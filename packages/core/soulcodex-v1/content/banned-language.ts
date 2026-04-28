/**
 * Extended banned-language list for the anti-generic engine.
 *
 * Categories:
 *   GENERIC_ADJECTIVES  — vague flattery that fits anyone
 *   ZODIAC_CLICHES      — astrology stereotype phrasing
 *   SPIRITUAL_FILLER    — mystical-mushy abstractions
 *   THERAPY_WALLPAPER   — self-help platitudes that describe no one specifically
 *   TEMPLATE_OPENERS    — sentence-frame starters that betray copy-paste logic
 */

export interface BannedEntry {
  phrase: string;
  category: "generic_adjective" | "zodiac_cliche" | "spiritual_filler" | "therapy_wallpaper" | "template_opener" | "corporate_productivity";
  penalty: number; // 0-1, 1 = hard reject
}

export const EXTENDED_BANNED: BannedEntry[] = [
  // ── Generic adjectives ──────────────────────────────────────────────────────
  { phrase: "deeply intuitive",         category: "generic_adjective",   penalty: 1 },
  { phrase: "highly sensitive",         category: "generic_adjective",   penalty: 1 },
  { phrase: "complex soul",             category: "generic_adjective",   penalty: 1 },
  { phrase: "old soul",                 category: "generic_adjective",   penalty: 1 },
  { phrase: "powerful inner world",     category: "generic_adjective",   penalty: 1 },
  { phrase: "profound energy",          category: "generic_adjective",   penalty: 1 },
  { phrase: "both strong and sensitive",category: "generic_adjective",   penalty: 1 },
  { phrase: "strong and sensitive",     category: "generic_adjective",   penalty: 1 },
  { phrase: "feel things deeply",       category: "generic_adjective",   penalty: 1 },
  { phrase: "feel deeply",              category: "generic_adjective",   penalty: 0.9 },
  { phrase: "intensely",                category: "generic_adjective",   penalty: 0.5 },
  { phrase: "multifaceted",             category: "generic_adjective",   penalty: 0.8 },
  { phrase: "rich inner life",          category: "generic_adjective",   penalty: 1 },
  { phrase: "unique individual",        category: "generic_adjective",   penalty: 1 },
  { phrase: "truly unique",             category: "generic_adjective",   penalty: 1 },

  // ── Zodiac clichés ──────────────────────────────────────────────────────────
  { phrase: "natural leader",           category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "born leader",              category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "natural nurturer",         category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "love deeply",              category: "zodiac_cliche",       penalty: 0.8 },
  { phrase: "loyal to a fault",         category: "zodiac_cliche",       penalty: 1 },
  { phrase: "fiercely independent",     category: "zodiac_cliche",       penalty: 0.8 },
  { phrase: "emotionally complex",      category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "see through people",       category: "zodiac_cliche",       penalty: 0.7 },
  { phrase: "old beyond your years",    category: "zodiac_cliche",       penalty: 1 },
  { phrase: "seek meaning",             category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "seek authenticity",        category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "authenticity is important",category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "driven by purpose",        category: "zodiac_cliche",       penalty: 0.7 },
  { phrase: "here to learn",            category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "here to teach",            category: "zodiac_cliche",       penalty: 0.9 },
  { phrase: "here to balance",          category: "zodiac_cliche",       penalty: 1 },

  // ── Spiritual filler ────────────────────────────────────────────────────────
  { phrase: "cosmic signature",         category: "spiritual_filler",    penalty: 1 },
  { phrase: "sacred blueprint",         category: "spiritual_filler",    penalty: 1 },
  { phrase: "divine timing",            category: "spiritual_filler",    penalty: 1 },
  { phrase: "vibrational frequency",    category: "spiritual_filler",    penalty: 1 },
  { phrase: "holistic convergence",     category: "spiritual_filler",    penalty: 1 },
  { phrase: "celestial",               category: "spiritual_filler",    penalty: 1 },
  { phrase: "the universe has",         category: "spiritual_filler",    penalty: 1 },
  { phrase: "the universe wants",       category: "spiritual_filler",    penalty: 1 },
  { phrase: "transformation is happening", category: "spiritual_filler", penalty: 1 },
  { phrase: "old energy",               category: "spiritual_filler",    penalty: 0.9 },
  { phrase: "energy is shifting",       category: "spiritual_filler",    penalty: 1 },
  { phrase: "soul's purpose",           category: "spiritual_filler",    penalty: 1 },
  { phrase: "soul contract",            category: "spiritual_filler",    penalty: 1 },
  { phrase: "higher self",              category: "spiritual_filler",    penalty: 0.9 },
  { phrase: "alchemize",                category: "spiritual_filler",    penalty: 1 },
  { phrase: "ancient wisdom",           category: "spiritual_filler",    penalty: 1 },
  { phrase: "sacred geometry",          category: "spiritual_filler",    penalty: 1 },
  { phrase: "cosmic timing",            category: "spiritual_filler",    penalty: 1 },
  { phrase: "highest potential",        category: "spiritual_filler",    penalty: 1 },
  { phrase: "stellar guidance",         category: "spiritual_filler",    penalty: 1 },
  { phrase: "cosmic dance",             category: "spiritual_filler",    penalty: 1 },
  { phrase: "divine nature",            category: "spiritual_filler",    penalty: 1 },

  // ── Therapy wallpaper ───────────────────────────────────────────────────────
  { phrase: "embrace your truth",       category: "therapy_wallpaper",   penalty: 1 },
  { phrase: "aligned with your purpose",category: "therapy_wallpaper",   penalty: 1 },
  { phrase: "your journey",             category: "therapy_wallpaper",   penalty: 0.8 },
  { phrase: "be yourself",              category: "therapy_wallpaper",   penalty: 0.9 },
  { phrase: "your authentic self",      category: "therapy_wallpaper",   penalty: 1 },
  { phrase: "honor your feelings",      category: "therapy_wallpaper",   penalty: 0.9 },
  { phrase: "practice self-care",       category: "therapy_wallpaper",   penalty: 0.9 },
  { phrase: "you deserve",              category: "therapy_wallpaper",   penalty: 0.7 },
  { phrase: "set boundaries",           category: "therapy_wallpaper",   penalty: 0.6 },
  { phrase: "healing journey",          category: "therapy_wallpaper",   penalty: 0.9 },
  { phrase: "toxic patterns",           category: "therapy_wallpaper",   penalty: 0.7 },
  { phrase: "inner child",              category: "therapy_wallpaper",   penalty: 0.7 },
  { phrase: "shadow work",              category: "therapy_wallpaper",   penalty: 0.6 },

  // ── Corporate productivity ─────────────────────────────────────────────────
  { phrase: "measurable goals",         category: "corporate_productivity", penalty: 1 },
  { phrase: "specific goals",           category: "corporate_productivity", penalty: 1 },
  { phrase: "detailed planner",         category: "corporate_productivity", penalty: 1 },
  { phrase: "allocate time",            category: "corporate_productivity", penalty: 1 },
  { phrase: "attend workshops",         category: "corporate_productivity", penalty: 1 },
  { phrase: "industry trends",          category: "corporate_productivity", penalty: 1 },
  { phrase: "effective communication",  category: "corporate_productivity", penalty: 1 },
  { phrase: "teamwork skills",          category: "corporate_productivity", penalty: 1 },
  { phrase: "hold myself accountable",  category: "corporate_productivity", penalty: 1 },
  { phrase: "productivity blog",        category: "corporate_productivity", penalty: 1 },
  { phrase: "set targets",              category: "corporate_productivity", penalty: 0.8 },
  { phrase: "work-life balance",        category: "corporate_productivity", penalty: 1 },
  { phrase: "career path",              category: "corporate_productivity", penalty: 1 },
  { phrase: "professional growth",      category: "corporate_productivity", penalty: 1 },

  // ── Template openers (sentence-frame starters) ──────────────────────────────
  { phrase: "you are a",                category: "template_opener",     penalty: 0.8 },
  { phrase: "you are someone who",      category: "template_opener",     penalty: 0.9 },
  { phrase: "you have a gift for",      category: "template_opener",     penalty: 0.8 },
  { phrase: "you tend to",              category: "template_opener",     penalty: 0.5 },
  { phrase: "you always",               category: "template_opener",     penalty: 0.6 },
  { phrase: "you never",                category: "template_opener",     penalty: 0.5 },
  { phrase: "you are known for",        category: "template_opener",     penalty: 0.7 },
];

// Flat list of phrases for quick filtering (superset of the original BANNED_PHRASES)
export const ALL_BANNED_PHRASES: string[] = EXTENDED_BANNED.map(e => e.phrase);

// Hard-reject set: penalty === 1
export const HARD_REJECT_PHRASES: string[] = EXTENDED_BANNED
  .filter(e => e.penalty >= 1)
  .map(e => e.phrase);

export function containsBannedPhrase(text: string): { found: boolean; matches: BannedEntry[] } {
  const lower = text.toLowerCase();
  const matches = EXTENDED_BANNED.filter(e => lower.includes(e.phrase.toLowerCase()));
  return { found: matches.length > 0, matches };
}

export function totalPenaltyScore(text: string): number {
  const { matches } = containsBannedPhrase(text);
  if (matches.length === 0) return 0;
  return Math.min(1, matches.reduce((sum, e) => sum + e.penalty, 0));
}
