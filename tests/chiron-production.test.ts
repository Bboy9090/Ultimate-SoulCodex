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

test("draft Chiron policy cannot promote output", async () => {
  const result = await verifyChiron("1990-09-17T15:11:00.000Z", {
    policy: { ...APPROVED_CHIRON_POLICY, status: "draft", approvedAt: undefined },
  });
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "policy_not_approved");
});
