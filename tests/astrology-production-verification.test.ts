import assert from "node:assert/strict";
import test from "node:test";
import { synthesizeArchetype } from "../server/services/archetype";
import {
  calculateAstrology,
  calculateVerifiedAstrology,
  type BirthData,
  type IndependentReferenceFetcher,
} from "../server/services/astrology";
import {
  APPROVED_LONGITUDE_TOLERANCE_EVIDENCE,
  getApprovedLongitudeTolerancePolicy,
} from "../server/services/astrology-tolerance-policy";
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

function matchingReferenceFetcher(delta = 0.0005): IndependentReferenceFetcher {
  const candidates = calculateAstrology(birthData);

  return async (body, inputTimestamp): Promise<IndependentEphemerisReference> => {
    const placement = body === "Sun" ? candidates.sun : candidates.moon;
    assert.ok(placement.candidate, `${body} candidate must exist for the test`);
    assert.equal(inputTimestamp, placement.candidate.inputTimestamp);

    return {
      body,
      sign: placement.candidate.sign,
      longitude: (placement.candidate.longitude + delta) % 360,
      source:
        "NASA/JPL Horizons observer quantity 31: geocentric apparent ecliptic-of-date longitude",
      engine: "nasa-jpl-horizons-api@1.3",
      calculatedAt: "2026-08-03T11:30:00.000Z",
      inputTimestamp,
    };
  };
}

test("the governed policy is approved only for Sun and Moon at 0.001 degrees", () => {
  const sunPolicy = getApprovedLongitudeTolerancePolicy("Sun");
  const moonPolicy = getApprovedLongitudeTolerancePolicy("Moon");

  assert.deepEqual(sunPolicy, moonPolicy);
  assert.equal(sunPolicy.status, "approved");
  assert.equal(sunPolicy.policyId, "ASTRO-LONGITUDE-v1");
  assert.equal(sunPolicy.maximumLongitudeDeltaDegrees, 0.001);
  assert.equal(sunPolicy.approvedAt, "2026-08-03T11:26:00.000Z");
  assert.equal(APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.totalRows, 40);
  assert.equal(APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.signDisagreements, 0);
  assert.ok(
    APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.maximumLongitudeDeltaDegrees <=
      sunPolicy.maximumLongitudeDeltaDegrees,
  );
});

test("matching independent references promote Sun and Moon with complete provenance", async () => {
  const result = await calculateVerifiedAstrology(birthData, {
    referenceFetcher: matchingReferenceFetcher(),
  });

  for (const [body, placement] of [
    ["Sun", result.sun],
    ["Moon", result.moon],
  ] as const) {
    assert.equal(placement.status, "verified");
    assert.ok(placement.sign, `${body} sign should be exposed after verification`);
    assert.equal(placement.confidence, 1);
    assert.ok(placement.provenance);
    assert.equal(placement.provenance.policyId, "ASTRO-LONGITUDE-v1");
    assert.equal(
      placement.provenance.evidenceReceiptId,
      APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.receiptRunId,
    );
    assert.equal(
      placement.provenance.evidenceArtifactId,
      APPROVED_LONGITUDE_TOLERANCE_EVIDENCE.artifactId,
    );
    assert.equal(
      placement.provenance.inputTimestamp,
      placement.candidate?.inputTimestamp,
    );
    assert.ok(placement.provenance.source);
    assert.ok(placement.provenance.engine);
    assert.ok(placement.provenance.calculatedAt);
    assert.ok(placement.provenance.longitudeDeltaDegrees <= 0.001);
  }

  assert.deepEqual(result.verification.verifiedBodies, ["Sun", "Moon"]);
  assert.deepEqual(result.verification.unresolvedBodies, ["Ascendant"]);
  assert.equal(result.rising.status, "pending_ephemeris");
  assert.equal(result.rising.sign, null);
});

test("a sign disagreement leaves the candidate withheld while independent matches may still verify", async () => {
  const candidates = calculateAstrology(birthData);
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const referenceFetcher: IndependentReferenceFetcher = async (
    body,
    inputTimestamp,
  ) => {
    const placement = body === "Sun" ? candidates.sun : candidates.moon;
    assert.ok(placement.candidate);
    const candidate = placement.candidate;
    const sign =
      body === "Sun"
        ? signs[(signs.indexOf(candidate.sign) + 1) % signs.length]
        : candidate.sign;

    return {
      body,
      sign,
      longitude: candidate.longitude + 0.0002,
      source: "NASA/JPL Horizons independent reference",
      engine: "nasa-jpl-horizons-api@1.3",
      calculatedAt: "2026-08-03T11:31:00.000Z",
      inputTimestamp,
    };
  };

  const result = await calculateVerifiedAstrology(birthData, {
    referenceFetcher,
  });

  assert.equal(result.sun.status, "calculated_pending_independent_verification");
  assert.equal(result.sun.sign, null);
  assert.equal(result.sun.verificationFailure?.reason, "sign_disagreement");
  assert.equal(result.moon.status, "verified");
  assert.ok(result.moon.sign);
});

test("reference failure cannot leak a candidate sign into authoritative output", async () => {
  const result = await calculateVerifiedAstrology(birthData, {
    referenceFetcher: async () => {
      throw new Error("horizons_http_503");
    },
  });

  for (const placement of [result.sun, result.moon]) {
    assert.equal(
      placement.status,
      "calculated_pending_independent_verification",
    );
    assert.equal(placement.sign, null);
    assert.ok(placement.candidate?.sign);
    assert.equal(placement.verificationFailure?.reason, "horizons_http_503");
  }
});

test("a draft policy cannot promote production candidates", async () => {
  const draftPolicyForBody = (_body: VerifiableBody): VerificationPolicy => ({
    status: "draft",
    policyId: "ASTRO-LONGITUDE-v1-draft",
    maximumLongitudeDeltaDegrees: 0.001,
  });

  const result = await calculateVerifiedAstrology(birthData, {
    referenceFetcher: matchingReferenceFetcher(),
    policyForBody: draftPolicyForBody,
  });

  for (const placement of [result.sun, result.moon]) {
    assert.equal(
      placement.status,
      "calculated_pending_independent_verification",
    );
    assert.equal(placement.sign, null);
    assert.equal(placement.verificationFailure?.reason, "policy_not_approved");
  }
});

test("missing birth time prevents network verification and leaves timed placements unresolved", async () => {
  let calls = 0;
  const result = await calculateVerifiedAstrology(
    {
      birthDate: birthData.birthDate,
      timezone: birthData.timezone,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    },
    {
      referenceFetcher: async () => {
        calls += 1;
        throw new Error("should_not_be_called");
      },
    },
  );

  assert.equal(calls, 0);
  assert.equal(result.sun.sign, null);
  assert.equal(
    result.sun.status,
    "calculated_pending_independent_verification",
  );
  assert.match(result.sun.reason ?? "", /birth time and timezone/i);
  assert.equal(result.moon.status, "requires_verified_birth_time");
  assert.equal(result.rising.status, "requires_verified_birth_time");
});

test("legacy astrology labels cannot steer archetype synthesis without verified evidence", () => {
  const archetype = synthesizeArchetype(
    {
      sunSign: "Virgo",
      moonSign: "Scorpio",
      risingSign: "Capricorn",
    },
    {},
    {},
  );

  assert.equal(archetype.title, "Pattern Witness");
});

test("verified astrology may contribute to archetype synthesis", () => {
  const archetype = synthesizeArchetype(
    {
      sun: {
        sign: "Virgo",
        status: "verified",
        provenance: {
          source: "Astronomy Engine plus NASA/JPL Horizons",
          engine: "astronomy-engine@2.1.19 + nasa-jpl-horizons-api@1.3",
          calculatedAt: "2026-08-03T11:32:00.000Z",
        },
      },
      moon: { sign: null, status: "calculated_pending_independent_verification" },
      rising: { sign: null, status: "pending_ephemeris" },
    },
    {},
    {},
  );

  assert.equal(archetype.title, "Sacred Guardian");
});
