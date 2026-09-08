import type { VerifiableBody, VerificationPolicy } from "./astrology-verification";

export interface EphemerisEvidenceSummary {
  totalRows: number;
  signDisagreements: number;
  maximumLongitudeDeltaDegrees: number;
  sunMaximumDeltaDegrees: number;
  moonMaximumDeltaDegrees: number;
}

export interface TolerancePolicyProposal {
  policy: VerificationPolicy;
  evidence: {
    receiptRunId: string;
    totalRows: number;
    signDisagreements: number;
    observedMaximumDeltaDegrees: number;
    safetyMultiplier: number;
  };
  promotionAllowed: false;
  rationale: string;
}

export interface ApprovedToleranceEvidence extends EphemerisEvidenceSummary {
  receiptRunId: string;
  artifactId: string;
  artifactSha256: string;
  approvedAt: string;
  approvedBy: string;
  approvedBodies: readonly VerifiableBody[];
  coordinateContract: string;
}

const MINIMUM_EVIDENCE_ROWS = 40;
const SAFETY_MULTIPLIER = 1.25;
const ROUNDING_INCREMENT_DEGREES = 0.001;
const APPROVED_TOLERANCE_DEGREES = 0.001;

export const APPROVED_LONGITUDE_TOLERANCE_EVIDENCE: ApprovedToleranceEvidence = Object.freeze({
  receiptRunId: "30803626991",
  artifactId: "8851843885",
  artifactSha256: "bc23e71ebffe3bb7532b2c511999e2da3ac5ba4af394092dd55c454e40f52d8d",
  totalRows: 40,
  signDisagreements: 0,
  maximumLongitudeDeltaDegrees: 0.0008717338064343494,
  sunMaximumDeltaDegrees: 0.00027293851550780346,
  moonMaximumDeltaDegrees: 0.0008717338064343494,
  approvedAt: "2026-08-03T11:26:00.000Z",
  approvedBy: "Bboy9090",
  approvedBodies: Object.freeze(["Sun", "Moon"] as const),
  coordinateContract:
    "Astronomy Engine geocentric true-ecliptic-of-date longitude compared with NASA/JPL Horizons geocentric apparent ecliptic-of-date observer quantity 31 at the exact same UTC timestamp.",
});

function roundUpToIncrement(value: number, increment: number): number {
  return Math.ceil(value / increment) * increment;
}

function assertApprovedEvidence(evidence: ApprovedToleranceEvidence): void {
  if (!evidence.receiptRunId.trim() || !evidence.artifactId.trim() || !evidence.artifactSha256.trim()) {
    throw new Error("approved_policy_evidence_identity_missing");
  }
  if (!Number.isInteger(evidence.totalRows) || evidence.totalRows < MINIMUM_EVIDENCE_ROWS) {
    throw new Error("approved_policy_evidence_rows_insufficient");
  }
  if (evidence.signDisagreements !== 0) {
    throw new Error("approved_policy_sign_disagreement_present");
  }
  if (
    !Number.isFinite(evidence.maximumLongitudeDeltaDegrees) ||
    evidence.maximumLongitudeDeltaDegrees < 0 ||
    evidence.maximumLongitudeDeltaDegrees > APPROVED_TOLERANCE_DEGREES
  ) {
    throw new Error("approved_policy_observed_delta_invalid");
  }
  if (!evidence.approvedAt.trim() || Number.isNaN(new Date(evidence.approvedAt).getTime())) {
    throw new Error("approved_policy_timestamp_invalid");
  }
  if (!evidence.approvedBy.trim()) {
    throw new Error("approved_policy_approver_missing");
  }
  if (!evidence.approvedBodies.includes("Sun") || !evidence.approvedBodies.includes("Moon")) {
    throw new Error("approved_policy_body_scope_invalid");
  }
}

export function getApprovedLongitudeTolerancePolicy(
  body: VerifiableBody,
): VerificationPolicy {
  const evidence = APPROVED_LONGITUDE_TOLERANCE_EVIDENCE;
  assertApprovedEvidence(evidence);

  if (!evidence.approvedBodies.includes(body)) {
    throw new Error("body_not_approved_for_longitude_verification");
  }

  return {
    status: "approved",
    policyId: "ASTRO-LONGITUDE-v1",
    maximumLongitudeDeltaDegrees: APPROVED_TOLERANCE_DEGREES,
    approvedAt: evidence.approvedAt,
  };
}

export function proposeLongitudeTolerancePolicy(
  summary: EphemerisEvidenceSummary,
  receiptRunId: string,
): TolerancePolicyProposal {
  if (!receiptRunId.trim()) {
    throw new Error("evidence_receipt_id_required");
  }

  if (!Number.isInteger(summary.totalRows) || summary.totalRows < MINIMUM_EVIDENCE_ROWS) {
    throw new Error("insufficient_evidence_rows");
  }

  if (summary.signDisagreements !== 0) {
    throw new Error("sign_disagreement_present");
  }

  const deltas = [
    summary.maximumLongitudeDeltaDegrees,
    summary.sunMaximumDeltaDegrees,
    summary.moonMaximumDeltaDegrees,
  ];

  if (deltas.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error("invalid_evidence_delta");
  }

  const measuredMaximum = Math.max(...deltas);
  const proposedTolerance = roundUpToIncrement(
    measuredMaximum * SAFETY_MULTIPLIER,
    ROUNDING_INCREMENT_DEGREES,
  );

  if (proposedTolerance <= 0 || proposedTolerance > 1) {
    throw new Error("invalid_proposed_tolerance");
  }

  return {
    policy: {
      status: "draft",
      policyId: "ASTRO-LONGITUDE-v1-draft",
      maximumLongitudeDeltaDegrees: proposedTolerance,
    },
    evidence: {
      receiptRunId,
      totalRows: summary.totalRows,
      signDisagreements: summary.signDisagreements,
      observedMaximumDeltaDegrees: measuredMaximum,
      safetyMultiplier: SAFETY_MULTIPLIER,
    },
    promotionAllowed: false,
    rationale:
      "A generated proposal remains draft-only. Production promotion uses the separately governed approved policy and its immutable evidence receipt.",
  };
}
