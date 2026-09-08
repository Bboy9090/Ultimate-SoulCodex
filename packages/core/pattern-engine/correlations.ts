import type { DailyPulseEntry, PatternCorrelation } from "./types.js";
import { calculateCorrelation } from "./scoring.js";

export function calculateEnergyAlignmentCorrelation(entries: DailyPulseEntry[]): number {
  if (entries.length < 2) return 0;

  const energies = entries.map((e) => e.energy);
  const alignments = entries.map((e) => e.alignment);

  return calculateCorrelation(energies, alignments);
}

export function findCorrelations(entries: DailyPulseEntry[]): PatternCorrelation[] {
  if (entries.length < 2) return [];

  const correlations: PatternCorrelation[] = [];
  const energies = entries.map((e) => e.energy);
  const alignments = entries.map((e) => e.alignment);
  const energyAlignmentCorr = calculateCorrelation(energies, alignments);

  if (energyAlignmentCorr !== 0) {
    const interpretation =
      energyAlignmentCorr > 0.5
        ? "Strong positive correlation: High energy tends to align with high alignment"
        : energyAlignmentCorr > 0
        ? "Weak positive correlation: Some alignment between energy and alignment metrics"
        : energyAlignmentCorr > -0.5
        ? "Weak negative correlation: Energy and alignment show slight inverse relationship"
        : "Strong negative correlation: High energy tends to occur with lower alignment";

    correlations.push({
      metric1: "energy",
      metric2: "alignment",
      correlation: energyAlignmentCorr,
      description: interpretation,
    });
  }

  return correlations;
}

export function analyzeMoodCorrelations(entries: DailyPulseEntry[]): Record<string, any> {
  if (entries.length === 0) return {};

  const moodStats: Record<string, { energies: number[]; alignments: number[] }> = {};

  entries.forEach((entry) => {
    if (!moodStats[entry.mood]) {
      moodStats[entry.mood] = { energies: [], alignments: [] };
    }
    moodStats[entry.mood].energies.push(entry.energy);
    moodStats[entry.mood].alignments.push(entry.alignment);
  });

  const result: Record<string, any> = {};

  for (const [mood, stats] of Object.entries(moodStats)) {
    const avgEnergy = stats.energies.reduce((a, b) => a + b, 0) / stats.energies.length;
    const avgAlignment = stats.alignments.reduce((a, b) => a + b, 0) / stats.alignments.length;

    result[mood] = {
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgAlignment: Math.round(avgAlignment * 10) / 10,
      frequency: stats.energies.length,
    };
  }

  return result;
}
