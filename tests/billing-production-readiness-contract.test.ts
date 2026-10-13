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
  assert.match(source, /SOUL_CODEX_PLUS_IOS_BILLING_ENABLED/);
  assert.match(source, /SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED/);
  assert.match(source, /SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED/);
  assert.match(source, /iosActivationSafe/);
  assert.match(source, /androidActivationSafe/);
  assert.match(source, /iosFlagExplicit/);
  assert.match(source, /androidFlagExplicit/);
  assert.match(source, /platformFlagsExplicit/);
  assert.match(source, /fullyConfigured:[\s\S]*iosFlagExplicit[\s\S]*androidFlagExplicit/);
  assert.match(source, /process\.exit\(2\)/);
  assert.match(source, /--require-provider/);
  assert.match(source, /providerConfigured/);
  assert.match(source, /--require-all/);
});

test("readiness preflight never prints secret values explicitly", () => {
  assert.doesNotMatch(source, /console\.log\([^\n]*(STRIPE_SECRET_KEY|GOOGLE_PLAY_SERVICE_ACCOUNT_JSON|APPLE_IAP_ROOT_CERTS_BASE64)/);
});


test("provider-specific production preflight can qualify one provider without requiring the others", async () => {
  const module = await import("../scripts/validate-billing-production-readiness.mjs?provider-contract-test");
  const base = {
    DATABASE_URL: "postgres://example",
    PUBLIC_APP_URL: "https://soulcodex.example",
    SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED: "false",
    SOUL_CODEX_PLUS_IOS_BILLING_ENABLED: "false",
    SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED: "false",
    SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED: "false",
  };

  const ios = module.providerReadiness({
    ...base,
    APPLE_CLIENT_ID: "app.soulcodex.ios",
    APPLE_APP_ID: "app.soulcodex.ios",
    APPLE_IAP_ROOT_CERTS_BASE64: "cert",
    APPLE_PLUS_MONTHLY_PRODUCT_ID: "app.soulcodex.plus.monthly",
    APPLE_PLUS_ANNUAL_PRODUCT_ID: "app.soulcodex.plus.annual",
    APPLE_IAP_ALLOWED_ENVIRONMENTS: "production",
  });
  assert.equal(ios.providerConfigured.ios, true);
  assert.equal(ios.providerConfigured.android, false);
  assert.equal(ios.providerConfigured.web, false);

  const web = module.providerReadiness({
    ...base,
    APPLE_WEB_CLIENT_ID: "app.soulcodex.web",
    STRIPE_SECRET_KEY: "sk_live_example",
    STRIPE_WEBHOOK_SECRET: "whsec_example",
    STRIPE_PLUS_MONTHLY_PRICE_ID: "price_monthly",
    STRIPE_PLUS_ANNUAL_PRICE_ID: "price_annual",
  });
  assert.equal(web.providerConfigured.web, true);
  assert.equal(web.providerConfigured.ios, false);
  assert.equal(web.providerConfigured.android, false);
});
