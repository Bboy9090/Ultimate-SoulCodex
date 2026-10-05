import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../scripts/validate-billing-production-readiness.mjs", import.meta.url), "utf8");

test("billing readiness preflight covers all production provider boundaries", () => {
  for (const key of [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PLUS_MONTHLY_PRICE_ID",
    "STRIPE_PLUS_ANNUAL_PRICE_ID",
    "APPLE_CLIENT_ID",
    "APPLE_WEB_CLIENT_ID",
    "APPLE_APP_ID",
    "APPLE_IAP_ROOT_CERTS_BASE64",
    "APPLE_PLUS_MONTHLY_PRODUCT_ID",
    "APPLE_PLUS_ANNUAL_PRODUCT_ID",
    "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
    "GOOGLE_PLAY_PACKAGE_NAME",
    "GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID",
    "GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID",
    "GOOGLE_PLAY_RTDN_VERIFICATION_TOKEN",
  ]) {
    assert.match(source, new RegExp(key));
  }
  assert.match(source, /APPLE_IAP_ALLOWED_ENVIRONMENTS/);
  assert.match(source, /SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED/);
  assert.match(source, /stripe\.configured && webAuth\.configured/);
  assert.match(source, /SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED/);
  assert.match(source, /process\.exit\(2\)/);
  assert.match(source, /--require-all/);
});

test("readiness preflight never prints secret values explicitly", () => {
  assert.doesNotMatch(source, /console\.log\([^\n]*(STRIPE_SECRET_KEY|GOOGLE_PLAY_SERVICE_ACCOUNT_JSON|APPLE_IAP_ROOT_CERTS_BASE64)/);
});
