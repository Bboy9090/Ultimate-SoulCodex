import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const handoff = readFileSync(new URL("../docs/SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md", import.meta.url), "utf8");

test("4.1 store catalog handoff freezes the intended cross-store identifiers and cadence", () => {
  assert.match(handoff, /`app\.soulcodex\.plus\.monthly\.renewing`/);
  assert.match(handoff, /`app\.soulcodex\.plus\.annual\.renewing`/);
  assert.match(handoff, /soul_codex_plus_monthly/);
  assert.match(handoff, /soul_codex_plus_annual/);
  assert.match(handoff, /\$5\.99 USD/);
  assert.match(handoff, /\$59\.99 USD/);
  assert.match(handoff, /every 1 month/);
  assert.match(handoff, /every 1 year/);
});

test("handoff distinguishes observed Apple products from unverified purchases and keeps billing disabled", () => {
  assert.match(handoff, /Google Play and Stripe catalog creation and availability remain unverified/);
  assert.match(handoff, /Both products were \*\*Prepare for Submission\*\*/);
  assert.match(handoff, /existence does not prove StoreKit availability or completed purchases/);
  assert.match(handoff, /APPLE_PLUS_MONTHLY_PRODUCT_ID=app\.soulcodex\.plus\.monthly\.renewing`/);
  assert.match(handoff, /APPLE_PLUS_ANNUAL_PRODUCT_ID=app\.soulcodex\.plus\.annual\.renewing`/);
  assert.doesNotMatch(handoff, /`app\.soulcodex\.plus\.(monthly|annual)`/);
  assert.match(handoff, /billing flags remain `false`/);
  assert.match(handoff, /sandbox\/TestFlight\/internal-test purchase/);
  assert.match(handoff, /Free remains available/);
});


test("4.1 handoff permits provider-by-provider native activation", () => {
  assert.match(handoff, /SOUL_CODEX_PLUS_IOS_BILLING_ENABLED=true/);
  assert.match(handoff, /SOUL_CODEX_PLUS_ANDROID_BILLING_ENABLED=true/);
  assert.match(handoff, /legacy `SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED` remains a compatibility fallback/);
  assert.match(handoff, /per provider/);
});
