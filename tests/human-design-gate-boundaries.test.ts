import assert from "node:assert/strict";
import test from "node:test";
import { degreeToGateAndLine } from "../packages/astrology/human-design";

const GATE_ORDER = [
  55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8,
  20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29,
  59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14,
  34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30,
] as const;

const GATE_WIDTH_DEGREES = 360 / 64;
const LINE_WIDTH_DEGREES = GATE_WIDTH_DEGREES / 6;

// Phase anchor already independently qualified by the Human Design differential
// verifier. Keep it explicit here so edge behavior cannot drift while broad
// differential fixtures still happen to remain away from a boundary.
const FIRST_GATE_BOUNDARY_DEGREES = 330 + 1 / 6;
const EPSILON_DEGREES = 1e-6;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function previousPosition(gateIndex: number, line: number) {
  if (line > 1) {
    return { gate: GATE_ORDER[gateIndex], line: line - 1 };
  }
  const previousGateIndex = (gateIndex + GATE_ORDER.length - 1) % GATE_ORDER.length;
  return { gate: GATE_ORDER[previousGateIndex], line: 6 };
}

test("all 384 Human Design gate-line boundaries are stable on both sides", () => {
  let checkedBoundaries = 0;

  for (let gateIndex = 0; gateIndex < GATE_ORDER.length; gateIndex += 1) {
    for (let line = 1; line <= 6; line += 1) {
      const boundary = normalizeDegrees(
        FIRST_GATE_BOUNDARY_DEGREES +
          gateIndex * GATE_WIDTH_DEGREES +
          (line - 1) * LINE_WIDTH_DEGREES,
      );

      const after = degreeToGateAndLine(boundary + EPSILON_DEGREES);
      assert.deepEqual(
        after,
        { gate: GATE_ORDER[gateIndex], line },
        `after boundary ${gateIndex}:${line} at ${boundary}`,
      );

      const before = degreeToGateAndLine(boundary - EPSILON_DEGREES);
      assert.deepEqual(
        before,
        previousPosition(gateIndex, line),
        `before boundary ${gateIndex}:${line} at ${boundary}`,
      );

      checkedBoundaries += 1;
    }
  }

  assert.equal(checkedBoundaries, 64 * 6);
});

test("Human Design gate-line mapping is invariant under full-circle normalization", () => {
  const probes = [
    -1080.25,
    -360.000001,
    -0.000001,
    0,
    29.999999,
    180,
    330.166667,
    359.999999,
    360,
    720.25,
  ];

  for (const longitude of probes) {
    const canonical = degreeToGateAndLine(normalizeDegrees(longitude));
    assert.deepEqual(degreeToGateAndLine(longitude), canonical, String(longitude));
  }
});

test("every gate occupies six sequential lines across one 5.625 degree span", () => {
  for (let gateIndex = 0; gateIndex < GATE_ORDER.length; gateIndex += 1) {
    for (let line = 1; line <= 6; line += 1) {
      const midpoint = normalizeDegrees(
        FIRST_GATE_BOUNDARY_DEGREES +
          gateIndex * GATE_WIDTH_DEGREES +
          (line - 0.5) * LINE_WIDTH_DEGREES,
      );

      assert.deepEqual(degreeToGateAndLine(midpoint), {
        gate: GATE_ORDER[gateIndex],
        line,
      });
    }
  }
});
