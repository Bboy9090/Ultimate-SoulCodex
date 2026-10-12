import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const soulGuideRoute = readFileSync(new URL("../routes/chat.ts", import.meta.url), "utf8");
const clarityReadingExperience = readFileSync(new URL("../client/src/components/ClarityReadingExperience.tsx", import.meta.url), "utf8");
const clarityReadingPage = readFileSync(new URL("../client/src/pages/ClarityReadingPage.tsx", import.meta.url), "utf8");

test("Aureon keeps Free useful and uses entitlement only to expand supported depth", () => {
  assert.match(soulGuideRoute, /FREE CLARITY MODE/);
  assert.match(soulGuideRoute, /complete brief answer, not a teaser/);
  assert.match(soulGuideRoute, /SOUL CODEX\+ DEPTH MODE/);
  assert.match(soulGuideRoute, /Expand supported contradictions, relationship impact, decision impact/);
  assert.match(soulGuideRoute, /applySoulGuideDepthMode\(systemInstruction, isPremium\)/);
  assert.match(soulGuideRoute, /Do not increase factual certainty/);
});


test("dedicated reading keeps Quick and Standard free while locking Deep Dive to shared depth access", () => {
  assert.match(clarityReadingExperience, /tierAllowsCapability\(tier, "interpretation_depth"\)/);
  assert.match(clarityReadingExperience, /nextDepth === "deep" && !deeperInterpretationUnlocked/);
  assert.match(clarityReadingExperience, /Deep dive · Plus/);
  assert.match(clarityReadingExperience, /Quick and Standard remain available on Free/);
  assert.match(clarityReadingExperience, /relationship, stress-response, and reflection layers/);
});

test("online clarity reading builds its model from entitled numerology and Human Design inputs", () => {
  assert.match(clarityReadingPage, /fullNameNumerology: tierAllowsCapability\(tier, "full_name_numerology"\)/);
  assert.match(clarityReadingPage, /humanDesignCore: tierAllowsCapability\(tier, "human_design_core"\)/);
});
