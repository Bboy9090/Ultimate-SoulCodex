import {
  calculateMeanNodePair,
  type MeanNodeInput,
  type NodePosition,
} from "./lunar-node-evidence";

export interface MeanNodeProductionPolicy {
  status: "draft" | "approved";
  policyId: string;
  nodeMode: "mean";
  maximumLongitudeDeltaDegrees: number;
  approvedAt?: string;
  approvedBy?: string;
  evidenceRunId?: string;
  evidenceArtifactId?: string;
  evidenceArtifactSha256?: string;
  evidenceCandidateSha?: string;
  evidenceFixtureCount?: number;
  evidenceMaximumLongitudeDeltaDegrees?: number;
}

export const APPROVED_MEAN_NODE_POLICY: MeanNodeProductionPolicy = Object.freeze({
  status: "approved",
  policyId: "ASTRO-MEAN-NODE-v1",
  nodeMode: "mean",
  maximumLongitudeDeltaDegrees: 0.01,
  approvedAt: "2026-09-19T19:18:33.000Z",
  approvedBy: "Bboy9090",
  evidenceRunId: "35463886745",
  evidenceArtifactId: "10590393354",
  evidenceArtifactSha256:
    "a58a113102eb47ae8dd9405d7039bb57f1c8e4671f999b574d6afabfd07f4b71",
  evidenceCandidateSha: "d5d5f30dd316999c5723e3ff8e3c2270dfd53f6f",
  evidenceFixtureCount: 24,
  evidenceMaximumLongitudeDeltaDegrees: 0.0049561882517537015,
});

export interface VerifiedNodePosition extends NodePosition {
  verificationStatus: "verified";
  policyId: string;
  evidenceRunId: string;
  evidenceArtifactId: string;
  qualificationMethod: "fixture-qualified-deterministic";
}

export type MeanNodeVerificationResult =
  | {
      status: "verified";
      mode: "mean";
      northNode: VerifiedNodePosition;
      southNode: VerifiedNodePosition;
      evidence: {
        runId: string;
        artifactId: string;
        artifactSha256: string;
        candidateSha: string;
        fixtureCount: number;
        maximumObservedDeltaDegrees: number;
      };
      verifiedAt: string;
    }
  | {
      status: "unresolved";
      mode: "mean";
      reason:
        | "policy_not_approved"
        | "policy_invalid"
        | "evidence_identity_missing"
        | "candidate_failed";
    };

function validatePolicy(
  policy: MeanNodeProductionPolicy,
): MeanNodeVerificationResult | null {
  if (policy.status !== "approved" || !policy.approvedAt) {
    return { status: "unresolved", mode: "mean", reason: "policy_not_approved" };
  }

  if (
    policy.nodeMode !== "mean" ||
    !policy.policyId.trim() ||
    !Number.isFinite(policy.maximumLongitudeDeltaDegrees) ||
    policy.maximumLongitudeDeltaDegrees <= 0 ||
    policy.maximumLongitudeDeltaDegrees > 1
  ) {
    return { status: "unresolved", mode: "mean", reason: "policy_invalid" };
  }

  if (
    !policy.evidenceRunId?.trim() ||
    !policy.evidenceArtifactId?.trim() ||
    !policy.evidenceArtifactSha256?.trim() ||
    !policy.evidenceCandidateSha?.trim() ||
    !policy.evidenceFixtureCount ||
    policy.evidenceFixtureCount < 20 ||
    !Number.isFinite(policy.evidenceMaximumLongitudeDeltaDegrees) ||
    (policy.evidenceMaximumLongitudeDeltaDegrees ?? Number.POSITIVE_INFINITY) >
      policy.maximumLongitudeDeltaDegrees
  ) {
    return { status: "unresolved", mode: "mean", reason: "evidence_identity_missing" };
  }

  return null;
}

function promote(
  position: NodePosition,
  policy: MeanNodeProductionPolicy,
): VerifiedNodePosition {
  return {
    ...position,
    verificationStatus: "verified",
    policyId: policy.policyId,
    evidenceRunId: policy.evidenceRunId!,
    evidenceArtifactId: policy.evidenceArtifactId!,
    qualificationMethod: "fixture-qualified-deterministic",
  };
}

export function verifyMeanNodes(
  input: MeanNodeInput,
  policy: MeanNodeProductionPolicy = APPROVED_MEAN_NODE_POLICY,
): MeanNodeVerificationResult {
  const policyFailure = validatePolicy(policy);
  if (policyFailure) return policyFailure;

  try {
    const pair = calculateMeanNodePair(input);
    return {
      status: "verified",
      mode: "mean",
      northNode: promote(pair.northNode, policy),
      southNode: promote(pair.southNode, policy),
      evidence: {
        runId: policy.evidenceRunId!,
        artifactId: policy.evidenceArtifactId!,
        artifactSha256: policy.evidenceArtifactSha256!,
        candidateSha: policy.evidenceCandidateSha!,
        fixtureCount: policy.evidenceFixtureCount!,
        maximumObservedDeltaDegrees: policy.evidenceMaximumLongitudeDeltaDegrees!,
      },
      verifiedAt: new Date().toISOString(),
    };
  } catch {
    return { status: "unresolved", mode: "mean", reason: "candidate_failed" };
  }
}
