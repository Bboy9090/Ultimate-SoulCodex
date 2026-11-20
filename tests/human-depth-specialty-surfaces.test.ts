import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

const voiceLaws = read("soulcodex/codex30/prompts/voice_laws.ts");
const narrator = read("soulcodex/codex30/prompts/narrator.ts");
const cleanLine = read("client/src/lib/soul-codex/utils/cleanCodexLine.ts");
const hdCore = read("packages/core/codex30/systems/humanDesign.ts");
const hdRuntime = read("soulcodex/codex30/systems/humanDesign.ts");

test("legacy clipped narrator doctrine is removed", () => {
  assert.doesNotMatch(voiceLaws, /12-WORD CONSTRAINT/i);
  assert.doesNotMatch(voiceLaws, /ABSOLUTE TRUTH/i);
  assert.match(voiceLaws, /EXPLAIN, DO NOT LABEL/);
  assert.match(voiceLaws, /BENEFIT AND TRADEOFF/);
  assert.match(voiceLaws, /COMMON MISREADING/);
  assert.match(voiceLaws, /PRACTICAL USE/);
  assert.match(voiceLaws, /USER AUTHORITY/);
});

test("narrator requires lived examples and practical interpretation", () => {
  assert.match(narrator, /decisions, work or creativity, conflict, relationships, stress/i);
  assert.match(narrator, /benefit, tradeoff, and common misunderstanding/i);
  assert.match(narrator, /concrete experiment, boundary, question, or action/i);
  assert.match(narrator, /Do not diagnose/);
  assert.match(narrator, /confirm, refine, or reject/i);
});

test("shared text firewall prevents terminal one-line readings", () => {
  assert.match(cleanLine, /terminalDepthBridge/);
  assert.match(cleanLine, /starting interpretation rather than a verdict/);
  assert.match(cleanLine, /what it helps and what it costs/);
  assert.match(cleanLine, /supports the pattern and another that contradicts it/);
});

test("Human Design output frames each type as a hypothesis to test against lived behavior", () => {
  // Current contract: every type explanation names its limit (a symbolic hypothesis,
  // not a fixed psychological fact) and tells the reader what lived evidence to compare.
  for (const source of [hdCore, hdRuntime]) {
    const block = source.slice(source.indexOf("TYPE_EXPLANATIONS"));
    const explanations = block.match(/^\s+\w+: "A[n]? [^"]+",$/gm) ?? [];
    assert.equal(explanations.length, 5, "all five Human Design types must be explained");
    for (const line of explanations) {
      assert.match(line, /can be used as a symbolic hypothesis/);
      assert.match(line, /Compare it against/);
      assert.match(line, /rather than treating it as a fixed psychological fact/);
    }
  }
});
