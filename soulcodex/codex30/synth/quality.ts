const BANNED_GENERIC = [
  "you are a unique individual",
  "your journey",
  "the universe",
  "cosmic blueprint",
  "embrace your truth",
  "growth and transformation",
  "aligned with your purpose",
  "sacred blueprint",
  "divine timing",
  "vibrational frequency",
  "holistic convergence",
  "celestial influence",
  "divine nature",
  "cosmic signature",
  "measurable goals",
  "specific goals",
  "detailed planner",
  "allocate time",
  "attend workshops",
  "industry trends",
  "hold myself accountable",
  "i need",
  "i value",
  "i seek",
  "i like",
  "i want"
];

const ZODIAC_PATTERN = /(virgo|scorpio|libra|aries|capricorn|aquarius|leo|taurus|gemini|cancer|pisces|sagittarius)/i;
const CONCRETE_PATTERN = /(lies|repetitiveness|boundaries|legacy|immortal|build|precision|craft|intensity|privacy|truth|discipline)/i;

export function isGeneric(text: string): boolean {
  if (!text || text.length < 500) return true;

  const t = text.toLowerCase();
  const hits = BANNED_GENERIC.filter(p => t.includes(p)).length;
  const hasConcrete = ZODIAC_PATTERN.test(text) || CONCRETE_PATTERN.test(text);

  return hits >= 2 || !hasConcrete;
}
