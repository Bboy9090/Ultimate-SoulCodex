import assert from "node:assert/strict";
import test from "node:test";
import {
  SOUL_CODEX_SYSTEM_POLICIES,
  mayInspectSystem,
  maySystemInfluenceSynthesis,
  unavailableProductionSystems,
} from "../shared/system-visibility.ts";

test("unverified astrology candidates are inspectable but cannot influence primary synthesis", () => {
  assert.equal(mayInspectSystem("astrologyCore", "candidate"), true);
  assert.equal(maySystemInfluenceSynthesis("astrologyCore", "candidate"), false);
  assert.equal(maySystemInfluenceSynthesis("astrologyCore", "verified"), true);
});

test("deterministic numerology may support synthesis while its meaning remains symbolic by policy", () => {
  assert.equal(maySystemInfluenceSynthesis("numerology", "deterministic"), true);
  assert.match(SOUL_CODEX_SYSTEM_POLICIES.numerology.rule, /meaning remains symbolic/i);
});

test("Human Design candidate stays inspectable-only until its trust record verifies", () => {
  assert.equal(mayInspectSystem("humanDesign", "candidate"), true);
  assert.equal(maySystemInfluenceSynthesis("humanDesign", "candidate"), false);
  assert.equal(maySystemInfluenceSynthesis("humanDesign", "verified"), true);
});

test("unfinished systems cannot leak into production synthesis or inspection as fake results", () => {
  for (const policy of unavailableProductionSystems()) {
    assert.equal(policy.mayInfluencePrimarySynthesis, false, policy.id);
    assert.equal(policy.inspectableWhenUnverified, false, policy.id);
  }

  for (const key of ["housesMidheaven", "nodesChiron", "astrocartography", "palmistry"] as const) {
    assert.equal(maySystemInfluenceSynthesis(key, "verified"), false);
    assert.equal(mayInspectSystem(key, "candidate"), false);
  }
});
