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

const SWISS_EPHEMERIS_REFERENCE: Record<
  VerifiableBody,
  { sign: "Virgo"; longitude: number }
> = {
  Sun: {
    sign: "Virgo",
    longitude: 174.4712502800783,
  },
  Moon: {
    sign: "Virgo",
    longitude: 157.6363960284451,
  },
};

const referenceFetcher: IndependentReferenceFetcher = async (
  body,
  inputTimestamp,
): Promise<IndependentEphemerisReference> => ({
  body,
  sign: SWISS_EPHEMERIS_REFERENCE[body].sign,
  longitude: SWISS_EPHEMERIS_REFERENCE[body].longitude,
  source:
    "Swiss Ephemeris 2.10.03 geocentric tropical longitude golden fixture",
  engine: "swisseph@2.10.03",
  calculatedAt: "2026-08-04T04:35:00.000Z",
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
});
