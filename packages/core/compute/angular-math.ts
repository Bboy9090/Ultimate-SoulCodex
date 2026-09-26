export const TROPICAL_ZODIAC_SIGNS = Object.freeze([
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
] as const);

export type TropicalZodiacSign = (typeof TROPICAL_ZODIAC_SIGNS)[number];

export function normalizeDegrees(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("angle_invalid");
  }
  return ((value % 360) + 360) % 360;
}

export function circularDegreesDelta(left: number, right: number): number {
  const raw = Math.abs(normalizeDegrees(left) - normalizeDegrees(right));
  return Math.min(raw, 360 - raw);
}

export function tropicalSignFromLongitude(longitude: number): TropicalZodiacSign {
  return TROPICAL_ZODIAC_SIGNS[Math.floor(normalizeDegrees(longitude) / 30)];
}

export function degreeInTropicalSign(longitude: number): number {
  return normalizeDegrees(longitude) % 30;
}

export function distanceToNearestThirtyDegreeBoundary(longitude: number): number {
  const within = degreeInTropicalSign(longitude);
  return Math.min(within, 30 - within);
}
