import type { PhaseSignal, TimelinePhase } from "./types";
import { PHASES } from "./phases";

// Map well-known Codex30 theme tags to phases they amplify
const THEME_PHASE_AFFINITY: Record<string, TimelinePhase> = {
  leadership: "Ignition",
  courage: "Ignition",
  innovation: "Ignition",
  rebellion: "Ignition",
  freedom: "Expansion",
  social_sensitivity: "Exposure",
  precision: "Refinement",
  craft: "Refinement",
  order: "Construction",
  discipline: "Construction",
  service: "Integration",
  healing: "Integration",
  emotion_depth: "Integration",
  truth: "Refinement",
  boundaries: "Construction",
  intensity: "Friction",
  legacy: "Legacy",
  intuition: "Refinement",
  focus: "Construction",
  privacy: "Refinement",
};

export function getThemeSignals(
  topThemes?: { tag: string; score: number }[]
): PhaseSignal[] {
  if (!topThemes || topThemes.length === 0) return [];

  const signals: PhaseSignal[] = [];

  for (const theme of topThemes.slice(0, 5)) {
    const phase = THEME_PHASE_AFFINITY[theme.tag];
    if (phase) {
      signals.push({
        phase,
        weight: Math.min(2, Math.round(theme.score * 2)),
        reason: `Your core theme "${theme.tag.replace(/_/g, " ")}" (score: ${theme.score.toFixed(2)}) aligns with the ${phase} phase pattern.`,
      });
    }
  }

  return signals;
}

export function resolvePhase(signals: PhaseSignal[]): TimelinePhase {
  if (signals.length === 0) return "Integration";

  const tally: Partial<Record<TimelinePhase, number>> = {};

  for (const s of signals) {
    tally[s.phase] = (tally[s.phase] ?? 0) + s.weight;
  }

  let best: TimelinePhase = "Integration";
  let bestScore = -1;

  for (const [phase, score] of Object.entries(tally) as [TimelinePhase, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = phase;
    }
  }

  return best;
}

export function nextPhaseFor(phase: TimelinePhase): TimelinePhase {
  return PHASES[phase].next;
}
