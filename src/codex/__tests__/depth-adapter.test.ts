import { test } from "node:test";
import assert from "node:assert";
import type { SoulProfile } from "../../types/soulcodex.js";
import {
  validateDepthInterpretationV1,
} from "../../../packages/core/depth-interpretation/index.js";
import {
  normalizeSoulProfileForDepth,
  synthesizeDepthCodex,
} from "../depth-adapter.js";
import { synthesizeCodex } from "../synthesize.js";

function completeProfile(): SoulProfile {
  return {
    birth: {
      name: "Test Profile",
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthPlace: "Bronx, New York",
      lat: 40.8448,
      lon: -73.8648,
      timezone: "America/New_York",
      timeKnown: true,
    },
    confidence: {
      badge: "partial",
      label: "Partially verified",
      reason: "Birth time is supplied but not externally documented.",
    },
    mirror: {
      driver: "Independence",
      shadowTrigger: "Loss of control",
      decisionStyle: "Analytical logic",
      energyStyle: "Fast and independent",
      conflictStyle: "Direct confrontation",
      nuance: ["Consistency matters more than people first assume."],
    },
    numerology: {
      lifePath: 4,
      expression: 1,
      soulUrge: 9,
    },
    chart: {
      sun: { planet: "Sun", sign: "Virgo", degree: 24 },
      moon: { planet: "Moon", sign: "Cancer", degree: 12 },
      rising: { planet: "Ascendant", sign: "Scorpio", degree: 8 },
      venus: { planet: "Venus", sign: "Libra", degree: 3 },
    },
    humanDesign: {
      type: "Manifestor",
      strategy: "Inform before acting",
      authority: "Emotional",
      profile: "2/5",
    },
    elements: {
      earth: 4,
      air: 2,
      fire: 3,
      water: 3,
    },
    morals: {
      values: ["Consistency", "Honesty"],
      intolerances: ["Dishonesty", "Control"],
      crisisResponse: "Take control and solve the immediate problem",
    },
    timeline: {
      currentPhase: "Construction",
      reasons: ["Long-term systems are becoming the main focus"],
    },
  };
}

test("SoulProfile depth adapter", async (suite) => {
  await suite.test("creates a valid evidence-backed interpretation", () => {
    const profile = completeProfile();
    const interpretation = synthesizeDepthCodex(profile, {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });
    const validation = validateDepthInterpretationV1(interpretation, {
      birthTimeStatus: "known",
    });

    assert.equal(validation.valid, true);
    assert.deepEqual(validation.findings, []);
    assert.ok(
      interpretation.evidence.some((item) => item.id === "mirror.driver"),
    );
    assert.ok(
      interpretation.evidence.some(
        (item) => item.id === "astrology.rising.sign",
      ),
    );
    assert.ok(
      interpretation.evidence.some(
        (item) => item.id === "moral-compass.values",
      ),
    );
    assert.deepEqual(interpretation.coreContradiction.evidenceIds, [
      "mirror.driver",
      "moral-compass.values",
    ]);
  });

  await suite.test("removes time-sensitive astrology and Human Design evidence when time is unknown", () => {
    const profile = completeProfile();
    profile.birth.timeKnown = false;
    delete profile.birth.birthTime;

    const interpretation = synthesizeDepthCodex(profile, {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });
    const ids = new Set(interpretation.evidence.map((item) => item.id));

    assert.equal(ids.has("astrology.rising.sign"), false);
    assert.equal(ids.has("human-design.type"), false);
    assert.equal(ids.has("human-design.authority"), false);
    assert.equal(ids.has("human-design.strategy"), false);
    assert.equal(ids.has("astrology.sun.sign"), true);
    assert.equal(ids.has("numerology.life-path"), true);
    assert.equal(ids.has("mirror.driver"), true);
    assert.ok(
      interpretation.missingData.some((item) =>
        item.includes("Exact birth time is unknown"),
      ),
    );
    assert.equal(
      validateDepthInterpretationV1(interpretation, {
        birthTimeStatus: "unknown",
      }).valid,
      true,
    );
  });

  await suite.test("uses unavailable layers instead of invented filler", () => {
    const profile: SoulProfile = {
      birth: {
        birthDate: "1990-09-17",
        birthPlace: "Bronx, New York",
        timeKnown: false,
      },
      numerology: { lifePath: 4 },
      chart: {
        sun: { planet: "Sun", sign: "Virgo" },
        moon: { planet: "Moon", sign: "Cancer" },
      },
    };

    const interpretation = synthesizeDepthCodex(profile, {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });

    assert.equal(interpretation.protectiveFunction.claimKind, "unavailable");
    assert.equal(interpretation.boundaryOrRepair.claimKind, "unavailable");
    assert.equal(interpretation.action.claimKind, "unavailable");
    assert.match(interpretation.action.summary, /^Unavailable:/);
    assert.ok(
      interpretation.missingData.includes("Mirror behavioral driver is missing."),
    );
  });

  await suite.test("keeps user-stated evidence authoritative without making it universal certainty", () => {
    const interpretation = synthesizeDepthCodex(completeProfile(), {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });

    const driver = interpretation.evidence.find(
      (item) => item.id === "mirror.driver",
    );

    assert.equal(driver?.confidence, "high");
    assert.equal(driver?.provenanceStatus, "partially-verified");
    assert.equal(interpretation.hiddenNeed.claimKind, "inferred");
    assert.ok(interpretation.hiddenNeed.limitations.length > 0);
  });

  await suite.test("does not mutate or replace the existing synthesis API", () => {
    const profile = completeProfile();
    const profileSnapshot = JSON.stringify(profile);
    const before = synthesizeCodex(profile);

    normalizeSoulProfileForDepth(profile, {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });
    synthesizeDepthCodex(profile, {
      generatedAt: "2026-07-24T16:30:00.000Z",
    });

    assert.deepEqual(synthesizeCodex(profile), before);
    assert.equal(JSON.stringify(profile), profileSnapshot);
  });

  await suite.test("normalization is deterministic when generatedAt is fixed", () => {
    const profile = completeProfile();
    const options = { generatedAt: "2026-07-24T16:30:00.000Z" };

    assert.equal(
      JSON.stringify(normalizeSoulProfileForDepth(profile, options)),
      JSON.stringify(normalizeSoulProfileForDepth(profile, options)),
    );
    assert.equal(
      JSON.stringify(synthesizeDepthCodex(profile, options)),
      JSON.stringify(synthesizeDepthCodex(profile, options)),
    );
  });
});
