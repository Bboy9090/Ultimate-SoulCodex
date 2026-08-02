import assert from "node:assert/strict";
import test from "node:test";
import { calculateAstrology } from "../server/services/astrology";

const completeBirthData = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  latitude: 40.8448,
  longitude: -73.8648,
  timezone: "America/New_York",
};

test("Sun and Moon candidates carry reproducible ephemeris evidence without becoming facts", () => {
  const result = calculateAstrology(completeBirthData);

  for (const placement of [result.sun, result.moon]) {
    assert.equal(placement.sign, null);
    assert.equal(placement.status, "calculated_pending_independent_verification");
    assert.equal(placement.confidence, null);
    assert.equal(placement.source, null);
    assert.ok(placement.candidate);
    assert.match(placement.candidate.engine, /^astronomy-engine@/);
    assert.match(placement.candidate.source, /geocentric true-ecliptic-of-date/i);
    assert.ok(placement.candidate.longitude >= 0 && placement.candidate.longitude < 360);
    assert.ok(placement.candidate.sign.length > 0);
    assert.equal(placement.candidate.inputTimestamp, "1990-09-17T15:11:00.000Z");
  }

  assert.equal(result.verification.complete, false);
  assert.ok(result.verification.missingData.includes("independent_sun_verification"));
  assert.ok(result.verification.missingData.includes("independent_moon_verification"));
});

test("Ascendant remains unresolved even when time and coordinates are present", () => {
  const result = calculateAstrology(completeBirthData);

  assert.equal(result.rising.sign, null);
  assert.equal(result.rising.status, "pending_ephemeris");
  assert.equal(result.rising.candidate, undefined);
  assert.match(result.rising.reason ?? "", /intentionally blocked/i);
  assert.ok(result.verification.missingData.includes("validated_ascendant_engine"));
});

test("Moon calculation refuses local time without a timezone", () => {
  const result = calculateAstrology({
    ...completeBirthData,
    timezone: undefined,
  });

  assert.equal(result.moon.sign, null);
  assert.equal(result.moon.status, "requires_verified_birth_time");
  assert.equal(result.moon.candidate, undefined);
  assert.match(result.moon.reason ?? "", /timezone/i);
});

test("date-only Sun calculation never silently promotes its candidate", () => {
  const result = calculateAstrology({ birthDate: "1990-09-17" });

  assert.equal(result.sun.sign, null);
  assert.equal(result.sun.status, "calculated_pending_independent_verification");
  assert.ok(result.sun.candidate);
  assert.equal(result.sun.candidate.inputTimestamp, "1990-09-17T12:00:00.000Z");
  assert.notEqual(result.sun.status, "verified");
});

test("invalid dates fail closed", () => {
  const result = calculateAstrology({ birthDate: "not-a-date" });

  assert.equal(result.sun.sign, null);
  assert.equal(result.sun.status, "pending_ephemeris");
  assert.equal(result.sun.candidate, undefined);
  assert.equal(result.verification.complete, false);
});
