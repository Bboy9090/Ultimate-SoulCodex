import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const changelog = readFileSync("CHANGELOG.md", "utf8");

test("changelog clearly supersedes legacy production claims", () => {
  assert.match(changelog, /Current production-status correction — 2026-09-26/);
  assert.match(changelog, /not the current production system contract/i);
  assert.match(changelog, /shared\/system-registry\.ts/);
  assert.match(changelog, /do(es|) \*\*not\*\* currently claim that 35\+ systems/i);
});

test("changelog correction preserves current evidence doctrine", () => {
  assert.match(changelog, /Unknown birth time is never silently replaced with noon/i);
  assert.match(changelog, /MBTI \/ Enneagram are explicit user-assessment context only/i);
  assert.match(changelog, /Human Design core must carry its approved verification receipt/i);
  assert.match(changelog, /Legacy share-link code is not mounted by the production server/i);
  assert.match(changelog, /Current Compatibility uses the governed evidence-aware router/i);
});
