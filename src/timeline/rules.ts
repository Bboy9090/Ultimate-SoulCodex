/**
 * src/timeline/rules.ts
 *
 * Deterministic scoring rules for the Soul Codex Timeline Engine.
 * Defines the 8 phases, all scoring tables, and tie-breaker priority.
 */

// ---------------------------------------------------------------------------
// Phase definitions
// ---------------------------------------------------------------------------

export const PHASES = [
  "Ignition",
  "Exposure",
  "Construction",
  "Expansion",
  "Friction",
  "Refinement",
  "Integration",
  "Legacy",
] as const;

export type Phase = (typeof PHASES)[number];

/** Allowed hybrid pairings when no clear winner emerges. */
export const HYBRID_PAIRS: [Phase, Phase][] = [
  ["Ignition", "Expansion"],
  ["Exposure", "Friction"],
  ["Construction", "Refinement"],
  ["Integration", "Legacy"],
];

// ---------------------------------------------------------------------------
// Scoring tables
// ---------------------------------------------------------------------------

/** Flat delta record: phase → integer weight. */
export type PhaseDeltas = Partial<Record<Phase, number>>;

/**
 * Personal Year → phase score deltas.
 * Keys 1–9 are standard numerology years.
 */
export const PERSONAL_YEAR_RULES: Record<number, PhaseDeltas> = {
  1: { Ignition: 5, Expansion: 2 },
  2: { Integration: 4, Refinement: 2 },
  3: { Expansion: 5, Ignition: 2 },
  4: { Construction: 5, Refinement: 2 },
  5: { Expansion: 4, Friction: 3 },
  6: { Integration: 4, Legacy: 3 },
  7: { Refinement: 5, Exposure: 2 },
  8: { Construction: 4, Legacy: 4 },
  9: { Legacy: 5, Integration: 3 },
};

/**
 * Astrology cycle marker identifiers as used in scoring input.
 *
 * Format convention for `cycle` strings:
 *   "<planet>_<qualifier>"
 *   e.g. "saturn_strong", "saturn_hard", "jupiter_return"
 */
export const ASTROLOGY_RULES: Record<string, PhaseDeltas> = {
  saturn_strong: { Construction: 4 },
  saturn_hard: { Friction: 4 },
  saturn_exact: { Friction: 4 },
  saturn_return: { Friction: 4 },
  jupiter_strong: { Expansion: 4 },
  jupiter_return: { Ignition: 2, Expansion: 3 },
  nodes_strong: { Exposure: 4, Legacy: 3 },
  eclipses_strong: { Exposure: 4, Legacy: 3 },
  pluto_hard: { Friction: 4 },
  neptune_hard: { Exposure: 3, Refinement: 2 },
  uranus_hard: { Ignition: 3, Friction: 3 },
};

/**
 * Codex theme tag → phase score deltas.
 * Tags match those produced by the Codex30 synthesis layer.
 */
export const THEME_TAG_RULES: Record<string, PhaseDeltas> = {
  precision: { Refinement: 2, Construction: 2 },
  truth: { Exposure: 3, Integration: 1 },
  boundaries: { Refinement: 2, Friction: 1 },
  innovation: { Ignition: 2, Expansion: 2 },
  legacy: { Legacy: 3, Construction: 1 },
  healing: { Integration: 2, Refinement: 2 },
  discipline: { Construction: 3 },
  freedom: { Expansion: 2, Ignition: 2 },
  privacy: { Refinement: 2, Exposure: 1 },
  service: { Legacy: 2, Integration: 2 },
  intensity: { Friction: 2, Exposure: 2 },
  craft: { Construction: 2, Refinement: 2 },
  leadership: { Ignition: 2, Legacy: 2 },
  intuition: { Exposure: 2, Integration: 2 },
  order: { Construction: 2, Refinement: 1 },
  emotion_depth: { Exposure: 2, Integration: 1 },
  social_sensitivity: { Refinement: 1, Exposure: 1 },
  courage: { Ignition: 2, Friction: 1 },
};

// ---------------------------------------------------------------------------
// Confidence modifier thresholds
// ---------------------------------------------------------------------------

/**
 * Multiplier applied to raw astrology scores before they are added to the
 * total.  Numerology and theme-tag scores are never reduced.
 */
export const CONFIDENCE_MULTIPLIERS: Record<ConfidenceLabel, number> = {
  Verified: 1.0,
  Partial: 0.7,
  Unverified: 0.5,
};

/**
 * When confidence is "Unverified", individual astrology deltas below this
 * threshold are discarded entirely (treated as noise).
 */
export const UNVERIFIED_IGNORE_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Confidence label type
// ---------------------------------------------------------------------------

export type ConfidenceLabel = "Verified" | "Partial" | "Unverified";

// ---------------------------------------------------------------------------
// Tie-breaker priority (lower index = higher priority)
// ---------------------------------------------------------------------------

export const TIE_BREAKER_PRIORITY = [
  "astrology",   // strongest single astrology cycle wins
  "numerology",  // then personal year
  "themes",      // then top theme count
  "hybrid",      // else allow a hybrid pair
] as const;

export type TieBreakerSource = (typeof TIE_BREAKER_PRIORITY)[number];
