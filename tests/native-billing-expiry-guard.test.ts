import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import {
  grantAllowsPlus,
  SOUL_CODEX_PLUS_CAPABILITY,
  verifiedBillingEventSchema,
} from "../server/lib/durable-entitlements";
import {
  verifyGoogleBillingEvidence,
  verifyGoogleRtdnNotification,
} from "../server/lib/native-billing-verification";

const NOW = new Date("2026-10-13T12:00:00.000Z");
const USER = "fb66bbef-1ef9-426b-ae48-51dba4a11c35";
const PRODUCT = "soul_codex_plus_monthly";
const TOKEN = "sandbox-purchase-token-123456";
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const serviceAccount = JSON.stringify({
  client_email: "test-service@example.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
});

function withGoogleConfiguration<T>(fn: () => Promise<T>): Promise<T> {
  const names = [
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
    "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
  ] as const;
  const previous = names.map((name) => process.env[name]);
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = serviceAccount;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "app.soulcodex.main";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = PRODUCT;
  process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID = "soul_codex_plus_annual";
  return fn().finally(() => {
    names.forEach((name, index) => {
      if (previous[index] === undefined) delete process.env[name];
      else process.env[name] = previous[index];
    });
  });
}

function playFetch(options: {
  state?: string;
  expiryTime?: string;
  acknowledgementState?: string;
} = {}) {
  const calls: string[] = [];
  const fetchImpl = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url === "https://oauth2.googleapis.com/token") {
      return Response.json({ access_token: "synthetic-oauth-token" });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      return Response.json({
        subscriptionState: options.state ?? "SUBSCRIPTION_STATE_ACTIVE",
        acknowledgementState: options.acknowledgementState ?? "ACKNOWLEDGEMENT_STATE_PENDING",
        startTime: "2026-10-12T12:00:00Z",
        externalAccountIdentifiers: { obfuscatedExternalAccountId: USER },
        lineItems: [{
          productId: PRODUCT,
          ...(options.expiryTime === undefined ? {} : { expiryTime: options.expiryTime }),
        }],
        testPurchase: {},
      });
    }
    if (url.endsWith(":acknowledge")) return new Response(null, { status: 200 });
    throw new Error(`Unexpected mock URL: ${url}`);
  }) as typeof fetch;
  return { fetchImpl, calls };
}

const evidence = {
  platform: "android" as const,
  productId: PRODUCT,
  transactionId: "GPA.1111-2222-3333-44444",
  purchaseToken: TOKEN,
};

test("verified native access events require an expiration; denied events may still be recorded", () => {
  const base = {
    userId: USER,
    provider: "apple",
    providerEventId: "apple:123",
    providerTransactionId: "123",
    productId: "app.soulcodex.plus.monthly",
    plan: "monthly",
    environment: "sandbox",
    eventType: "transaction_verified",
    occurredAt: NOW,
    verificationState: "verified",
    accessStatus: "active",
    purchasedAt: NOW,
    verifiedAt: NOW,
    evidenceDigest: "a".repeat(64),
    diagnosticMetadata: {},
  };
  for (const provider of ["apple", "google_play"]) {
    for (const accessStatus of ["active", "trialing", "grace_period", "canceled_pending_expiry"]) {
      assert.equal(verifiedBillingEventSchema.safeParse({ ...base, provider, accessStatus }).success, false,
        `${provider}/${accessStatus} without paid-through date must not grant`);
    }
    assert.equal(verifiedBillingEventSchema.safeParse({
      ...base, provider, accessStatus: "revoked",
    }).success, true, "revocation must still be recordable without expiry");
    assert.equal(verifiedBillingEventSchema.safeParse({
      ...base, provider, accessStatus: "active", expiresAt: new Date("2026-11-13T12:00:00Z"),
    }).success, true);
  }
});

test("legacy native grants without paid-through date never confer Plus", () => {
  const grant = {
    capability: SOUL_CODEX_PLUS_CAPABILITY,
    sourceProvider: "apple",
    status: "active",
    effectiveAt: new Date("2026-10-12T12:00:00Z"),
    expiresAt: null,
    revokedAt: null,
  } as unknown as NonNullable<Parameters<typeof grantAllowsPlus>[0]>;
  assert.equal(grantAllowsPlus(grant, NOW), false);
  assert.equal(grantAllowsPlus({ ...grant, sourceProvider: "google_play" }, NOW), false);
  assert.equal(grantAllowsPlus({ ...grant, expiresAt: new Date("2026-10-14T12:00:00Z") }, NOW), true);
});

test("Google Play active purchase with no expiry is rejected before acknowledgement", async () =>
  withGoogleConfiguration(async () => {
    const { fetchImpl, calls } = playFetch();
    await assert.rejects(
      verifyGoogleBillingEvidence(USER, evidence, NOW, fetchImpl),
      /google_play_expiry_time_missing/,
    );
    assert.equal(calls.some((url) => url.endsWith(":acknowledge")), false);
  }));

test("Google Play active purchase with malformed expiry is rejected", async () =>
  withGoogleConfiguration(async () => {
    const { fetchImpl, calls } = playFetch({ expiryTime: "not-a-date" });
    await assert.rejects(
      verifyGoogleBillingEvidence(USER, evidence, NOW, fetchImpl),
      /google_play_expiry_time_invalid/,
    );
    assert.equal(calls.some((url) => url.endsWith(":acknowledge")), false);
  }));

test("Google Play valid future expiry verifies and then acknowledges", async () =>
  withGoogleConfiguration(async () => {
    const { fetchImpl, calls } = playFetch({ expiryTime: "2026-11-13T12:00:00Z" });
    const result = await verifyGoogleBillingEvidence(USER, evidence, NOW, fetchImpl);
    assert.equal(result.accessStatus, "active");
    assert.equal(result.expiresAt?.toISOString(), "2026-11-13T12:00:00.000Z");
    assert.equal(calls.filter((url) => url.endsWith(":acknowledge")).length, 1);
    assert.equal(verifiedBillingEventSchema.safeParse(result).success, true);
  }));

test("Google Play account hold without expiry cannot grant or acknowledge", async () =>
  withGoogleConfiguration(async () => {
    const { fetchImpl, calls } = playFetch({ state: "SUBSCRIPTION_STATE_ON_HOLD" });
    const result = await verifyGoogleBillingEvidence(USER, evidence, NOW, fetchImpl);
    assert.equal(result.accessStatus, "account_hold");
    assert.equal(result.expiresAt, null);
    assert.equal(calls.some((url) => url.endsWith(":acknowledge")), false);
  }));

test("Google RTDN active purchase without expiry cannot grant or acknowledge", async () =>
  withGoogleConfiguration(async () => {
    const { fetchImpl, calls } = playFetch();
    const payload = {
      version: "1.0",
      packageName: "app.soulcodex.main",
      eventTimeMillis: String(NOW.getTime()),
      subscriptionNotification: { version: "1.0", notificationType: 2, purchaseToken: TOKEN },
    };
    const envelope = {
      message: { data: Buffer.from(JSON.stringify(payload)).toString("base64"), messageId: "rtdn-123" },
    };
    await assert.rejects(
      verifyGoogleRtdnNotification(envelope, NOW, fetchImpl),
      /google_play_expiry_time_missing/,
    );
    assert.equal(calls.some((url) => url.endsWith(":acknowledge")), false);
  }));
