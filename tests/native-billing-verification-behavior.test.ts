import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { verifyGoogleBillingEvidence } from "../server/lib/native-billing-verification";

test("active Google subscription becomes effective at purchase time, not future expiry", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  const previous = {
    serviceAccount: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON,
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
    productId: process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID,
  };

  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: "billing-test@example.iam.gserviceaccount.com",
    private_key: pem,
    token_uri: "https://oauth2.googleapis.com/token",
  });
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "app.soulcodex.ios";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";

  const startTime = "2026-10-03T12:00:00.000Z";
  const expiryTime = "2026-11-03T12:00:00.000Z";
  let call = 0;

  const fakeFetch = (async (input: string | URL | Request) => {
    call += 1;
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "test-access-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      return new Response(JSON.stringify({
        startTime,
        subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
        acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
        latestOrderId: "GPA.1234-5678-9012-34567",
        externalAccountIdentifiers: {
          obfuscatedExternalAccountId: "11111111-1111-4111-8111-111111111111",
        },
        lineItems: [{
          productId: "soul_codex_plus_monthly",
          expiryTime,
        }],
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const verified = await verifyGoogleBillingEvidence(
      "11111111-1111-4111-8111-111111111111",
      {
        platform: "android",
        productId: "soul_codex_plus_monthly",
        transactionId: "GPA.1234-5678-9012-34567",
        purchaseToken: "purchase-token-with-enough-length-123456",
      },
      new Date("2026-10-03T12:01:00.000Z"),
      fakeFetch,
    );

    assert.equal(verified.accessStatus, "active");
    assert.equal(verified.occurredAt.toISOString(), startTime);
    assert.equal(verified.expiresAt?.toISOString(), expiryTime);
    assert.equal(call, 2);
  } finally {
    if (previous.serviceAccount === undefined) delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = previous.serviceAccount;
    if (previous.packageName === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous.packageName;
    if (previous.productId === undefined) delete process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = previous.productId;
  }
});
