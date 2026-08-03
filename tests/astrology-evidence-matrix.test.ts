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

test("the versioned matrix covers golden, boundary, DST, and historical evidence categories", () => {
  const categories = new Set(EPHEMERIS_EVIDENCE_FIXTURES.map((fixture) => fixture.category));
  assert.deepEqual(categories, new Set([
    "golden_profile",
    "zodiac_boundary",
    "dst_transition",
    "historical",
  ]));
  assert.ok(EPHEMERIS_EVIDENCE_FIXTURES.every((fixture) => fixture.bodies.includes("Sun")));
  assert.ok(EPHEMERIS_EVIDENCE_FIXTURES.every((fixture) => fixture.bodies.includes("Moon")));
});

test("a live-style receipt measures deltas but never approves a tolerance", async () => {
  const fixture = EPHEMERIS_EVIDENCE_FIXTURES[0];
  const astrology = calculateAstrology(fixture);
  const longitudes = [
    astrology.sun.candidate?.longitude,
    astrology.moon.candidate?.longitude,
  ];
  assert.ok(longitudes.every((value) => typeof value === "number"));

  const originalFetch = globalThis.fetch;
  let callIndex = 0;
  globalThis.fetch = async () => horizonsPayload(longitudes[callIndex++] as number);

  try {
    const receipt = await runLiveEphemerisEvidenceMatrix([fixture]);
    assert.equal(receipt.schemaVersion, "1.0.0");
    assert.equal(receipt.policyStatus, "evidence_only_no_tolerance_approved");
    assert.equal(receipt.summary.totalRows, 2);
    assert.equal(receipt.summary.signDisagreements, 0);
    assert.equal(receipt.summary.maximumLongitudeDeltaDegrees, 0);
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
