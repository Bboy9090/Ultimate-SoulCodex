import {
  clearActiveProfile as clearCanonicalProfile,
  loadActiveProfile as loadCanonicalProfile,
  saveActiveProfile as saveCanonicalProfile,
  type StoredProfile,
} from "./ActiveProfileRepository";

export type { StoredProfile } from "./ActiveProfileRepository";

interface EvidenceLike {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
}

interface PlacementLike {
  verificationStatus?: string | null;
  status?: string | null;
  evidence?: EvidenceLike | null;
  provenance?: EvidenceLike | null;
}

function isEvidenceComplete(value: PlacementLike | null | undefined): boolean {
  const state = value?.verificationStatus ?? value?.status;
  const evidence = value?.provenance ?? value?.evidence;
  return state === "verified" && Boolean(evidence?.source && evidence?.engine && evidence?.calculatedAt);
}

function placement(profile: StoredProfile, key: "sun" | "moon" | "rising"): PlacementLike | undefined {
  return (
    profile?.astrologyData?.[key] ??
    (profile as any)?.astrology?.[key] ??
    (profile as any)?.natalChart?.[key] ??
    (profile as any)?.chart?.[key]
  );
}

/**
 * Compatibility wrapper for older callers.
 *
 * The canonical repository owns migration, schema validation, timestamps,
 * recovery status, and read-after-write verification. This wrapper exists only
 * to keep older pages compiling while they migrate to the richer result API.
 */
export function loadActiveProfile(): StoredProfile | null {
  return loadCanonicalProfile().profile;
}

export function saveActiveProfile(profilePayload: StoredProfile): void {
  const result = saveCanonicalProfile(profilePayload);
  if (!result.success) {
    console.warn("[profileStorage] Canonical profile save failed:", result.error);
  }
}

export function clearActiveProfile(): void {
  clearCanonicalProfile();
}

/**
 * Confidence describes verified calculation evidence, not merely completed
 * form fields. Birth time and location improve calculation capability, but
 * their presence alone cannot promote a profile to verified.
 */
export function deriveConfidenceState(
  profile: StoredProfile | null
): "verified" | "partial" | "unverified" {
  if (!profile?.birthDate) return "unverified";

  const explicit = (profile as any)?.confidence?.verificationStatus ?? (profile as any)?.confidence?.status;
  if (explicit === "verified") return "verified";

  const verifiedPlacements = ["sun", "moon", "rising"].filter((key) =>
    isEvidenceComplete(placement(profile, key as "sun" | "moon" | "rising"))
  );

  if (verifiedPlacements.length === 3) return "verified";
  return "partial";
}

export function isProfileComplete(profile: StoredProfile | null): boolean {
  return Boolean(profile?.birthDate);
}
