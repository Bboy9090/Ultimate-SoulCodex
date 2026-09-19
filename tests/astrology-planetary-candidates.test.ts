import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAstrology,
  calculateVerifiedAstrology,
  type BirthData,
  type IndependentReferenceFetcher,
} from "../server/services/astrology";
import type {
  IndependentEphemerisReference,
  VerifiableBody,
  VerificationPolicy,
} from "../server/services/astrology-verification";

const birthData: BirthData = {
  birthDate: "1990-09-17",
  birthTime: "11:11",
  timezone: "America/New_York",
  latitude: 40.8448,
  longitude: -73.8648,
};

const PLANET_KEYS = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

const BODY_BY_KEY: Record<(typeof PLANET_KEYS)[number], VerifiableBody> = {
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

test("all classical natal planets get deterministic withheld candidates", () => {
  const first = calculateAstrology(birthData);
  const second = calculateAstrology(birthData);

  assert.ok(first.planets);
  assert.ok(second.planets);

  for (const key of PLANET_KEYS) {
    const left = first.planets[key];
    const right = second.planets[key];
    assert.equal(left.verificationStatus, "pending_independent_verification");
    assert.equal(left.sign, null);
    assert.ok(left.internalCandidate);
    assert.ok(right.internalCandidate);
    assert.equal(left.internalCandidate.sign, right.internalCandidate.sign);
    assert.equal(left.internalCandidate.longitude, right.internalCandidate.longitude);
    assert.equal(left.internalCandidate.inputTimestamp, right.internalCandidate.inputTimestamp);
    assert.ok(left.internalCandidate.longitude >= 0 && left.internalCandidate.longitude < 360);
  }
});

test("missing birth time withholds all time-sensitive planets", () => {
  const result = calculateAstrology({
    birthDate: birthData.birthDate,
    timezone: birthData.timezone,
    latitude: birthData.latitude,
    longitude: birthData.longitude,
  });

  assert.ok(result.planets);
  for (const key of PLANET_KEYS) {
    assert.equal(result.planets[key].sign, null);
    assert.equal(result.planets[key].verificationStatus, "requires_verified_birth_time");
    assert.equal(result.planets[key].internalCandidate, undefined);
  }
});

test("an explicitly approved independent policy can promote every planetary candidate", async () => {
  const candidates = calculateAstrology(birthData);
  assert.ok(candidates.planets);

  const referenceFetcher: IndependentReferenceFetcher = async (
    body,
    inputTimestamp,
  ): Promise<IndependentEphemerisReference> => {
    const key =
      body === "Sun" ? "sun" :
      body === "Moon" ? "moon" :
      body.toLowerCase() as keyof typeof candidates.planets;
    const placement = candidates.planets![key];
    assert.ok(placement.internalCandidate);

    return {
      body,
      sign: placement.internalCandidate.sign,
      longitude: (placement.internalCandidate.longitude + 0.0001) % 360,
      source: "Independent fixture ephemeris",
      engine: "independent-fixture-engine@1",
      calculatedAt: "2026-09-19T00:00:00.000Z",
      inputTimestamp,
    };
  };

  const policyForBody = (body: VerifiableBody): VerificationPolicy => ({
    status: "approved",
    policyId: `TEST-${body}-LONGITUDE-v1`,
    maximumLongitudeDeltaDegrees: 0.001,
    approvedAt: "2026-09-19T00:00:00.000Z",
  });

  const result = await calculateVerifiedAstrology(birthData, {
    referenceFetcher,
    policyForBody,
  });

  assert.ok(result.planets);
  for (const key of PLANET_KEYS) {
    const placement = result.planets[key];
    assert.equal(placement.verificationStatus, "verified");
    assert.ok(placement.sign);
    assert.ok(placement.evidence);
    assert.ok((placement.evidence.longitudeDeltaDegrees ?? 99) <= 0.001);
  }
});

test("production policy refuses unapproved planets before independent network lookup", async () => {
  const candidates = calculateAstrology(birthData);
  assert.ok(candidates.planets);

  const calls: VerifiableBody[] = [];
  const referenceFetcher: IndependentReferenceFetcher = async (
    body,
    inputTimestamp,
  ): Promise<IndependentEphemerisReference> => {
    calls.push(body);
    const key =
      body === "Sun" ? "sun" :
      body === "Moon" ? "moon" :
      body.toLowerCase() as keyof typeof candidates.planets;
    const placement = candidates.planets![key];
    assert.ok(placement.internalCandidate);
    return {
      body,
      sign: placement.internalCandidate.sign,
      longitude: placement.internalCandidate.longitude,
      source: "Independent fixture ephemeris",
      engine: "independent-fixture-engine@1",
      calculatedAt: "2026-09-19T00:00:00.000Z",
      inputTimestamp,
    };
  };

  const result = await calculateVerifiedAstrology(birthData, { referenceFetcher });
  assert.deepEqual(calls.sort(), ["Moon", "Sun"]);

  for (const key of PLANET_KEYS) {
    const placement = result.planets![key];
    assert.equal(placement.verificationStatus, "pending_independent_verification");
    assert.equal(placement.sign, null);
    assert.equal(placement.verificationFailure?.reason, "body_not_approved_for_longitude_verification");
  }
});
