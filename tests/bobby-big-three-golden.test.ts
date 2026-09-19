import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateVerifiedAstrology,
  type BirthData,
} from "../server/services/astrology-production";
import type { IndependentReferenceFetcher } from "../server/services/astrology";
import type {
  IndependentEphemerisReference,
  VerifiableBody,
} from "../server/services/astrology-verification";

const BOBBY_RAW_BIRTH_INPUT: BirthData = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: 40.8448,
  longitude: -73.8648,
};

const GOLDEN_EPHEMERIS_REFERENCE: Record<
  VerifiableBody,
  { sign: string; longitude: number }
> = {
  Sun: { sign: "Virgo", longitude: 174.4712414 },
  Moon: { sign: "Virgo", longitude: 157.6364328 },
  Mercury: { sign: "Virgo", longitude: 159.5916156 },
  Venus: { sign: "Virgo", longitude: 162.7370284 },
  Mars: { sign: "Gemini", longitude: 67.6092377 },
  Jupiter: { sign: "Leo", longitude: 126.0213619 },
  Saturn: { sign: "Capricorn", longitude: 288.7300928 },
  Uranus: { sign: "Capricorn", longitude: 275.6039647 },
  Neptune: { sign: "Capricorn", longitude: 281.8081157 },
  Pluto: { sign: "Scorpio", longitude: 225.7598442 },
};

const referenceFetcher: IndependentReferenceFetcher = async (
  body,
  inputTimestamp,
): Promise<IndependentEphemerisReference> => ({
  body,
  sign: GOLDEN_EPHEMERIS_REFERENCE[body].sign,
  longitude: GOLDEN_EPHEMERIS_REFERENCE[body].longitude,
  source:
    "NASA/JPL Horizons geocentric apparent ecliptic-of-date golden receipt",
  engine: "nasa-jpl-horizons-api@1.3-golden",
  calculatedAt: "2026-09-19T14:36:05.000Z",
  inputTimestamp,
});

test("Bobby's raw birth inputs verify as Virgo Sun, Virgo Moon, and Scorpio Rising", async () => {
  const result = await calculateVerifiedAstrology(BOBBY_RAW_BIRTH_INPUT, {
    referenceFetcher,
  });

  assert.equal(result.sun.verificationStatus, "verified");
  assert.equal(result.sun.sign, "Virgo");
  assert.equal(result.sun.internalCandidate?.inputTimestamp, "1990-09-17T15:11:00.000Z");
  assert.ok(result.sun.evidence);
  assert.ok(result.sun.evidence.longitudeDeltaDegrees <= 0.001);

  assert.equal(result.moon.verificationStatus, "verified");
  assert.equal(result.moon.sign, "Virgo");
  assert.equal(result.moon.internalCandidate?.inputTimestamp, "1990-09-17T15:11:00.000Z");
  assert.ok(result.moon.evidence);
  assert.ok(result.moon.evidence.longitudeDeltaDegrees <= 0.001);

  assert.equal(result.rising.verificationStatus, "verified");
  assert.equal(result.rising.sign, "Scorpio");
  assert.equal(result.rising.internalCandidate?.inputTimestamp, "1990-09-17T15:11:00.000Z");
  assert.ok(result.rising.internalCandidate);
  assert.ok(result.rising.internalCandidate.longitude > 227.3);
  assert.ok(result.rising.internalCandidate.longitude < 227.33);
  assert.ok(result.rising.evidence);
  assert.equal(result.rising.evidence.policyId, "ASTRO-ASCENDANT-v1");
  assert.ok(result.rising.evidence.longitudeDeltaDegrees <= 0.01);

  assert.equal(result.verification.complete, true);
  assert.deepEqual(result.verification.unresolvedBodies, []);
  for (const body of [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ] as const) {
    assert.ok(result.verification.verifiedBodies.includes(body), `${body} should be verified`);
  }
  assert.match(result.verification.policyId ?? "", /ASTRO-PLANET-LONGITUDE-v1/);
  assert.match(result.verification.evidenceReceiptId ?? "", /35449041012/);
});
