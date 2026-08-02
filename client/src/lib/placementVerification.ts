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

export function getVerifiedPlacement(value: PlacementLike | null | undefined) {
  if (!value?.sign) return null;
  if ((value.verificationStatus ?? value.status) !== "verified") return null;
  const evidence = value.provenance ?? value.evidence;
  if (!evidence?.source || !evidence?.engine || !evidence?.calculatedAt) return null;
  return { sign: value.sign, degree: value.degree, verificationStatus: "verified" as const, evidence };
}

export function trustedSign(value: PlacementLike | null | undefined): string | undefined {
  return getVerifiedPlacement(value)?.sign;
}
