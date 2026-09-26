import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMeanNodePair,
  circularNodeDeltaDegrees,
} from "../server/services/lunar-node-evidence";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

function signFromLongitude(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
}

test("mean lunar nodes remain exactly opposite across a multi-century UTC corpus", () => {
  const timestamps = [
    "1800-01-01T00:00:00.000Z",
    "1850-06-15T12:34:56.000Z",
    "1900-01-01T00:00:00.000Z",
    "1950-12-31T23:59:59.000Z",
    "2000-02-29T12:00:00.000Z",
    "2026-09-26T12:00:00.000Z",
    "2100-01-01T00:00:00.000Z",
    "2200-12-31T23:59:59.000Z",
  ];

  for (const inputTimestamp of timestamps) {
    const pair = calculateMeanNodePair({ inputTimestamp });

    assert.ok(pair.northNode.longitudeDegrees >= 0 && pair.northNode.longitudeDegrees < 360);
    assert.ok(pair.southNode.longitudeDegrees >= 0 && pair.southNode.longitudeDegrees < 360);
    assert.ok(
      Math.abs(
        circularNodeDeltaDegrees(
          pair.northNode.longitudeDegrees,
          pair.southNode.longitudeDegrees,
        ) - 180,
      ) < 1e-10,
      inputTimestamp,
    );
  }
});

test("mean-node sign and degree-in-sign remain mathematically consistent", () => {
  for (let year = 1800; year <= 2200; year += 10) {
    const inputTimestamp = `${year}-07-01T12:00:00.000Z`;
    const pair = calculateMeanNodePair({ inputTimestamp });

    for (const position of [pair.northNode, pair.southNode]) {
      assert.equal(position.sign, signFromLongitude(position.longitudeDegrees), inputTimestamp);
      assert.ok(position.degreeInSign >= 0 && position.degreeInSign < 30, inputTimestamp);
      assert.ok(
        Math.abs(position.degreeInSign - (position.longitudeDegrees % 30)) < 1e-12,
        inputTimestamp,
      );
    }
  }
});

test("mean-node calculation is deterministic for identical exact UTC input", () => {
  const input = { inputTimestamp: "1990-09-17T15:11:00.000Z" };
  assert.deepEqual(calculateMeanNodePair(input), calculateMeanNodePair(input));
});
