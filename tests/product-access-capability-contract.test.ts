import assert from "node:assert/strict";
import test from "node:test";
import {
  DAILY_INFLUENCE_LIMIT,
  SOUL_CODEX_CAPABILITIES,
  capabilityUpgradeReason,
  resolveCapabilityGate,
  tierAllowsCapability,
} from "../shared/product-access";

test("free keeps core clarity capabilities", () => {
  for (const capability of [
    "core_profile",
    "big_three",
    "date_numerology",
    "evidence_provenance",
    "diamond_closure",
    "basic_connections",
    "basic_compatibility",
  ] as const) {
    assert.equal(tierAllowsCapability("free", capability), true);
  }
});

test("plus gates depth rather than accuracy", () => {
  for (const capability of [
    "full_natal_chart",
    "full_name_numerology",
    "human_design_depth",
    "advanced_daily",
    "advanced_transits",
    "timeline_history",
    "advanced_connections",
    "cross_system_synthesis",
    "premium_exports",
    "premium_tarot",
  ] as const) {
    assert.equal(SOUL_CODEX_CAPABILITIES[capability].minimumTier, "plus");
    assert.equal(tierAllowsCapability("free", capability), false);
    assert.equal(tierAllowsCapability("plus", capability), true);
    assert.ok(capabilityUpgradeReason(capability));
  }
});

test("daily influence budget is centrally defined", () => {
  assert.equal(DAILY_INFLUENCE_LIMIT.free, 3);
  assert.equal(DAILY_INFLUENCE_LIMIT.plus, 5);
});

test("capability gate returns a usable upgrade explanation", () => {
  const gate = resolveCapabilityGate("free", "advanced_connections");
  assert.equal(gate.allowed, false);
  assert.equal(gate.tier, "free");
  assert.match(gate.label, /Connections/);
  assert.match(gate.upgradeReason ?? "", /communication/i);
});
