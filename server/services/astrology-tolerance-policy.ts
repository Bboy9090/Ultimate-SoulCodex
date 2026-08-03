import type { VerificationPolicy } from "./astrology-verification";

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

const MINIMUM_EVIDENCE_ROWS = 40;
const SAFETY_MULTIPLIER = 1.25;
const ROUNDING_INCREMENT_DEGREES = 0.001;

function roundUpToIncrement(value: number, increment: number): number {
  return Math.ceil(value / increment) * increment;
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
      "The expanded live matrix supports a draft tolerance only. Explicit governance approval is still required before any placement can be promoted to verified.",
  };
}
