import type { Phase, ConfidenceLabel, PhaseDeltas } from "./rules.js";
import {
  PHASES,
  PERSONAL_YEAR_RULES,
  ASTROLOGY_RULES,
  THEME_TAG_RULES,
  CONFIDENCE_MULTIPLIERS,
  UNVERIFIED_IGNORE_THRESHOLD,
} from "./rules.js";

export interface TimelineScoreInput {
  personalYear: number;
  astrologyCycles: string[];
  themeTags: string[];
  confidence: ConfidenceLabel;
}

export interface TimelineScoreBreakdown {
  scores: Record<Phase, number>;
  reasons: string[];
  strongestAstrologyPhase: Phase | null;
  strongestAstrologyScore: number;
  numerologyScores: Record<Phase, number>;
  themeScores: Record<Phase, number>;
}

function emptyScores(): Record<Phase, number> {
  return Object.fromEntries(PHASES.map((p) => [p, 0])) as Record<Phase, number>;
}

function addDeltas(scores: Record<Phase, number>, deltas: PhaseDeltas, multiplier = 1): void {
  for (const [phase, delta] of Object.entries(deltas) as [Phase, number][]) {
    scores[phase] = (scores[phase] ?? 0) + Math.round(delta * multiplier);
  }
}

export function scoreTimeline(input: TimelineScoreInput): TimelineScoreBreakdown {
  const scores = emptyScores();
  const numerologyScores = emptyScores();
  const astrologyScores = emptyScores();
  const themeScores = emptyScores();
  const reasons: string[] = [];

  const multiplier = CONFIDENCE_MULTIPLIERS[input.confidence];

  // Personal year
  const pyRules = PERSONAL_YEAR_RULES[input.personalYear];
  if (pyRules) {
    addDeltas(numerologyScores, pyRules);
    addDeltas(scores, pyRules);
    for (const [phase, delta] of Object.entries(pyRules) as [Phase, number][]) {
      reasons.push(`Personal Year ${input.personalYear} → ${phase} +${delta}`);
    }
  }

  // Astrology cycles
  let strongestAstrologyPhase: Phase | null = null;
  let strongestAstrologyScore = 0;

  for (const cycle of input.astrologyCycles) {
    const rules = ASTROLOGY_RULES[cycle];
    if (!rules) continue;

    for (const [phase, rawDelta] of Object.entries(rules) as [Phase, number][]) {
      if (input.confidence === "Unverified" && rawDelta < UNVERIFIED_IGNORE_THRESHOLD) {
        reasons.push(`Astrology cycle "${cycle}" → ${phase} +${rawDelta} ignored (Unverified, below threshold)`);
        continue;
      }

      const effectiveDelta = Math.round(rawDelta * multiplier);
      astrologyScores[phase] = (astrologyScores[phase] ?? 0) + effectiveDelta;
      scores[phase] = (scores[phase] ?? 0) + effectiveDelta;

      const confidenceNote =
        multiplier < 1 ? ` (×${multiplier.toFixed(1)} ${input.confidence} confidence → effective +${effectiveDelta})` : "";
      reasons.push(`Astrology cycle "${cycle}" → ${phase} +${rawDelta}${confidenceNote}`);

      if (rawDelta > strongestAstrologyScore) {
        strongestAstrologyScore = rawDelta;
        strongestAstrologyPhase = phase;
      }
    }
  }

  // Theme tags
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

