import { HARD_REJECT_PHRASES } from "../../packages/core/soulcodex-v1/content/banned-language";

// Original hand-curated list
const LEGACY_BANNED = [
  "cosmic signature",
  "sacred blueprint",
  "divine timing",
  "vibrational frequency",
  "holistic convergence",
  "incarnation",
  "celestial",
  "cosmic dance",
  "cosmic blueprint",
  "cosmic purpose",
  "divine nature",
  "spiritual evolution",
  "spiritual growth",
  "soul's evolution",
  "soul's journey",
  "soul story",
  "mystical biographer",
  "seen and unseen worlds",
  "ancient wisdom",
  "sacred timing",
  "sacred geometry",
  "stellar guidance",
  "cosmic timing",
  "highest potential",
  "highest growth",
  "spiritual narrative",
  "alchemize",
];

// Merged de-duplicated list (anti-generic engine + legacy)
const _allBanned = Array.from(new Set([...LEGACY_BANNED, ...HARD_REJECT_PHRASES]));
export const BANNED_PHRASES = _allBanned;

const MUST_HAVE_PATTERNS = [
  { label: "strength", pattern: /strength|strong|gift|excel|built for|natural at|sharp at/i },
  { label: "shadow", pattern: /shadow|blind spot|avoid|struggle|default to|tendency to/i },
  { label: "tension", pattern: /tension|conflict|pull between|torn|paradox|friction|push.?pull/i },
  { label: "growth edge", pattern: /growth edge|edge|grow|develop|stretch|work on|learn to/i },
];

export interface FilterResult {
  pass: boolean;
  bannedFound: string[];
  missingElements: string[];
}

export function runBlandnessFilter(text: string): FilterResult {
  const lower = text.toLowerCase();

  const bannedFound = BANNED_PHRASES.filter((phrase) =>
    lower.includes(phrase.toLowerCase())
  );

  const missingElements = MUST_HAVE_PATTERNS.filter(
    ({ pattern }) => !pattern.test(text)
  ).map(({ label }) => label);

  return {
    pass: bannedFound.length === 0 && missingElements.length === 0,
    bannedFound,
    missingElements,
  };
}

export function stripBannedPhrases(text: string): string {
  let cleaned = text;
  for (const phrase of BANNED_PHRASES) {
    const regex = new RegExp(phrase, "gi");
    cleaned = cleaned.replace(regex, "");
  }
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  return cleaned;
}

export { MUST_HAVE_PATTERNS };
