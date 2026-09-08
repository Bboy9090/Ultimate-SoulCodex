type UnknownRecord = Record<string, any>;

function firstDefined(...values: unknown[]) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

/**
 * Build the minimum server payload required by Foundation compatibility.
 *
 * Compatibility does not need a person's name, birth date, birth location,
 * biography, behavioral answers, account data, or unrelated astrology layers.
 * Keeping this projection explicit prevents future UI work from accidentally
 * uploading the entire active profile for a narrow symbolic calculation.
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
  const lifePath = firstDefined(
    profile?.lifePathNumber,
    profile?.numerologyData?.lifePathNumber,
    profile?.numerologyData?.lifePath,
    profile?.numerology?.lifePath?.value,
  );

  return {
    astrologyData: {
      ...(verifiedSun ? { sun: verifiedSun } : {}),
      ...(symbolicSun ? { sunSign: symbolicSun } : {}),
    },
    ...(lifePath !== undefined
      ? {
          lifePathNumber: lifePath,
          numerologyData: { lifePath },
        }
      : {}),
  };
}
