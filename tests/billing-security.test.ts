import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  containsRawPaymentFields,
  getBillingStatus,
  isNativeAppOrigin,
  parseCheckoutRequest,
  verifiedStripeSubscriptionEvent,
} from "../server/billing.ts";

const serverRoutesSource = readFileSync("server/routes.ts", "utf8");
const billingSource = readFileSync("server/billing.ts", "utf8");
const indexSource = readFileSync("server/index.ts", "utf8");

function withStripeCatalog<T>(
  fn: () => T,
  options: { checkoutEnabled?: boolean } = {},
): T {
  const keys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
    "DATABASE_URL",
    "PUBLIC_APP_URL",
    "SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED",
  ] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  try {
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
    process.env.STRIPE_PLUS_MONTHLY_PRICE_ID = "price_plus_monthly";
    process.env.STRIPE_PLUS_ANNUAL_PRICE_ID = "price_plus_annual";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/soulcodex";
    process.env.PUBLIC_APP_URL = "https://soulcodex.example.com";
    process.env.SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED =
      options.checkoutEnabled ? "true" : "false";
    return fn();
  } finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("checkout accepts only a monthly or annual plan", () => {
  assert.deepEqual(parseCheckoutRequest({ plan: "monthly" }), { plan: "monthly" });
  assert.deepEqual(parseCheckoutRequest({ plan: "annual" }), { plan: "annual" });
  assert.throws(() => parseCheckoutRequest({ plan: "weekly" }), /invalid/i);
  assert.throws(
    () => parseCheckoutRequest({ plan: "monthly", profileId: "profile-123" }),
    /unrecognized/i,
  );
});

test("raw payment fields are rejected before any checkout handling", () => {
  assert.equal(containsRawPaymentFields({ plan: "monthly" }), false);
  assert.equal(containsRawPaymentFields({ plan: "monthly", cardNumber: "4111" }), true);
  assert.equal(containsRawPaymentFields({ plan: "monthly", cvv: "123" }), true);
  assert.equal(containsRawPaymentFields({ plan: "monthly", cvc: "123" }), true);
  assert.equal(containsRawPaymentFields({ plan: "monthly", expiryDate: "12/30" }), true);
  assert.equal(containsRawPaymentFields({ plan: "monthly", pan: "4111" }), true);
});

test("native shell origins cannot use web digital-goods checkout", () => {
  assert.equal(isNativeAppOrigin("soulcodex://localhost"), true);
  assert.equal(isNativeAppOrigin("capacitor://localhost"), true);
  assert.equal(isNativeAppOrigin("https://localhost"), true);
  assert.equal(isNativeAppOrigin("https://soulcodex.app"), false);
  assert.match(billingSource, /native_store_billing_required/);
});

test("direct-card legacy upgrade stays retired and checkout is subscription-only", () => {
  assert.match(billingSource, /direct_card_collection_retired/);
  assert.doesNotMatch(billingSource, /mode:\s*"payment"/);
  assert.match(billingSource, /mode:\s*"subscription"/);
  assert.doesNotMatch(serverRoutesSource, /updateProfile\([^)]*\{\s*isPremium:\s*true\s*\}/);
});

test("parsed billing routes are registered after session setup", () => {
  assert.doesNotMatch(indexSource, /registerBillingRoutes\(app\)/);
  const sessionIndex = serverRoutesSource.indexOf("setupSession(app)");
  const billingIndex = serverRoutesSource.indexOf("registerBillingRoutes(app)");
  assert.ok(sessionIndex >= 0);
  assert.ok(billingIndex > sessionIndex);
});

test("billing status keeps checkout disabled unless explicit flag is enabled", () => {
  const keys = [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
    "PUBLIC_APP_URL",
    "SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED",
  ] as const;
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  try {
    for (const key of keys) delete process.env[key];

    assert.deepEqual(getBillingStatus(), {
      enabled: false,
      provider: "stripe_checkout",
      collectsCardDataOnSoulCodex: false,
      persistentEntitlements: false,
      subscriptionWebhookVerification: false,
      monthlyProductConfigured: false,
      annualProductConfigured: false,
      webCheckoutEnabled: false,
      manageSubscriptionEnabled: false,
      reason: "not_configured",
    });

    withStripeCatalog(() => {
      const status = getBillingStatus();
      assert.equal(status.enabled, false);
      assert.equal(status.subscriptionWebhookVerification, true);
      assert.equal(status.monthlyProductConfigured, true);
      assert.equal(status.annualProductConfigured, true);
      assert.equal(status.webCheckoutEnabled, false);
      assert.equal(status.manageSubscriptionEnabled, true);
      assert.equal(status.reason, "web_checkout_disabled");
    });

    withStripeCatalog(() => {
      const status = getBillingStatus();
      assert.equal(status.enabled, true);
      assert.equal(status.webCheckoutEnabled, true);
      assert.equal(status.reason, "ready");
    }, { checkoutEnabled: true });
  } finally {
    for (const key of keys) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("web checkout binds subscription metadata to authenticated session user", () => {
  assert.match(billingSource, /req\.session\?\.userId/);
  assert.match(billingSource, /soulCodexUserId:\s*user\.id/);
  assert.match(billingSource, /subscription_data:\s*\{/);
  assert.doesNotMatch(billingSource, /Authorization:\s*`Bearer \$\{profileId\}`/);
  assert.doesNotMatch(billingSource, /profileId.*checkout/s);
});

test("web catalog uses Stripe price objects rather than hard-coded currency amounts", () => {
  assert.match(billingSource, /stripe\.prices\.retrieve/);
  assert.match(billingSource, /price\.unit_amount/);
  assert.doesNotMatch(billingSource, /\$\d+\.\d{2}/);
  assert.match(billingSource, /price\.recurring\.interval/);
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
