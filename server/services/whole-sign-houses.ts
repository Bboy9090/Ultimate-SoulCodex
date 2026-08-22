import type { PlacementLike } from "@soulcodex/core";

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];
export type WholeSignHouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface WholeSignHouseAssignment {
  system: "Whole Sign";
  house: WholeSignHouseNumber;
  houseSign: ZodiacSign;
  placementSign: ZodiacSign;
  evidenceMode: "derived_from_verified_signs";
}

export interface WholeSignHouseMap {
  system: "Whole Sign";
  ascendantSign: ZodiacSign;
  cusps: Array<{
    house: WholeSignHouseNumber;
    sign: ZodiacSign;
    degree: 0;
  }>;
  assignments: Record<string, WholeSignHouseAssignment>;
  limitations: string[];
}

function zodiacSign(value: unknown): ZodiacSign | null {
  return typeof value === "string" && ZODIAC_SIGNS.includes(value as ZodiacSign)
    ? (value as ZodiacSign)
    : null;
}

function verifiedSign(placement: PlacementLike | null | undefined): ZodiacSign | null {
  const state = placement?.verificationStatus ?? placement?.status;
  if (state !== "verified") return null;
  return zodiacSign(placement?.sign);
}

function signIndex(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign);
}

export function wholeSignHouseForSigns(
  ascendantSign: ZodiacSign,
  placementSign: ZodiacSign,
): WholeSignHouseNumber {
  const offset = (signIndex(placementSign) - signIndex(ascendantSign) + 12) % 12;
  return (offset + 1) as WholeSignHouseNumber;
}

export function wholeSignCusps(ascendantSign: ZodiacSign): WholeSignHouseMap["cusps"] {
  const ascendantIndex = signIndex(ascendantSign);
  return Array.from({ length: 12 }, (_, offset) => ({
    house: (offset + 1) as WholeSignHouseNumber,
    sign: ZODIAC_SIGNS[(ascendantIndex + offset) % 12],
    degree: 0 as const,
  }));
}

/**
 * Whole Sign houses are a named astrological convention, not an astronomical
 * measurement. Once the Ascendant sign and placement signs are independently
 * verified, the house mapping is deterministic under that convention.
 *
 * Unverified/candidate placements are omitted rather than assigned a house.
 */
export function deriveWholeSignHouses(
  rising: PlacementLike | null | undefined,
  placements: Record<string, PlacementLike | null | undefined>,
): WholeSignHouseMap | null {
  const ascendantSign = verifiedSign(rising);
  if (!ascendantSign) return null;

  const assignments: Record<string, WholeSignHouseAssignment> = {};
  for (const [key, placement] of Object.entries(placements)) {
    const placementSign = verifiedSign(placement);
    if (!placementSign) continue;
    const house = wholeSignHouseForSigns(ascendantSign, placementSign);
    assignments[key] = {
      system: "Whole Sign",
      house,
      houseSign: ZODIAC_SIGNS[(signIndex(ascendantSign) + house - 1) % 12],
      placementSign,
      evidenceMode: "derived_from_verified_signs",
    };
  }

  return {
    system: "Whole Sign",
    ascendantSign,
    cusps: wholeSignCusps(ascendantSign),
    assignments,
    limitations: [
      "Whole Sign is the explicitly selected house-system convention for this derived view; it is not presented as the only valid astrological house system.",
      "House assignments are derived only from placements whose zodiac signs are independently verified.",
      "Midheaven is an astronomical angle and remains separately gated; Whole Sign house 10 is not relabeled as the Midheaven.",
    ],
  };
}
