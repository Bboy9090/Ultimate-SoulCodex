import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEqualHouseCuspsFromAscendant,
  calculateEqualHouseEvidence,
  calculateHousePosition,
  calculateIndependentMidheavenReference,
  calculateMidheavenCandidate,
  circularDegreesDelta,
  normalizeDegrees,
} from "../server/services/house-verification";
import {
  SWISS_EQUAL_HOUSE_FIXTURES,
  SWISS_EQUAL_HOUSE_POLAR_EDGE_FIXTURES,
  SWISS_EQUAL_HOUSE_REFERENCE,
} from "./fixtures/swiss-equal-house-fixtures";

test("Swiss Equal House fixture matrix is independently identified and broad", () => {
  assert.equal(SWISS_EQUAL_HOUSE_REFERENCE.houseSystem, "E");
  assert.equal(SWISS_EQUAL_HOUSE_REFERENCE.fixtureCount, 24);
  assert.ok(SWISS_EQUAL_HOUSE_REFERENCE.engine.includes("Swiss Ephemeris"));
});

test("MC candidate and independent reference agree with 24 Swiss Ephemeris fixtures", () => {
  let candidateMax = 0;
  let referenceMax = 0;

  for (const fixture of SWISS_EQUAL_HOUSE_FIXTURES) {
    const input = {
      inputTimestamp: fixture.inputTimestamp,
      latitude: fixture.latitude,
      longitude: fixture.longitude,
    };
    const candidate = calculateMidheavenCandidate(input);
    const reference = calculateIndependentMidheavenReference(input);
    const candidateDelta = circularDegreesDelta(
      candidate.longitudeDegrees,
      fixture.expectedMidheavenLongitude,
    );
    const referenceDelta = circularDegreesDelta(
      reference.longitudeDegrees,
      fixture.expectedMidheavenLongitude,
    );
    candidateMax = Math.max(candidateMax, candidateDelta);
    referenceMax = Math.max(referenceMax, referenceDelta);

    assert.ok(candidateDelta <= 0.01, `${fixture.id} candidate MC delta ${candidateDelta}`);
    assert.ok(referenceDelta <= 0.01, `${fixture.id} reference MC delta ${referenceDelta}`);
    assert.equal(candidate.sign, reference.sign, `${fixture.id} MC sign disagreement`);
  }

  assert.ok(candidateMax > 0);
  assert.ok(referenceMax > 0);
});

test("Equal House cusps stay exactly 30 degrees apart and track Swiss Ascendant fixtures", () => {
  for (const fixture of SWISS_EQUAL_HOUSE_FIXTURES) {
    const evidence = calculateEqualHouseEvidence({
      inputTimestamp: fixture.inputTimestamp,
      latitude: fixture.latitude,
      longitude: fixture.longitude,
    });
    assert.equal(evidence.system, "equal");
    assert.equal(evidence.cusps.length, 12);

    for (let index = 0; index < evidence.cusps.length; index += 1) {
      const expected = normalizeDegrees(fixture.expectedAscendantLongitude + index * 30);
      const delta = circularDegreesDelta(evidence.cusps[index].longitudeDegrees, expected);
      assert.ok(delta <= 0.01, `${fixture.id} house ${index + 1} cusp delta ${delta}`);
      assert.equal(evidence.cusps[index].house, index + 1);
    }
  }
});

test("Equal House keeps MC as a separate angle instead of relabeling the tenth cusp", () => {
  const fixture = SWISS_EQUAL_HOUSE_FIXTURES[0];
  const evidence = calculateEqualHouseEvidence({
    inputTimestamp: fixture.inputTimestamp,
    latitude: fixture.latitude,
    longitude: fixture.longitude,
  });
  const tenthCusp = evidence.cusps[9].longitudeDegrees;
  assert.ok(
    circularDegreesDelta(evidence.midheavenCandidate.longitudeDegrees, tenthCusp) > 0.1,
    "MC must remain an independent angle in Equal House",
  );
  assert.ok(
    circularDegreesDelta(evidence.midheavenCandidate.longitudeDegrees, fixture.expectedMidheavenLongitude) <= 0.01,
  );
});

test("house assignment handles the 0-degree wrap without silent fallback", () => {
  const cusps = calculateEqualHouseCuspsFromAscendant(350);
  assert.equal(calculateHousePosition(355, cusps), 1);
  assert.equal(calculateHousePosition(5, cusps), 1);
  assert.equal(calculateHousePosition(20, cusps), 2);
  assert.equal(calculateHousePosition(349.999, cusps), 12);
});

test("invalid inputs fail closed", () => {
  assert.throws(
    () => calculateMidheavenCandidate({
      inputTimestamp: "not-a-date",
      latitude: 0,
      longitude: 0,
    }),
    /house_input_invalid/,
  );
  assert.throws(
    () => calculateEqualHouseCuspsFromAscendant(Number.NaN),
    /ascendant_longitude_invalid/,
  );
});


test("polar edge evidence stays numerically close to Swiss without rewriting the approved 24-fixture receipt", () => {
  for (const fixture of SWISS_EQUAL_HOUSE_POLAR_EDGE_FIXTURES) {
    const input = {
      inputTimestamp: fixture.inputTimestamp,
      latitude: fixture.latitude,
      longitude: fixture.longitude,
    };
    const evidence = calculateEqualHouseEvidence(input);
    const mcDelta = circularDegreesDelta(
      evidence.midheavenCandidate.longitudeDegrees,
      fixture.expectedMidheavenLongitude,
    );
    assert.ok(mcDelta <= 0.01, `${fixture.id} MC delta ${mcDelta}`);

    for (let index = 0; index < evidence.cusps.length; index += 1) {
      const expected = normalizeDegrees(fixture.expectedAscendantLongitude + index * 30);
      const delta = circularDegreesDelta(evidence.cusps[index].longitudeDegrees, expected);
      assert.ok(delta <= 0.01, `${fixture.id} house ${index + 1} cusp delta ${delta}`);
    }
  }
});
