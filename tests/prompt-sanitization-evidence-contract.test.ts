import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeInput } from "../services/ai-router";
import { narratorPrompt } from "../soulcodex/codex30/prompts/narrator";

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
