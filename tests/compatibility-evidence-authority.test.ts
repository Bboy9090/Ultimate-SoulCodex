import assert from "node:assert/strict";
import test from "node:test";
import { compatibility as legacyCompatibility } from "../soulcodex/compute/compatibility.ts";
import { compatibility as coreCompatibility } from "../packages/core/compute/compatibility.ts";

function legacySignals(values: string[]) {
  return {
    lifePath: 9,
    mirrorProfile: {} as any,
    nonNegotiables: values,
    goals: [],
    seed: "fixture",
    pressureStyle: ["fight"],
    stressElement: ["fire"],
    decisionStyle: ["analysis"],
    socialEnergy: ["steady"],
    sunSign: "Virgo",
    moonSign: "Scorpio",
  } as any;
}

function coreSignals(values: string[]) {
  return {
    lifePath: 9,
    nonNegotiables: values,
    goals: [],
    pressureStyle: "fight",
    stressElement: "fire",
    decisionStyle: "analysis",
    socialEnergy: "steady",
    sunSign: "Virgo",
    moonSign: "Scorpio",
  } as any;
}

for (const [name, compatibility, fixture] of [
  ["legacy compatibility", legacyCompatibility, legacySignals],
  ["package compatibility", coreCompatibility, coreSignals],
] as const) {
  test(`${name} withholds unproven identity, stress, and decision scoring`, () => {
    const result = compatibility(
      fixture(["honesty", "family"]),
      fixture(["honesty", "family"]),
    );

    assert.equal(result.dimensions.identity.score, null);
    assert.equal(result.dimensions.stress.score, null);
    assert.equal(result.dimensions.decisions.score, null);
    assert.equal(result.overall, null);
    assert.match(result.dimensions.identity.note, /verified astrology evidence/i);
    assert.match(result.dimensions.stress.note, /supporting reflection/i);
    assert.match(result.dimensions.decisions.note, /direct self-report provenance/i);
  });

  test(`${name} limits direct values comparison without manufacturing an overall verdict`, () => {
    const result = compatibility(
      fixture(["honesty", "family"]),
      fixture(["honesty", "family", "stability"]),
    );

    assert.equal(result.dimensions.values.score, 80);
    assert.equal(result.overall, null);
    assert.ok(result.synergy.some((entry) => /non-negotiables/i.test(entry)));
  });

  test(`${name} withholds values when either person supplied no priorities`, () => {
    const result = compatibility(
      fixture([]),
      fixture(["honesty"]),
    );

    assert.equal(result.dimensions.values.score, null);
    assert.equal(result.overall, null);
    assert.deepEqual(result.friction, []);
    assert.deepEqual(result.synergy, []);
  });
}
