import assert from "node:assert/strict";
import test from "node:test";
import {
  nativeBillingVerificationEnabled,
  parseNativeVerificationRequest,
  resolveNativeProductCatalog,
} from "../shared/billing-entitlements.ts";

const catalog = resolveNativeProductCatalog({
  APPLE_PREMIUM_LIFETIME_PRODUCT_ID: "com.soulcodex.premium.lifetime",
  GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID: "premium_lifetime",
});

test("native verification accepts only configured products", () => {
  const parsed = parseNativeVerificationRequest({
    provider: "apple_app_store",
    environment: "sandbox",
    productId: "com.soulcodex.premium.lifetime",
    externalTransactionId: "1000001234567890",
    signedPayload: "signed-transaction-jws",
  }, catalog);
  assert.equal(parsed.provider, "apple_app_store");
  assert.equal(parsed.originalTransactionId, null);
  assert.throws(() => parseNativeVerificationRequest({
    provider: "google_play",
    environment: "production",
    productId: "unconfigured_product",
    externalTransactionId: "GPA.123",
    signedPayload: "token",
  }, catalog), /not_configured/);
});

test("native verification rejects malformed or cross-provider payloads", () => {
  assert.throws(() => parseNativeVerificationRequest({
    provider: "apple_app_store",
    environment: "sandbox",
    productId: "premium_lifetime",
    externalTransactionId: "GPA.123",
    signedPayload: "token",
  }, catalog), /not_configured/);
  assert.throws(() => parseNativeVerificationRequest({
    provider: "google_play",
    environment: "sandbox",
    productId: "premium_lifetime",
    externalTransactionId: "GPA.123",
  }, catalog), /request_invalid/);
});

test("native verification is disabled until explicitly enabled", () => {
  assert.equal(nativeBillingVerificationEnabled({}), false);
  assert.equal(nativeBillingVerificationEnabled({
    NATIVE_BILLING_VERIFICATION_ENABLED: "true",
    APPLE_PREMIUM_LIFETIME_PRODUCT_ID: "com.soulcodex.premium.lifetime",
  }), true);
});
