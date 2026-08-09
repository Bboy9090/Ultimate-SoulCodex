/**
 * Canonical Placement Verification Types
 *
 * Single source of truth for placement verification state and evidence.
 * Shared by all subsystems (astrology, numerology, human design).
 *
 * These types define:
 * - VerificationState: The lifecycle of a placement from calculation to independent verification
 * - PlacementEvidence: Metadata about where the placement came from and how to trust it
 * - PlacementLike: A placement value that may not yet be fully verified
 * - VerifiedPlacement: A placement that has passed all verification checks
 *
 * Do not redeclare locally; import from @soulcodex/core.
 *
 * Authority Split for Placement Verification:
 * - VerificationState = placement lifecycle (unresolved → calculated → verified)
 * - PlacementEvidence = source + engine + timestamps + comparison metadata
 *
 * Sun placement:
 * - Never requires birth time for sign (moves ~1°/day)
 * - Missing time → do NOT set unresolvedReason
 * - State: 'calculated' (repeatable but not yet independently verified)
 *
 * Moon placement:
 * - Requires exact birth time (moves ~12°/day)
 * - Missing time → verificationStatus: 'requires_verified_birth_time'
 * - State: 'calculated' if time available
 *
 * Rising (Ascendant) placement:
 * - Requires exact birth time (changes ~1°/4 minutes)
 * - Also requires birth location (local horizon depends on observer position)
 * - Missing time → 'requires_verified_birth_time'
 * - Missing location → 'requires_location'
 * - Has time + location → 'calculated'
 */

export type VerificationState =
  | "verified"                         // Independent verification complete
  | "calculated"                       // Calculated but not independently verified
  | "pending_independent_verification" // Waiting for external verification
  | "pending_ephemeris"                // Waiting for ephemeris provider
  | "requires_verified_birth_time"     // Cannot calculate without exact time
  | "requires_location"                // Cannot calculate without coordinates
  | "approximate"                      // Estimated/approximated result
  | "unresolved"                       // Insufficient information
  | "unknown";                         // State not determined

export interface PlacementEvidence {
  source?: string | null;              // Where result came from
  engine?: string | null;              // Which calculator/system
  calculatedAt?: string | null;        // ISO 8601 timestamp
  comparisonSource?: string | null;    // Reference for verification
  confidence?: number | null;          // Numeric 0-100 (optional)
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
