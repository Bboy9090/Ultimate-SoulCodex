/**
 * Canonical placement verification types imported from @soulcodex/core
 * Re-exported for backwards compatibility with existing client imports
 * New code should import directly from @soulcodex/core
 */
import type {
  VerificationState,
  PlacementEvidence,
  PlacementLike,
  VerifiedPlacement,
  RangeEvidence
} from '@soulcodex/core';

export type { VerificationState, PlacementEvidence, PlacementLike, VerifiedPlacement, RangeEvidence };

export interface SynthesisPlacement {
  sign: string;
  degree?: number;
  evidenceState: "verified" | "stable_across_range";
  verificationStatus: string;
  evidence?: PlacementEvidence | null;
  rangeEvidence?: RangeEvidence | null;
}

/**
 * Interpretation code may consume a placement only when the calculation layer
 * supplied an explicit verified state and traceable evidence. Birth time, a
 * populated sign string, or UI confidence must never promote the state.
 */
export function getVerifiedPlacement(value: PlacementLike | null | undefined): VerifiedPlacement | null {
  if (!value?.sign) return null;

  const state = value.verificationStatus ?? value.status;
  if (state !== "verified") return null;

  const evidence = value.provenance ?? value.evidence;
  const sourceValid = typeof evidence?.source === "string" && evidence.source.trim().length > 0;
  const engineValid = typeof evidence?.engine === "string" && evidence.engine.trim().length > 0;
  const timestampValid =
    typeof evidence?.calculatedAt === "string" &&
    evidence.calculatedAt.trim().length > 0 &&
    !Number.isNaN(Date.parse(evidence.calculatedAt));
  if (!sourceValid || !engineValid || !timestampValid) return null;

  return {
    sign: value.sign,
    ...(typeof value.degree === "number" ? { degree: value.degree } : {}),
    verificationStatus: "verified",
    evidence,
  };
}

export function getSynthesisPlacement(value: PlacementLike | null | undefined): SynthesisPlacement | null {
  const verified = getVerifiedPlacement(value);
  if (verified) {
    return {
      sign: verified.sign,
      ...(typeof verified.degree === "number" ? { degree: verified.degree } : {}),
      evidenceState: "verified",
      verificationStatus: "verified",
      evidence: verified.evidence,
      rangeEvidence: null,
    };
  }

  if (!value?.sign || value.evidenceState !== "stable_across_range") return null;
  const range = value.rangeEvidence;
  if (
    !range ||
    range.resolutionMinutes !== 1 ||
    range.testedValues !== 1440 ||
    typeof range.rangeStartLocal !== "string" ||
    typeof range.rangeEndLocal !== "string"
  ) {
    return null;
  }

  return {
    sign: value.sign,
    ...(typeof value.degree === "number" ? { degree: value.degree } : {}),
    evidenceState: "stable_across_range",
    verificationStatus: String(value.verificationStatus ?? value.status ?? "calculated"),
    evidence: value.provenance ?? value.evidence ?? null,
    rangeEvidence: range,
  };
}

export function placementDisplayStatus(value: PlacementLike | null | undefined): string {
  const evidenceState = value?.evidenceState;
  if (evidenceState === "stable_across_range") {
    return getSynthesisPlacement(value) ? "Stable across full-day range" : "Range evidence incomplete";
  }
  if (evidenceState === "conditional") return "Conditional — branches by birth-time window";
  if (evidenceState === "unavailable") return "Unavailable — required input missing";

  const state = value?.verificationStatus ?? value?.status ?? "unresolved";
  switch (state) {
    case "pending_independent_verification":
      return "Pending independent verification";
    case "pending_ephemeris":
      return "Pending ephemeris calculation";
    case "requires_verified_birth_time":
      return "Requires verified birth time";
    case "requires_location":
      return "Requires birth location";
    case "approximate":
      return "Approximate — interpretation paused";
    case "calculated":
      return "Calculated — independent verification pending";
    case "verified":
      return getVerifiedPlacement(value) ? "Verified" : "Verification evidence incomplete";
    default:
      return "Unresolved";
  }
}
