import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Human Design evidence import uses the ESM-safe package root export", () => {
  const source = readFileSync("packages/astrology/human-design.ts", "utf8");

  assert.doesNotMatch(source, /@soulcodex\/core\/evidence-ledger/);
  assert.match(
    source,
    /import\s*\{[^}]*createEvidenceEntry[^}]*\}\s*from\s*['"]@soulcodex\/core['"]/s,
  );
});

test("release workflow rejects the production-breaking evidence-ledger directory import", () => {
  const workflow = readFileSync(".github/workflows/store-4.0.0-release.yml", "utf8");

  assert.match(workflow, /@soulcodex\/core\/evidence-ledger/);
  assert.match(workflow, /dist\/index\.js/);
});
