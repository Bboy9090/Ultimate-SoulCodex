import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SOUL_CODEX_CAPABILITIES } from "../shared/product-access.ts";

const modal = readFileSync(new URL("../client/src/components/PremiumUpgradeModal.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../client/src/pages/PricingPage.tsx", import.meta.url), "utf8");

test("verified Human Design core remains part of the Free promise", () => {
  assert.equal(SOUL_CODEX_CAPABILITIES.human_design_core.minimumTier, "free");
  assert.equal(SOUL_CODEX_CAPABILITIES.human_design_core.availability, "live");
  assert.match(pricing, /Verified Human Design Type, Strategy, Authority, and Profile/);
  assert.doesNotMatch(modal, /Verified Human Design Type, Strategy, Authority, and Profile/);
});

test("planned Human Design depth is not sold as current Plus access", () => {
  assert.equal(SOUL_CODEX_CAPABILITIES.human_design_depth.minimumTier, "plus");
  assert.equal(SOUL_CODEX_CAPABILITIES.human_design_depth.availability, "planned");
  assert.doesNotMatch(modal, /Definition, centers, channels, activated gates/);
});
