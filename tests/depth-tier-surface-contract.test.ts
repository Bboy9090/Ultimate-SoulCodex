import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const compatibility = readFileSync(new URL("../client/src/pages/CompatibilityPersonPage.tsx", import.meta.url), "utf8");
const humanDepth = readFileSync(new URL("../client/src/components/HumanDepthSurface.tsx", import.meta.url), "utf8");
const timeline = readFileSync(new URL("../client/src/components/TimelineIntelligence.tsx", import.meta.url), "utf8");

test("friend compatibility keeps a free core read and reserves remaining two-way perspectives for Plus depth", () => {
  assert.match(compatibility, /visibleFriendshipPerspectives/);
  assert.match(compatibility, /slice\(0, 1\)/);
  assert.match(compatibility, /Free clarity · Plus depth/);
  assert.match(compatibility, /Open deeper relationship layers/);
  assert.match(compatibility, /interpretation_depth/);
});

test("human-depth identity cards keep core observation, action, feedback, and evidence free", () => {
  assert.match(humanDepth, /item\.observation/);
  assert.match(humanDepth, /item\.practicalTakeaway/);
  assert.match(humanDepth, /Does this fit your experience\?/);
  assert.match(humanDepth, /Why this appeared in the reading/);
  assert.match(humanDepth, /deeperInterpretationUnlocked && \(item\.benefit \|\| item\.tradeoff\)/);
  assert.match(humanDepth, /deeperInterpretationUnlocked && item\.relationshipView/);
});

test("timeline intelligence keeps current signals and lived reality free while Plus expands analysis", () => {
  assert.match(timeline, /System Signals/);
  assert.match(timeline, /Your Reality/);
  assert.match(timeline, /Free clarity · Plus depth/);
  assert.match(timeline, /deeperInterpretationUnlocked \? \(/);
  assert.match(timeline, /Notable Differences/);
  assert.match(timeline, /Tracking Depth/);
  assert.match(timeline, /Open deeper timeline layers/);
});
