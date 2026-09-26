import assert from "node:assert/strict";
import test from "node:test";
import {
  verifyAgainstIndependentReference,
  type VerifiableBody,
  type VerificationPolicy,
} from "../server/services/astrology-verification";

const BODIES: readonly VerifiableBody[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const CORE_POLICY: VerificationPolicy = {
  status: "approved",
  policyId: "TEST-BOUNDARY-CORE",
  maximumLongitudeDeltaDegrees: 0.001,
  approvedAt: "2026-09-26T00:00:00.000Z",
};

const PLANET_POLICY: VerificationPolicy = {
  status: "approved",
  policyId: "TEST-BOUNDARY-PLANET",
  maximumLongitudeDeltaDegrees: 0.005,
  approvedAt: "2026-09-26T00:00:00.000Z",
};

function policyFor(body: VerifiableBody): VerificationPolicy {
  return body === "Sun" || body === "Moon" ? CORE_POLICY : PLANET_POLICY;
}

function row(body: VerifiableBody, longitude: number, sign: string, suffix: string) {
  return {
    body,
    longitude,
    sign,
    source: `independent-${suffix}`,
    engine: `engine-${suffix}`,
    calculatedAt: "2026-09-26T00:00:00.000Z",
    inputTimestamp: "2000-01-01T12:00:00.000Z",
  };
}

test("all supported natal bodies fail closed inside their governed zodiac-boundary tolerance", () => {
  for (const body of BODIES) {
    const policy = policyFor(body);
    for (let signIndex = 0; signIndex < SIGNS.length; signIndex += 1) {
      const boundary = signIndex * 30;
      const longitude = boundary + policy.maximumLongitudeDeltaDegrees / 2;
      const normalizedLongitude = ((longitude % 360) + 360) % 360;
      const sign = SIGNS[signIndex];

      const result = verifyAgainstIndependentReference(
        row(body, normalizedLongitude, sign, "candidate"),
        row(body, normalizedLongitude + policy.maximumLongitudeDeltaDegrees / 10, sign, "reference"),
        policy,
      );

      assert.equal(result.status, "rejected", `${body} ${sign}`);
      if (result.status === "rejected") {
        assert.equal(result.reason, "sign_boundary_within_tolerance", `${body} ${sign}`);
      }
    }
  }
});

test("all supported natal bodies verify safely away from zodiac boundaries", () => {
  for (const body of BODIES) {
    const policy = policyFor(body);
    for (let signIndex = 0; signIndex < SIGNS.length; signIndex += 1) {
      const longitude = signIndex * 30 + 15;
      const sign = SIGNS[signIndex];

      const result = verifyAgainstIndependentReference(
        row(body, longitude, sign, "candidate"),
        row(body, longitude + policy.maximumLongitudeDeltaDegrees / 10, sign, "reference"),
        policy,
      );

      assert.equal(result.status, "verified", `${body} ${sign}`);
    }
  }
});

test("all supported natal bodies reject stale sign labels after every zodiac crossing", () => {
  for (const body of BODIES) {
    const policy = policyFor(body);
    for (let signIndex = 0; signIndex < SIGNS.length; signIndex += 1) {
      const nextIndex = (signIndex + 1) % SIGNS.length;
      const boundary = (signIndex + 1) * 30;
      const longitude = boundary >= 360 ? 0.02 : boundary + 0.02;
      const staleSign = SIGNS[signIndex];

      const result = verifyAgainstIndependentReference(
        row(body, longitude, staleSign, "candidate"),
        row(body, longitude + policy.maximumLongitudeDeltaDegrees / 10, staleSign, "reference"),
        policy,
      );

      assert.equal(result.status, "rejected", `${body} ${SIGNS[signIndex]} -> ${SIGNS[nextIndex]}`);
      if (result.status === "rejected") {
        assert.equal(result.reason, "sign_longitude_mismatch");
      }
    }
  }
});
