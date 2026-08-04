import assert from "node:assert/strict";
import test from "node:test";
import {
  containsRawPaymentFields,
  getBillingStatus,
  isProfileCapabilityAuthorized,
  parseCheckoutRequest,
} from "../server/billing.ts";

const profileId = "profile-12345678";

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

test("profile billing actions require the existing bearer capability", () => {
  assert.equal(
    isProfileCapabilityAuthorized(`Bearer ${profileId}`, profileId),
    true,
  );
  assert.equal(isProfileCapabilityAuthorized(undefined, profileId), false);
  assert.equal(
    isProfileCapabilityAuthorized("Bearer another-profile", profileId),
    false,
  );
});

test("billing remains disabled unless checkout and persistent entitlement storage are complete", () => {
  const previous = {
    secret: process.env.STRIPE_SECRET_KEY,
    price: process.env.STRIPE_PRICE_ID,
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
    appUrl: process.env.PUBLIC_APP_URL,
    databaseUrl: process.env.DATABASE_URL,
  };

  try {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ID;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.PUBLIC_APP_URL;
    delete process.env.DATABASE_URL;

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
  }
});
