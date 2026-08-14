import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(path, "utf8");

const voiceLaws = read("soulcodex/codex30/prompts/voice_laws.ts");
const narrator = read("soulcodex/codex30/prompts/narrator.ts");
const cleanLine = read("client/src/lib/soul-codex/utils/cleanCodexLine.ts");
const blueprint = read("client/src/pages/BlueprintPage.tsx");
const daily = read("client/src/pages/DailyHoroscopePage.tsx");
const today = read("client/src/pages/TodayPage.tsx");
const soulGuide = read("client/src/pages/SoulGuidePage.tsx");
const tracker = read("client/src/pages/TrackerPage.tsx");
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

test("specialty pages pass generated interpretation through the shared firewall", () => {
  for (const source of [blueprint, daily, today, soulGuide, tracker]) {
    assert.match(source, /cleanCodexLine/);
  }
});

test("Human Design output explains lived behavior and its limits", () => {
  for (const source of [hdCore, hdRuntime]) {
    assert.match(source, /best treated as a hypothesis/);
    assert.match(source, /The benefit is/);
    assert.match(source, /The tradeoff is/);
    assert.match(source, /Other people may/);
    assert.match(source, /A grounded experiment is/);
    assert.match(source, /symbolic interpretation, not verified psychology/);
  }
});
