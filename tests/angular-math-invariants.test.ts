import assert from "node:assert/strict";
import test from "node:test";
import {
  TROPICAL_ZODIAC_SIGNS,
  circularDegreesDelta,
  degreeInTropicalSign,
  distanceToNearestThirtyDegreeBoundary,
  normalizeDegrees,
  tropicalSignFromLongitude,
} from "../packages/core/compute/angular-math";

test("degree normalization is periodic, bounded, and idempotent across a wide range", () => {
  for (let value = -50_000; value <= 50_000; value += 7.25) {
    const normalized = normalizeDegrees(value);
    assert.ok(normalized >= 0 && normalized < 360, String(value));
    assert.ok(
      Math.abs(normalizeDegrees(normalized) - normalized) < 1e-12,
      String(value),
    );

    for (const turns of [-100, -7, -1, 0, 1, 7, 100]) {
      assert.ok(
        Math.abs(normalizeDegrees(value + turns * 360) - normalized) < 1e-9,
        `${value} + ${turns} turns`,
      );
    }
  }
});

test("circular angular distance is symmetric, bounded, and rotation-invariant", () => {
  for (let left = -1080; left <= 1080; left += 17.5) {
    for (let right = -720; right <= 720; right += 29.75) {
      const delta = circularDegreesDelta(left, right);
      assert.ok(delta >= 0 && delta <= 180);
      assert.ok(
        Math.abs(delta - circularDegreesDelta(right, left)) < 1e-12,
      );
      assert.ok(
        Math.abs(delta - circularDegreesDelta(left + 720, right - 1080)) < 1e-9,
      );
    }
  }
});

test("zodiac sign partition and degree-in-sign agree for every tenth degree", () => {
  for (let tenth = -7200; tenth <= 7200; tenth += 1) {
    const longitude = tenth / 10;
    const normalized = normalizeDegrees(longitude);
    const signIndex = Math.floor(normalized / 30);
    const expectedSign = TROPICAL_ZODIAC_SIGNS[signIndex];

    assert.equal(tropicalSignFromLongitude(longitude), expectedSign);

    const degree = degreeInTropicalSign(longitude);
    assert.ok(degree >= 0 && degree < 30);
    assert.ok(
      Math.abs(degree - (normalized - signIndex * 30)) < 1e-10,
      String(longitude),
    );
  }
});

test("every exact 30-degree boundary maps to the following tropical sign", () => {
  for (let index = 0; index < 12; index += 1) {
    const longitude = index * 30;
    assert.equal(tropicalSignFromLongitude(longitude), TROPICAL_ZODIAC_SIGNS[index]);
    assert.equal(degreeInTropicalSign(longitude), 0);
    assert.equal(distanceToNearestThirtyDegreeBoundary(longitude), 0);
  }

  assert.equal(tropicalSignFromLongitude(360), "Aries");
  assert.equal(tropicalSignFromLongitude(-30), "Pisces");
});

test("distance to nearest sign boundary is periodic and never exceeds 15 degrees", () => {
  for (let tenth = -7200; tenth <= 7200; tenth += 1) {
    const longitude = tenth / 10;
    const distance = distanceToNearestThirtyDegreeBoundary(longitude);
    assert.ok(distance >= 0 && distance <= 15, String(longitude));
    assert.ok(
      Math.abs(
        distance -
          distanceToNearestThirtyDegreeBoundary(longitude + 360 * 13),
      ) < 1e-10,
    );
  }
});

test("angular helpers reject non-finite values instead of manufacturing positions", () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(() => normalizeDegrees(value), /angle_invalid/);
    assert.throws(() => tropicalSignFromLongitude(value), /angle_invalid/);
    assert.throws(() => degreeInTropicalSign(value), /angle_invalid/);
    assert.throws(
      () => distanceToNearestThirtyDegreeBoundary(value),
      /angle_invalid/,
    );
    assert.throws(() => circularDegreesDelta(value, 0), /angle_invalid/);
    assert.throws(() => circularDegreesDelta(0, value), /angle_invalid/);
  }
});
