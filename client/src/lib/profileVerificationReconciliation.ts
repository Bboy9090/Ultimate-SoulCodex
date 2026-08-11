import type { OfflineCodexProfile } from "@soulcodex/core";
import type { StoredProfile } from "./ActiveProfileRepository";

type PlacementRecord = {
  status?: string;
  verificationStatus?: string;
  sign?: string | null;
};

export const CURRENT_ASTROLOGY_VERIFICATION_VERSION = 2;

export type RemoteProfileSnapshot = {
  id?: string;
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  birthLocation?: string;
  timezone?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  astrologyData?: {
    sun?: PlacementRecord;
    moon?: PlacementRecord;
    rising?: PlacementRecord;
    sunSign?: string | null;
    moonSign?: string | null;
    risingSign?: string | null;
    verification?: unknown;
    [key: string]: unknown;
  };
  numerologyData?: Record<string, unknown>;
  archetypeData?: {
    title?: string;
    [key: string]: unknown;
  };
  biography?: string;
  dailyGuidance?: string;
  updatedAt?: string;
};

export type ReconciledOfflineProfile = OfflineCodexProfile & {
  verifiedAstrologyData?: RemoteProfileSnapshot["astrologyData"];
  remoteSync?: {
    remoteId: string;
    syncedAt: string;
    status: "verified-online";
    verificationVersion?: number;
  };
};

export function getVerifiedAstrologySign(
  astrology: RemoteProfileSnapshot["astrologyData"],
  body: "sun" | "moon" | "rising",
): string | null {
  const placement = astrology?.[body];
  if (placement?.verificationStatus !== "verified") return null;
  return typeof placement.sign === "string" && placement.sign.trim()
    ? placement.sign
    : null;
}

export function hasVerifiedSunAndMoon(
  astrology: RemoteProfileSnapshot["astrologyData"] | undefined,
): boolean {
  return Boolean(
    getVerifiedAstrologySign(astrology, "sun") &&
      getVerifiedAstrologySign(astrology, "moon"),
  );
}

export function hasVerifiedBigThree(
  astrology: RemoteProfileSnapshot["astrologyData"] | undefined,
): boolean {
  return Boolean(
    hasVerifiedSunAndMoon(astrology) &&
      getVerifiedAstrologySign(astrology, "rising"),
  );
}

function hasExactAscendantInputs(profile: ReconciledOfflineProfile): boolean {
  return Boolean(
    profile.birthTime &&
      profile.timezone &&
      profile.latitude !== null &&
      profile.latitude !== undefined &&
      profile.longitude !== null &&
      profile.longitude !== undefined,
  );
}

export function reconcileActiveProfile(
  local: StoredProfile,
  remote: RemoteProfileSnapshot,
  syncedAt = new Date().toISOString(),
): StoredProfile {
  const astrology = remote.astrologyData;
  const sunSign = getVerifiedAstrologySign(astrology, "sun");
  const moonSign = getVerifiedAstrologySign(astrology, "moon");
  const risingSign = getVerifiedAstrologySign(astrology, "rising");

  return {
    ...local,
    id: local.id,
    remoteId: remote.id ?? local.remoteId,
    name: remote.name ?? local.name,
    codename: remote.name ?? local.codename,
    birthDate: local.birthDate ?? remote.birthDate,
    birthTime: local.birthTime ?? remote.birthTime ?? undefined,
    birthLocation: local.birthLocation ?? remote.birthLocation,
    timezone: local.timezone ?? remote.timezone,
    latitude:
      local.latitude ??
      (remote.latitude === null || remote.latitude === undefined
        ? undefined
        : String(remote.latitude)),
    longitude:
      local.longitude ??
      (remote.longitude === null || remote.longitude === undefined
        ? undefined
        : String(remote.longitude)),
    sunSign,
    moonSign,
    risingSign,
    astrologyData: astrology ?? local.astrologyData,
    numerologyData: remote.numerologyData ?? local.numerologyData,
    archetype: remote.archetypeData?.title ?? local.archetype,
    confidence: {
      ...(local.confidence && typeof local.confidence === "object"
        ? local.confidence
        : {}),
      astrologyVerification: astrology?.verification ?? null,
      astrologyVerificationVersion: CURRENT_ASTROLOGY_VERIFICATION_VERSION,
      remoteSyncedAt: syncedAt,
    },
    updatedAt: syncedAt,
  };
}

export function reconcileOfflineProfile(
  local: OfflineCodexProfile,
  remote: RemoteProfileSnapshot,
  syncedAt = new Date().toISOString(),
): ReconciledOfflineProfile {
  const remoteId = remote.id ?? local.id;

  return {
    ...local,
    numerologyData:
      (remote.numerologyData as OfflineCodexProfile["numerologyData"] | undefined) ??
      local.numerologyData,
    archetypeData:
      (remote.archetypeData as OfflineCodexProfile["archetypeData"] | undefined) ??
      local.archetypeData,
    biography: remote.biography ?? local.biography,
    dailyGuidance: remote.dailyGuidance ?? local.dailyGuidance,
    verifiedAstrologyData: remote.astrologyData,
    remoteSync: {
      remoteId,
      syncedAt,
      status: "verified-online",
      verificationVersion: CURRENT_ASTROLOGY_VERIFICATION_VERSION,
    },
    updatedAt: syncedAt,
  };
}

export function profileNeedsOnlineVerification(
  profile: ReconciledOfflineProfile,
): boolean {
  if (!hasVerifiedSunAndMoon(profile.verifiedAstrologyData)) {
    return true;
  }

  const syncedVersion = profile.remoteSync?.verificationVersion ?? 1;
  const needsAscendantMigration =
    hasExactAscendantInputs(profile) &&
    syncedVersion < CURRENT_ASTROLOGY_VERIFICATION_VERSION &&
    !getVerifiedAstrologySign(profile.verifiedAstrologyData, "rising");

  return needsAscendantMigration;
}
