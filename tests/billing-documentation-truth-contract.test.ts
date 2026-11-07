import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const monetization = readFileSync(new URL("../docs/MONETIZATION_V4_1_CONTRACT.md", import.meta.url), "utf8");
const catalog = readFileSync(new URL("../docs/SOUL_CODEX_PLUS_STORE_CATALOG_4_1.md", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../client/src/pages/PricingPage.tsx", import.meta.url), "utf8");

test("native billing docs distinguish implementation from provider-specific production activation", () => {
  assert.match(monetization, /purchase initiation and restore are implemented behind platform-specific activation flags/);
  assert.match(monetization, /Production activation must remain off for a provider until that provider\'s current-build sandbox\/TestFlight\/internal-test purchase/);
  assert.match(monetization, /provider-specific billing paths that are explicitly enabled and verifier\/catalog ready/);
  assert.doesNotMatch(monetization, /Soul Codex 4\.0\.1 does not sell native premium access/);
  assert.doesNotMatch(monetization, /purchase initiation and restore are not yet active/);
});

test("operator catalog uses the approved near-six and near-sixty baseline", () => {
  assert.match(catalog, /Soul Codex\+ Monthly \| \$5\.99 USD \| Monthly/);
  assert.match(catalog, /Soul Codex\+ Annual \| \$59\.99 USD \| Annual/);
  assert.match(catalog, /Monthly: \$5\.99 USD every 1 month/);
  assert.match(catalog, /Annual: \$59\.99 USD every 1 year/);
  assert.doesNotMatch(catalog, /\$9\.99 USD|\$89\.99 USD/);
});

test("runtime pricing remains provider-driven rather than hard-coded from the operator baseline", () => {
  assert.match(pricing, /Purchase availability and localized pricing come from the qualified platform billing path rather than hard-coded app values/);
  assert.doesNotMatch(pricing, /\$5\.99|\$59\.99|\$9\.99|\$89\.99/);
});
