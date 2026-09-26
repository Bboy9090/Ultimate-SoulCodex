import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "client/src/components/soul-codex/EvidenceDrawer.tsx",
  "utf8",
);

test("evidence drawer frames confidence as source support", () => {
  assert.match(source, /High source support/);
  assert.match(source, /Moderate source support/);
  assert.match(source, /Low source support/);
  assert.match(source, /◆ Source support:/);

  assert.doesNotMatch(source, /High Confidence/);
  assert.doesNotMatch(source, /Moderate Confidence/);
  assert.doesNotMatch(source, /Low Confidence/);
  assert.doesNotMatch(source, /◆ Confidence:/);
});


test("evidence drawer exposes an accessible toggle relationship", () => {
  assert.match(source, /type="button"/);
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /aria-controls=\{drawerId\}/);
  assert.match(source, /id=\{drawerId\}/);
  assert.match(source, /role="region"/);
  assert.match(source, /aria-label="Reading evidence and methods"/);
});
