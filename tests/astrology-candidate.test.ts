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
    assert.equal(placement.verificationStatus, "pending_independent_verification");
    assert.ok(placement.evidence);
    assert.ok(placement.evidence.candidateEngine);
    assert.match(placement.evidence.candidateEngine, /^astronomy-engine@/);
    assert.ok(placement.evidence.candidateSource);
    assert.match(placement.evidence.candidateSource, /geocentric true-ecliptic-of-date/i);
    assert.ok(placement.internalCandidate);
    assert.ok(placement.internalCandidate.longitude >= 0 && placement.internalCandidate.longitude < 360);
    assert.ok(placement.internalCandidate.sign.length > 0);
    assert.equal(placement.evidence.inputTimestamp, "1990-09-17T15:11:00.000Z");
  }

  assert.equal(result.verification.complete, false);
  assert.ok(result.verification.missingData.includes("independent_sun_verification"));
  assert.ok(result.verification.missingData.includes("independent_moon_verification"));
});

test("Ascendant remains unresolved even when time and coordinates are present", () => {
  const result = calculateAstrology(completeBirthData);

  assert.equal(result.rising.sign, null);
  assert.equal(result.rising.verificationStatus, "pending_ephemeris");
  assert.equal(result.rising.internalCandidate, undefined);
  assert.match(result.rising.reason ?? "", /intentionally blocked/i);
  assert.ok(result.verification.missingData.includes("validated_ascendant_engine"));
});

test("Moon calculation refuses local time without a timezone", () => {
  const result = calculateAstrology({
    ...completeBirthData,
    timezone: undefined,
  });

  assert.equal(result.moon.sign, null);
  assert.equal(result.moon.verificationStatus, "requires_verified_birth_time");
  assert.equal(result.moon.internalCandidate, undefined);
  assert.match(result.moon.reason ?? "", /timezone/i);
});

test("date-only Sun calculation never silently promotes its candidate", () => {
  const result = calculateAstrology({ birthDate: "1990-09-17" });

  assert.equal(result.sun.sign, null);
  assert.equal(result.sun.verificationStatus, "pending_independent_verification");
  assert.ok(result.sun.internalCandidate);
  assert.equal(result.sun.evidence?.inputTimestamp, "1990-09-17T12:00:00.000Z");
  assert.notEqual(result.sun.verificationStatus, "verified");
});

test("invalid dates fail closed", () => {
  const result = calculateAstrology({ birthDate: "not-a-date" });

  assert.equal(result.sun.sign, null);
  assert.equal(result.sun.verificationStatus, "pending_ephemeris");
  assert.equal(result.sun.internalCandidate, undefined);
  assert.equal(result.verification.complete, false);
});
