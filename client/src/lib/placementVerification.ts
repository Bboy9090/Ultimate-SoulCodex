/**
 * Canonical placement verification types imported from @soulcodex/core
 * Re-exported for backwards compatibility with existing client imports
 * New code should import directly from @soulcodex/core
 */
import {
  getVerifiedPlacement,
  type VerificationState,
  type PlacementEvidence,
  type PlacementLike,
  type VerifiedPlacement,
} from '@soulcodex/core';

export {
  getVerifiedPlacement,
  type VerificationState,
  type PlacementEvidence,
  type PlacementLike,
  type VerifiedPlacement,
};

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
