import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEqualHouseCuspsFromAscendant,
  calculateHousePosition,
  circularDegreesDelta,
} from "../server/services/house-verification";

const PROBES = [
  -0.000001,
  0,
  0.000001,
  29.999999,
  30,
  89.123456,
  179.999999,
  227.314087669,
  359.999999,
  360,
  720.25,
] as const;

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

test("Equal House cusps remain exactly 30 degrees apart across normalization edges", () => {
  for (const ascendant of PROBES) {
    const cusps = calculateEqualHouseCuspsFromAscendant(ascendant);
    assert.equal(cusps.length, 12, String(ascendant));

    for (let index = 0; index < 12; index += 1) {
      const current = cusps[index];
      const next = cusps[(index + 1) % 12];
      assert.equal(current.house, index + 1);
      assert.ok(
        Math.abs(circularDegreesDelta(current.longitudeDegrees, next.longitudeDegrees) - 30) < 1e-10,
        `${ascendant}: cusp ${index + 1}`,
      );
    }
  }
});

test("Equal House cusps preserve one common degree-in-sign", () => {
  for (const ascendant of PROBES) {
    const cusps = calculateEqualHouseCuspsFromAscendant(ascendant);
    const expected = normalizeDegrees(ascendant) % 30;

    for (const cusp of cusps) {
      assert.ok(
        Math.abs(cusp.degreeInSign - expected) < 1e-10,
        `${ascendant}: house ${cusp.house}`,
      );
    }
  }
});

test("an exact cusp belongs to the house beginning at that cusp", () => {
  const cusps = calculateEqualHouseCuspsFromAscendant(227.314087669);

  for (const cusp of cusps) {
    assert.equal(
      calculateHousePosition(cusp.longitudeDegrees, cusps),
      cusp.house,
      `house ${cusp.house}`,
    );
  }
});

test("epsilon before a cusp belongs to the preceding house, including the 1/12 wrap", () => {
  const cusps = calculateEqualHouseCuspsFromAscendant(359.999999);
  const epsilon = 1e-8;

  for (let index = 0; index < cusps.length; index += 1) {
    const cusp = cusps[index];
    const previousHouse = index === 0 ? 12 : index;
    assert.equal(
      calculateHousePosition(normalizeDegrees(cusp.longitudeDegrees - epsilon), cusps),
      previousHouse,
      `before house ${cusp.house}`,
    );
  }
});

test("epsilon after a cusp stays in the house beginning at that cusp", () => {
  const cusps = calculateEqualHouseCuspsFromAscendant(0.000001);
  const epsilon = 1e-8;

  for (const cusp of cusps) {
    assert.equal(
      calculateHousePosition(normalizeDegrees(cusp.longitudeDegrees + epsilon), cusps),
      cusp.house,
      `after house ${cusp.house}`,
    );
  }
});
