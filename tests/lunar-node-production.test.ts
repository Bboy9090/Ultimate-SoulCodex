import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVED_MEAN_NODE_POLICY,
  verifyMeanNodes,
} from "../server/services/lunar-node-production";

test("approved Mean Node policy is bound to the exact Swiss evidence receipt", () => {
  assert.equal(APPROVED_MEAN_NODE_POLICY.status, "approved");
  assert.equal(APPROVED_MEAN_NODE_POLICY.policyId, "ASTRO-MEAN-NODE-v1");
  assert.equal(APPROVED_MEAN_NODE_POLICY.nodeMode, "mean");
  assert.equal(APPROVED_MEAN_NODE_POLICY.maximumLongitudeDeltaDegrees, 0.01);
  assert.equal(APPROVED_MEAN_NODE_POLICY.evidenceRunId, "35463886745");
  assert.equal(APPROVED_MEAN_NODE_POLICY.evidenceArtifactId, "10590393354");
  assert.equal(
    APPROVED_MEAN_NODE_POLICY.evidenceCandidateSha,
    "d5d5f30dd316999c5723e3ff8e3c2270dfd53f6f",
  );
  assert.ok(
    (APPROVED_MEAN_NODE_POLICY.evidenceMaximumLongitudeDeltaDegrees ?? 99) <=
      APPROVED_MEAN_NODE_POLICY.maximumLongitudeDeltaDegrees,
  );
});

test("Bobby fixture promotes mean Aquarius North Node and opposite Leo South Node", () => {
  const result = verifyMeanNodes({
    inputTimestamp: "1990-09-17T15:11:00.000Z",
  });
  assert.equal(result.status, "verified");
  if (result.status !== "verified") return;

  assert.equal(result.mode, "mean");
  assert.equal(result.northNode.sign, "Aquarius");
  assert.equal(result.southNode.sign, "Leo");
  assert.equal(result.northNode.policyId, "ASTRO-MEAN-NODE-v1");
  assert.equal(result.northNode.evidenceArtifactId, "10590393354");
  assert.equal(result.northNode.qualificationMethod, "fixture-qualified-deterministic");

  const opposition =
    ((result.southNode.longitudeDegrees - result.northNode.longitudeDegrees) % 360 + 360) % 360;
  assert.ok(Math.abs(opposition - 180) < 1e-10);
});

test("draft node policy cannot promote a node", () => {
  const result = verifyMeanNodes(
    { inputTimestamp: "1990-09-17T15:11:00.000Z" },
    {
      ...APPROVED_MEAN_NODE_POLICY,
      status: "draft",
      approvedAt: undefined,
    },
  );
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "policy_not_approved");
});

test("missing evidence identity fails closed", () => {
  const result = verifyMeanNodes(
    { inputTimestamp: "1990-09-17T15:11:00.000Z" },
    {
      ...APPROVED_MEAN_NODE_POLICY,
      evidenceArtifactId: undefined,
    },
  );
  assert.equal(result.status, "unresolved");
  assert.equal(result.reason, "evidence_identity_missing");
});
