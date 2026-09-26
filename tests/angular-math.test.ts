import assert from "node:assert/strict";
import test from "node:test";
import {
  TROPICAL_ZODIAC_SIGNS,
  circularDegreesDelta,
  degreeInTropicalSign,
  distanceToNearestThirtyDegreeBoundary,
  normalizeDegrees,
  tropicalSignFromLongitude,
} from "../server/services/angular-math";

test("canonical angle normalization maps finite values into [0, 360)", () => {
  const values = [
    -1440.5, -720, -360.000001, -360, -0.000001, 0, 0.000001,
    29.999999, 30, 180, 359.999999, 360, 720.5, 1440,
  ];

  for (const value of values) {
    const normalized = normalizeDegrees(value);
    assert.ok(normalized >= 0 && normalized < 360, String(value));
    assert.ok(
      Math.abs(normalizeDegrees(normalized) - normalized) < 1e-12,
      `idempotent ${value}`,
    );
  }
});

test("canonical circular delta is symmetric, bounded, and rotation-invariant", () => {
  const values = [-721, -360, -1, 0, 1, 30, 179.999, 180, 359.999, 360, 721];

  for (const left of values) {
    for (const right of values) {
      const forward = circularDegreesDelta(left, right);
      const reverse = circularDegreesDelta(right, left);
      assert.ok(forward >= 0 && forward <= 180);
      assert.ok(Math.abs(forward - reverse) < 1e-12);
      assert.ok(
        Math.abs(
          forward - circularDegreesDelta(left + 1080, right - 720),
        ) < 1e-12,
      );
    }
  }
});

test("canonical tropical sign mapping covers all twelve 30-degree sectors", () => {
  assert.equal(TROPICAL_ZODIAC_SIGNS.length, 12);

  for (let index = 0; index < TROPICAL_ZODIAC_SIGNS.length; index += 1) {
    const start = index * 30;
    const sign = TROPICAL_ZODIAC_SIGNS[index];

    assert.equal(tropicalSignFromLongitude(start), sign);
    assert.equal(tropicalSignFromLongitude(start + 15), sign);
    assert.equal(tropicalSignFromLongitude(start + 29.999999), sign);
  }
});

test("degree-in-sign and boundary distance stay consistent at every zodiac edge", () => {
  const epsilon = 1e-9;

  for (let index = 0; index < 12; index += 1) {
    const boundary = index * 30;

    assert.ok(Math.abs(degreeInTropicalSign(boundary)) < 1e-12);
    assert.ok(Math.abs(distanceToNearestThirtyDegreeBoundary(boundary)) < 1e-12);

    const before = normalizeDegrees(boundary - epsilon);
    const after = normalizeDegrees(boundary + epsilon);

    assert.ok(distanceToNearestThirtyDegreeBoundary(before) <= epsilon * 2);
    assert.ok(distanceToNearestThirtyDegreeBoundary(after) <= epsilon * 2);
  }
});

test("canonical angle helpers reject non-finite inputs", () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(() => normalizeDegrees(value), /angle_invalid/);
    assert.throws(() => tropicalSignFromLongitude(value), /angle_invalid/);
    assert.throws(() => degreeInTropicalSign(value), /angle_invalid/);
    assert.throws(() => distanceToNearestThirtyDegreeBoundary(value), /angle_invalid/);
  }
  assert.throws(() => circularDegreesDelta(Number.NaN, 0), /angle_invalid/);
});
