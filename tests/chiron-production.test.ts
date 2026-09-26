import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVED_CHIRON_POLICY,
  verifyChiron,
} from "../server/services/chiron-production";

test("approved Chiron policy is bound to the exact cross-engine evidence artifact", () => {
  assert.equal(APPROVED_CHIRON_POLICY.status, "approved");
  assert.equal(APPROVED_CHIRON_POLICY.policyId, "ASTRO-CHIRON-v1");
  assert.equal(APPROVED_CHIRON_POLICY.maximumLongitudeDeltaDegrees, 0.001);
  assert.equal(APPROVED_CHIRON_POLICY.evidenceRunId, "35474358663");
  assert.equal(APPROVED_CHIRON_POLICY.evidenceArtifactId, "10593933139");
  assert.equal(
    APPROVED_CHIRON_POLICY.evidenceCandidateSha,
    "284aa019937ae3fdd2bfc4bfb1693219caa3f63a",
  );
  assert.ok(
    (APPROVED_CHIRON_POLICY.evidenceMaximumLongitudeDeltaDegrees ?? 99) <=
      APPROVED_CHIRON_POLICY.maximumLongitudeDeltaDegrees,
  );
});

test("live-qualified Chiron reference promotes exact sign and longitude", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    referenceFetcher: async (inputTimestamp) => ({
      body: "Chiron",
      longitude: 115.3498,
      sign: "Cancer",
      source: "NASA/JPL Horizons test fixture",
      engine: "nasa-jpl-horizons-api@1.3-test",
      calculatedAt: "2026-09-19T22:49:00.000Z",
      inputTimestamp,
    }),
  });

  assert.equal(result.status, "verified");
  if (result.status !== "verified") return;
  assert.equal(result.chiron.sign, "Cancer");
  assert.equal(result.chiron.verificationStatus, "verified");
  assert.equal(result.chiron.policyId, "ASTRO-CHIRON-v1");
  assert.equal(result.chiron.evidenceArtifactId, "10593933139");
  assert.equal(result.chiron.qualificationMethod, "live-jpl-qualified-against-swiss");
});

test("Chiron remains unresolved when live JPL reference is unavailable", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    referenceFetcher: async () => { throw new Error("offline"); },
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "reference_unavailable");
});

test("Chiron rejects references for the wrong body", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    referenceFetcher: async (inputTimestamp) => ({
      body: "Mars",
      longitude: 115.3498,
      sign: "Cancer",
      source: "wrong-body fixture",
      engine: "fixture",
      calculatedAt: "2026-09-19T22:49:00.000Z",
      inputTimestamp,
    } as never),
  });

  assert.deepEqual(result, { status: "unresolved", reason: "reference_identity_mismatch" });
});

test("Chiron rejects references for a different timestamp", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    referenceFetcher: async () => ({
      body: "Chiron",
      longitude: 115.3498,
      sign: "Cancer",
      source: "timestamp-mismatch fixture",
      engine: "fixture",
      calculatedAt: "2026-09-19T22:49:00.000Z",
      inputTimestamp: "1990-09-17T15:12:00.000Z",
    }),
  });

  assert.deepEqual(result, { status: "unresolved", reason: "reference_timestamp_mismatch" });
});

test("Chiron rejects non-finite longitudes and sign-longitude disagreement", async () => {
  for (const reference of [
    { longitude: Number.NaN, sign: "Cancer" },
    { longitude: 115.3498, sign: "Leo" },
  ]) {
    const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
      referenceFetcher: async (inputTimestamp) => ({
        body: "Chiron",
        ...reference,
        source: "invalid-reference fixture",
        engine: "fixture",
        calculatedAt: "2026-09-19T22:49:00.000Z",
        inputTimestamp,
      }),
    });

    assert.deepEqual(result, { status: "unresolved", reason: "reference_invalid" });
  }
});

test("draft Chiron policy cannot promote output", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    policy: { ...APPROVED_CHIRON_POLICY, status: "draft", approvedAt: undefined },
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "policy_not_approved");
});


test("Chiron verification rejects timezone-less and offset request timestamps", async () => {
  for (const inputTimestamp of [
    "1990-09-17T15:11:00",
    "1990-09-17T11:11:00-04:00",
  ]) {
    const result = await verifyChiron(inputTimestamp, {
      referenceFetcher: async () => {
        throw new Error("reference should not be called for invalid timestamp");
      },
    });

    assert.deepEqual(result, {
      status: "unresolved",
      reason: "reference_timestamp_mismatch",
    });
  }
});

test("Chiron verification rejects non-UTC reference timestamps even for the same instant", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    referenceFetcher: async () => ({
      body: "Chiron",
      longitude: 115.3498,
      sign: "Cancer",
      source: "offset-reference fixture",
      engine: "fixture",
      calculatedAt: "2026-09-19T22:49:00.000Z",
      inputTimestamp: "1990-09-17T11:11:00-04:00",
    }),
  });

  assert.deepEqual(result, {
    status: "unresolved",
    reason: "reference_timestamp_mismatch",
  });
});


test("Chiron verification preserves sign-longitude integrity across all zodiac sectors", async () => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ] as const;

  for (let index = 0; index < signs.length; index += 1) {
    const longitude = index * 30 + 15;
    const result = await verifyChiron("2000-01-01T12:00:00.000Z", {
      referenceFetcher: async (inputTimestamp) => ({
        body: "Chiron",
        longitude,
        sign: signs[index],
        source: "zodiac-integrity fixture",
        engine: "fixture",
        calculatedAt: "2026-09-26T00:00:00.000Z",
        inputTimestamp,
      }),
    });

    assert.equal(result.status, "verified", signs[index]);
  }
});

test("Chiron verification rejects stale sign labels immediately after every zodiac crossing", async () => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ] as const;

  for (let index = 0; index < signs.length; index += 1) {
    const boundary = (index + 1) * 30;
    const longitude = boundary >= 360 ? 0.01 : boundary + 0.01;
    const result = await verifyChiron("2000-01-01T12:00:00.000Z", {
      referenceFetcher: async (inputTimestamp) => ({
        body: "Chiron",
        longitude,
        sign: signs[index],
        source: "stale-sign fixture",
        engine: "fixture",
        calculatedAt: "2026-09-26T00:00:00.000Z",
        inputTimestamp,
      }),
    });

    assert.deepEqual(result, { status: "unresolved", reason: "reference_invalid" });
  }
});
