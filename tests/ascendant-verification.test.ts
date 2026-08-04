import assert from "node:assert/strict";
import { test } from "node:test";
import {
  APPROVED_ASCENDANT_POLICY,
  calculateAscendantCandidate,
  calculateIndependentAscendantReference,
  verifyAscendant,
  type AscendantInput,
  type AscendantSign,
} from "../server/services/ascendant-verification";

type Fixture = AscendantInput & {
  id: string;
  expectedLongitude: number;
  expectedSign: AscendantSign;
};

// Generated with Swiss Ephemeris 2.10.03 swe_houses_ex() in tropical mode.
// Longitude is east-positive. Each timestamp is an exact UTC instant.
const FIXTURES: readonly Fixture[] = [
  { id: "bobby-bronx", inputTimestamp: "1990-09-17T15:11:00Z", latitude: 40.8448, longitude: -73.8648, expectedLongitude: 227.314087669, expectedSign: "Scorpio" },
  { id: "nyc-dst-spring", inputTimestamp: "2024-03-10T07:30:00Z", latitude: 40.7128, longitude: -74.006, expectedLongitude: 274.72793619, expectedSign: "Capricorn" },
  { id: "nyc-dst-fall", inputTimestamp: "2024-11-03T05:30:00Z", latitude: 40.7128, longitude: -74.006, expectedLongitude: 149.555688938, expectedSign: "Leo" },
  { id: "london-summer", inputTimestamp: "2001-06-21T11:00:00Z", latitude: 51.5074, longitude: -0.1278, expectedLongitude: 169.129917534, expectedSign: "Virgo" },
  { id: "london-winter", inputTimestamp: "1985-12-21T23:45:00Z", latitude: 51.5074, longitude: -0.1278, expectedLongitude: 177.605909675, expectedSign: "Virgo" },
  { id: "sydney-summer", inputTimestamp: "1999-01-14T19:20:00Z", latitude: -33.8688, longitude: 151.2093, expectedLongitude: 297.591674407, expectedSign: "Capricorn" },
  { id: "sydney-winter", inputTimestamp: "2010-07-01T08:05:00Z", latitude: -33.8688, longitude: 151.2093, expectedLongitude: 294.85666318, expectedSign: "Capricorn" },
  { id: "tokyo", inputTimestamp: "1975-04-03T05:32:00Z", latitude: 35.6762, longitude: 139.6503, expectedLongitude: 149.894830878, expectedSign: "Leo" },
  { id: "san-juan", inputTimestamp: "1991-04-23T12:15:00Z", latitude: 18.4655, longitude: -66.1057, expectedLongitude: 68.070642465, expectedSign: "Gemini" },
  { id: "cape-town", inputTimestamp: "1968-08-09T20:40:00Z", latitude: -33.9249, longitude: 18.4241, expectedLongitude: 14.174889081, expectedSign: "Aries" },
  { id: "delhi-leap-day", inputTimestamp: "2000-02-29T00:15:00Z", latitude: 28.6139, longitude: 77.209, expectedLongitude: 317.980145746, expectedSign: "Aquarius" },
  { id: "kathmandu-quarter-hour-zone", inputTimestamp: "2020-02-29T11:27:00Z", latitude: 27.7172, longitude: 85.324, expectedLongitude: 149.866097133, expectedSign: "Leo" },
  { id: "adelaide-half-hour-zone", inputTimestamp: "1988-10-28T21:00:00Z", latitude: -34.9285, longitude: 138.6007, expectedLongitude: 237.732931893, expectedSign: "Scorpio" },
  { id: "honolulu", inputTimestamp: "1944-06-06T13:30:00Z", latitude: 21.3069, longitude: -157.8583, expectedLongitude: 37.402562442, expectedSign: "Taurus" },
  { id: "anchorage-high-latitude", inputTimestamp: "2015-09-23T08:15:00Z", latitude: 61.2181, longitude: -149.9003, expectedLongitude: 110.819844096, expectedSign: "Cancer" },
  { id: "reykjavik-high-latitude", inputTimestamp: "1950-03-20T13:00:00Z", latitude: 64.1466, longitude: -21.9426, expectedLongitude: 124.205708416, expectedSign: "Leo" },
  { id: "buenos-aires-year-edge", inputTimestamp: "2009-01-01T01:59:00Z", latitude: -34.6037, longitude: -58.3816, expectedLongitude: 153.009999839, expectedSign: "Virgo" },
  { id: "nairobi-equatorial", inputTimestamp: "1993-07-26T06:00:00Z", latitude: -1.2921, longitude: 36.8219, expectedLongitude: 158.983567577, expectedSign: "Virgo" },
  { id: "apia-date-line", inputTimestamp: "2011-12-31T10:10:00Z", latitude: -13.8507, longitude: -171.7514, expectedLongitude: 168.130666786, expectedSign: "Virgo" },
  { id: "kiritimati-utc-plus-14", inputTimestamp: "2026-08-03T09:28:00Z", latitude: 1.8721, longitude: -157.4278, expectedLongitude: 28.96183427, expectedSign: "Aries" },
  { id: "pago-pago-utc-minus-11", inputTimestamp: "2026-08-04T10:28:00Z", latitude: -14.2756, longitude: -170.702, expectedLongitude: 28.50520515, expectedSign: "Aries" },
  { id: "berlin-1900", inputTimestamp: "1900-01-01T11:00:00Z", latitude: 52.52, longitude: 13.405, expectedLongitude: 22.110473284, expectedSign: "Aries" },
  { id: "cairo-1850", inputTimestamp: "1850-05-15T07:24:51Z", latitude: 30.0444, longitude: 31.2357, expectedLongitude: 115.934713197, expectedSign: "Cancer" },
  { id: "los-angeles-2100", inputTimestamp: "2100-01-01T05:45:00Z", latitude: 34.0522, longitude: -118.2437, expectedLongitude: 162.319637983, expectedSign: "Virgo" },
];

function circularDelta(left: number, right: number): number {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

test("Ascendant verification matrix", async (suite) => {
  await suite.test("covers 24 independently generated geographic and temporal fixtures", () => {
    assert.equal(FIXTURES.length, 24);
    assert.ok(FIXTURES.some((fixture) => fixture.id === "bobby-bronx"));
    assert.ok(FIXTURES.some((fixture) => fixture.latitude > 60));
    assert.ok(FIXTURES.some((fixture) => fixture.latitude < 0));
    assert.ok(FIXTURES.some((fixture) => fixture.inputTimestamp.startsWith("1850")));
    assert.ok(FIXTURES.some((fixture) => fixture.inputTimestamp.startsWith("2100")));
  });

  await suite.test("candidate and independent reference agree with Swiss Ephemeris fixtures", () => {
    let maximumCandidateDelta = 0;
    let maximumReferenceDelta = 0;
    let maximumCrossEngineDelta = 0;

    for (const fixture of FIXTURES) {
      const candidate = calculateAscendantCandidate(fixture);
      const reference = calculateIndependentAscendantReference(fixture);
      const verification = verifyAscendant(fixture);
      const candidateDelta = circularDelta(candidate.longitudeDegrees, fixture.expectedLongitude);
      const referenceDelta = circularDelta(reference.longitudeDegrees, fixture.expectedLongitude);
      const crossEngineDelta = circularDelta(candidate.longitudeDegrees, reference.longitudeDegrees);

      maximumCandidateDelta = Math.max(maximumCandidateDelta, candidateDelta);
      maximumReferenceDelta = Math.max(maximumReferenceDelta, referenceDelta);
      maximumCrossEngineDelta = Math.max(maximumCrossEngineDelta, crossEngineDelta);

      assert.equal(candidate.sign, fixture.expectedSign, `${fixture.id}: candidate sign`);
      assert.equal(reference.sign, fixture.expectedSign, `${fixture.id}: reference sign`);
      assert.ok(candidateDelta <= 0.02, `${fixture.id}: candidate delta ${candidateDelta}`);
      assert.ok(referenceDelta <= 0.005, `${fixture.id}: reference delta ${referenceDelta}`);
      assert.equal(verification.status, "verified", `${fixture.id}: verification status`);
    }

    console.log(JSON.stringify({
      fixtureCount: FIXTURES.length,
      maximumCandidateDeltaDegrees: maximumCandidateDelta,
      maximumReferenceDeltaDegrees: maximumReferenceDelta,
      maximumCrossEngineDeltaDegrees: maximumCrossEngineDelta,
      policyToleranceDegrees: APPROVED_ASCENDANT_POLICY.maximumLongitudeDeltaDegrees,
    }));
  });

  await suite.test("produces Bobby's Scorpio Ascendant from raw inputs rather than a hardcoded sign", () => {
    const result = verifyAscendant(FIXTURES[0]);
    assert.equal(result.status, "verified");
    if (result.status !== "verified") return;
    assert.equal(result.sign, "Scorpio");
    assert.ok(result.degreeInSign > 17.2 && result.degreeInSign < 17.4);
  });

  await suite.test("rejects a draft policy and invalid coordinates", () => {
    const draft = verifyAscendant(FIXTURES[0], {
      ...APPROVED_ASCENDANT_POLICY,
      status: "draft",
      approvedAt: undefined,
    });
    assert.equal(draft.status, "rejected");
    if (draft.status === "rejected") assert.equal(draft.reason, "policy_not_approved");

    const invalid = verifyAscendant({
      inputTimestamp: FIXTURES[0].inputTimestamp,
      latitude: 100,
      longitude: FIXTURES[0].longitude,
    });
    assert.equal(invalid.status, "rejected");
    if (invalid.status === "rejected") assert.equal(invalid.reason, "invalid_input");
  });
});
