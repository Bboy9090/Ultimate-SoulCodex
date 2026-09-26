import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "client/src/components/soul-codex/CodexHeader.tsx",
  "utf8",
);

test("Codex header does not require every registered system to be verified", () => {
  assert.match(source, /Provisional while key evidence remains incomplete/);
  assert.doesNotMatch(source, /Provisional until all systems are verified/);
});

test("Codex header frames confidence as calculation support", () => {
  assert.match(source, /Calculation support/);
  assert.match(
    source,
    /Reflects input and calculation quality, not certainty about symbolic interpretation/i,
  );
  assert.doesNotMatch(source, /Calculation Confidence/);
});
