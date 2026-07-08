import type { DailyPulseEntry, EnergyPattern, AlignmentPattern, MoodFrequency } from "./types.js";

export function calculateEnergyPattern(entries: DailyPulseEntry[]): EnergyPattern {
  if (entries.length === 0) {
    return {
      avgEnergy: 0,
      minEnergy: 0,
      maxEnergy: 0,
      consistency: 0,
      trend: "stable",
    };
  }

  const energies = entries.map((e) => e.energy);
  const sum = energies.reduce((a, b) => a + b, 0);
  const avg = sum / energies.length;
  const min = Math.min(...energies);
  const max = Math.max(...energies);

  // Consistency: how close values are to average (1 = perfect consistency, 0 = very variable)
  const variance = energies.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / energies.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1 - stdDev / 5); // Normalize to 0-1 range

  // Trend: compare first half to second half
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = energies.slice(0, midpoint);
  const secondHalf = energies.slice(midpoint);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend: "rising" | "falling" | "stable" =
    secondAvg > firstAvg + 0.5 ? "rising" : secondAvg < firstAvg - 0.5 ? "falling" : "stable";

  return {
    avgEnergy: Math.round(avg * 10) / 10,
    minEnergy: min,
    maxEnergy: max,
    consistency: Math.round(consistency * 100) / 100,
    trend,
  };
}

export function calculateAlignmentPattern(entries: DailyPulseEntry[]): AlignmentPattern {
  if (entries.length === 0) {
    return {
      avgAlignment: 0,
      minAlignment: 0,
      maxAlignment: 0,
      consistency: 0,
      trend: "stable",
    };
  }

  const alignments = entries.map((e) => e.alignment);
  const sum = alignments.reduce((a, b) => a + b, 0);
  const avg = sum / alignments.length;
  const min = Math.min(...alignments);
  const max = Math.max(...alignments);

  const variance = alignments.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / alignments.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1 - stdDev / 5);

  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = alignments.slice(0, midpoint);
  const secondHalf = alignments.slice(midpoint);
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend: "rising" | "falling" | "stable" =
    secondAvg > firstAvg + 0.5 ? "rising" : secondAvg < firstAvg - 0.5 ? "falling" : "stable";

  return {
    avgAlignment: Math.round(avg * 10) / 10,
    minAlignment: min,
    maxAlignment: max,
    consistency: Math.round(consistency * 100) / 100,
    trend,
  };
}

export function calculateMoodFrequencies(entries: DailyPulseEntry[]): MoodFrequency[] {
  if (entries.length === 0) return [];

  const moodCounts: Record<string, number> = {};

  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / entries.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateCorrelation(values1: number[], values2: number[]): number {
  if (values1.length === 0 || values1.length !== values2.length) return 0;

  const n = values1.length;
  const mean1 = values1.reduce((a, b) => a + b, 0) / n;
  const mean2 = values2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;

    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  if (denominator === 0) return 0;

  const correlation = numerator / denominator;
  return Math.round(correlation * 100) / 100;
}
