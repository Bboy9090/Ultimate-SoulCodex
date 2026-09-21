import type { OfflineCodexProfile } from "@soulcodex/core";
import type { StoredProfile } from "./ActiveProfileRepository";
import {
  synthesizeVerifiedFoundationProfile,
  type VerifiedAstrologyForSynthesis,
} from "./foundationOfflineCodex";

type PlacementRecord = {
  status?: string;
  verificationStatus?: string;
  sign?: string | null;
};

const FULL_NATAL_PLANET_KEYS = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

export const CURRENT_ASTROLOGY_VERIFICATION_VERSION = 7;

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
    planets?: Partial<Record<(typeof FULL_NATAL_PLANET_KEYS)[number], PlacementRecord>>;
    houseSystem?: string;
    houses?: Array<{
      house?: number;
      verificationStatus?: string;
      sign?: string;
      degree?: number;
      longitude?: number;
    }>;
    midheaven?: PlacementRecord & {
      longitude?: number;
      degree?: number;
      policyId?: string;
    };
    planetaryHouses?: Partial<Record<(typeof FULL_NATAL_PLANET_KEYS)[number], number>>;
    aspects?: Array<{
      planet1?: string;
      planet2?: string;
      aspect?: string;
      orb?: number;
      policyId?: string;
    }>;
    northNode?: PlacementRecord & {
      mode?: string;
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
    };
    southNode?: PlacementRecord & {
      mode?: string;
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
    };
    chiron?: PlacementRecord & {
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
      qualificationMethod?: string;
    };
    sunSign?: string | null;
    moonSign?: string | null;
    risingSign?: string | null;
    verification?: unknown;
    [key: string]: unknown;
  };
  numerologyData?: Record<string, unknown>;
  humanDesignData?: Record<string, unknown> | null;
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

export function hasVerifiedFullNatalChart(
  astrology: RemoteProfileSnapshot["astrologyData"] | undefined,
): boolean {
  if (!astrology || !hasVerifiedBigThree(astrology)) return false;
  if (astrology.houseSystem !== "equal") return false;
  if (astrology.midheaven?.verificationStatus !== "verified") return false;

  const houses = astrology.houses;
  if (
    !Array.isArray(houses) ||
    houses.length !== 12 ||
    houses.some(
      (house, index) =>
        house.verificationStatus !== "verified" ||
        house.house !== index + 1,
    )
  ) {
    return false;
  }

  const planets = astrology.planets;
  if (
    !planets ||
    FULL_NATAL_PLANET_KEYS.some(
      (key) => planets[key]?.verificationStatus !== "verified",
    )
  ) {
    return false;
  }

  const planetaryHouses = astrology.planetaryHouses;
  if (
    !planetaryHouses ||
    FULL_NATAL_PLANET_KEYS.some((key) => {
      const house = planetaryHouses[key];
      return typeof house !== "number" || house < 1 || house > 12;
    })
  ) {
    return false;
  }

  if (!Array.isArray(astrology.aspects)) return false;

  for (const node of [astrology.northNode, astrology.southNode]) {
    if (
      node?.verificationStatus !== "verified" ||
      node.mode !== "mean" ||
      typeof node.house !== "number" ||
      node.house < 1 ||
      node.house > 12
    ) {
      return false;
    }
  }

  const chiron = astrology.chiron;
  if (
    chiron?.verificationStatus !== "verified" ||
    typeof chiron.house !== "number" ||
    chiron.house < 1 ||
    chiron.house > 12 ||
    chiron.qualificationMethod !== "live-jpl-qualified-against-swiss"
  ) {
    return false;
  }

  return true;
}

function hasExactAscendantInputs(profile: ReconciledOfflineProfile): boolean {
  return Boolean(
    profile.birthTime &&
      profile.timezone &&
      profile.latitude !== null &&
      profile.latitude !== undefined &&
      String(profile.latitude).trim() &&
      profile.longitude !== null &&
      profile.longitude !== undefined &&
      String(profile.longitude).trim(),
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
    humanDesignData: remote.humanDesignData ?? local.humanDesignData,
    humanDesignType:
      typeof remote.humanDesignData?.type === "string"
        ? remote.humanDesignData.type
        : local.humanDesignType,
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
  const numerologyData =
    (remote.numerologyData as OfflineCodexProfile["numerologyData"] | undefined) ??
    local.numerologyData;
  const mergedLocal: OfflineCodexProfile = {
    ...local,
    numerologyData,
    humanDesignData: remote.humanDesignData ?? local.humanDesignData,
  };

  const verifiedNarrative =
    remote.astrologyData && hasVerifiedFullNatalChart(remote.astrologyData)
      ? synthesizeVerifiedFoundationProfile(
          mergedLocal,
          remote.astrologyData as VerifiedAstrologyForSynthesis,
          syncedAt,
          remote.humanDesignData ?? undefined,
        )
      : null;

  return {
    ...local,
    numerologyData,
    humanDesignData: remote.humanDesignData ?? local.humanDesignData,
    archetypeData:
      verifiedNarrative?.archetypeData ??
      (remote.archetypeData as OfflineCodexProfile["archetypeData"] | undefined) ??
      local.archetypeData,
    biography:
      verifiedNarrative?.biography ??
      remote.biography ??
      local.biography,
    dailyGuidance:
      verifiedNarrative?.dailyGuidance ??
      remote.dailyGuidance ??
      local.dailyGuidance,
    depthInterpretation:
      verifiedNarrative?.depthInterpretation ??
      local.depthInterpretation,
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

/**
 * A profile still needs astronomy verification when:
 * - Sun or Moon has not been independently verified; or
 * - exact timed chart inputs exist and the full supported natal chart has not
 *   completed its independent verification/derived-geometry contract.
 *
 * Verification-version bookkeeping must never suppress a retry after a
 * temporary reference/engine failure. Version 7 rebuilds complete timed
 * profiles through the promoted supporting-synthesis contract so verified
 * houses, angles, Nodes, qualified Chiron, and Human Design details reach all
 * profile consumers instead of remaining isolated rows.
 */
export function profileNeedsOnlineVerification(
  profile: ReconciledOfflineProfile,
): boolean {
  if (!hasVerifiedSunAndMoon(profile.verifiedAstrologyData)) {
    return true;
  }

  if (!hasExactAscendantInputs(profile)) return false;

  if (
    (profile.remoteSync?.verificationVersion ?? 0) <
    CURRENT_ASTROLOGY_VERIFICATION_VERSION
  ) {
    return true;
  }

  if (!hasVerifiedFullNatalChart(profile.verifiedAstrologyData)) return true;

  return profile.humanDesignData?.status !== "verified";
}
