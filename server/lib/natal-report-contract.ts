import type { NatalReportInput } from "../natalReportPdf";

type PlacementLike = {
  sign?: unknown;
  verificationStatus?: unknown;
  reason?: unknown;
  internalCandidate?: {
    longitude?: unknown;
  } | null;
};

type ProfileLike = {
  name: string;
  birthDate: Date;
  birthTime?: string | null;
  birthLocation?: string | null;
  astrologyData?: unknown;
  numerologyData?: unknown;
  humanDesignData?: unknown;
  archetypeData?: unknown;
  biography?: string | null;
  dailyGuidance?: string | null;
  isPremium?: boolean | null;
};

const MAJOR_PLANET_KEYS = [
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

function record(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function verifiedSign(value: unknown): string | null {
  const placement = record(value) as PlacementLike;
  return placement.verificationStatus === "verified" &&
    typeof placement.sign === "string" &&
    placement.sign.trim()
    ? placement.sign.trim()
    : null;
}

function placementReason(value: unknown, fallback: string): string {
  const reason = record(value).reason;
  return typeof reason === "string" && reason.trim() ? reason.trim() : fallback;
}

function verifiedPlanet(value: unknown): Record<string, number | string> | undefined {
  const placement = record(value) as PlacementLike;
  const sign = verifiedSign(placement);
  const rawLongitude = placement.internalCandidate?.longitude;
  const longitude = typeof rawLongitude === "number" && Number.isFinite(rawLongitude)
    ? ((rawLongitude % 360) + 360) % 360
    : null;

  // The PDF placement table prints a degree. Do not manufacture 0° when the
  // verified evidence does not carry a usable longitude.
  if (!sign || longitude === null) return undefined;

  return {
    sign,
    longitude,
    degree: longitude % 30,
  };
}

function verifiedHumanDesign(value: unknown): Record<string, string> {
  const hd = record(value);
  if (hd.status !== "verified") return {};
  const candidate = record(hd.candidate);
  const result: Record<string, string> = {};

  for (const field of ["type", "strategy", "authority", "profile"] as const) {
    const entry = candidate[field];
    if (typeof entry === "string" && entry.trim()) result[field] = entry.trim();
  }
  return result;
}

function lifePathNumber(value: unknown): number | null {
  const numerology = record(value);
  const candidate = numerology.lifePath ?? numerology.lifePathNumber;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

function describePlacement(label: string, value: unknown, role: string): string {
  const sign = verifiedSign(value);
  if (!sign) {
    return `${label} is unresolved in this saved profile and Soul Codex intentionally does not assign a sign here. ${placementReason(value, "The required verification evidence is not available.")}`;
  }
  return `${label} is independently verified as ${sign}. In this report, ${role} is symbolic interpretation layered on top of that verified astronomical placement; it is not a diagnosis or a fixed personality fact.`;
}

function reportHighlights(astrology: Record<string, any>, numerology: Record<string, any>, humanDesign: Record<string, any>): string[] {
  const highlights: string[] = [];
  const sun = verifiedSign(astrology.sun);
  const moon = verifiedSign(astrology.moon);
  const rising = verifiedSign(astrology.rising);
  const planets = record(astrology.planets);
  const verifiedMajorPlanets = MAJOR_PLANET_KEYS.filter((key) => Boolean(verifiedPlanet(planets[key])));
  const lifePath = lifePathNumber(numerology);

  highlights.push(sun ? `Sun verified: ${sun}.` : `Sun unresolved: ${placementReason(astrology.sun, "verification evidence is incomplete")}`);
  highlights.push(moon ? `Moon verified: ${moon}.` : `Moon unresolved: ${placementReason(astrology.moon, "verified birth-time evidence or independent verification is incomplete")}`);
  highlights.push(rising ? `Ascendant verified: ${rising}.` : `Ascendant unresolved: ${placementReason(astrology.rising, "verified birth time, coordinates, or independent verification is incomplete")}`);
  highlights.push(`Major planets independently verified: ${verifiedMajorPlanets.length}/8 (Mercury through Pluto).`);
  if (lifePath !== null) highlights.push(`Life Path ${lifePath} is a deterministic numerology calculation; its meaning remains interpretive.`);
  highlights.push(humanDesign.status === "verified"
    ? "Human Design core fields carry a verified trust record and may be displayed."
    : "Human Design is unresolved or calculated-unverified and is deliberately withheld from authoritative report fields.");

  return highlights;
}

export function buildNatalReportInput(profile: ProfileLike): NatalReportInput {
  const astrology = record(profile.astrologyData);
  const numerology = record(profile.numerologyData);
  const humanDesignRecord = record(profile.humanDesignData);
  const archetype = record(profile.archetypeData);

  const sunSign = verifiedSign(astrology.sun);
  const moonSign = verifiedSign(astrology.moon);
  const risingSign = verifiedSign(astrology.rising);
  const sunPlanet = verifiedPlanet(astrology.sun);
  const moonPlanet = verifiedPlanet(astrology.moon);
  const savedPlanets = record(astrology.planets);
  const lifePath = lifePathNumber(numerology);
  const humanDesign = verifiedHumanDesign(humanDesignRecord);

  const safePlanets: Record<string, Record<string, number | string>> = {};
  if (sunPlanet) safePlanets.sun = sunPlanet;
  if (moonPlanet) safePlanets.moon = moonPlanet;
  for (const key of MAJOR_PLANET_KEYS) {
    const verified = verifiedPlanet(savedPlanets[key]);
    if (verified) safePlanets[key] = verified;
  }

  const verifiedMajorPlanetCount = MAJOR_PLANET_KEYS.filter((key) => key in safePlanets).length;

  const safeAstrology = {
    sunSign,
    moonSign,
    risingSign,
    planets: safePlanets,
    // Houses, aspects, nodes, Chiron, Midheaven, and planetary house placements
    // remain absent until those distinct calculations earn release evidence.
    houses: [],
    aspects: [],
    numerology: lifePath === null ? {} : { lifePathNumber: lifePath },
    verification: astrology.verification ?? null,
  };

  const archetypeTitle = typeof archetype.title === "string" ? archetype.title.trim() : "";
  const symbolicSummary = typeof profile.biography === "string" && profile.biography.trim()
    ? profile.biography.trim()
    : archetypeTitle
      ? `Your saved Soul Codex archetype is ${archetypeTitle}. Treat this as a symbolic synthesis to compare with lived experience, not as a factual diagnosis.`
      : "This report separates verified astronomical evidence, deterministic calculations, and symbolic interpretation so uncertainty remains visible instead of being filled with guesses.";

  const humanDesignText = humanDesignRecord.status === "verified"
    ? "Human Design core fields shown here come from a verified trust record. Their interpretive meaning remains symbolic rather than scientific diagnosis."
    : "Human Design is not independently verified for this profile, so candidate Type, Strategy, Authority, Profile, channels, centers, and advanced values are intentionally omitted rather than presented as facts.";

  const planetaryEvidenceText = verifiedMajorPlanetCount === MAJOR_PLANET_KEYS.length
    ? "Mercury through Pluto are independently verified against NASA/JPL Horizons and may appear in the placement table. A chart-wide element interpretation is still treated as a separate symbolic synthesis layer rather than an astronomical fact."
    : `${verifiedMajorPlanetCount}/8 major planets are independently verified in this saved profile. Element emphasis remains withheld rather than filling the missing placements with guesses.`;

  return {
    name: profile.name,
    birthDate: profile.birthDate.toISOString().split("T")[0],
    birthTime: profile.birthTime ?? "",
    birthLocation: profile.birthLocation ?? "",
    astrology: safeAstrology,
    humanDesign,
    aiText: {
      overview: symbolicSummary,
      bigThreeSun: describePlacement("Sun", astrology.sun, "Sun language explores conscious identity, vitality, and what a person may deliberately develop"),
      bigThreeMoon: describePlacement("Moon", astrology.moon, "Moon language explores emotional processing, habit, and felt safety"),
      bigThreeRising: describePlacement("Ascendant", astrology.rising, "Ascendant language explores first response, presentation, and how a person enters situations"),
      whatStandsOut: reportHighlights(astrology, numerology, humanDesignRecord),
      workingInterpretation: `${symbolicSummary} Keep any interpretation that improves recognition or decision-making, and reject wording that does not fit lived experience.`,
      elementEmphasis: planetaryEvidenceText,
      houseEmphasis: "House emphasis, Midheaven, nodes, Chiron, and planetary house placements are intentionally not claimed until those calculations have their own approved verification evidence.",
      bottomLine: typeof profile.dailyGuidance === "string" && profile.dailyGuidance.trim()
        ? profile.dailyGuidance.trim()
        : "Use verified data as evidence, symbolic systems as lenses, and lived experience as the final check.",
      hdInterpretation: humanDesignText,
    },
    isPremium: Boolean(profile.isPremium),
  };
}

export function natalReportFilename(name: string): string {
  const stem = name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9 _-]+/g, "")
    .trim()
    .replace(/[ _-]+/g, "_")
    .slice(0, 72) || "Soul_Codex";
  return `${stem}_Natal_Chart_Report.pdf`;
}
