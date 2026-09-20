import assert from "node:assert/strict";
import test from "node:test";
import { calculateAstrology } from "../server/services/astrology";
import {
  FULL_NATAL_BODIES,
  PLANETARY_EVIDENCE_FIXTURES,
  runLivePlanetaryEvidenceMatrix,
} from "../server/services/astrology-planetary-evidence-matrix";

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

test("full natal evidence fixtures cover all ten supported bodies", () => {
  assert.equal(FULL_NATAL_BODIES.length, 10);
  assert.ok(PLANETARY_EVIDENCE_FIXTURES.length >= 20);
  for (const fixture of PLANETARY_EVIDENCE_FIXTURES) {
    assert.deepEqual(new Set(fixture.bodies), new Set(FULL_NATAL_BODIES));
  }
});

test("every expanded fixture produces withheld candidates for every supported body", () => {
  for (const fixture of PLANETARY_EVIDENCE_FIXTURES) {
    const astrology = calculateAstrology(fixture);
    assert.ok(astrology.planets);
    for (const body of FULL_NATAL_BODIES) {
      const placement = body === "Sun"
        ? astrology.sun
        : body === "Moon"
          ? astrology.moon
          : astrology.planets[body.toLowerCase() as keyof typeof astrology.planets];
      assert.ok(placement.internalCandidate, `missing ${body} candidate for ${fixture.id}`);
      assert.equal(placement.sign, null);
    }
  }
});

test("full-planet live-style receipt measures every body but cannot approve production", async () => {
  const fixture = PLANETARY_EVIDENCE_FIXTURES[0];
  const astrology = calculateAstrology(fixture);
  assert.ok(astrology.planets);

  const longitudes = FULL_NATAL_BODIES.map((body) => {
    const placement = body === "Sun"
      ? astrology.sun
      : body === "Moon"
        ? astrology.moon
        : astrology.planets![body.toLowerCase() as keyof typeof astrology.planets];
    assert.ok(placement.internalCandidate);
    return placement.internalCandidate.longitude;
  });

  const originalFetch = globalThis.fetch;
  let callIndex = 0;
  globalThis.fetch = async () => horizonsPayload(longitudes[callIndex++]);

  try {
    const receipt = await runLivePlanetaryEvidenceMatrix([fixture]);
    assert.equal(receipt.policyStatus, "evidence_only_no_planetary_tolerance_approved");
    assert.equal(receipt.totalRows, undefined);
    assert.equal(receipt.summary.totalRows, 10);
    assert.equal(receipt.summary.signDisagreements, 0);
    assert.equal(receipt.bodyCount, 10);
    for (const body of FULL_NATAL_BODIES) {
      const delta = receipt.summary.bodyMaximumDeltaDegrees[body];
      assert.ok(delta !== null && delta < 1e-8, `${body} delta ${delta}`);
    }
    assert.equal("approvedTolerance" in receipt, false);
    assert.equal("verified" in receipt, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
