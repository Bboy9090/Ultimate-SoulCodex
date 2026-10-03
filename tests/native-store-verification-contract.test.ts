import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  googleObfuscatedAccountId,
  verifyAppleSignedTransaction,
  verifyGooglePlaySubscription,
} from "../server/lib/native-store-verification";

const billingSource = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
const verifierSource = readFileSync(new URL("../server/lib/native-store-verification.ts", import.meta.url), "utf8");
const clientSource = readFileSync(new URL("../client/src/lib/nativeBilling.ts", import.meta.url), "utf8");

function withEnv<T>(values: Record<string, string>, fn: () => T): T {
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    return fn();
  } finally {
    for (const key of Object.keys(values)) {
      const old = previous[key];
      if (old === undefined) delete process.env[key];
      else process.env[key] = old;
    }
  }
}

test("native catalog and verification require authenticated account binding and lifecycle readiness", () => {
  assert.match(billingSource, /native_billing_auth_required/);
  assert.match(billingSource, /SOUL_CODEX_BILLING_BINDING_SECRET/);
  assert.match(billingSource, /createHmac\("sha256"/);
  assert.match(billingSource, /APPLE_IAP_NOTIFICATIONS_READY/);
  assert.match(billingSource, /GOOGLE_PLAY_RTDN_READY/);
  assert.match(billingSource, /lifecycle_notifications_not_ready/);
  assert.match(billingSource, /\/api\/billing\/native\/verify/);
  assert.match(billingSource, /recordVerifiedBillingEvent/);
  assert.doesNotMatch(billingSource, /isPremium\s*[:=]\s*true/);
});

test("client purchase and restore paths require server verification", () => {
  assert.match(clientSource, /accountToken/);
  assert.match(clientSource, /verifyNativeBillingEvidence/);
  assert.match(clientSource, /\/api\/billing\/native\/verify/);
  assert.match(clientSource, /verifyRestoredNativePurchases/);
  assert.doesNotMatch(clientSource, /isPremium\s*=\s*true/);
});

test("malformed Apple JWS is rejected before entitlement mapping", () => {
  assert.throws(
    () => verifyAppleSignedTransaction("not-a-jws", "11111111-1111-4111-8111-111111111111"),
    /apple_jws_malformed/,
  );
});

test("Apple verification binds trusted JWS to signedDate, bundle, product, and app account token", () => {
  assert.match(verifierSource, /verifyAppleCertificateChain\(chain, parseAppleRoots\(\), signedAt\)/);
  assert.match(verifierSource, /payload\.bundleId !== bundleId/);
  assert.match(verifierSource, /apple_product_not_allowed/);
  assert.match(verifierSource, /apple_account_binding_mismatch/);
  assert.match(verifierSource, /jws_signature_invalid/);
  assert.doesNotMatch(verifierSource, /diagnosticMetadata:[\s\S]{0,400}signedTransaction/);
});

test("Google account binding is deterministic and account-specific", () => {
  withEnv({ SOUL_CODEX_BILLING_BINDING_SECRET: "test-binding-secret-32-bytes-minimum" }, () => {
    const one = googleObfuscatedAccountId("user-one");
    const again = googleObfuscatedAccountId("user-one");
    const two = googleObfuscatedAccountId("user-two");
    assert.equal(one, again);
    assert.notEqual(one, two);
    assert.match(one, /^[a-f0-9]{64}$/);
  });
});

test("Google subscriptionsv2 verification checks account binding then acknowledges", async () => {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  const userId = "google-user-1";
  const productId = "soul_codex_plus_monthly";
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method: string }> = [];

  await withEnv({
    SOUL_CODEX_BILLING_BINDING_SECRET: "test-binding-secret-32-bytes-minimum",
    GOOGLE_PLAY_PACKAGE_NAME: "soulcodex.app",
    GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID: productId,
    GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID: "soul_codex_plus_annual",
    GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: JSON.stringify({
      client_email: "billing-test@example.iam.gserviceaccount.com",
      private_key: privateKey,
      token_uri: "https://oauth2.googleapis.com/token",
    }),
  }, async () => {
    const accountBinding = googleObfuscatedAccountId(userId);
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method ?? "GET";
      calls.push({ url, method });

      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(JSON.stringify({
          access_token: "google-test-access-token",
          expires_in: 3600,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("/purchases/subscriptionsv2/tokens/")) {
        return new Response(JSON.stringify({
          startTime: "2026-10-01T00:00:00Z",
          subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
          acknowledgementState: "ACKNOWLEDGEMENT_STATE_PENDING",
          externalAccountIdentifiers: {
            obfuscatedExternalAccountId: accountBinding,
          },
          etag: "etag-v1",
          testPurchase: {},
          lineItems: [{
            productId,
            expiryTime: "2026-11-01T00:00:00Z",
            latestSuccessfulOrderId: "GPA.TEST-ORDER",
          }],
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes(":acknowledge")) {
        return new Response("", { status: 200 });
      }

      return new Response("", { status: 404 });
    }) as typeof fetch;

    try {
      const verified = await verifyGooglePlaySubscription(
        "play-purchase-token",
        productId,
        userId,
        new Date("2026-10-03T12:00:00Z"),
      );

      assert.equal(verified.provider, "google_play");
      assert.equal(verified.plan, "monthly");
      assert.equal(verified.accessStatus, "active");
      assert.equal(verified.environment, "sandbox");
      assert.equal(verified.userId, userId);
      assert.match(verified.evidenceDigest, /^[a-f0-9]{64}$/);
      assert.ok(calls.some((call) => call.url.includes("/purchases/subscriptionsv2/tokens/")));
      assert.ok(calls.some((call) => call.url.includes(":acknowledge") && call.method === "POST"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("Google verifier never stores raw purchase token in diagnostic metadata", () => {
  assert.match(verifierSource, /purchaseTokenDigest/);
  assert.match(verifierSource, /purchases\/subscriptionsv2\/tokens/);
  assert.match(verifierSource, /obfuscatedExternalAccountId/);
  assert.doesNotMatch(verifierSource, /diagnosticMetadata:[\s\S]{0,500}purchaseToken/);
});
