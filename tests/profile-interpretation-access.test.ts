import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { projectInterpretationInputsForTier } from "../server/lib/profile-interpretation-access.ts";

const fullNumerology = {
  status: "resolved",
  lifePath: 9,
  birthday: 17,
  expression: 4,
  soulUrge: 5,
  personality: 8,
  maturity: 4,
  personalYear: 8,
  interpretations: {
    lifePath: "life path",
    birthday: "birthday",
    expression: "expression",
    soulUrge: "soul urge",
    personality: "personality",
    maturity: "maturity",
    personalYear: "personal year",
  },
};

const verifiedHumanDesign = {
  status: "verified",
  type: "Reflector",
  strategy: "Wait a lunar cycle",
  authority: "Lunar Authority",
  profile: "2/5",
  engine: "soulcodex-hd-geocentric-v1",
  source: "verified source",
  calculatedAt: "2026-09-26T18:00:00.000Z",
  inputTimestampUtc: "1990-09-17T15:11:00.000Z",
  verificationReceiptId: "receipt",
  independentSource: "independent",
  verifiedAt: "2026-09-19T23:03:08.000Z",
};

test("Free synthesis keeps date numerology but removes paid name numerology", () => {
  const projected = projectInterpretationInputsForTier("free", fullNumerology, verifiedHumanDesign);
  assert.equal(projected.numerologyData.lifePath, 9);
  assert.equal(projected.numerologyData.birthday, 17);
  assert.equal(projected.numerologyData.personalYear, 8);
  assert.equal(projected.numerologyData.expression, null);
  assert.equal(projected.numerologyData.soulUrge, null);
  assert.equal(projected.numerologyData.personality, null);
  assert.equal(projected.numerologyData.maturity, null);
  assert.deepEqual(Object.keys(projected.numerologyData.interpretations).sort(), ["birthday", "lifePath", "personalYear"]);
});

test("Free synthesis can consume verified Human Design core but not deeper bodygraph values", () => {
  const projected = projectInterpretationInputsForTier("free", fullNumerology, verifiedHumanDesign);
  assert.equal(projected.humanDesignData.status, "verified");
  assert.equal(projected.humanDesignData.type, "Reflector");
  assert.equal(projected.humanDesignData.strategy, "Wait a lunar cycle");
  assert.equal(projected.humanDesignData.authority, "Lunar Authority");
  assert.equal(projected.humanDesignData.profile, "2/5");
  assert.equal(projected.humanDesignData.definition, undefined);
  assert.equal(projected.humanDesignData.centers, undefined);
  assert.equal(projected.humanDesignData.channels, undefined);
  assert.equal(projected.humanDesignData.activatedGates, undefined);
});

test("Plus synthesis receives the stored qualified interpretation inputs unchanged", () => {
  const projected = projectInterpretationInputsForTier("plus", fullNumerology, verifiedHumanDesign);
  assert.equal(projected.numerologyData.expression, 4);
  assert.equal(projected.numerologyData.soulUrge, 5);
  assert.equal(projected.humanDesignData.type, "Reflector");
  assert.equal(projected.humanDesignData.authority, "Lunar Authority");
});

test("profile creation and assessment refreshes apply entitlement projection before archetype and prose generation", () => {
  const routes = readFileSync(new URL("../server/routes.ts", import.meta.url), "utf8");
  assert.match(routes, /projectInterpretationInputsForTier/);
  assert.match(routes, /synthesizeArchetype\([\s\S]*interpretationInputs\.numerologyData[\s\S]*interpretationInputs\.humanDesignData/);
  assert.match(routes, /humanDesignData:\s*interpretationInputs\.humanDesignData/);
  assert.match(routes, /numerologyData:\s*interpretationInputs\.numerologyData/);
});
