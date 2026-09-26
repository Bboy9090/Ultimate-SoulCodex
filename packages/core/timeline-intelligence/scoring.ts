import type { Match, Divergence, SystemSignal, LivedSignal } from "./types.js";

export function calculateAlignmentScore(matches: Match[], divergences: Divergence[]): number {
  const total = matches.length + divergences.length;
  if (total === 0) return 0;

  let score = 0;
  matches.forEach((match) => {
    score += match.alignment;
  });

  const average = score / total;
  return Math.round(average * 100) / 100;
}

export function scoreSystemToLived(
  _system: SystemSignal,
  _lived: LivedSignal[],
): number | null {
  // No generic fallback scorer is allowed. A comparison is eligible only when
  // an explicit model exists for the exact symbolic signal + lived metrics.
  return null;
}

function normalizeExpectationKey(systemLabel: string): string | null {
  const normalized = systemLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const personalDay = /^day-(1|4|7|9)(?:-|$)/.exec(normalized);
  if (personalDay) return `day-${personalDay[1]}`;
  if (normalized.includes("full-moon")) return "full-moon";
  if (normalized.includes("new-moon")) return "new-moon";
  return null;
}

export function calculateEnergyAlignmentMatch(
  systemLabel: string,
  livedEnergy: number,
  livedAlignment: number,
): number | null {
  if (
    !Number.isFinite(livedEnergy) ||
    !Number.isFinite(livedAlignment) ||
    livedEnergy < 1 ||
    livedEnergy > 5 ||
    livedAlignment < 1 ||
    livedAlignment > 5
  ) {
    return null;
  }

  const expectations: Record<
    string,
    { expectedEnergy: number; expectedAlignment: number }
  > = {
    "day-4": { expectedEnergy: 3, expectedAlignment: 3 },
    "day-9": { expectedEnergy: 4, expectedAlignment: 5 },
    "day-1": { expectedEnergy: 4, expectedAlignment: 4 },
    "day-7": { expectedEnergy: 3, expectedAlignment: 4 },
    "full-moon": { expectedEnergy: 5, expectedAlignment: 3 },
    "new-moon": { expectedEnergy: 2, expectedAlignment: 4 },
  };

  const key = normalizeExpectationKey(systemLabel);
  if (!key) return null;

  const expected = expectations[key];
  if (!expected) return null;

  const energyDiff = Math.abs(livedEnergy - expected.expectedEnergy) / 4;
  const alignmentDiff =
    Math.abs(livedAlignment - expected.expectedAlignment) / 4;

  const match = Math.max(0, 1 - (energyDiff + alignmentDiff) / 2);
  return Math.round(match * 100) / 100;
}

export function calculateStrengthOfEvidence(
  sampleSize: number,
  consistency: number,
): number {
  if (
    !Number.isFinite(sampleSize) ||
    sampleSize < 0 ||
    !Number.isFinite(consistency) ||
    consistency < 0 ||
    consistency > 1
  ) {
    return 0;
  }

  // This is a coverage heuristic, not an accuracy or causation score.
  const sizeScore = Math.min(sampleSize / 30, 1);
  const combined = (sizeScore + consistency) / 2;
  return Math.round(combined * 100) / 100;
}
