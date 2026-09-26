import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("client/src/pages/SystemsDetailsPage.tsx", "utf8");

test("systems details page renders the canonical registry manifest", () => {
  assert.match(source, /registryDisplayManifest/);
  assert.match(source, /System governance atlas/);
  assert.match(source, /Governed systems/);
  assert.match(source, /Supporting systems/);
  assert.match(source, /Inspect only systems/);
  assert.match(source, /Unavailable systems/);
});

test("systems details page separates governance from per-profile verification", () => {
  assert.match(
    source,
    /“Governed” means Soul Codex has an approved production policy for that system/i,
  );
  assert.match(source, /Per-profile verification is separate/i);
  assert.match(source, /profile evidence must still qualify/i);
});

test("systems details page preserves stable identity eligibility boundaries", () => {
  assert.match(source, /Stable identity eligible/);
  assert.match(source, /Not in stable identity/);
  assert.match(source, /Explicit user context; not a stable birth-derived identity fact/i);
  assert.match(source, /excluded from verified synthesis/i);
  assert.match(source, /Quarantined until its own evidence and calculation contract is production-grade/i);
});
