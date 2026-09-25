import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SOUL_CODEX_SYSTEM_POLICIES,
  mayInspectSystem,
  maySystemInfluenceSynthesis,
  unavailableProductionSystems,
} from "../shared/system-visibility.ts";

const productionRoutes = readFileSync(
  new URL("../server/routes.ts", import.meta.url),
  "utf8",
);
const galacticGenerator = readFileSync(
  new URL("../server/services/galactic-code/generator.ts", import.meta.url),
  "utf8",
);

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

test("only promoted verified systems can influence production synthesis", () => {
  for (const policy of unavailableProductionSystems()) {
    assert.equal(policy.mayInfluencePrimarySynthesis, false, policy.id);
    assert.equal(policy.inspectableWhenUnverified, false, policy.id);
  }

  for (const key of ["housesMidheaven", "nodesChiron"] as const) {
    assert.equal(maySystemInfluenceSynthesis(key, "verified"), true);
    assert.equal(maySystemInfluenceSynthesis(key, "candidate"), false);
    assert.equal(mayInspectSystem(key, "candidate"), false);
  }
  for (const key of ["astrocartography", "palmistry", "chineseAstrology", "iChing"] as const) {
    assert.equal(maySystemInfluenceSynthesis(key, "verified"), false);
    assert.equal(mayInspectSystem(key, "candidate"), false);
  }

  for (const key of ["runes", "sacredGeometry"] as const) {
    assert.equal(maySystemInfluenceSynthesis(key, "deterministic"), false);
    assert.equal(mayInspectSystem(key, "deterministic"), true);
  }
});

test("production synthesis cannot accept caller-attested specialist evidence", () => {
  assert.doesNotMatch(productionRoutes, /registerGalacticCodeRoutes\(app\)/);
  assert.match(galacticGenerator, /maySystemInfluenceSynthesis/);
  assert.match(galacticGenerator, /input\.humanDesign\.evidenceState \|\| 'candidate'/);
});


test("quarantined legacy systems are named explicitly in executable policy", () => {
  assert.match(SOUL_CODEX_SYSTEM_POLICIES.chineseAstrology.rule, /not BaZi\/Four Pillars/i);
  assert.match(SOUL_CODEX_SYSTEM_POLICIES.iChing.rule, /incomplete hexagram corpus/i);
  assert.match(SOUL_CODEX_SYSTEM_POLICIES.palmistry.rule, /actual image-analysis contract/i);
});
