import type { Match, Divergence, SystemSignal, LivedSignal } from "./types.js";

export function calculateAlignmentScore(matches: Match[], divergences: Divergence[]): number {
  const total = matches.length + divergences.length;
  if (total === 0) return 0;

  let score = 0;
  matches.forEach((m) => {
    score += m.alignment;
  });

  const average = score / total;
  return Math.round(average * 100) / 100; // 0-1 scale
}

export function scoreSystemToLived(system: SystemSignal, lived: LivedSignal[]): number {
  // This is a placeholder scoring function
  // Actual scoring depends on the specific system and lived metric
  if (lived.length === 0) return 0;

  // Simple scoring: if the system predicts something and lived data confirms it, score higher
  // This would need domain-specific logic for each system type

  // For now, return a neutral score that would be refined based on the specific comparison
  return 0.5;
}

export function calculateEnergyAlignmentMatch(
  systemLabel: string,
  livedEnergy: number,
  livedAlignment: number
): number {
  // Map system phase/day to expected energy/alignment patterns
  // This is deterministic based on system rules

  const expectations: Record<string, { expectedEnergy: number; expectedAlignment: number }> = {
    "day-4": { expectedEnergy: 3, expectedAlignment: 3 }, // Structure phase - steady, grounded
    "day-9": { expectedEnergy: 4, expectedAlignment: 5 }, // Completion phase - high completion energy
    "day-1": { expectedEnergy: 4, expectedAlignment: 4 }, // Initiative phase - new beginnings
    "day-7": { expectedEnergy: 3, expectedAlignment: 4 }, // Reflection phase - introspective
    "full-moon": { expectedEnergy: 5, expectedAlignment: 3 }, // Peak energy but scattered
    "new-moon": { expectedEnergy: 2, expectedAlignment: 4 }, // Lower energy, inward focus
  };

  const expected = expectations[systemLabel];
  if (!expected) return 0.5; // Unknown system, neutral score

  // Calculate similarity: closer matches score higher
  const energyDiff = Math.abs(livedEnergy - expected.expectedEnergy) / 5; // Normalize to 0-1
  const alignmentDiff = Math.abs(livedAlignment - expected.expectedAlignment) / 5;

  const match = 1 - (energyDiff + alignmentDiff) / 2; // Average difference
  return Math.round(match * 100) / 100;
}

export function calculateStrengthOfEvidence(sampleSize: number, consistency: number): number {
  // Strength of evidence: larger sample + higher consistency = stronger signal
  const sizeScore = Math.min(sampleSize / 30, 1); // Cap at 30 entries
  const combined = (sizeScore + consistency) / 2; // Average the two factors
  return Math.round(combined * 100) / 100;
}
