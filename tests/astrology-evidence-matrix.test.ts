import assert from "node:assert/strict";
import test from "node:test";
import { calculateAstrology } from "../server/services/astrology";
import {
  EPHEMERIS_EVIDENCE_FIXTURES,
  runLiveEphemerisEvidenceMatrix,
} from "../server/services/astrology-evidence-matrix";

function horizonsPayload(longitude: number): Response {
  const result = `
 Date__(UT)__HR:MN:SC.fff, ObsEcLon, ObsEcLat,
$$SOE
2000-Jan-01 00:00:00.000, ${longitude.toFixed(8)}, 0.00000000,
$$EOE
`;
  return new Response(JSON.stringify({
    signature: { source: "NASA/JPL Horizons API", version: "1.3" },
    result,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("the versioned matrix covers identity, boundaries, civil-time edges, leap days, and history", () => {
  const categories = new Set(EPHEMERIS_EVIDENCE_FIXTURES.map((fixture) => fixture.category));
  assert.deepEqual(categories, new Set([
    "golden_profile",
    "zodiac_boundary",
    "dst_transition",
    "leap_day",
    "timezone_edge",
    "historical",
  ]));
  assert.ok(EPHEMERIS_EVIDENCE_FIXTURES.length >= 20);
  assert.equal(new Set(EPHEMERIS_EVIDENCE_FIXTURES.map((fixture) => fixture.id)).size, EPHEMERIS_EVIDENCE_FIXTURES.length);
  assert.ok(EPHEMERIS_EVIDENCE_FIXTURES.every((fixture) => fixture.bodies.includes("Sun")));
  assert.ok(EPHEMERIS_EVIDENCE_FIXTURES.every((fixture) => fixture.bodies.includes("Moon")));
  const fullBodyFixtures = EPHEMERIS_EVIDENCE_FIXTURES.filter(
    (fixture) => fixture.bodies.length === 10,
  );
  assert.ok(fullBodyFixtures.length >= 5);
  assert.ok(fullBodyFixtures.some((fixture) => fixture.category === "golden_profile"));
  assert.ok(
    fullBodyFixtures.filter((fixture) => fixture.category === "zodiac_boundary").length >= 4,
  );
});

test("every expanded fixture produces each requested local candidate before live comparison", () => {
  for (const fixture of EPHEMERIS_EVIDENCE_FIXTURES) {
    const astrology = calculateAstrology(fixture);
    for (const body of fixture.bodies) {
      const key = body.toLowerCase() as
        | "sun" | "moon" | "mercury" | "venus" | "mars"
        | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";
      const placement =
        body === "Sun" ? astrology.sun :
        body === "Moon" ? astrology.moon :
        astrology.planets?.[key];
      assert.ok(placement?.internalCandidate, `missing ${body} candidate for ${fixture.id}`);
    }
  }
});

test("a live-style receipt measures deltas but never approves a tolerance", async () => {
  const fixture = EPHEMERIS_EVIDENCE_FIXTURES[0];
  const astrology = calculateAstrology(fixture);
  const longitudes = fixture.bodies.map((body) => {
    const key = body.toLowerCase() as
      | "sun" | "moon" | "mercury" | "venus" | "mars"
      | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";
    const placement =
      body === "Sun" ? astrology.sun :
      body === "Moon" ? astrology.moon :
      astrology.planets?.[key];
    assert.ok(placement?.internalCandidate);
    return placement.internalCandidate.longitude;
  });

  const originalFetch = globalThis.fetch;
  let callIndex = 0;
  globalThis.fetch = async () => horizonsPayload(longitudes[callIndex++]);

  try {
    const receipt = await runLiveEphemerisEvidenceMatrix([fixture]);
    assert.equal(receipt.schemaVersion, "1.0.0");
    assert.equal(receipt.policyStatus, "evidence_only_no_tolerance_approved");
    assert.equal(receipt.summary.totalRows, fixture.bodies.length);
    assert.equal(receipt.summary.signDisagreements, 0);
    assert.ok(
      receipt.summary.maximumLongitudeDeltaDegrees !== null
        && receipt.summary.maximumLongitudeDeltaDegrees < 1e-8,
      `expected a rounding-only delta below 1e-8°, got ${receipt.summary.maximumLongitudeDeltaDegrees}`,
    );
    for (const body of fixture.bodies) {
      assert.ok(
        typeof receipt.summary.bodyMaximumDeltaDegrees[body] === "number",
        `missing body maximum for ${body}`,
      );
    }
    assert.equal("approvedTolerance" in receipt, false);
    assert.equal("verified" in receipt, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the evidence runner fails closed when a candidate cannot be produced", async () => {
  const invalidFixture = {
    ...EPHEMERIS_EVIDENCE_FIXTURES[0],
    id: "invalid-date-fixture",
    birthDate: "not-a-date",
  };

  await assert.rejects(
    runLiveEphemerisEvidenceMatrix([invalidFixture]),
    /candidate_missing:invalid-date-fixture:Sun/,
  );
});
