import assert from "node:assert/strict";
import test from "node:test";
import {
  entitlementIsActive,
  nativeBillingVerificationEnabled,
  parseNativeVerificationRequest,
  resolveNativeProductCatalog,
  PREMIUM_LIFETIME_CAPABILITY,
} from "../shared/billing-entitlements.ts";

test("native catalog ignores malformed store IDs", () => {
  assert.deepEqual(resolveNativeProductCatalog({
    APPLE_PREMIUM_LIFETIME_PRODUCT_ID: "com.soulcodex.premium.lifetime",
    GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID: "Bad Google ID",
  }), [{ provider: "apple_app_store", productId: "com.soulcodex.premium.lifetime", capability: PREMIUM_LIFETIME_CAPABILITY }]);
});

test("entitlement activity fails closed", () => {
  const now = new Date("2026-10-03T00:00:00Z");
  const base = {
    status: "active" as const,
    startsAt: new Date("2026-09-01T00:00:00Z"),
    endsAt: null,
    revokedAt: null,
    lastVerifiedAt: new Date("2026-10-02T00:00:00Z"),
  };
  assert.equal(entitlementIsActive(base, now), true);
  assert.equal(entitlementIsActive({ ...base, revokedAt: now }, now), false);
  assert.equal(entitlementIsActive({ ...base, endsAt: new Date("2026-10-02T00:00:00Z") }, now), false);
  assert.equal(entitlementIsActive({ ...base, startsAt: new Date("2026-10-04T00:00:00Z") }, now), false);
  assert.equal(entitlementIsActive({ ...base, lastVerifiedAt: new Date("invalid") }, now), false);
});

test("native verification accepts only configured provider products", () => {
  const catalog = resolveNativeProductCatalog({
    APPLE_PREMIUM_LIFETIME_PRODUCT_ID: "com.soulcodex.premium.lifetime",
    GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID: "premium_lifetime",
  });
  assert.equal(parseNativeVerificationRequest({
    provider: "apple_app_store",
    environment: "sandbox",
    productId: "com.soulcodex.premium.lifetime",
    externalTransactionId: "1000001234567890",
    signedPayload: "signed-transaction-jws",
  }, catalog).provider, "apple_app_store");
  assert.throws(() => parseNativeVerificationRequest({
    provider: "apple_app_store",
    environment: "sandbox",
    productId: "premium_lifetime",
    externalTransactionId: "GPA.123",
    signedPayload: "token",
  }, catalog), /not_configured/);
});

test("native verification remains disabled until explicitly enabled", () => {
  assert.equal(nativeBillingVerificationEnabled({}), false);
  assert.equal(nativeBillingVerificationEnabled({
    NATIVE_BILLING_VERIFICATION_ENABLED: "true",
    APPLE_PREMIUM_LIFETIME_PRODUCT_ID: "com.soulcodex.premium.lifetime",
  }), true);
});
