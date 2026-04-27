import type { ConfidenceLabel, Phase } from "./rules";
import { HYBRID_PAIRS } from "./rules";
import { scoreTimeline, type TimelineScoreBreakdown as ScoreBreakdown, type TimelineScoreInput } from "./score";

export interface TimelinePhaseOutput {
  phase: Phase;
  secondaryPhase?: Phase;
  scores: Record<Phase, number>;
  reasons: string[];
}

export type TimelineInput = TimelineScoreInput;

function sumScores(scores: Partial<Record<Phase, number>>): number {
  return Object.values(scores).reduce((a, b) => a + (b ?? 0), 0);
}

function pickHybrid(topA: Phase, topB: Phase): [Phase, Phase] | null {
  for (const [a, b] of HYBRID_PAIRS) {
    if ((topA === a && topB === b) || (topA === b && topB === a)) return [a, b];
  }
  return null;
}

function topTwo(scores: Record<Phase, number>): [Phase, Phase, number, number] {
  const sorted = (Object.entries(scores) as [Phase, number][])
    .slice()
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0], sorted[0][1], sorted[1][1]];
}

function appendConfidenceQualifier(reasons: string[], confidence: ConfidenceLabel): string[] {
  if (confidence === "Verified") return reasons;
  const note =
    confidence === "Partial"
      ? "Astrology timing is softened (Partial) — numerology + themes carry more weight."
      : "Astrology timing is heavily softened (Unverified) — numerology + themes carry the result.";
  return [...reasons, note];
}

export function resolveTimelinePhase(input: TimelineInput): TimelinePhaseOutput {
  const breakdown: ScoreBreakdown = scoreTimeline(input);
  const [a, b, aScore, bScore] = topTwo(breakdown.scores);

  // clear winner
  if (aScore !== bScore) {
    return {
      phase: a,
      scores: breakdown.scores,
      reasons: appendConfidenceQualifier(breakdown.reasons, input.confidence),
    };
  }

  // tie-break 1: strongest raw astrology contributor (if present)
  if (breakdown.strongestAstrologyPhase) {
    const p = breakdown.strongestAstrologyPhase;
    return {
      phase: p,
      scores: breakdown.scores,
      reasons: appendConfidenceQualifier(
        [...breakdown.reasons, `Tie-break: strongest astrology signal favored ${p}.`],
        input.confidence
      ),
    };
  }

  // tie-break 2: numerology contribution sum
  const aNum = breakdown.numerologyScores[a] ?? 0;
  const bNum = breakdown.numerologyScores[b] ?? 0;
  if (aNum !== bNum) {
    const winner = aNum > bNum ? a : b;
    return {
      phase: winner,
      scores: breakdown.scores,
      reasons: appendConfidenceQualifier(
        [...breakdown.reasons, `Tie-break: numerology contribution favored ${winner}.`],
        input.confidence
      ),
    };
  }

  // tie-break 3: theme contribution sum
  const aTheme = breakdown.themeScores[a] ?? 0;
  const bTheme = breakdown.themeScores[b] ?? 0;
  if (aTheme !== bTheme) {
    const winner = aTheme > bTheme ? a : b;
    return {
      phase: winner,
      scores: breakdown.scores,
      reasons: appendConfidenceQualifier(
        [...breakdown.reasons, `Tie-break: theme contribution favored ${winner}.`],
        input.confidence
      ),
    };
  }

  // final: hybrid if allowed; else deterministic alphabetical
  const hybrid = pickHybrid(a, b);
  if (hybrid) {
    return {
      phase: hybrid[0],
      secondaryPhase: hybrid[1],
      scores: breakdown.scores,
      reasons: appendConfidenceQualifier(
        [...breakdown.reasons, `Hybrid: scores tied between ${hybrid[0]} and ${hybrid[1]}.`],
        input.confidence
      ),
    };
  }

  const winner = [a, b].slice().sort((x, y) => x.localeCompare(y))[0];
  return {
    phase: winner,
    scores: breakdown.scores,
    reasons: appendConfidenceQualifier(
      [...breakdown.reasons, `Tie-break: deterministic fallback selected ${winner}.`],
      input.confidence
    ),
  };
}

