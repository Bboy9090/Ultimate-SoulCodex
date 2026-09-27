import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeInput } from "../services/ai-router";
import { narratorPrompt } from "../soulcodex/codex30/prompts/narrator";
import { buildPromptForType } from "../routes/ai-respond";
import { buildProfileContextPrompt } from "../routes/chat";

test("AI prompt sanitation preserves evidence-bearing language", async (suite) => {
  await suite.test("unknown remains explicit so uncertainty instructions survive routing", () => {
    const sanitized = sanitizeInput(
      "BIRTH TIME UNKNOWN | Rising unresolved | do not infer or guess it."
    );

    assert.match(sanitized, /BIRTH TIME UNKNOWN/);
    assert.match(sanitized, /Rising unresolved/);
    assert.match(sanitized, /do not infer or guess it/);
    assert.doesNotMatch(sanitized, /\|/);
  });

  await suite.test("behavior words are not deleted from user evidence", () => {
    const sanitized = sanitizeInput(
      "Under chaos I fix the immediate problem, then analyze what happened."
    );

    assert.match(sanitized, /chaos/i);
    assert.match(sanitized, /fix the immediate problem/i);
    assert.match(sanitized, /analyze what happened/i);
  });

  await suite.test("narrator prompt preserves uncertainty and recorded triggers", () => {
    const prompt = narratorPrompt({
      codename: "Evidence Test",
      archetype: "Architect",
      themes: [{ tag: "unknown timing", score: 7 }],
      strengths: ["fix broken systems"],
      shadows: ["chaos overload"],
      triggers: ["birth time unknown"],
      prescriptions: ["name one fix"],
      anchors: ["chaos is recorded evidence"],
    });

    assert.match(prompt, /unknown timing/);
    assert.match(prompt, /fix broken systems/);
    assert.match(prompt, /chaos overload/);
    assert.match(prompt, /birth time unknown/);
  });
});


test("AI profile prompt withholds unverified Human Design and admits only approved trust", () => {
  const statusOnly = buildPromptForType("codex_reading", "", {
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
    },
  });
  assert.doesNotMatch(statusOnly.prompt, /Human Design: Reflector/i);

  const verified = buildPromptForType("codex_reading", "", {
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      engine: "soulcodex-hd-geocentric-v1",
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: "35474994858:human-design-repair-audit",
      independentSource: "free-human-design@1.0.1 differential verifier",
      verifiedAt: "2026-09-19T23:03:08.000Z",
    },
  });
  assert.match(verified.prompt, /Human Design: Reflector/i);
  assert.match(verified.prompt, /Strategy: Wait a lunar cycle/i);
});


test("Soul Guide client profile context ignores legacy hdType without approved trust", () => {
  const legacy = buildProfileContextPrompt({
    name: "Context Test",
    hdType: "Projector",
    lifePath: 7,
  });
  assert.doesNotMatch(legacy, /Human Design: Projector/i);
  assert.match(legacy, /Life Path 7/i);

  const verified = buildProfileContextPrompt({
    name: "Context Test",
    humanDesignData: {
      status: "verified",
      type: "Reflector",
      strategy: "Wait a lunar cycle",
      authority: "Lunar Authority",
      profile: "2/5",
      engine: "soulcodex-hd-geocentric-v1",
      source: "Soul Codex deterministic Human Design core engine",
      calculatedAt: "2026-09-26T18:00:00.000Z",
      inputTimestampUtc: "1990-09-17T15:11:00.000Z",
      verificationReceiptId: "35474994858:human-design-repair-audit",
      independentSource: "free-human-design@1.0.1 differential verifier",
      verifiedAt: "2026-09-19T23:03:08.000Z",
    },
  });
  assert.match(verified, /Human Design: Reflector/i);
});
