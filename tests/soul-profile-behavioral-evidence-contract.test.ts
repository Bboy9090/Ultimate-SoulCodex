import assert from "node:assert/strict";
import test from "node:test";
import { buildSoulProfile, compareProfiles } from "../soulcodex/index";

function baseInput() {
  return {
    birthData: {
      name: "Signal Contract",
      birthDate: "1990-09-17",
    },
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
    assert.doesNotMatch(profile.synthesis.relationshipPattern, /consistent predictability|audit the history|trust my internal signal/i);
    assert.match(profile.synthesis.relationshipPattern, /not provided enough direct behavioral evidence/i);
  });

  await suite.test("decision styles are derived from the actual selected Mirror reactions", () => {
    const input = baseInput();
    input.mirror.reaction = ["fix", "talk"];

    const { signals } = buildSoulProfile(input);

    assert.deepEqual(signals.pressureStyle, ["fight", "perform"]);
    assert.deepEqual(signals.decisionStyle, ["impulse", "consensus"]);
    assert.deepEqual(signals.socialEnergy, []);
  });

  await suite.test("multi-select synthesis uses recorded values rather than array-string fallbacks", () => {
    const input = baseInput();
    input.mirror.reaction = ["withdraw", "analyze"];
    input.mirror.drain = ["lies", "chaos"];

    const { profile } = buildSoulProfile(input);

    assert.match(profile.synthesis.stressPattern, /vanish|go dark|pull back/i);
    assert.match(profile.synthesis.relationshipPattern, /audit the history|monitor the potential|enough data/i);
    assert.doesNotMatch(profile.synthesis.relationshipPattern, /show up consistently|stabilizing my circle/i);
  });

  await suite.test("compatibility compares signal arrays by value, not array identity", () => {
    const firstInput = baseInput();
    firstInput.mirror.reaction = ["analyze"];
    firstInput.mirror.drain = ["chaos"];

    const secondInput = baseInput();
    secondInput.birthData.name = "Second Signal";
    secondInput.mirror.reaction = ["analyze"];
    secondInput.mirror.drain = ["chaos"];

    const first = buildSoulProfile(firstInput).signals;
    const second = buildSoulProfile(secondInput).signals;
    const result = compareProfiles(first, second);

    assert.equal(result.dimensions.stress.score, 85);
    assert.equal(result.dimensions.decisions.score, 85);
    assert.match(result.dimensions.stress.note, /share at least one stress-response signal/i);
    assert.match(result.dimensions.decisions.note, /share at least one decision-style signal/i);
  });

  await suite.test("missing behavioral evidence stays neutral instead of creating false compatibility friction", () => {
    const first = buildSoulProfile(baseInput()).signals;
    const secondInput = baseInput();
    secondInput.birthData.name = "Second Signal";
    const second = buildSoulProfile(secondInput).signals;

    const result = compareProfiles(first, second);

    assert.equal(result.dimensions.stress.score, 50);
    assert.equal(result.dimensions.decisions.score, 50);
    assert.match(result.dimensions.stress.note, /not enough shared stress-response evidence/i);
    assert.match(result.dimensions.decisions.note, /not enough direct decision-style evidence/i);
    assert.equal(result.friction.includes("Decision pace mismatch — agree on a process before big calls."), false);
  });
});


test("multi-select stress and full decision vocabulary remain evidence-backed", async (suite) => {
  await suite.test("multiple drain signals do not collapse to the old Air fallback", () => {
    const input = baseInput();
    input.mirror.reaction = ["fix"];
    input.mirror.drain = ["lies", "chaos"];

    const { profile, signals } = buildSoulProfile(input);

    assert.deepEqual(signals.stressElement, ["metal", "air"]);
    assert.match(profile.synthesis.stressPattern, /Goes cold/i);
    assert.match(profile.synthesis.stressPattern, /Mind speeds up/i);
  });

  await suite.test("talk and withdraw map to supported consensus and avoidance decision prose", () => {
    const talkInput = baseInput();
    talkInput.mirror.reaction = ["talk"];
    const talk = buildSoulProfile(talkInput);
    assert.deepEqual(talk.signals.decisionStyle, ["consensus"]);
    assert.match(talk.profile.synthesis.relationshipPattern, /talking them through|conversation|trusted perspectives/i);

    const withdrawInput = baseInput();
    withdrawInput.mirror.reaction = ["withdraw"];
    const withdraw = buildSoulProfile(withdrawInput);
    assert.deepEqual(withdraw.signals.decisionStyle, ["avoidance"]);
    assert.match(withdraw.profile.synthesis.relationshipPattern, /delay a decision|step away from a choice|postpone hard calls/i);
  });
});
