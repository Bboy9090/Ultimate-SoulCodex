import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { verifyGoogleRtdnNotification } from "../server/lib/native-billing-verification";

test("Google RTDN re-queries Play and derives account-bound durable state", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  const previous = {
    service: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON,
    verifierEmail: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL,
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
    monthly: process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID,
    annual: process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID,
  };

  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = "billing-test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: "billing-test@example.iam.gserviceaccount.com",
    private_key: pem,
    token_uri: "https://oauth2.googleapis.com/token",
  });
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";
  process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID = "soul_codex_plus_annual";

  const data = Buffer.from(JSON.stringify({
    version: "1.0",
    packageName: "soulcodex.app",
    eventTimeMillis: "1791043260000",
    subscriptionNotification: {
      version: "1.0",
      notificationType: 2,
      purchaseToken: "purchase-token-long-enough-for-lifecycle-test",
    },
  }), "utf8").toString("base64");

  let apiLookup = 0;
  const fakeFetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "access" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      apiLookup += 1;
      return new Response(JSON.stringify({
        startTime: "2026-10-01T12:00:00.000Z",
        subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
        acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
        latestOrderId: "GPA.1111-2222-3333-44444",
        externalAccountIdentifiers: {
          obfuscatedExternalAccountId: "11111111-1111-4111-8111-111111111111",
        },
        lineItems: [{
          productId: "soul_codex_plus_monthly",
          expiryTime: "2026-11-01T12:00:00.000Z",
        }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const event = await verifyGoogleRtdnNotification({
      message: { data, messageId: "pubsub-message-1" },
      subscription: "projects/example/subscriptions/soul-codex-rtdn",
    }, new Date("2026-10-03T12:02:00.000Z"), fakeFetch);

    assert.ok(event);
    assert.equal(apiLookup, 1);
    assert.equal(event.userId, "11111111-1111-4111-8111-111111111111");
    assert.equal(event.accessStatus, "active");
    assert.equal(event.productId, "soul_codex_plus_monthly");
    assert.equal(event.providerEventId, "google_rtdn:pubsub-message-1");
    assert.equal(event.occurredAt.toISOString(), "2026-10-03T16:01:00.000Z");
  } finally {
    if (previous.service === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = previous.service;
    if (previous.verifierEmail === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = previous.verifierEmail;
    if (previous.packageName === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous.packageName;
    if (previous.monthly === undefined) delete process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = previous.monthly;
    if (previous.annual === undefined) delete process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID = previous.annual;
  }
});

test("Google provider test notification is acknowledged without an entitlement event", async () => {
  const previous = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
  const data = Buffer.from(JSON.stringify({
    version: "1.0",
    packageName: "soulcodex.app",
    testNotification: { version: "1.0" },
  }), "utf8").toString("base64");

  try {
    const event = await verifyGoogleRtdnNotification({
      message: { data, messageId: "test-message" },
    });
    assert.equal(event, null);
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous;
  }
});


test("Google RTDN does not persist an active entitlement with an unrecognized acknowledgement state", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const keys = [
    "GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON",
    "GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
  ] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = "billing-test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: "billing-test@example.iam.gserviceaccount.com",
    private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    token_uri: "https://oauth2.googleapis.com/token",
  });
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";

  const data = Buffer.from(JSON.stringify({
    version: "1.0",
    packageName: "soulcodex.app",
    eventTimeMillis: "1791043260000",
    subscriptionNotification: {
      version: "1.0",
      notificationType: 2,
      purchaseToken: "purchase-token-long-enough-for-ack-validation",
    },
  }), "utf8").toString("base64");

  let acknowledgementRequests = 0;
  const fakeFetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "test" }), { status: 200 });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      return new Response(JSON.stringify({
        startTime: "2026-11-01T12:00:00.000Z",
        subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
        acknowledgementState: "ACKNOWLEDGEMENT_STATE_UNSPECIFIED",
        externalAccountIdentifiers: { obfuscatedExternalAccountId: "11111111-1111-4111-8111-111111111111" },
        lineItems: [{ productId: "soul_codex_plus_monthly", expiryTime: "2026-12-01T12:00:00.000Z" }],
      }), { status: 200 });
    }
    acknowledgementRequests++;
    throw new Error("unexpected acknowledgement request");
  }) as typeof fetch;

  try {
    await assert.rejects(
      verifyGoogleRtdnNotification({
        message: { data, messageId: "pubsub-ack-unknown" },
      }, new Date("2026-11-09T12:00:00.000Z"), fakeFetch),
      /google_play_acknowledgement_state_invalid/,
    );
    assert.equal(acknowledgementRequests, 0);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
