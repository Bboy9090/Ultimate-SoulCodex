import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const evidenceMatrix = readFileSync(
  "server/services/astrology-evidence-matrix.ts",
  "utf8",
);
const planetaryMatrix = readFileSync(
  "server/services/astrology-planetary-evidence-matrix.ts",
  "utf8",
);

test("astronomy evidence matrices share canonical circular-angle math", () => {
  for (const source of [evidenceMatrix, planetaryMatrix]) {
    assert.match(source, /circularDegreesDelta/);
    assert.doesNotMatch(source, /function\s+circularDelta\s*\(/);
    assert.doesNotMatch(
      source,
      /Math\.min\(raw,\s*360\s*-\s*raw\)/,
    );
  }
});
