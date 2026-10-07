import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const handoff = readFileSync(new URL("../docs/SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md", import.meta.url), "utf8");

test("4.1 store catalog handoff freezes the intended cross-store identifiers and cadence", () => {
  assert.match(handoff, /app\.soulcodex\.plus\.monthly/);
  assert.match(handoff, /app\.soulcodex\.plus\.annual/);
  assert.match(handoff, /soul_codex_plus_monthly/);
  assert.match(handoff, /soul_codex_plus_annual/);
  assert.match(handoff, /\$9\.99 USD/);
  assert.match(handoff, /\$89\.99 USD/);
  assert.match(handoff, /every 1 month/);
  assert.match(handoff, /every 1 year/);
});

test("handoff refuses to claim uncreated store products or enable billing prematurely", () => {
  assert.match(handoff, /does \*\*not\*\* claim the products already exist/);
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
