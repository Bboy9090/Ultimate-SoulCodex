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

test("legacy synthesis frames behavioral outputs as reflections rather than observed facts", () => {
  const result = synthesize(signals, archetype);

  assert.match(result.myPattern, /^Symbolic reflection:/);
  assert.match(result.stressPattern, /^Self-report reflection:/);
  assert.match(result.relationshipPattern, /^Self-report reflection:/);
  assert.match(result.recognitionMoment, /^Self-report reflection:/);
  assert.match(result.powerMode, /^Goal reflection:/);
  assert.match(result.contradiction, /^Self-report reflection:/);
  assert.match(result.lifeConsequence, /^Self-report reflection:/);
  assert.match(result.patternInterruption, /^Self-report reflection:/);
  assert.match(result.loopSentence, /^Self-report reflection:/);
  assert.match(result.moralCode.notes, /^Self-report reflection:/);
  assert.ok(result.growthEdges.every((entry) => entry.startsWith("Self-report reflection:")));
});

test("legacy synthesis does not emit unsupported dominance, synergy, or behavior predictions", () => {
  const result = synthesize(signals, archetype);

  assert.deepEqual(result.synergy, []);
  assert.deepEqual(result.coreDrivers, []);
  assert.deepEqual(result.predictions, []);
});