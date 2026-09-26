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


test("astronomy-engine consumers use the ESM namespace directly", () => {
  for (const path of [
    "packages/astrology/astrology.ts",
    "packages/astrology/human-design.ts",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /Astronomy(?: as any)?\)\.default|Astronomy\.default/);
    assert.match(source, /import \* as Astronomy from ['"]astronomy-engine['"]/);
  }
});

test("quarantined Vedic astrology does not retain a dormant astronomy-engine dependency", () => {
  const source = readFileSync("packages/astrology/vedic-astrology.ts", "utf8");
  assert.doesNotMatch(source, /astronomy-engine/);
  assert.match(source, /vedic_astrology_unavailable:no_governed_sidereal_contract/);
});
