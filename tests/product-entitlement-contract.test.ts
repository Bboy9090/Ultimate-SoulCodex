import assert from "node:assert/strict";
import test from "node:test";
import { resolveProductEntitlement } from "../server/lib/product-entitlement";

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    username: "test",
    password: "disabled",
    email: null,
    firstName: null,
    lastName: null,
    profileImageUrl: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionPlan: null,
    subscriptionEndsAt: null,
    isPremium: false,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  } as any;
}

test("anonymous access is Free", () => {
  assert.deepEqual(resolveProductEntitlement(null, new Date("2026-10-03T12:00:00Z")), {
    tier: "free",
    source: "free",
    verified: true,
    expiresAt: null,
  });
});

test("legacy premium flag cannot grant Soul Codex Plus", () => {
  const entitlement = resolveProductEntitlement(
    user({ isPremium: true }),
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "free");
});

test("active server-side subscription grants Soul Codex Plus", () => {
  const entitlement = resolveProductEntitlement(
    user({
      stripeSubscriptionId: "sub_verified",
      subscriptionStatus: "active",
      subscriptionPlan: "soul_codex_plus_monthly",
      subscriptionEndsAt: new Date("2026-11-03T12:00:00Z"),
    }),
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "plus");
  assert.equal(entitlement.source, "stripe_subscription");
  assert.equal(entitlement.verified, true);
});

test("expired subscription fails closed to Free", () => {
  const entitlement = resolveProductEntitlement(
    user({
      stripeSubscriptionId: "sub_expired",
      subscriptionStatus: "active",
      subscriptionEndsAt: new Date("2026-09-01T00:00:00Z"),
      isPremium: true,
    }),
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "free");
});

test("canceled subscription fails closed to Free", () => {
  const entitlement = resolveProductEntitlement(
    user({
      stripeSubscriptionId: "sub_canceled",
      subscriptionStatus: "canceled",
      subscriptionEndsAt: new Date("2026-11-03T12:00:00Z"),
    }),
    new Date("2026-10-03T12:00:00Z"),
  );
  assert.equal(entitlement.tier, "free");
});
