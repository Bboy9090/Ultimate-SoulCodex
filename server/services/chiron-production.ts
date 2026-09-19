import {
  fetchChironHorizonsReference,
  type ChironReference,
} from "./chiron-horizons-reference";

export interface ChironProductionPolicy {
  status: "draft" | "approved";
  policyId: string;
  maximumLongitudeDeltaDegrees: number;
  approvedAt?: string;
  approvedBy?: string;
  evidenceRunId?: string;
  evidenceArtifactId?: string;
  evidenceArtifactSha256?: string;
  evidenceCandidateSha?: string;
  evidenceFixtureCount?: number;
  evidenceMaximumLongitudeDeltaDegrees?: number;
  swissEphemerisHashes?: {
    seas18: string;
    sepl18: string;
  };
}

export const APPROVED_CHIRON_POLICY: ChironProductionPolicy = Object.freeze({
  status: "approved",
  policyId: "ASTRO-CHIRON-v1",
  maximumLongitudeDeltaDegrees: 0.001,
  approvedAt: "2026-09-19T22:50:45.000Z",
  approvedBy: "Bboy9090",
  evidenceRunId: "35474358663",
  evidenceArtifactId: "10593933139",
  evidenceArtifactSha256:
    "a2d8f9b91cb8ad13a47cb66257bfacefbc9a516e5a35d3933a22b70008dd1d00",
  evidenceCandidateSha: "284aa019937ae3fdd2bfc4bfb1693219caa3f63a",
  evidenceFixtureCount: 24,
  evidenceMaximumLongitudeDeltaDegrees: 0.00024446952613743633,
  swissEphemerisHashes: {
    seas18: "a2cd8fc33807c78ca9a700c91c2e042258b12fc4796519e00781440b5ad8b2e2",
    sepl18: "ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66",
  },
});

export interface VerifiedChiron {
  sign: string;
  longitudeDegrees: number;
  degreeInSign: number;
  verificationStatus: "verified";
  policyId: string;
  evidenceRunId: string;
  evidenceArtifactId: string;
  source: string;
  engine: string;
  inputTimestamp: string;
  qualificationMethod: "live-jpl-qualified-against-swiss";
}

export type ChironVerificationResult =
  | {
      status: "verified";
      chiron: VerifiedChiron;
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
      reason:
        | "policy_not_approved"
        | "policy_invalid"
        | "evidence_identity_missing"
        | "reference_unavailable";
    };

export type ChironReferenceFetcher = (
  inputTimestamp: string,
) => Promise<ChironReference>;

function validatePolicy(
  policy: ChironProductionPolicy,
): ChironVerificationResult | null {
  if (policy.status !== "approved" || !policy.approvedAt) {
    return { status: "unresolved", reason: "policy_not_approved" };
  }
  if (
    !policy.policyId.trim() ||
    !Number.isFinite(policy.maximumLongitudeDeltaDegrees) ||
    policy.maximumLongitudeDeltaDegrees <= 0 ||
    policy.maximumLongitudeDeltaDegrees > 1
  ) {
    return { status: "unresolved", reason: "policy_invalid" };
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
    return { status: "unresolved", reason: "evidence_identity_missing" };
  }
  return null;
}

export async function verifyChiron(
  inputTimestamp: string,
  options: {
    policy?: ChironProductionPolicy;
    referenceFetcher?: ChironReferenceFetcher;
  } = {},
): Promise<ChironVerificationResult> {
  const policy = options.policy ?? APPROVED_CHIRON_POLICY;
  const failure = validatePolicy(policy);
  if (failure) return failure;

  try {
    const reference = await (
      options.referenceFetcher ??
      ((timestamp) => fetchChironHorizonsReference(timestamp, { timeoutMs: 10_000 }))
    )(inputTimestamp);

    const longitudeDegrees = ((reference.longitude % 360) + 360) % 360;
    return {
      status: "verified",
      chiron: {
        sign: reference.sign,
        longitudeDegrees,
        degreeInSign: longitudeDegrees % 30,
        verificationStatus: "verified",
        policyId: policy.policyId,
        evidenceRunId: policy.evidenceRunId!,
        evidenceArtifactId: policy.evidenceArtifactId!,
        source: reference.source,
        engine: reference.engine,
        inputTimestamp: reference.inputTimestamp,
        qualificationMethod: "live-jpl-qualified-against-swiss",
      },
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
    return { status: "unresolved", reason: "reference_unavailable" };
  }
}
