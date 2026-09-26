// Legacy root compatibility surface.
//
// Do not carry an independent numerology implementation here. Route historical
// imports to the date-only engine so host timezone cannot change a birth date.
export {
  lifePath,
  birthDay,
  personalYear,
  hasNineHarmony,
  expressionNumber,
  soulUrge,
  personalityNumber,
  calculateNumerology,
} from "./packages/astrology/numerology";
