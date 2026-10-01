type UnknownRecord = Record<string, any>;

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

/**
 * Build the minimum server payload required by Foundation compatibility.
 *
 * Compatibility does not need a person's name, birth date, birth location,
 * biography, behavioral answers, account data, numerology, or unrelated
 * astrology layers. This caller-supplied projection is symbolic-only; verified
 * and deterministic layers must come from server-owned evidence, not payload claims.
 */
export function buildCompatibilityProfilePayload(profile: UnknownRecord | null | undefined) {
  const astrologyData = profile?.astrologyData ?? {};
  const astrology = profile?.astrology ?? {};
  const verifiedSun = firstDefined(
    astrologyData?.sun,
    astrology?.sun,
    profile?.natalChart?.sun,
    profile?.chart?.sun,
  );
  const symbolicSun = firstDefined(
    astrologyData?.sunSign,
    astrology?.sunSign,
    profile?.sunSign,
  );
  return {
    astrologyData: {
      ...(verifiedSun ? { sun: verifiedSun } : {}),
      ...(symbolicSun ? { sunSign: symbolicSun } : {}),
    },
  };
}
