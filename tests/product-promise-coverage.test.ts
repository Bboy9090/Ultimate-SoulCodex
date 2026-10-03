import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SOUL_CODEX_CAPABILITIES } from "../shared/product-access";

const profile = readFileSync(new URL("../client/src/pages/profile.tsx", import.meta.url), "utf8");
const timeline = readFileSync(new URL("../client/src/pages/TimelinePage.tsx", import.meta.url), "utf8");
const compatibility = readFileSync(new URL("../client/src/pages/CompatibilityHubPage.tsx", import.meta.url), "utf8");
const compatibilityRoute = readFileSync(new URL("../server/routes/compatibility.ts", import.meta.url), "utf8");
const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
const diamondClosure = readFileSync(new URL("../client/src/components/DiamondClosure.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../client/src/pages/PricingPage.tsx", import.meta.url), "utf8");

test("every Free promise has a concrete implementation surface", () => {
  assert.match(profile, /Your Big 3/);
  assert.match(profile, /Life Path/);
  assert.match(profile, /Why am I seeing this\?/);
  assert.match(diamondClosure, /Clarity/);
  assert.match(diamondClosure, /Depth/);
  assert.match(diamondClosure, /Next move/);
  assert.match(compatibility, /bounded symbolic comparison/i);
  assert.match(compatibilityRoute, /foundation-compatibility-v2/);
});

test("every live Plus promise has a concrete implementation surface", () => {
  assert.equal(SOUL_CODEX_CAPABILITIES.full_name_numerology.availability, "live");
  for (const field of ["Expression", "Soul Urge", "Personality", "Maturity"]) {
    assert.ok(profile.includes(field), `missing live numerology field: ${field}`);
  }

  assert.equal(SOUL_CODEX_CAPABILITIES.human_design_depth.availability, "live");
  for (const field of ["Type", "Strategy", "Authority", "Profile"]) {
    assert.ok(profile.includes(field), `missing live Human Design field: ${field}`);
  }

  assert.equal(SOUL_CODEX_CAPABILITIES.advanced_daily.availability, "live");
  assert.match(timeline, /DAILY_INFLUENCE_LIMIT/);
  assert.match(timeline, /See all five influences/);

  assert.equal(SOUL_CODEX_CAPABILITIES.premium_exports.availability, "live");
  assert.match(routes, /\/api\/pdf\/profile\/:id/);
  assert.match(routes, /premium_exports/);
  assert.match(routes, /resolveProductEntitlement/);
});

test("planned capabilities are visibly excluded from the current paid promise", () => {
  for (const capability of [
    "full_natal_chart",
    "advanced_transits",
    "timeline_history",
    "advanced_connections",
    "cross_system_synthesis",
    "premium_tarot",
  ] as const) {
    assert.equal(SOUL_CODEX_CAPABILITIES[capability].availability, "planned");
  }

  assert.match(pricing, /Roadmap · not sold yet/);
  assert.match(pricing, /Planned, not included in the current paid promise/);
  assert.match(compatibility, /Planned · not included in current Soul Codex\+/);
});


test("legacy one-time premium product cannot be sold", () => {
  const billing = readFileSync(new URL("../server/billing.ts", import.meta.url), "utf8");
  const modal = readFileSync(new URL("../client/src/components/PremiumUpgradeModal.tsx", import.meta.url), "utf8");

  assert.match(billing, /legacy_checkout_retired/);
  assert.match(billing, /subscription_checkout_not_qualified/);
  assert.doesNotMatch(billing, /mode:\s*"payment"/);
  assert.doesNotMatch(modal, /One-time premium access/i);
  assert.doesNotMatch(modal, /Lifetime access/i);
  assert.match(modal, /Purchase path not active yet/);
});
