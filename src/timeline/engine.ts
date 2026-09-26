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

export function timelinePhaseCycleYear(personalYear: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 {
  if (!Number.isInteger(personalYear)) {
    throw new RangeError("Timeline Personal Year must be an integer");
  }

  if (personalYear >= 1 && personalYear <= 9) {
    return personalYear as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  }

  const masterRoot: Record<number, 2 | 4 | 6> = {
    11: 2,
    22: 4,
    33: 6,
  };
  const root = masterRoot[personalYear];
  if (root) return root;

  throw new RangeError("Timeline Personal Year must be 1-9, 11, 22, or 33");
}

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

  const phaseCycleYear = timelinePhaseCycleYear(input.personalYear);
  const basePhase = yearPhaseMap[phaseCycleYear];
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
  const personalYear = profile.numerology?.personalYear;
  if (personalYear === undefined || personalYear === null) {
    throw new Error("timeline_personal_year_required");
  }
  const themes = profile.themes?.topThemes ?? [];
  return resolveTimeline({ personalYear, themes });
}
