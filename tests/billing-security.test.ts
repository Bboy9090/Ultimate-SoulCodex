import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  containsRawPaymentFields,
  getBillingStatus,
  parseCheckoutRequest,
  verifiedStripeSubscriptionEvent,
} from "../server/billing.ts";

const profileId = "profile-12345678";
const serverRoutesSource = readFileSync("server/routes.ts", "utf8");
const billingSource = readFileSync("server/billing.ts", "utf8");

function withStripeCatalog<T>(fn: () => T): T {
  const previous = {
    secret: process.env.STRIPE_SECRET_KEY,
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
    monthly: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_PLUS_ANNUAL_PRICE_ID,
    databaseUrl: process.env.DATABASE_URL,
  };

  try {
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
    process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/soulcodex";
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const envKey =
        key === "secret" ? "STRIPE_SECRET_KEY" :
        key === "webhook" ? "STRIPE_WEBHOOK_SECRET" :
        key === "monthly" ? "STRIPE_PLUS_MONTHLY_PRICE_ID" :
        key === "annual" ? "STRIPE_PLUS_ANNUAL_PRICE_ID" :
        "DATABASE_URL";
      if (value === undefined) delete process.env[envKey];
      else process.env[envKey] = value;
    }
  }
}

test("checkout accepts only the retired profile capability request shape", () => {
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

test("raw payment fields are rejected before any checkout handling", () => {
  assert.equal(containsRawPaymentFields({ profileId }), false);
  assert.equal(containsRawPaymentFields({ profileId, cardNumber: "4111" }), true);
  assert.equal(containsRawPaymentFields({ profileId, cvv: "123" }), true);
  assert.equal(containsRawPaymentFields({ profileId, cvc: "123" }), true);
  assert.equal(containsRawPaymentFields({ profileId, expiryDate: "12/30" }), true);
});

test("legacy profile upgrade and one-time Stripe payment stay retired", () => {
  assert.match(serverRoutesSource, /direct_card_upgrade_retired/);
  assert.match(billingSource, /legacy_checkout_retired/);
  assert.doesNotMatch(billingSource, /mode:\s*"payment"/);
  assert.doesNotMatch(serverRoutesSource, /updateProfile\([^)]*\{\s*isPremium:\s*true\s*\}/);
});

test("billing status separates webhook verification from purchase activation", () => {
  const previousDatabase = process.env.DATABASE_URL;
  const previousSecret = process.env.STRIPE_SECRET_KEY;
  const previousWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  const previousMonthly = process.env.STRIPE_PLUS_MONTHLY_PRICE_ID;
  const previousAnnual = process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;

  try {
    delete process.env.DATABASE_URL;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_PLUS_MONTHLY_PRICE_ID;
    delete process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;

    assert.deepEqual(getBillingStatus(), {
      enabled: false,
      provider: "stripe_checkout",
      collectsCardDataOnSoulCodex: false,
      persistentEntitlements: false,
      subscriptionWebhookVerification: false,
      monthlyProductConfigured: false,
      annualProductConfigured: false,
      reason: "not_configured",
    });

    withStripeCatalog(() => {
      assert.deepEqual(getBillingStatus(), {
        enabled: false,
        provider: "stripe_checkout",
        collectsCardDataOnSoulCodex: false,
        persistentEntitlements: true,
        subscriptionWebhookVerification: true,
        monthlyProductConfigured: true,
        annualProductConfigured: true,
        reason: "subscription_checkout_not_qualified",
      });
    });
  } finally {
    if (previousDatabase === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabase;
    if (previousSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousSecret;
    if (previousWebhook === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previousWebhook;
    if (previousMonthly === undefined) delete process.env.STRIPE_PLUS_MONTHLY_PRICE_ID;
    else process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = previousMonthly;
    if (previousAnnual === undefined) delete process.env.STRIPE_PLUS_ANNUAL_PRICE_ID;
    else process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = previousAnnual;
  }
});

test("verified Stripe subscription event maps only configured products", () => {
  withStripeCatalog(() => {
    const raw = Buffer.from('{"id":"evt_monthly"}');
    const mapped = verifiedStripeSubscriptionEvent({
      id: "evt_monthly",
      type: "customer.subscription.updated",
      livemode: false,
      data: {
        object: {
          id: "sub_123",
          object: "subscription",
          status: "active",
          cancel_at_period_end: false,
          start_date: 1790856000,
          current_period_end: 1793534400,
          metadata: { soulCodexUserId: "user-123" },
          items: { data: [{ price: { id: "price_plus_monthly" } }] },
        },
      },
    } as any, raw, new Date("2026-10-01T12:01:00Z"));

    assert.ok(mapped);
    assert.equal(mapped?.provider, "stripe");
    assert.equal(mapped?.plan, "monthly");
    assert.equal(mapped?.accessStatus, "active");
    assert.equal(mapped?.environment, "sandbox");
    assert.match(mapped?.evidenceDigest ?? "", /^[a-f0-9]{64}$/);
  });
});

test("Stripe mapping ignores unbound users and unknown price IDs", () => {
  withStripeCatalog(() => {
    const raw = Buffer.from("{}");
    const base = {
      id: "evt_unknown",
      type: "customer.subscription.updated",
      livemode: false,
      data: {
        object: {
          id: "sub_unknown",
          object: "subscription",
          status: "active",
          metadata: { soulCodexUserId: "user-123" },
          items: { data: [{ price: { id: "price_not_allowed" } }] },
        },
      },
    } as any;

    assert.equal(verifiedStripeSubscriptionEvent(base, raw), null);

    base.data.object.items.data[0].price.id = "price_plus_monthly";
    base.data.object.metadata = {};
    assert.equal(verifiedStripeSubscriptionEvent(base, raw), null);
  });
});

test("scheduled cancellation keeps the paid period while unpaid fails closed", () => {
  withStripeCatalog(() => {
    const raw = Buffer.from("{}");
    const stripeEvent = (status: string, cancelAtPeriodEnd: boolean) => ({
      id: `evt_${status}_${cancelAtPeriodEnd}`,
      type: "customer.subscription.updated",
      livemode: true,
      data: {
        object: {
          id: "sub_lifecycle",
          object: "subscription",
          status,
          cancel_at_period_end: cancelAtPeriodEnd,
          metadata: { soulCodexUserId: "user-123" },
          items: { data: [{ price: { id: "price_plus_annual" } }] },
        },
      },
    } as any);

    assert.equal(
      verifiedStripeSubscriptionEvent(stripeEvent("active", true), raw)?.accessStatus,
      "canceled_pending_expiry",
    );
    assert.equal(
      verifiedStripeSubscriptionEvent(stripeEvent("unpaid", false), raw)?.accessStatus,
      "account_hold",
    );
  });
});
