import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const coreAngular = readFileSync("packages/core/compute/angular-math.ts", "utf8");
const serverAngular = readFileSync("server/services/angular-math.ts", "utf8");
const reconciliation = readFileSync(
  "client/src/lib/profileVerificationReconciliation.ts",
  "utf8",
);
const governedServerConsumers = [
  "server/services/aspect-engine.ts",
  "server/services/house-verification.ts",
  "server/services/ascendant-verification.ts",
  "server/services/lunar-node-evidence.ts",
  "server/services/chiron-production.ts",
  "server/services/chiron-horizons-reference.ts",
].map((path) => ({ path, source: readFileSync(path, "utf8") }));

test("core angular math is the canonical tropical angle authority", () => {
  assert.match(coreAngular, /export const TROPICAL_ZODIAC_SIGNS/);
  assert.match(coreAngular, /export function normalizeDegrees/);
  assert.match(coreAngular, /export function circularDegreesDelta/);
  assert.match(coreAngular, /export function tropicalSignFromLongitude/);
  assert.match(coreAngular, /export function degreeInTropicalSign/);
});

test("server angular surface delegates to core instead of reimplementing math", () => {
  assert.match(serverAngular, /from "@soulcodex\/core"/);
  assert.doesNotMatch(
    serverAngular,
    /function\s+(normalizeDegrees|circularDegreesDelta|tropicalSignFromLongitude|degreeInTropicalSign)\s*\(/,
  );
});

test("governed astronomy consumers use the canonical angular surface", () => {
  for (const { path, source } of governedServerConsumers) {
    assert.doesNotMatch(
      source,
      /function\s+normalizeDegrees\s*\([^)]*\)\s*\{\s*return\s+\(\([^\n]*%\s*360/s,
      `${path} must not carry a private degree-normalization implementation`,
    );
    assert.doesNotMatch(
      source,
      /const\s+ZODIAC_SIGNS\s*=\s*\[/,
      `${path} must not carry a private tropical zodiac order`,
    );
  }
});

test("profile reconciliation shares core zodiac and circular-angle math", () => {
  for (const symbol of [
    "TROPICAL_ZODIAC_SIGNS",
    "normalizeDegrees",
    "tropicalSignFromLongitude",
    "degreeInTropicalSign",
    "circularDegreesDelta",
  ]) {
    assert.match(reconciliation, new RegExp(symbol));
  }

  assert.doesNotMatch(reconciliation, /const\s+ZODIAC_SIGNS\s*=\s*\[/);
  assert.doesNotMatch(
    reconciliation,
    /function\s+normalizeLongitude\s*\(/,
  );
  assert.doesNotMatch(
    reconciliation,
    /Math\.min\(nodeOpposition,\s*360\s*-\s*nodeOpposition\)/,
  );
});
