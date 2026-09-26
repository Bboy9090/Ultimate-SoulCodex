// Legacy compatibility surface.
//
// Keep older service imports pinned to the date-only implementation used by the
// astrology package instead of maintaining a second numerology engine here.
export {
  lifePath,
  birthDay,
  personalYear,
  hasNineHarmony,
  expressionNumber,
  soulUrge,
  personalityNumber,
  calculateNumerology,
} from "../packages/astrology/numerology";
