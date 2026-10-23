/**
 * Canonical revision digest for cache invalidation. Not a public identifier.
 * Changes to any identity-affecting birth field produce a different revision.
 */
import { createHash } from "node:crypto";
import type { Profile } from "../../shared/schema";

export function galacticProfileRevision(profile: Profile): string {
  const date = profile.birthDate instanceof Date ? profile.birthDate : new Date(profile.birthDate);
  if (!Number.isFinite(date.getTime())) throw new Error("invalid_profile_birth_date");
  const coordinates = [profile.latitude, profile.longitude].map(value =>
    value == null ? null : Number(value)
  );
  if (coordinates.some(value => value !== null && !Number.isFinite(value))) {
    throw new Error("invalid_profile_coordinates");
  }
  const revisionFields = [
    "galactic-profile-revision-v1",
    date.toISOString().slice(0, 10),
    profile.birthTime?.trim() || null,
    profile.timezone?.trim() || null,
    ...coordinates,
    profile.fullBirthName?.trim().normalize("NFKC") || null,
  ];
  return createHash("sha256").update(JSON.stringify(revisionFields)).digest("hex");
}
