import { test } from "node:test";
import assert from "node:assert";
import type { SoulProfile } from "../../src/types/soulcodex.js";
import {
  answerFromProfile,
  soulGuideFallback,
} from "../soul-guide-fallback.js";

function completeProfile(): SoulProfile {
  return {
    birth: {
      name: "Fallback Test",
      birthDate: "1990-09-17",
      birthTime: "11:11",
      birthPlace: "Bronx, New York",
      timeKnown: true,
    },
    confidence: {
      badge: "partial",
      label: "Partially verified",
      reason: "Birth details are supplied but not externally documented.",
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
    },
    chart: {
      sun: { planet: "Sun", sign: "Virgo" },
      moon: { planet: "Moon", sign: "Cancer" },
      rising: { planet: "Ascendant", sign: "Scorpio" },
      venus: { planet: "Venus", sign: "Libra" },
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
      crisisResponse: "Solve the immediate problem",
    },
    timeline: {
      currentPhase: "Construction",
      reasons: ["Long-term systems are becoming the main focus"],
    },
  };
}

test("Soul Guide service fallback", async (suite) => {
  await suite.test("returns layered clarity cards for a complete profile", () => {
    const result = soulGuideFallback(completeProfile());

    assert.deepEqual(
      result.primaryCards?.map((card) => card.key),
      ["claritySummary", "coreContradiction", "action"],
    );
    assert.ok(result.interpretation);
    assert.ok(result.markdown?.includes("# Soul Guide: Clarity First"));
    assert.ok(
      result.cards.some((card) => card.body.includes("mirror.driver")) ||
        result.markdown?.includes("mirror.driver"),
    );
  });

  await suite.test("keeps unknown-time evidence degraded", () => {
    const profile = completeProfile();
    profile.birth.timeKnown = false;
    delete profile.birth.birthTime;

    const result = soulGuideFallback(profile);
    const evidenceIds = new Set(
      result.interpretation?.evidence.map((item) => item.id) ?? [],
    );

    assert.equal(evidenceIds.has("astrology.rising.sign"), false);
    assert.equal(evidenceIds.has("human-design.type"), false);
    assert.ok(
      result.interpretation?.missingData.some((item) =>
        item.includes("Exact birth time is unknown"),
      ),
    );
  });

  await suite.test("returns an explicit unavailable state for incomplete input", () => {
    const result = soulGuideFallback({});

    assert.equal(result.interpretation, undefined);
    assert.equal(result.cards.length, 3);
    result.cards.forEach((card) => {
      assert.match(card.body, /^Unavailable:/);
    });
  });

  await suite.test("answers from the matching depth layer", () => {
    const profile = completeProfile();

    const strength = answerFromProfile("What am I good at?", profile);
    const decision = answerFromProfile("How should I decide?", profile);
    const boundary = answerFromProfile("What boundary matters?", profile);

    assert.ok(strength.length > 20);
    assert.ok(decision.length > 20);
    assert.ok(boundary.length > 20);
    assert.notEqual(strength, decision);
  });
});
