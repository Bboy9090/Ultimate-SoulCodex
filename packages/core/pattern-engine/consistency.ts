import type { DailyPulseEntry } from "./types.js";

export function calculateEnergyConsistency(entries: DailyPulseEntry[]): number {
  if (entries.length === 0) return 0;
  if (entries.length === 1) return 1;

  const energies = entries.map((e) => e.energy);
  const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
  const variance = energies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / energies.length;
  const stdDev = Math.sqrt(variance);

  // Consistency score: 1 = perfectly consistent, 0 = highly variable
  const consistency = Math.max(0, 1 - stdDev / 5);
  return Math.round(consistency * 100) / 100;
}

export function calculateAlignmentConsistency(entries: DailyPulseEntry[]): number {
  if (entries.length === 0) return 0;
  if (entries.length === 1) return 1;

  const alignments = entries.map((e) => e.alignment);
  const mean = alignments.reduce((a, b) => a + b, 0) / alignments.length;
  const variance = alignments.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / alignments.length;
  const stdDev = Math.sqrt(variance);

  const consistency = Math.max(0, 1 - stdDev / 5);
  return Math.round(consistency * 100) / 100;
}

export function calculateMoodConsistency(entries: DailyPulseEntry[]): number {
  if (entries.length === 0) return 0;
  if (entries.length === 1) return 1;

  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  const moods = Object.values(moodCounts);
  const total = entries.length;

  // Herfindahl index for mood diversity
  // Higher value = more consistent (concentrated on one mood)
  // Lower value = less consistent (spread across moods)
  const hhi = moods.reduce((sum, count) => sum + Math.pow(count / total, 2), 0);

  // Normalize to 0-1 range where 1 = perfect consistency (all same mood)
  return Math.round(hhi * 100) / 100;
}

export function calculateVariability(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Return as percentage of theoretical max (5 for 1-5 scale)
  return Math.round((stdDev / 2.5) * 100) / 100; // Normalized to 0-1
}

export function calculateStability(values: number[], windowSize: number = 3): number {
  if (values.length < windowSize) return 1;

  const diffs: number[] = [];
  for (let i = 0; i < values.length - 1; i++) {
    diffs.push(Math.abs(values[i] - values[i + 1]));
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  // Stability: how small the average change is (1 = no change, 0 = large changes)
  const stability = Math.max(0, 1 - avgDiff / 5);
  return Math.round(stability * 100) / 100;
}
