import { parseDateOnly, resolveCivilTimeStrict } from "@soulcodex/core";
import { isValidIanaTimezone } from "@shared/schema";

/** The inputs used by a completed verification request, never a confidence score. */
export type BirthEvidenceInput = {
  version: 1;
  birthDate: string;
  timezone: string;
  mode: "known" | "unknown";
  utc: string | null;
  latitude: number | null;
  longitude: number | null;
};

function coordinate(value: unknown, limit: number): number | null | undefined {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : undefined;
}

export function birthEvidenceInput(profile: any): BirthEvidenceInput | null {
  if (!profile || typeof profile !== "object") return null;
  const birthDate = typeof profile.birthDate === "string" ? profile.birthDate.slice(0, 10) : "";
  const timezone = typeof profile.timezone === "string" ? profile.timezone.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !isValidIanaTimezone(timezone)) return null;
  try {
    parseDateOnly(birthDate);
  } catch {
    return null;
  }
  const unknown = profile.birthTimeStatus === "unknown" || profile.birthTime === null ||
    profile.birthTime === undefined || (typeof profile.birthTime === "string" && !profile.birthTime.trim());
  let utc: string | null = null;
  if (!unknown) {
    if (typeof profile.birthTime !== "string") return null;
    try {
      const resolved = resolveCivilTimeStrict(birthDate, profile.birthTime, timezone);
      if (resolved.status !== "valid" || !resolved.utc) return null;
      utc = resolved.utc.toISOString();
    } catch {
      return null;
    }
  }
  const latitude = coordinate(profile.latitude, 90);
  const longitude = coordinate(profile.longitude, 180);
  if (latitude === undefined || longitude === undefined) return null;
  return { version: 1, birthDate, timezone, mode: unknown ? "unknown" : "known", utc,
    latitude, longitude };
}

export function sameBirthEvidenceInput(left: BirthEvidenceInput | null, right: BirthEvidenceInput | null): boolean {
  return Boolean(left && right && (["version", "birthDate", "timezone", "mode", "utc", "latitude", "longitude"] as const)
    .every((key) => left[key] === right[key]));
}

/** Persisted legacy claims without an input binding require one explicit
 * re-verification. New responses are checked against their captured request.
 */
export function staleBirthEvidenceReason(profile: any, requireStoredBinding = false): string | null {
  const current = birthEvidenceInput(profile);
  if (profile.birthEvidenceInput && !sameBirthEvidenceInput(profile.birthEvidenceInput, current)) {
    return "saved_birth_inputs_changed";
  }
  const astrologyBundles = [profile.verifiedAstrologyData, profile.astrologyData, profile.astrology,
    profile.natalChart, profile.chart].filter(Boolean);
  const placements = astrologyBundles.flatMap((astrology) => [astrology?.sun, astrology?.moon,
    astrology?.rising, astrology?.ascendant, ...Object.values(astrology?.planets ?? {}),
    ...Object.values(astrology?.placements ?? {})]);
  if (requireStoredBinding && !profile.birthEvidenceInput && (
    placements.some((placement: any) => (placement?.verificationStatus ?? placement?.status) === "verified") ||
    profile.humanDesignData?.status === "verified" || profile.humanDesignData?.status === "range_analyzed" ||
    placements.some((placement: any) => ["stable_across_range", "conditional"].includes(placement?.evidenceState)) ||
    Boolean(profile.risingSign) || astrologyBundles.some((astrology) =>
      Boolean(astrology?.risingSign || astrology?.houses?.length || astrology?.aspects?.length))
  )) return "legacy_evidence_requires_birth_input_verification";
  if (!current) return null;
  for (const placement of placements as any[]) {
    if ((placement?.verificationStatus ?? placement?.status) !== "verified") continue;
    if (current.mode === "unknown") return "exact_evidence_for_unknown_birth_time";
    const timestamp = placement?.provenance?.inputTimestamp ?? placement?.evidence?.inputTimestamp ?? placement?.internalCandidate?.inputTimestamp;
    if (typeof timestamp === "string" && new Date(timestamp).getTime() !== new Date(current.utc!).getTime()) {
      return "astrology_birth_instant_mismatch";
    }
  }
  const hd = profile.humanDesignData;
  if (hd?.status === "verified") {
    if (current.mode === "unknown") return "exact_evidence_for_unknown_birth_time";
    if (typeof hd.inputTimestampUtc === "string" && new Date(hd.inputTimestampUtc).getTime() !== new Date(current.utc!).getTime()) {
      return "human_design_birth_instant_mismatch";
    }
  }
  return null;
}

/** Reject an old in-flight response even when it has the same profile ID. */
export function assertVerificationBirthInputs(local: any, remote: any, requestedInputs?: any): void {
  if (requestedInputs && !sameBirthEvidenceInput(birthEvidenceInput(local), birthEvidenceInput(requestedInputs))) {
    throw new Error("Birth details changed during verification. Retry using the saved details.");
  }
  const declaredFields = ["birthDate", "birthTime", "birthTimeStatus", "timezone", "latitude", "longitude"];
  const declared = Object.fromEntries(declaredFields.filter((key) => remote[key] !== undefined).map((key) => [key, remote[key]]));
  if (Object.keys(declared).length && !sameBirthEvidenceInput(birthEvidenceInput(local), birthEvidenceInput({ ...local, ...declared }))) {
    throw new Error("Verification belongs to different birth details. Retry using the saved details.");
  }
  if (staleBirthEvidenceReason({ birthDate: local.birthDate, birthTime: local.birthTime,
    birthTimeStatus: local.birthTimeStatus, timezone: local.timezone, latitude: local.latitude, longitude: local.longitude,
    astrologyData: remote.astrologyData, humanDesignData: remote.humanDesignData })) {
    throw new Error("Verification evidence does not match the saved birth details.");
  }
}
