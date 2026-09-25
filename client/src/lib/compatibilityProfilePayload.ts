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
  const suppliedSunPlacement = firstDefined(
    astrologyData?.sun,
    astrology?.sun,
    profile?.natalChart?.sun,
    profile?.chart?.sun,
  ) as UnknownRecord | undefined;
  const symbolicSun = firstDefined(
    astrologyData?.sunSign,
    astrology?.sunSign,
    profile?.sunSign,
    suppliedSunPlacement?.sign,
    suppliedSunPlacement?.internalCandidate?.sign,
  );
  const lifePath = firstDefined(
    profile?.lifePathNumber,
    profile?.numerologyData?.lifePathNumber,
    profile?.numerologyData?.lifePath,
    profile?.numerology?.lifePath?.value,
  );

  return {
    astrologyData: {
      // The compatibility API receives client-owned data, so it must never
      // receive or trust caller-attested verification metadata. A Sun value
      // crossing this boundary is symbolic unless the server reconstructs it
      // from its own evidence store.
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
