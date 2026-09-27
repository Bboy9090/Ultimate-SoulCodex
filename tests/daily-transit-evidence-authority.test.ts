import assert from "node:assert/strict";
import test from "node:test";
import { extractNatalPositions } from "../transits.ts";

const evidence = {
  source: "independent ephemeris comparison",
  engine: "test-reference@1",
  calculatedAt: "2026-09-26T18:00:00.000Z",
};

test("personal transit natal authority fails closed on status-only placements", () => {
  const result = extractNatalPositions({
    planets: {
      sun: {
        sign: "Virgo",
        verificationStatus: "verified",
        internalCandidate: { longitude: 174.2 },
      },
      moon: {
        sign: "Cancer",
        verificationStatus: "calculated",
        evidence,
        internalCandidate: { longitude: 95.25 },
      },
    },
    rising: {
      sign: "Scorpio",
      verificationStatus: "verified",
      internalCandidate: { longitude: 220 },
    },
  });

  assert.deepEqual(result, {});
});

test("personal transit natal authority accepts complete placement provenance", () => {
  const result = extractNatalPositions({
    planets: {
      sun: {
        sign: "Virgo",
        verificationStatus: "verified",
        evidence,
        internalCandidate: { longitude: 174.2 },
      },
      mercury: {
        sign: "Libra",
        verificationStatus: "verified",
        provenance: evidence,
        longitude: 185.5,
      },
    },
    rising: {
      sign: "Scorpio",
      verificationStatus: "verified",
      evidence,
      internalCandidate: { longitude: 220 },
    },
  });

  const expected = {
    Sun: { longitude: 174.2, sign: "Virgo" },
    Mercury: { longitude: 185.5, sign: "Libra" },
    Ascendant: { longitude: 220, sign: "Scorpio" },
  } as const;

  assert.deepEqual(Object.keys(result).sort(), Object.keys(expected).sort());
  for (const [name, target] of Object.entries(expected)) {
    const actual = result[name];
    assert.ok(actual, name);
    assert.equal(actual.sign, target.sign, name);
    assert.ok(
      Math.abs(actual.longitude - target.longitude) <= 1e-10,
      `${name} longitude drifted: ${actual.longitude} vs ${target.longitude}`,
    );
  }
});

test("personal transit natal authority rejects malformed evidence timestamps", () => {
  const result = extractNatalPositions({
    planets: {
      venus: {
        sign: "Leo",
        verificationStatus: "verified",
        evidence: { ...evidence, calculatedAt: "not-a-date" },
        longitude: 145,
      },
    },
  });

  assert.deepEqual(result, {});
});

test("governed Midheaven uses the approved equal-house receipt contract", () => {
  const accepted = extractNatalPositions({
    midheaven: {
      sign: "Leo",
      longitude: 130,
      verificationStatus: "verified",
      policyId: "ASTRO-EQUAL-HOUSE-v1",
      evidenceArtifactId: "equal-house-fixture",
    },
  });
  assert.deepEqual(accepted, {
    Midheaven: { longitude: 130, sign: "Leo" },
  });

  const rejected = extractNatalPositions({
    midheaven: {
      sign: "Leo",
      longitude: 130,
      verificationStatus: "verified",
      policyId: "ASTRO-UNKNOWN-v1",
      evidenceArtifactId: "equal-house-fixture",
    },
  });
  assert.deepEqual(rejected, {});
});
