import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { verifyGoogleBillingEvidence } from "../server/lib/native-billing-verification";

test("active Google subscription becomes effective at purchase time, not future expiry", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  const previous = {
    serviceAccount: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON,
    verifierEmail: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL,
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
    productId: process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID,
  };

  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = "billing-test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
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
    assert.equal(verified.environment, "production");
    assert.equal(verified.diagnosticMetadata.testPurchase, false);
    assert.equal(verified.occurredAt.toISOString(), startTime);
    assert.equal(verified.expiresAt?.toISOString(), expiryTime);
    assert.equal(call, 2);
  } finally {
    if (previous.serviceAccount === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = previous.serviceAccount;
    if (previous.verifierEmail === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = previous.verifierEmail;
    if (previous.packageName === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous.packageName;
    if (previous.productId === undefined) delete process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = previous.productId;
  }
});


test("Google license-tester subscription evidence is classified as sandbox", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const previous = {
    serviceAccount: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON,
    verifierEmail: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL,
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
    productId: process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID,
  };

  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = "billing-test@example.iam.gserviceaccount.com";
  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: "billing-test@example.iam.gserviceaccount.com",
    private_key: pem,
    token_uri: "https://oauth2.googleapis.com/token",
  });
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";

  const fakeFetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      return new Response(JSON.stringify({ access_token: "test-access-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/purchases/subscriptionsv2/tokens/")) {
      return new Response(JSON.stringify({
        testPurchase: {},
        startTime: "2026-10-03T12:00:00.000Z",
        subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
        acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
        latestOrderId: "GPA.TEST-1234",
        externalAccountIdentifiers: {
          obfuscatedExternalAccountId: "11111111-1111-4111-8111-111111111111",
        },
        lineItems: [{
          productId: "soul_codex_plus_monthly",
          expiryTime: "2026-11-03T12:00:00.000Z",
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
        transactionId: "GPA.TEST-1234",
        purchaseToken: "license-tester-purchase-token-123456789",
      },
      new Date("2026-10-03T12:01:00.000Z"),
      fakeFetch,
    );

    assert.equal(verified.environment, "sandbox");
    assert.equal(verified.diagnosticMetadata.testPurchase, true);
    assert.equal(verified.accessStatus, "active");
  } finally {
    if (previous.serviceAccount === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = previous.serviceAccount;
    if (previous.verifierEmail === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = previous.verifierEmail;
    if (previous.packageName === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous.packageName;
    if (previous.productId === undefined) delete process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = previous.productId;
  }
});


test("Google Play verifier rejects a credential whose client email does not match the dedicated verifier identity", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const previous = {
    serviceAccount: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON,
    verifierEmail: process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL,
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME,
    productId: process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID,
  };

  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL =
    "soulcodex-play-verifier@soul-codex-platform.iam.gserviceaccount.com";
  process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
    client_email: "soulcodex-play-publisher@soul-codex-platform.iam.gserviceaccount.com",
    private_key: pem,
    token_uri: "https://oauth2.googleapis.com/token",
  });
  process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
  process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";

  let fetchCalled = false;
  const fakeFetch = (async () => {
    fetchCalled = true;
    throw new Error("fetch should not run");
  }) as typeof fetch;

  try {
    await assert.rejects(
      verifyGoogleBillingEvidence(
        "11111111-1111-4111-8111-111111111111",
        {
          platform: "android",
          productId: "soul_codex_plus_monthly",
          transactionId: "GPA.IDENTITY-MISMATCH",
          purchaseToken: "purchase-token-with-enough-length-identity",
        },
        new Date("2026-11-08T16:00:00.000Z"),
        fakeFetch,
      ),
      /google_play_verifier_identity_mismatch/,
    );
    assert.equal(fetchCalled, false);
  } finally {
    if (previous.serviceAccount === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = previous.serviceAccount;
    if (previous.verifierEmail === undefined) delete process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL;
    else process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = previous.verifierEmail;
    if (previous.packageName === undefined) delete process.env.GOOGLE_PLAY_PACKAGE_NAME;
    else process.env.GOOGLE_PLAY_PACKAGE_NAME = previous.packageName;
    if (previous.productId === undefined) delete process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID;
    else process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = previous.productId;
  }
});


test("Google Play verifier rejects untrusted OAuth token_uri without issuing a signed assertion", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const keys = [
    "GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON",
    "GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
  ] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  let networkCalls = 0;
  try {
    process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_EMAIL = "billing-test@example.iam.gserviceaccount.com";
    process.env.GOOGLE_PLAY_VERIFIER_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "billing-test@example.iam.gserviceaccount.com",
      private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
      token_uri: "https://attacker.example/oauth/collect",
    });
    process.env.GOOGLE_PLAY_PACKAGE_NAME = "soulcodex.app";
    process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID = "soul_codex_plus_monthly";

    const fakeFetch = (async () => {
      networkCalls += 1;
      throw new Error("no network request should be performed");
    }) as typeof fetch;
    await assert.rejects(
      verifyGoogleBillingEvidence(
        "11111111-1111-4111-8111-111111111111",
        {
          platform: "android",
          productId: "soul_codex_plus_monthly",
          transactionId: "GPA.UNTRUSTED-ENDPOINT",
          purchaseToken: "play-purchase-token-test-untrusted-endpoint",
        },
        new Date("2026-11-09T12:00:00.000Z"),
        fakeFetch,
      ),
      /google_play_token_endpoint_invalid/,
    );
    assert.equal(networkCalls, 0);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
