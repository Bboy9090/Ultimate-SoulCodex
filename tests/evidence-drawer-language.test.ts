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
