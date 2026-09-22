import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  containsRawPaymentFields,
  getBillingStatus,
  parseCheckoutRequest,
} from "../server/billing.ts";

const profileId = "profile-12345678";
const serverRoutesSource = readFileSync("server/billing.ts", "utf8");

test("checkout accepts only the profile capability request shape", () => {
  assert.deepEqual(parseCheckoutRequest({ profileId }), { profileId });

  assert.throws(
    () =>
      parseCheckoutRequest({
        profileId,
        cardNumber: "4111111111111111",
      }),
    /unrecognized/i,
  );
});

test("raw payment fields are rejected before checkout session creation", () => {
  assert.equal(containsRawPaymentFields({ profileId }), false);
  assert.equal(containsRawPaymentFields({ profileId, cardNumber: "4111" }), true);
  assert.equal(containsRawPaymentFields({ profileId, cvv: "123" }), true);
  assert.equal(containsRawPaymentFields({ profileId, cvc: "123" }), true);
  assert.equal(containsRawPaymentFields({ profileId, expiryDate: "12/30" }), true);
});

test("legacy profile upgrade route can never collect raw card fields or grant premium directly", () => {
  assert.match(serverRoutesSource, /direct_card_collection_retired/);
  assert.match(serverRoutesSource, /Direct card entry has been retired/);
  assert.doesNotMatch(serverRoutesSource, /const\s*\{\s*cardNumber\s*,\s*expiryDate\s*,\s*cvv\s*\}\s*=\s*req\.body/);
  assert.doesNotMatch(serverRoutesSource, /updateProfile\([^)]*\{\s*isPremium:\s*true\s*\}/);
});

test("billing checkout uses authenticated ownership rather than profile-id bearer secrets", () => {
  assert.match(serverRoutesSource, /profileBelongsToActor/);
  assert.match(serverRoutesSource, /billing_account_required/);
  assert.match(serverRoutesSource, /entitlement\/:profileId/);
  assert.doesNotMatch(serverRoutesSource, /Bearer \$\{profileId\}/);
  assert.doesNotMatch(serverRoutesSource, /updateProfile\([^)]*isPremium/);
});

test("billing remains disabled unless checkout and persistent entitlement storage are complete", () => {
  const previous = {
    secret: process.env.STRIPE_SECRET_KEY,
    price: process.env.STRIPE_PRICE_ID,
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
    appUrl: process.env.PUBLIC_APP_URL,
    databaseUrl: process.env.DATABASE_URL,
    entitlements: process.env.BILLING_ENTITLEMENTS_V1_ENABLED,
  };

  try {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ID;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.PUBLIC_APP_URL;
    delete process.env.DATABASE_URL;
    delete process.env.BILLING_ENTITLEMENTS_V1_ENABLED;

    assert.deepEqual(getBillingStatus(), {
      enabled: false,
      provider: "stripe_checkout",
      collectsCardDataOnSoulCodex: false,
      persistentEntitlements: false,
      reason: "not_configured",
    });

    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.STRIPE_PRICE_ID = "price_example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
    process.env.PUBLIC_APP_URL = "https://soulcodex.example.com";

    assert.deepEqual(getBillingStatus(), {
      enabled: false,
      provider: "stripe_checkout",
      collectsCardDataOnSoulCodex: false,
      persistentEntitlements: false,
      reason: "not_configured",
    });

    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/soulcodex";
    process.env.BILLING_ENTITLEMENTS_V1_ENABLED = "true";
    assert.deepEqual(getBillingStatus(), {
      enabled: true,
      provider: "stripe_checkout",
      collectsCardDataOnSoulCodex: false,
      persistentEntitlements: true,
    });

    process.env.PUBLIC_APP_URL = "http://not-secure.example.com";
    assert.equal(getBillingStatus().enabled, false);
  } finally {
    if (previous.secret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous.secret;

    if (previous.price === undefined) delete process.env.STRIPE_PRICE_ID;
    else process.env.STRIPE_PRICE_ID = previous.price;

    if (previous.webhook === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous.webhook;

    if (previous.appUrl === undefined) delete process.env.PUBLIC_APP_URL;
    else process.env.PUBLIC_APP_URL = previous.appUrl;

    if (previous.databaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous.databaseUrl;

    if (previous.entitlements === undefined) delete process.env.BILLING_ENTITLEMENTS_V1_ENABLED;
    else process.env.BILLING_ENTITLEMENTS_V1_ENABLED = previous.entitlements;
  }
});
