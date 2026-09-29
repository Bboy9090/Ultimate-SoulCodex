import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const scorer = readFileSync(
  "packages/core/cross-engine-validation/agreement-scorer.ts",
  "utf8",
);
const validator = readFileSync(
  "packages/core/cross-engine-validation/validator.ts",
  "utf8",
);
const registry = readFileSync("governance/SYSTEM_REGISTRY.md", "utf8");

test("cross-system agreement cannot mechanically inflate certainty", () => {
  assert.match(
    scorer,
    /engine count itself[\s\S]*never increases epistemic certainty/i,
  );
  assert.match(scorer, /not extra proof/i);
  assert.match(scorer, /No bonus is awarded for engine count/);
  assert.doesNotMatch(
    scorer,
    /engineCount\s*>=\s*3[\s\S]{0,300}\+\s*10/,
  );
  assert.doesNotMatch(
    scorer,
    /engineCount\s*===\s*2[\s\S]{0,300}\+\s*5/,
  );
  assert.doesNotMatch(
    scorer,
    /reasoning\.length[\s\S]{0,400}\+\s*5/,
  );
});

test("agreement reasoning is resonance language, not confidence voting", () => {
  assert.match(
    validator,
    /resonance\/corroboration, not independent proof or a confidence multiplier/,
  );
  assert.doesNotMatch(validator, /Average confidence:/);
  assert.doesNotMatch(validator, /Confidence in agreement:/);
  assert.doesNotMatch(
    validator,
    /confidence multiplier[^\n]*\+\d+/i,
  );
});

test("governance keeps repeated themes from becoming extra proof", () => {
  assert.match(
    registry,
    /repeating another system's theme does not create extra certainty/i,
  );
});
