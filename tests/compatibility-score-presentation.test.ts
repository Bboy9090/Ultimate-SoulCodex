import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hub = readFileSync("client/src/pages/CompatibilityHubPage.tsx", "utf8");
const explorer = readFileSync("client/src/pages/CompatibilityExplorerPage.tsx", "utf8");
const person = readFileSync("client/src/pages/CompatibilityPersonPage.tsx", "utf8");

test("active Compatibility surfaces label scores as symbolic rather than probabilistic", () => {
  assert.match(hub, /Scores organize relationship themes; they do not measure the probability/);
  assert.match(explorer, /internal ordering values, not percentages, probabilities, or measured relationship outcomes/);
  assert.match(person, /internal ordering values, not percentages, probabilities, or measured relationship outcomes/);
});

test("default Compatibility cards use symbolic bands instead of raw numeric verdicts", () => {
  assert.match(explorer, /function symbolicBand\(score: number\)/);
  assert.match(person, /function symbolicBand\(score: number\)/);
  assert.match(person, /symbolic model band/);
  assert.doesNotMatch(person, /symbolic model score/);
});

test("exact symbolic model values remain inspectable behind disclosure", () => {
  assert.match(explorer, /Inspect exact symbolic model values/);
  assert.match(person, /Inspect exact symbolic model values/);
  assert.match(explorer, /<details/);
  assert.match(person, /<details/);
});
