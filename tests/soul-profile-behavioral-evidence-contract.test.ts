import assert from "node:assert/strict";
import test from "node:test";
import { buildSoulProfile, compareProfiles } from "../soulcodex/index";

function baseInput() {
  return {
    birthData: { name: "Signal Contract", birthDate: "1990-09-17" },
    mirror: {
      reaction: [] as Array<"fix" | "analyze" | "talk" | "withdraw">,
      betrayal: [] as Array<"disrespect" | "dishonesty" | "stupidity" | "emotional">,
      drain: [] as Array<"chaos" | "repetition" | "lies" | "misunderstood">,
      freedomBuild: [] as Array<"system" | "movement" | "masterpiece" | "sanctuary">,
    },
    nonNegotiables: [],
    goals: [],
  };
}

test("Soul Profile behavioral evidence contract", async (suite) => {
  await suite.test("missing Mirror answers do not fabricate analysis or steady social energy", () => {
    const { signals, profile } = buildSoulProfile(baseInput());
    assert.deepEqual(signals.decisionStyle, []);
    assert.deepEqual(signals.socialEnergy, []);
    assert.match(profile.synthesis.relationshipPattern, /not provided enough direct behavioral evidence/i);
  });

  await suite.test("decision styles are derived from selected Mirror reactions", () => {
    const input = baseInput();
    input.mirror.reaction = ["fix", "talk"];
    const { signals } = buildSoulProfile(input);
    assert.deepEqual(signals.pressureStyle, ["fight", "perform"]);
    assert.deepEqual(signals.decisionStyle, ["impulse", "consensus"]);
    assert.deepEqual(signals.socialEnergy, []);
  });

  await suite.test("legacy inferred behavior remains reflection-only in compatibility", () => {
    const firstInput = baseInput();
    firstInput.mirror.reaction = ["analyze"];
    firstInput.mirror.drain = ["chaos"];
    const secondInput = baseInput();
    secondInput.birthData.name = "Second Signal";
    secondInput.mirror.reaction = ["analyze"];
    secondInput.mirror.drain = ["chaos"];

    const result = compareProfiles(
      buildSoulProfile(firstInput).signals,
      buildSoulProfile(secondInput).signals,
    );

    assert.equal(result.dimensions.stress.score, null);
    assert.equal(result.dimensions.decisions.score, null);
    assert.equal(result.overall, null);
    assert.match(result.dimensions.stress.note, /supporting reflection/i);
    assert.match(result.dimensions.decisions.note, /direct self-report provenance/i);
  });

  await suite.test("direct non-negotiables remain a bounded supporting comparison", () => {
    const firstInput = baseInput();
    firstInput.nonNegotiables = ["honesty", "family"];
    const secondInput = baseInput();
    secondInput.birthData.name = "Second Signal";
    secondInput.nonNegotiables = ["honesty", "family", "stability"];

    const result = compareProfiles(
      buildSoulProfile(firstInput).signals,
      buildSoulProfile(secondInput).signals,
    );

    assert.equal(result.dimensions.values.score, 80);
    assert.equal(result.overall, null);
    assert.match(result.dimensions.values.note, /conversation starting point/i);
  });

  await suite.test("multi-select signals preserve recorded values without becoming compatibility facts", () => {
    const input = baseInput();
    input.mirror.reaction = ["withdraw", "analyze"];
    input.mirror.drain = ["lies", "chaos"];
    const { profile, signals } = buildSoulProfile(input);

    assert.deepEqual(signals.stressElement, ["metal", "air"]);
    assert.deepEqual(signals.decisionStyle, ["avoidance", "analysis"]);
    assert.match(profile.synthesis.stressPattern, /Goes cold|Mind speeds up/i);
  });
});
