import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readme = readFileSync("README.md", "utf8");

test("README points to the executable production registry as source of truth", () => {
  assert.match(readme, /shared\/system-registry\.ts/);
  assert.match(readme, /governance\/SYSTEM_REGISTRY\.md/);
  assert.match(readme, /Unavailable \/ quarantined from production synthesis/);
  assert.match(readme, /More systems do not automatically mean more certainty/);
});

test("README cannot advertise quarantined systems as live birth-derived identity", () => {
  for (const forbidden of [
    /35\+ systems/i,
    /maps your Gene Key profile/i,
    /Type and wing suggestion based on chart signature/i,
    /Cognitive function stack correlated to chart/i,
    /Dominant and blocked chakras from chart patterns/i,
    /Core geometric archetype from numerology\/chart/i,
    /The engine calculates all .* systems/i,
    /All calculations are performed on the server/i,
  ]) {
    assert.doesNotMatch(readme, forbidden);
  }
});

test("README preserves the user-assessed boundary for personality systems", () => {
  assert.match(
    readme,
    /MBTI \/ Enneagram \/ similar assessments[\s\S]*User-supplied assessment context only/,
  );
  assert.match(readme, /does not infer these types from a birth chart/i);
});

test("README keeps unsupported systems visibly quarantined", () => {
  for (const system of [
    "Vedic astrology / Nakshatras",
    "Gene Keys",
    "Chakras / energy-center profiles",
    "Runes",
    "Sacred geometry",
    "Fixed stars",
    "Astrocartography",
    "Palmistry",
  ]) {
    assert.match(readme, new RegExp(system.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&"), "i"));
  }
});
