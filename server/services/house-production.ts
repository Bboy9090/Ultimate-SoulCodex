import {
  APPROVED_ASCENDANT_POLICY,
  verifyAscendant,
  type AscendantVerificationPolicy,
} from "./ascendant-verification";
import {
  calculateEqualHouseCuspsFromAscendant,
  calculateIndependentMidheavenReference,
  calculateMidheavenCandidate,
  circularDegreesDelta,
  type AngleEvidenceRecord,
  type HouseCusp,
  type HouseInput,
} from "./house-verification";

export interface EqualHouseProductionPolicy {
  status: "draft" | "approved";
  policyId: string;
  houseSystem: "equal";
  maximumMidheavenDeltaDegrees: number;
  maximumCuspDeltaDegrees: number;
  approvedAt?: string;
  approvedBy?: string;
  evidenceRunId?: string;
  evidenceArtifactId?: string;
  evidenceArtifactSha256?: string;
  evidenceCandidateSha?: string;
  evidenceFixtureCount?: number;
  evidenceMaximumCandidateMidheavenDeltaDegrees?: number;
  evidenceMaximumReferenceMidheavenDeltaDegrees?: number;
  evidenceMaximumCuspDeltaDegrees?: number;
}

export const APPROVED_EQUAL_HOUSE_POLICY: EqualHouseProductionPolicy = Object.freeze({
  status: "approved",
  policyId: "ASTRO-EQUAL-HOUSE-v1",
  houseSystem: "equal",
  maximumMidheavenDeltaDegrees: 0.001,
  maximumCuspDeltaDegrees: 0.01,
  approvedAt: "2026-09-19T14:54:41.000Z",
  approvedBy: "Bboy9090",
  evidenceRunId: "35449945640",
  evidenceArtifactId: "10586653891",
  evidenceArtifactSha256:
    "fa801246ef13786dab5e6ad4939907ae1371e68bc051eba60adabd6e2c288a82",
  evidenceCandidateSha: "ef242e304747065e3305ea62883cde3589ab895c",
  evidenceFixtureCount: 24,
  evidenceMaximumCandidateMidheavenDeltaDegrees: 0.0005004738771390294,
  evidenceMaximumReferenceMidheavenDeltaDegrees: 0.000532682797711459,
  evidenceMaximumCuspDeltaDegrees: 0.004287078216634654,
});

export interface VerifiedHouseCusp extends HouseCusp {
  verificationStatus: "verified";
  policyId: string;
  evidenceArtifactId: string;
}

export interface VerifiedMidheaven {
  sign: string;
  longitudeDegrees: number;
  degreeInSign: number;
  verificationStatus: "verified";
  policyId: string;
  longitudeDeltaDegrees: number;
  candidate: AngleEvidenceRecord;
  reference: AngleEvidenceRecord;
}

export type EqualHouseVerificationResult =
  | {
      status: "verified";
      houseSystem: "equal";
      ascendant: {
        sign: string;
        longitudeDegrees: number;
        degreeInSign: number;
        policyId: string;
        verificationStatus: "verified";
        longitudeDeltaDegrees: number;
      };
      midheaven: VerifiedMidheaven;
      cusps: VerifiedHouseCusp[];
      evidence: {
        runId: string;
        artifactId: string;
        artifactSha256: string;
        candidateSha: string;
        fixtureCount: number;
      };
      verifiedAt: string;
    }
  | {
      status: "unresolved";
      houseSystem: "equal";
      reason:
        | "policy_not_approved"
        | "policy_invalid"
        | "ascendant_unverified"
        | "midheaven_reference_not_independent"
        | "midheaven_timestamp_mismatch"
        | "midheaven_coordinate_mismatch"
        | "midheaven_sign_disagreement"
        | "midheaven_outside_tolerance"
        | "evidence_identity_missing";
      ascendantReason?: string;
      midheavenCandidate?: AngleEvidenceRecord;
      midheavenReference?: AngleEvidenceRecord;
      midheavenDeltaDegrees?: number;
    };

export interface EqualHouseVerificationOptions {
  policy?: EqualHouseProductionPolicy;
  ascendantPolicy?: AscendantVerificationPolicy;
  midheavenReference?: (input: HouseInput) => AngleEvidenceRecord;
}

function validatePolicy(
  policy: EqualHouseProductionPolicy,
): EqualHouseVerificationResult | null {
  if (policy.status !== "approved" || !policy.approvedAt) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "policy_not_approved",
    };
  }

  if (
    policy.houseSystem !== "equal" ||
    !policy.policyId.trim() ||
    !Number.isFinite(policy.maximumMidheavenDeltaDegrees) ||
    policy.maximumMidheavenDeltaDegrees <= 0 ||
    policy.maximumMidheavenDeltaDegrees > 1 ||
    !Number.isFinite(policy.maximumCuspDeltaDegrees) ||
    policy.maximumCuspDeltaDegrees <= 0 ||
    policy.maximumCuspDeltaDegrees > 1
  ) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "policy_invalid",
    };
  }

  if (
    !policy.evidenceRunId?.trim() ||
    !policy.evidenceArtifactId?.trim() ||
    !policy.evidenceArtifactSha256?.trim() ||
    !policy.evidenceCandidateSha?.trim() ||
    !policy.evidenceFixtureCount ||
    policy.evidenceFixtureCount < 20
  ) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "evidence_identity_missing",
    };
  }

  if (
    (policy.evidenceMaximumCandidateMidheavenDeltaDegrees ?? Number.POSITIVE_INFINITY) >
      policy.maximumMidheavenDeltaDegrees ||
    (policy.evidenceMaximumReferenceMidheavenDeltaDegrees ?? Number.POSITIVE_INFINITY) >
      policy.maximumMidheavenDeltaDegrees ||
    (policy.evidenceMaximumCuspDeltaDegrees ?? Number.POSITIVE_INFINITY) >
      policy.maximumCuspDeltaDegrees
  ) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "policy_invalid",
    };
  }

  return null;
}

export function verifyEqualHouse(
  input: HouseInput,
  options: EqualHouseVerificationOptions = {},
): EqualHouseVerificationResult {
  const policy = options.policy ?? APPROVED_EQUAL_HOUSE_POLICY;
  const policyFailure = validatePolicy(policy);
  if (policyFailure) return policyFailure;

  const ascendant = verifyAscendant(
    input,
    options.ascendantPolicy ?? APPROVED_ASCENDANT_POLICY,
  );
  if (ascendant.status !== "verified") {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "ascendant_unverified",
      ascendantReason: ascendant.reason,
    };
  }

  const candidate = calculateMidheavenCandidate(input);
  const reference = (options.midheavenReference ?? calculateIndependentMidheavenReference)(
    input,
  );

  if (
    candidate.engine.trim().toLowerCase() === reference.engine.trim().toLowerCase() ||
    candidate.source.trim().toLowerCase() === reference.source.trim().toLowerCase()
  ) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "midheaven_reference_not_independent",
      midheavenCandidate: candidate,
      midheavenReference: reference,
    };
  }

  if (candidate.inputTimestamp !== reference.inputTimestamp) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "midheaven_timestamp_mismatch",
      midheavenCandidate: candidate,
      midheavenReference: reference,
    };
  }

  if (
    candidate.latitude !== reference.latitude ||
    candidate.longitude !== reference.longitude
  ) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "midheaven_coordinate_mismatch",
      midheavenCandidate: candidate,
      midheavenReference: reference,
    };
  }

  const midheavenDeltaDegrees = circularDegreesDelta(
    candidate.longitudeDegrees,
    reference.longitudeDegrees,
  );

  if (candidate.sign !== reference.sign) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "midheaven_sign_disagreement",
      midheavenCandidate: candidate,
      midheavenReference: reference,
      midheavenDeltaDegrees,
    };
  }

  if (midheavenDeltaDegrees > policy.maximumMidheavenDeltaDegrees) {
    return {
      status: "unresolved",
      houseSystem: "equal",
      reason: "midheaven_outside_tolerance",
      midheavenCandidate: candidate,
      midheavenReference: reference,
      midheavenDeltaDegrees,
    };
  }

  const cusps = calculateEqualHouseCuspsFromAscendant(
    ascendant.longitudeDegrees,
  ).map((cusp): VerifiedHouseCusp => ({
    ...cusp,
    verificationStatus: "verified",
    policyId: policy.policyId,
    evidenceArtifactId: policy.evidenceArtifactId!,
  }));

  return {
    status: "verified",
    houseSystem: "equal",
    ascendant: {
      sign: ascendant.sign,
      longitudeDegrees: ascendant.longitudeDegrees,
      degreeInSign: ascendant.degreeInSign,
      policyId: ascendant.policy.policyId,
      verificationStatus: "verified",
      longitudeDeltaDegrees: ascendant.longitudeDeltaDegrees,
    },
    midheaven: {
      sign: candidate.sign,
      longitudeDegrees: candidate.longitudeDegrees,
      degreeInSign: candidate.degreeInSign,
      verificationStatus: "verified",
      policyId: policy.policyId,
      longitudeDeltaDegrees: midheavenDeltaDegrees,
      candidate,
      reference,
    },
    cusps,
    evidence: {
      runId: policy.evidenceRunId!,
      artifactId: policy.evidenceArtifactId!,
      artifactSha256: policy.evidenceArtifactSha256!,
      candidateSha: policy.evidenceCandidateSha!,
      fixtureCount: policy.evidenceFixtureCount!,
    },
    verifiedAt: new Date().toISOString(),
  };
}
