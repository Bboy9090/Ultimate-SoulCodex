import assert from "node:assert/strict";
import test from "node:test";
import {
  BILLING_REQUIRED_VARIABLES,
  auditBillingVariableNames,
} from "../scripts/audit-billing-variable-names.mjs";

test("billing variable-name audit reports missing provider prerequisites without values", () => {
  const names = [
    "DATABASE_URL",
    "PUBLIC_APP_URL",
    "APPLE_CLIENT_ID",
    "APPLE_APP_ID",
    "APPLE_IAP_ROOT_CERTS_BASE64",
    "APPLE_PLUS_MONTHLY_PRODUCT_ID",
    "APPLE_PLUS_ANNUAL_PRODUCT_ID",
    "APPLE_IAP_ALLOWED_ENVIRONMENTS",
    "SOUL_CODEX_PLUS_IOS_BILLING_ENABLED",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
    "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
    "GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN",
    "SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED",
    "SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED",
    "SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED",
  ];

  const report = auditBillingVariableNames(names);

  assert.equal(report.completeByName, false);
  assert.deepEqual(report.missing, [
    "APPLE_WEB_CLIENT_ID",
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ]);
  assert.deepEqual(report.missingByGroup.webAuth, ["APPLE_WEB_CLIENT_ID"]);
  assert.deepEqual(report.missingByGroup.google, ["GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"]);
  assert.deepEqual(report.missingByGroup.stripe, [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
  ]);
});

test("billing variable-name audit passes when every required name is present", () => {
  const names = Object.values(BILLING_REQUIRED_VARIABLES).flat();
  const report = auditBillingVariableNames(names);

  assert.equal(report.completeByName, true);
  assert.deepEqual(report.missing, []);
  for (const missing of Object.values(report.missingByGroup)) {
    assert.deepEqual(missing, []);
  }
});
