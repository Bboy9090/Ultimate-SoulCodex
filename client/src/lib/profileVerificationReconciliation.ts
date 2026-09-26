import type { OfflineCodexProfile } from "@soulcodex/core";
import type { StoredProfile } from "./ActiveProfileRepository";
import {
  synthesizeVerifiedFoundationProfile,
  type VerifiedAstrologyForSynthesis,
} from "./foundationOfflineCodex";

type PlacementEvidenceRecord = {
  source?: string | null;
  engine?: string | null;
  calculatedAt?: string | null;
};

type PlacementRecord = {
  status?: string;
  verificationStatus?: string;
  sign?: string | null;
  evidence?: PlacementEvidenceRecord | null;
  provenance?: PlacementEvidenceRecord | null;
  internalCandidate?: {
    longitude?: number;
    inputTimestamp?: string;
  };
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const MAJOR_ASPECTS = new Set([
  "conjunction", "opposition", "trine", "square", "sextile",
]);

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
      policyId?: string;
      evidenceArtifactId?: string;
    }>;
    midheaven?: PlacementRecord & {
      longitude?: number;
      degree?: number;
      policyId?: string;
      evidenceArtifactId?: string;
    };
    planetaryHouses?: Partial<Record<(typeof FULL_NATAL_PLANET_KEYS)[number], number>>;
    aspects?: Array<{
      planet1?: string;
      planet2?: string;
      aspect?: string;
      orb?: number;
      policyId?: string;
      evidenceArtifactId?: string;
    }>;
    northNode?: PlacementRecord & {
      mode?: string;
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
      evidenceArtifactId?: string;
    };
    southNode?: PlacementRecord & {
      mode?: string;
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
      evidenceArtifactId?: string;
    };
    chiron?: PlacementRecord & {
      house?: number;
      longitude?: number;
      degree?: number;
      policyId?: string;
      qualificationMethod?: string;
      evidenceArtifactId?: string;
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

function validZodiacSign(value: unknown): value is (typeof ZODIAC_SIGNS)[number] {
  return typeof value === "string" &&
    ZODIAC_SIGNS.includes(value.trim() as (typeof ZODIAC_SIGNS)[number]);
}

function verifiedPlacementSign(
  placement: PlacementRecord | null | undefined,
): string | null {
  const state = placement?.verificationStatus ?? placement?.status;
  if (state !== "verified" || !validZodiacSign(placement?.sign)) return null;

  const evidence = placement?.provenance ?? placement?.evidence;
  const hasEvidence =
    typeof evidence?.source === "string" && evidence.source.trim().length > 0 &&
    typeof evidence?.engine === "string" && evidence.engine.trim().length > 0 &&
    typeof evidence?.calculatedAt === "string" && evidence.calculatedAt.trim().length > 0;

  return hasEvidence ? placement!.sign!.trim() : null;
}

export function getVerifiedAstrologySign(
  astrology: RemoteProfileSnapshot["astrologyData"],
  body: "sun" | "moon" | "rising",
): string | null {
  return verifiedPlacementSign(astrology?.[body]);
}

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signFromLongitude(value: number): (typeof ZODIAC_SIGNS)[number] {
  return ZODIAC_SIGNS[Math.floor(normalizeLongitude(value) / 30)];
}

function validHouseNumber(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function verifiedHumanDesignRecord(
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!value || value.status !== "verified") return null;
  for (const field of ["type", "strategy", "authority", "profile"] as const) {
    if (typeof value[field] !== "string" || !String(value[field]).trim()) return null;
  }
  for (const field of ["verificationReceiptId", "independentSource", "verifiedAt"] as const) {
    if (typeof value[field] !== "string" || !String(value[field]).trim()) return null;
  }
  return value;
}

function validVerifiedPoint(
  point: PlacementRecord & {
    longitude?: number;
    degree?: number;
    policyId?: string;
    evidenceArtifactId?: string;
  } | undefined,
  policyId: string,
): boolean {
  return point?.verificationStatus === "verified" &&
    validZodiacSign(point.sign) &&
    Number.isFinite(point.longitude) &&
    Number(point.longitude) >= 0 && Number(point.longitude) < 360 &&
    signFromLongitude(Number(point.longitude)) === point.sign &&
    Number.isFinite(point.degree) &&
    Math.abs(Number(point.degree) - (Number(point.longitude) % 30)) < 0.01 &&
    point.policyId === policyId &&
    typeof point.evidenceArtifactId === "string" &&
    point.evidenceArtifactId.trim().length > 0;
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
  const verification = astrology.verification as { policyId?: unknown } | undefined;
  const policyIdentity = typeof verification?.policyId === "string" ? verification.policyId : "";
  for (const policy of ["ASTRO-EQUAL-HOUSE-v1", "ASTRO-MEAN-NODE-v1", "ASTRO-CHIRON-v1"]) {
    if (!policyIdentity.includes(policy)) return false;
  }
  if (!validVerifiedPoint(astrology.midheaven, "ASTRO-EQUAL-HOUSE-v1")) return false;

  const houses = astrology.houses;
  if (
    !Array.isArray(houses) ||
    houses.length !== 12 ||
    houses.some(
      (house, index) =>
        house.verificationStatus !== "verified" ||
        house.house !== index + 1 ||
        house.policyId !== "ASTRO-EQUAL-HOUSE-v1" ||
        typeof house.evidenceArtifactId !== "string" ||
        !house.evidenceArtifactId.trim() ||
        !Number.isFinite(house.longitude) ||
        Number(house.longitude) < 0 || Number(house.longitude) >= 360 ||
        signFromLongitude(Number(house.longitude)) !== house.sign ||
        !Number.isFinite(house.degree) ||
        Math.abs(Number(house.degree) - (Number(house.longitude) % 30)) >= 0.01,
    )
  ) {
    return false;
  }

  const planets = astrology.planets;
  if (
    !planets ||
    FULL_NATAL_PLANET_KEYS.some(
      (key) => !verifiedPlacementSign(planets[key]),
    )
  ) {
    return false;
  }

  const planetaryHouses = astrology.planetaryHouses;
  if (
    !planetaryHouses ||
    FULL_NATAL_PLANET_KEYS.some((key) => {
      const house = planetaryHouses[key];
      return !validHouseNumber(house);
    })
  ) {
    return false;
  }

  if (!Array.isArray(astrology.aspects) || astrology.aspects.some((aspect) =>
    typeof aspect.planet1 !== "string" ||
    typeof aspect.planet2 !== "string" ||
    !MAJOR_ASPECTS.has(String(aspect.aspect).toLowerCase()) ||
    !Number.isFinite(aspect.orb) ||
    Number(aspect.orb) < 0 ||
    aspect.policyId !== "ASTRO-ASPECT-MAJOR-v1"
  )) return false;

  for (const node of [astrology.northNode, astrology.southNode]) {
    if (
      !node ||
      !validVerifiedPoint(node, "ASTRO-MEAN-NODE-v1") ||
      node.mode !== "mean" ||
      !validHouseNumber(node.house)
    ) {
      return false;
    }
  }

  const chiron = astrology.chiron;
  if (
    !chiron ||
    !validVerifiedPoint(chiron, "ASTRO-CHIRON-v1") ||
    !validHouseNumber(chiron.house) ||
    chiron.qualificationMethod !== "live-jpl-qualified-against-swiss"
  ) {
    return false;
  }

  const northLongitude = Number(astrology.northNode?.longitude);
  const southLongitude = Number(astrology.southNode?.longitude);
  const nodeOpposition = Math.abs(normalizeLongitude(northLongitude - southLongitude));
  if (Math.min(nodeOpposition, 360 - nodeOpposition) < 179.99 || Math.min(nodeOpposition, 360 - nodeOpposition) > 180.01) {
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
  const remoteHumanDesign = verifiedHumanDesignRecord(remote.humanDesignData);

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
    humanDesignData: remoteHumanDesign ?? local.humanDesignData,
    humanDesignType:
      typeof remoteHumanDesign?.type === "string"
        ? remoteHumanDesign.type
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
  const remoteHumanDesign = verifiedHumanDesignRecord(remote.humanDesignData);
  const mergedLocal: OfflineCodexProfile = {
    ...local,
    numerologyData,
    humanDesignData:
      (remoteHumanDesign as OfflineCodexProfile["humanDesignData"] | null) ??
      local.humanDesignData,
  };

  const verifiedNarrative =
    remote.astrologyData && hasVerifiedFullNatalChart(remote.astrologyData)
      ? synthesizeVerifiedFoundationProfile(
          mergedLocal,
          remote.astrologyData as VerifiedAstrologyForSynthesis,
          syncedAt,
          remoteHumanDesign ?? undefined,
        )
      : null;

  return {
    ...local,
    numerologyData,
    humanDesignData:
      (remoteHumanDesign as OfflineCodexProfile["humanDesignData"] | null) ??
      local.humanDesignData,
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

  return !verifiedHumanDesignRecord(
    profile.humanDesignData as Record<string, unknown> | null | undefined,
  );
}
