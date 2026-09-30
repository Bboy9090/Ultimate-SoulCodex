import assert from "node:assert/strict";
import test from "node:test";
import { synthesize } from "../soulcodex/compute/synthesis.ts";

const signals = {
  name: "Fixture",
  lifePath: 9,
  mirrorProfile: {
    decisionStyle: ["Action"],
    energyStyle: ["Solitude"],
    driver: ["Legacy"],
    shadowTrigger: ["Authority"],
  },
  nonNegotiables: ["honesty"],
  goals: ["build something"],
  seed: "fixture",
  pressureStyle: ["fight"],
  stressElement: ["fire"],
  decisionStyle: ["analysis"],
  socialEnergy: ["steady"],
  sunSign: "Virgo",
  moonSign: "Virgo",
  risingSign: "Scorpio",
} as any;

const archetype = {
  name: "Architect",
  tagline: "fixture",
  element: "earth",
  role: "Builder",
} as any;

const symbolicOpeners = [
  "Treat this as symbolic language to test against experience:",
  "One symbolic interpretation to compare with real life:",
  "Use this placement-derived idea as a lens, not a fact:",
];

const selfReportOpeners = [
  "Compare this pattern with behavior you have actually observed:",
  "Use your recorded answers to test whether this description fits:",
  "Check this interpretation against specific lived examples:",
  "Keep, revise, or reject this based on what you actually do:",
];

const goalOpeners = [
  "Use this stated goal as a planning prompt:",
  "Compare this goal-based interpretation with your actual priorities:",
  "Treat this as a direction to test through action:",
];

function startsWithAny(value: string, options: readonly string[]): boolean {
  return options.some((option) => value.startsWith(option));
}

test("legacy synthesis frames unsupported behavioral prose as reflection rather than fact", () => {
  const result = synthesize(signals, archetype);

  assert.equal(startsWithAny(result.myPattern, symbolicOpeners), true);
  assert.equal(startsWithAny(result.powerMode, goalOpeners), true);

  for (const value of [
    result.stressPattern,
    result.relationshipPattern,
    result.recognitionMoment,
    result.contradiction,
    result.lifeConsequence,
    result.patternInterruption,
    result.loopSentence,
    result.moralCode.notes,
    ...result.growthEdges,
  ]) {
    assert.equal(startsWithAny(value, selfReportOpeners), true, value);
  }
});

test("legacy synthesis does not emit unsupported dominance, synergy, or behavior predictions", () => {
  const result = synthesize(signals, archetype);

  assert.deepEqual(result.synergy, []);
  assert.deepEqual(result.coreDrivers, []);
  assert.deepEqual(result.predictions, []);
});

test("legacy synthesis reflection framing does not collapse into one repeated opener", () => {
  const result = synthesize(signals, archetype);
  const values = [
    result.stressPattern,
    result.relationshipPattern,
    result.recognitionMoment,
    result.contradiction,
    result.lifeConsequence,
    result.patternInterruption,
    result.loopSentence,
    result.moralCode.notes,
    ...result.growthEdges,
  ];

  const openerHits = values.map((value) =>
    selfReportOpeners.find((opener) => value.startsWith(opener)) ?? "",
  );
  assert.ok(new Set(openerHits).size >= 3, `expected at least three reflection openers, got ${new Set(openerHits).size}`);
});
