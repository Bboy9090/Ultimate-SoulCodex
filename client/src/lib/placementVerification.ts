export type VerificationState =
  | "verified"
  | "calculated"
  | "pending_independent_verification"
  | "pending_ephemeris"
  | "requires_verified_birth_time"
  | "requires_location"
  | "approximate"
  | "unresolved"
  | "unknown";

export interface PlacementEvidence {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
  comparisonSource?: string | null;
  confidence?: number | null;
}

export interface PlacementLike {
  sign?: string | null;
  degree?: number | null;
  verificationStatus?: VerificationState | string | null;
  status?: VerificationState | string | null;
  provenance?: PlacementEvidence | null;
  evidence?: PlacementEvidence | null;
}

export interface VerifiedPlacement {
  sign: string;
  degree?: number;
  verificationStatus: "verified";
  evidence: PlacementEvidence;
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
  if (!evidence?.source || !evidence?.engine || !evidence?.calculatedAt) return null;

  return {
    sign: value.sign,
    ...(typeof value.degree === "number" ? { degree: value.degree } : {}),
    verificationStatus: "verified",
    evidence,
  };
}

export function placementDisplayStatus(value: PlacementLike | null | undefined): string {
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
