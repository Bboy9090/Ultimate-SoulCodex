// Compatibility surface.
//
// Root/server routes use the governed numerology service so explicit target-year
// semantics, strict input validation, canonical field names, and interpretations
// cannot be lost through the older nullable adapter.
export { calculateNumerology } from "../server/services/numerology";

export {
  lifePath,
  birthDay,
  personalYear,
  hasNineHarmony,
  expressionNumber,
  soulUrge,
  personalityNumber,
} from "../packages/astrology/numerology";
