/**
 * src/timeline/score.ts
 *
 * Applies scoring rules to a set of inputs and returns per-phase raw scores,
 * a breakdown of contributing reasons, and metadata needed for tie-breaking.
 */

import {
  PHASES,
  PERSONAL_YEAR_RULES,
  ASTROLOGY_RULES,
  THEME_TAG_RULES,
  CONFIDENCE_MULTIPLIERS,
  UNVERIFIED_IGNORE_THRESHOLD,
  type Phase,
  type ConfidenceLabel,
} from "./rules";

// ---------------------------------------------------------------------------
// Public input type
// ---------------------------------------------------------------------------

export interface TimelineInput {
  /**
   * Personal Year number (1–9).  Derive with standard numerology:
   *   sum of birth month + birth day + current calendar year, reduced to 1–9.
   */
  personalYear: number;

  /**
   * Active astrology cycle markers.
   * Use the underscore-separated keys defined in ASTROLOGY_RULES, e.g.
   * "saturn_hard", "jupiter_return", "nodes_strong".
   */
  astrologyCycles: string[];

  /**
   * Theme tags produced by Codex30 synthesis (topThemes[].tag).
   */
  themeTags: string[];

  /**
   * Data confidence for the astrology portion of the input.
   * Numerology + theme scores are never reduced.
   */
  confidence: ConfidenceLabel;
}

// ---------------------------------------------------------------------------
// Internal score-accumulation helpers
// ---------------------------------------------------------------------------

/** Zero-initialised score map for all 8 phases. */
function emptyScores(): Record<Phase, number> {
  return Object.fromEntries(PHASES.map((p) => [p, 0])) as Record<Phase, number>;
}

function addDeltas(
  scores: Record<Phase, number>,
  deltas: Partial<Record<Phase, number>>,
  multiplier = 1
): void {
  for (const [phase, delta] of Object.entries(deltas) as [Phase, number][]) {
    scores[phase] = (scores[phase] ?? 0) + Math.round(delta * multiplier);
  }
}

// ---------------------------------------------------------------------------
// Score breakdown
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  /** Final summed score per phase (integers after rounding). */
  scores: Record<Phase, number>;

  /**
   * Human-readable strings explaining each scoring contribution.
   * Used directly in the `reasons` array of the resolved output.
   */
  reasons: string[];

  /**
   * The single strongest raw astrology contribution (phase + score delta)
   * before confidence reduction, used as the first tie-breaker.
   */
  strongestAstrologyPhase: Phase | null;
  strongestAstrologyScore: number;

  /** Personal year score contribution map (for tie-breaking). */
  numerologyScores: Record<Phase, number>;

  /** Aggregated theme contribution map (for tie-breaking). */
  themeScores: Record<Phase, number>;
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

/**
 * Computes per-phase scores from the provided timeline inputs.
 *
 * Returns a {@link ScoreBreakdown} that is consumed by `resolvePhase` in
 * `resolve.ts` to determine the final phase and narrative output.
 */
export function scoreTimeline(input: TimelineInput): ScoreBreakdown {
  const scores = emptyScores();
  const numerologyScores = emptyScores();
  const astrologyScores = emptyScores();
  const themeScores = emptyScores();
  const reasons: string[] = [];

  const multiplier = CONFIDENCE_MULTIPLIERS[input.confidence];

  // ---- Personal Year -------------------------------------------------------
  const pyRules = PERSONAL_YEAR_RULES[input.personalYear];
  if (pyRules) {
    addDeltas(numerologyScores, pyRules);
    addDeltas(scores, pyRules);
    for (const [phase, delta] of Object.entries(pyRules) as [Phase, number][]) {
      reasons.push(
        `Personal Year ${input.personalYear} → ${phase} +${delta}`
      );
    }
  }

  // ---- Astrology cycles ----------------------------------------------------
  let strongestAstrologyPhase: Phase | null = null;
  let strongestAstrologyScore = 0;

  for (const cycle of input.astrologyCycles) {
    const rules = ASTROLOGY_RULES[cycle];
    if (!rules) continue;

    for (const [phase, rawDelta] of Object.entries(rules) as [Phase, number][]) {
      // Unverified: ignore weak signals before applying the multiplier
      if (
        input.confidence === "Unverified" &&
        rawDelta < UNVERIFIED_IGNORE_THRESHOLD
      ) {
        reasons.push(
          `Astrology cycle "${cycle}" → ${phase} +${rawDelta} ignored (Unverified, below threshold)`
        );
        continue;
      }

      const effectiveDelta = Math.round(rawDelta * multiplier);
      astrologyScores[phase] = (astrologyScores[phase] ?? 0) + effectiveDelta;
      scores[phase] = (scores[phase] ?? 0) + effectiveDelta;

      const confidenceNote =
        multiplier < 1
          ? ` (×${multiplier.toFixed(1)} ${input.confidence} confidence → effective +${effectiveDelta})`
          : "";
      reasons.push(
        `Astrology cycle "${cycle}" → ${phase} +${rawDelta}${confidenceNote}`
      );

      // Track the single strongest astrology contribution (raw, pre-reduction)
      if (rawDelta > strongestAstrologyScore) {
        strongestAstrologyScore = rawDelta;
        strongestAstrologyPhase = phase;
      }
    }
  }

  // ---- Theme tags ----------------------------------------------------------
  for (const tag of input.themeTags) {
    const rules = THEME_TAG_RULES[tag];
    if (!rules) continue;

    addDeltas(themeScores, rules);
    addDeltas(scores, rules);
    for (const [phase, delta] of Object.entries(rules) as [Phase, number][]) {
      reasons.push(`Theme tag "${tag}" → ${phase} +${delta}`);
    }
  }

  return {
    scores,
    reasons,
    strongestAstrologyPhase,
    strongestAstrologyScore,
    numerologyScores,
    themeScores,
  };
}
