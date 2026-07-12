import type { DailyPulseEntry, RollingWindow, PatternMetrics } from "./types.js";
import { calculateEnergyPattern, calculateAlignmentPattern, calculateMoodFrequencies } from "./scoring.js";
import {
  findHighEnergyStreaks,
  findLowEnergyStreaks,
  findHighAlignmentStreaks,
  findLowAlignmentStreaks,
} from "./streaks.js";

export function generateRollingWindow(entries: DailyPulseEntry[], days: 7 | 14 | 30): RollingWindow {
  const windowEntries = entries.slice(0, days);

  const metrics: PatternMetrics = {
    energy: calculateEnergyPattern(windowEntries),
    alignment: calculateAlignmentPattern(windowEntries),
    moodFrequencies: calculateMoodFrequencies(windowEntries),
    streaks: [
      ...findHighEnergyStreaks(windowEntries),
      ...findLowEnergyStreaks(windowEntries),
      ...findHighAlignmentStreaks(windowEntries),
      ...findLowAlignmentStreaks(windowEntries),
    ].sort((a, b) => b.length - a.length),
  };

  const dateRange =
    windowEntries.length > 0
      ? {
          start: windowEntries[windowEntries.length - 1].date,
          end: windowEntries[0].date,
        }
      : null;

  return {
    days,
    metrics,
    dataPoints: windowEntries.length,
    dateRange,
  };
}

export function generateOverallTrend(entries: DailyPulseEntry[]): "rising" | "falling" | "stable" {
  if (entries.length < 2) return "stable";

  const energies = entries.map((e) => e.energy);
  const firstHalf = energies.slice(0, Math.floor(energies.length / 2));
  const secondHalf = energies.slice(Math.floor(energies.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  if (secondAvg > firstAvg + 0.5) return "rising";
  if (secondAvg < firstAvg - 0.5) return "falling";
  return "stable";
}

export function generateAlignmentTrend(entries: DailyPulseEntry[]): "rising" | "falling" | "stable" {
  if (entries.length < 2) return "stable";

  const alignments = entries.map((e) => e.alignment);
  const firstHalf = alignments.slice(0, Math.floor(alignments.length / 2));
  const secondHalf = alignments.slice(Math.floor(alignments.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  if (secondAvg > firstAvg + 0.5) return "rising";
  if (secondAvg < firstAvg - 0.5) return "falling";
  return "stable";
}

export function getDominantMood(entries: DailyPulseEntry[]): string | undefined {
  if (entries.length === 0) return undefined;

  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
}
