import { parseDateOnly, resolveCivilTimeStrict } from "@soulcodex/core";
import { isValidIanaTimezone } from "@shared/schema";

export type StoredBirthEvidenceInput = {
  version: 1;
  birthDate: string;
  timezone: string;
  mode: "known" | "unknown";
  utc: string | null;
  latitude: number | null;
  longitude: number | null;
};

type BirthInputLike = {
  birthDate?: Date | string | null;
  birthTime?: string | null;
  timezone?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

function dateOnly(value: BirthInputLike["birthDate"]): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return null;
  const candidate = value.slice(0, 10);
  try {
    parseDateOnly(candidate);
    return candidate;
  } catch {
    return null;
  }
}

function coordinate(value: unknown, limit: number): number | null | undefined {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : undefined;
}

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

export function buildStoredBirthEvidenceInput(input: BirthInputLike): StoredBirthEvidenceInput | null {
  const birthDate = dateOnly(input.birthDate);
  const timezone = typeof input.timezone === "string" ? input.timezone.trim() : "";
  if (!birthDate || !isValidIanaTimezone(timezone)) return null;

  const latitude = coordinate(input.latitude, 90);
  const longitude = coordinate(input.longitude, 180);
  if (latitude === undefined || longitude === undefined) return null;

  const birthTime = typeof input.birthTime === "string" ? input.birthTime.trim() : "";
  if (!birthTime) {
    return {
      version: 1,
      birthDate,
      timezone,
      mode: "unknown",
      utc: null,
      latitude,
      longitude,
    };
  }

  const resolved = resolveCivilTimeStrict(birthDate, birthTime, timezone);
  if (resolved.status !== "valid" || !resolved.utc) return null;

  return {
    version: 1,
    birthDate,
    timezone,
    mode: "known",
    utc: resolved.utc.toISOString(),
    latitude,
    longitude,
  };
}

export function sameStoredBirthEvidenceInput(
  left: StoredBirthEvidenceInput | null | undefined,
  right: StoredBirthEvidenceInput | null | undefined,
): boolean {
  if (!left || !right) return false;
  return (["version", "birthDate", "timezone", "mode", "utc", "latitude", "longitude"] as const)
    .every((key) => left[key] === right[key]);
}

export function bindStoredEvidence<T extends Record<string, any>>(
  value: T,
  input: BirthInputLike,
): T {
  const birthEvidenceInput = buildStoredBirthEvidenceInput(input);
  return birthEvidenceInput ? { ...value, birthEvidenceInput } : value;
}

export function hasMatchingStoredEvidenceBinding(
  profile: BirthInputLike & { astrologyData?: unknown; humanDesignData?: unknown },
  system: "astrology" | "humanDesign",
): boolean {
  const current = buildStoredBirthEvidenceInput(profile);
  if (!current) return false;
  const source = system === "astrology"
    ? record(profile.astrologyData)
    : record(profile.humanDesignData);
  return sameStoredBirthEvidenceInput(source.birthEvidenceInput as StoredBirthEvidenceInput | undefined, current);
}

export function boundAstrologyForStoredProfile<T extends BirthInputLike & { astrologyData?: unknown }>(
  profile: T,
): Record<string, any> {
  return hasMatchingStoredEvidenceBinding(profile, "astrology")
    ? record(profile.astrologyData)
    : {};
}

export function boundHumanDesignForStoredProfile<T extends BirthInputLike & { humanDesignData?: unknown }>(
  profile: T,
): Record<string, any> {
  return hasMatchingStoredEvidenceBinding(profile, "humanDesign")
    ? record(profile.humanDesignData)
    : {};
}
