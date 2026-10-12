import assert from "node:assert/strict";
import test from "node:test";
import { buildClarityReadingModel } from "../client/src/lib/clarityReadingModel.ts";

const cachedPlusProfile = {
  birthDate: "1990-09-17",
  fullBirthName: "Bobby Example",
  astrologyData: {},
  verifiedAstrologyData: {},
  numerologyData: { lifePath: 9, expression: 4, soulUrge: 5 },
  humanDesignData: {},
  personalityData: {},
  archetypeData: {
    title: "Premium Architect",
    description: "Premium archetype description.",
    strengths: ["Premium strength"],
    shadows: ["Premium shadow"],
  },
  biography: "Premium biography with paid interpretation.",
  dailyGuidance: "Premium paid action.",
  depthInterpretation: {
    title: "Premium depth title",
    summary: "Premium depth summary.",
    visiblePattern: "Premium visible pattern.",
    gift: "Premium gift.",
    cost: "Premium cost.",
    relationshipImpact: "Premium relationship impact.",
    groundedAction: "Premium grounded action.",
  },
};

test("Free clarity model ignores cached Plus prose and paid name numerology", () => {
  const model = buildClarityReadingModel(cachedPlusProfile, {
    fullNameNumerology: false,
    humanDesignCore: false,
    interpretationDepth: false,
  });

  const serialized = JSON.stringify(model);
  assert.doesNotMatch(serialized, /Premium/i);
  assert.equal(model.title, "Life Path 9");
  assert.match(model.summary, /Free clarity/i);
  assert.match(model.summary, /Life Path 9/);
  assert.doesNotMatch(model.summary, /paid interpretation/i);
  assert.equal(model.signals.some((signal) => signal.id === "expression"), false);
  assert.equal(model.signals.some((signal) => signal.id === "soul-urge"), false);
  assert.match(model.groundedAction, /Choose one situation/i);
});

test("Plus clarity model preserves cached deeper interpretation sources", () => {
  const model = buildClarityReadingModel(cachedPlusProfile, {
    fullNameNumerology: true,
    humanDesignCore: true,
    interpretationDepth: true,
  });

  assert.equal(model.title, "Premium depth title");
  assert.equal(model.summary, "Premium depth summary.");
  assert.match(model.visiblePattern, /Premium visible pattern/);
  assert.equal(model.groundedAction, "Premium grounded action.");
  assert.equal(model.signals.some((signal) => signal.id === "expression"), true);
  assert.equal(model.signals.some((signal) => signal.id === "soul-urge"), true);
});
