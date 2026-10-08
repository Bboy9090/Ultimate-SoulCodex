import { z } from "zod";
import type { Profile } from "@shared/schema";

export type PublicShareField =
  | "displayName"
  | "sunSign"
  | "moonSign"
  | "risingSign"
  | "lifePath"
  | "archetypeTitle"
  | "comparisonChart";

export type PublicComparisonPlacement = {
  key: "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto" | "northNode" | "southNode" | "chiron";
  sign: string;
  house: number;
};

export const publicShareSelectionSchema = z.object({
  fields: z.array(z.enum(["displayName", "sunSign", "moonSign", "risingSign", "lifePath", "archetypeTitle", "comparisonChart"])).min(1).max(7),
  displayName: z.string().trim().min(1).max(80).optional(),
}).superRefine((value, context) => {
  if (value.fields.includes("displayName") && !value.displayName) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["displayName"],
      message: "displayName is required when displayName is selected",
    });
  }
});

export type PublicShareSelection = z.infer<typeof publicShareSelectionSchema>;

export interface PublicProfileProjection {
  version: 1;
  fields: Partial<Record<Exclude<PublicShareField, "comparisonChart">, string | number>> & {
    comparisonChart?: PublicComparisonPlacement[];
  };
}

const ZODIAC_SIGNS = new Set(["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]);
const COMPARISON_PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;
const COMPARISON_POINTS = ["northNode", "southNode", "chiron"] as const;

function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function verifiedPlacementSign(placement: unknown): string | undefined {
  if (!placement || typeof placement !== "object") return undefined;
  const record = placement as Record<string, unknown>;
  if (record.verificationStatus !== "verified") return undefined;

  const evidence = (record.provenance ?? record.evidence) as Record<string, unknown> | undefined;
  const source = cleanText(evidence?.source);
  const engine = cleanText(evidence?.engine);
  const calculatedAt = cleanText(evidence?.calculatedAt);
  if (!source || !engine || !calculatedAt || Number.isNaN(Date.parse(calculatedAt))) return undefined;

  return cleanText(record.sign);
}

function verifiedSign(container: unknown, key: "sun" | "moon" | "rising"): string | undefined {
  if (!container || typeof container !== "object") return undefined;
  return verifiedPlacementSign((container as Record<string, unknown>)[key]);
}

function safeLifePath(profile: Profile): number | undefined {
  const numerology = profile.numerologyData as Record<string, unknown> | null;
  const value = numerology?.lifePath;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeArchetypeTitle(profile: Profile): string | undefined {
  const archetype = profile.archetypeData as Record<string, unknown> | null;
  return cleanText(archetype?.title);
}

function validHouse(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
}

function verifiedComparisonChart(container: unknown): PublicComparisonPlacement[] {
  if (!container || typeof container !== "object") return [];
  const astrology = container as Record<string, any>;
  const planetaryHouses = astrology.planetaryHouses as Record<string, unknown> | undefined;
  const planets = astrology.planets as Record<string, any> | undefined;
  const rows: PublicComparisonPlacement[] = [];

  for (const key of COMPARISON_PLANETS) {
    const placement = planets?.[key] ?? astrology[key];
    const sign = verifiedPlacementSign(placement);
    const actualSign = cleanText(placement?.sign);
    const house = planetaryHouses?.[key];
    if (!sign || sign !== actualSign || !ZODIAC_SIGNS.has(actualSign) || !validHouse(house)) continue;
    rows.push({ key, sign: actualSign, house });
  }

  for (const key of COMPARISON_POINTS) {
    const point = astrology[key] as Record<string, unknown> | undefined;
    const sign = cleanText(point?.sign);
    const policyId = key === "chiron" ? "ASTRO-CHIRON-v1" : "ASTRO-MEAN-NODE-v1";
    if (
      point?.verificationStatus !== "verified" || !sign || !ZODIAC_SIGNS.has(sign) ||
      !validHouse(point.house) || point.policyId !== policyId || !cleanText(point.evidenceArtifactId)
    ) continue;
    if (key === "chiron" && point.qualificationMethod !== "live-jpl-qualified-against-swiss") continue;
    if ((key === "northNode" || key === "southNode") && point.mode !== "mean") continue;
    rows.push({ key, sign, house: point.house });
  }

  return rows;
}

export function buildPublicProfileProjection(
  profile: Profile,
  selection: PublicShareSelection,
): PublicProfileProjection {
  const requested = new Set(selection.fields);
  const fields: PublicProfileProjection["fields"] = {};

  if (requested.has("displayName")) {
    const displayName = cleanText(selection.displayName);
    if (displayName) fields.displayName = displayName;
  }

  const astrology = profile.astrologyData;
  if (requested.has("sunSign")) {
    const value = verifiedSign(astrology, "sun");
    if (value) fields.sunSign = value;
  }
  if (requested.has("moonSign")) {
    const value = verifiedSign(astrology, "moon");
    if (value) fields.moonSign = value;
  }
  if (requested.has("risingSign")) {
    const value = verifiedSign(astrology, "rising");
    if (value) fields.risingSign = value;
  }

  if (requested.has("lifePath")) {
    const value = safeLifePath(profile);
    if (value !== undefined) fields.lifePath = value;
  }

  if (requested.has("archetypeTitle")) {
    const value = safeArchetypeTitle(profile);
    if (value) fields.archetypeTitle = value;
  }

  if (requested.has("comparisonChart")) {
    const value = verifiedComparisonChart(astrology);
    if (value.length > 0) fields.comparisonChart = value;
  }

  return { version: 1, fields };
}
