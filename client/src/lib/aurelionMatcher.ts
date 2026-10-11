export const AURELION_PLANETS = [
  { key: "sun", label: "Sun", symbol: "☉", role: "identity signal" },
  { key: "moon", label: "Moon", symbol: "☽", role: "emotional rhythm" },
  { key: "mercury", label: "Mercury", symbol: "☿", role: "communication" },
  { key: "venus", label: "Venus", symbol: "♀", role: "affection and values" },
  { key: "mars", label: "Mars", symbol: "♂", role: "drive and pursuit" },
  { key: "jupiter", label: "Jupiter", symbol: "♃", role: "growth pattern" },
  { key: "saturn", label: "Saturn", symbol: "♄", role: "structure and limits" },
  { key: "uranus", label: "Uranus", symbol: "♅", role: "change and independence" },
  { key: "neptune", label: "Neptune", symbol: "♆", role: "imagination and ideals" },
  { key: "pluto", label: "Pluto", symbol: "♇", role: "depth and transformation" },
] as const;

export type AurelionPlanetKey = (typeof AURELION_PLANETS)[number]["key"];

export type AurelionPlacement = {
  key: AurelionPlanetKey;
  label: string;
  symbol: string;
  role: string;
  sign: string;
  house?: number;
  degree?: number;
};

function cleanSign(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanHouse(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 12 ? numeric : undefined;
}

function cleanDegree(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 && numeric < 30 ? numeric : undefined;
}

function placementSource(profile: any, key: AurelionPlanetKey): any {
  return profile?.verifiedAstrologyData?.planets?.[key]
    ?? profile?.verifiedAstrologyData?.[key]
    ?? profile?.verifiedAstrology?.planets?.[key]
    ?? profile?.astrologyData?.planets?.[key]
    ?? profile?.astrology?.planets?.[key]
    ?? profile?.astrologyData?.[key]
    ?? profile?.astrology?.[key]
    ?? null;
}

function planetaryHouse(profile: any, key: AurelionPlanetKey): number | undefined {
  return cleanHouse(
    profile?.verifiedAstrologyData?.planetaryHouses?.[key]
      ?? profile?.verifiedAstrology?.planetaryHouses?.[key]
      ?? profile?.astrologyData?.planetaryHouses?.[key]
      ?? profile?.astrology?.planetaryHouses?.[key],
  );
}

export function buildAurelionPlacements(profile: any): AurelionPlacement[] {
  if (!profile) return [];

  return AURELION_PLANETS.flatMap((planet) => {
    const source = placementSource(profile, planet.key);
    const sign = cleanSign(
      source?.sign
        ?? profile?.[planet.key + "Sign"]
        ?? (planet.key === "sun" ? profile?.sunSign : null),
    );
    if (!sign) return [];

    const house = cleanHouse(source?.house) ?? planetaryHouse(profile, planet.key);
    const degree = cleanDegree(source?.degree ?? source?.degreeInSign);

    return [{
      ...planet,
      sign,
      ...(house ? { house } : {}),
      ...(degree !== undefined ? { degree } : {}),
    }];
  });
}

export type AurelionMatchSignal = {
  key: string;
  label: string;
  score: number;
};

export function aurelionMatchSummary(
  partnerName: string,
  matches: AurelionMatchSignal[],
): string {
  if (!matches.length) {
    return `Aurelion cannot match ${partnerName} yet because no shared saved planetary keys are available on both charts.`;
  }

  const sorted = [...matches].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const watch = sorted[sorted.length - 1];

  if (sorted.length === 1) {
    return `Aurelion sees one shared saved signal with ${partnerName}: ${strongest.label}. Treat it as one symbolic lens, not a verdict.`;
  }

  return `Aurelion sees the clearest shared signal with ${partnerName} around ${strongest.label}. The lowest-scoring shared signal is ${watch.label}; use it as a watch point, not a prediction.`;
}
