import type { SoulProfile, TimelinePhase } from "../types/soulcodex";

export type { TimelinePhase };

export type TimelineInput = {
  personalYear: number;
  themes: string[];
  astroSignals?: string[];
};

const yearPhaseMap: Record<number, TimelinePhase> = {
  1: "Ignition",
  2: "Integration",
  3: "Expansion",
  4: "Construction",
  5: "Expansion",
  6: "Legacy",
  7: "Refinement",
  8: "Construction",
  9: "Legacy",
};

const themePhaseBoostMap: Record<string, { phase: TimelinePhase; weight: number }> = {
  precision: { phase: "Refinement", weight: 2 },
  truth: { phase: "Exposure", weight: 2 },
  discipline: { phase: "Construction", weight: 3 },
  freedom: { phase: "Expansion", weight: 2 },
  legacy: { phase: "Legacy", weight: 3 },
};

export function resolveTimeline(input: TimelineInput): TimelinePhase {
  const scores: Record<TimelinePhase, number> = {
    Ignition: 0,
    Exposure: 0,
    Construction: 0,
    Expansion: 0,
    Friction: 0,
    Refinement: 0,
    Integration: 0,
    Legacy: 0,
  };

  const normalizedYear = ((input.personalYear - 1) % 9) + 1;
  const basePhase = yearPhaseMap[normalizedYear] ?? "Integration";
  scores[basePhase] += 5;

  for (const theme of input.themes) {
    const boost = themePhaseBoostMap[theme];
    if (boost) {
      scores[boost.phase] += boost.weight;
    }
  }

  const sorted = (Object.entries(scores) as [TimelinePhase, number][]).sort(
    (a, b) => b[1] - a[1]
  );

  return sorted[0][0];
}

/**
 * Convenience overload that accepts a SoulProfile directly.
 */
export function resolveTimelineFromProfile(profile: SoulProfile): TimelinePhase {
  const personalYear = profile.numerology?.personalYear ?? 1;
  const themes = profile.themes?.topThemes ?? [];
  return resolveTimeline({ personalYear, themes });
}
