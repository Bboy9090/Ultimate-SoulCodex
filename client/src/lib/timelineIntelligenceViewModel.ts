import type { LivedSignal } from "@soulcodex/core";
import type { DailyPulseEntry } from "./dailyPulseStorage";

export const TIMELINE_LOOKBACK_ENTRIES = 30;

export function buildTimelineLivedSignals(entries: DailyPulseEntry[]): LivedSignal[] {
  if (entries.length === 0) return [];

  const dateRange = {
    start: entries[entries.length - 1].date,
    end: entries[0].date,
  };
  const avgEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length;
  const avgAlignment = entries.reduce((sum, entry) => sum + entry.alignment, 0) / entries.length;
  const moodCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    return counts;
  }, {});
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const signals: LivedSignal[] = [
    { dateRange, metric: "energy", value: Math.round(avgEnergy * 10) / 10 },
    { dateRange, metric: "alignment", value: Math.round(avgAlignment * 10) / 10 },
  ];

  if (dominantMood) {
    const [mood, frequency] = dominantMood;
    signals.push({
      dateRange,
      metric: "mood",
      value: mood,
      frequency,
      percentage: Math.round((frequency / entries.length) * 100),
    });
  }

  return signals;
}

export function trackingDepth(sampleSize: number): number {
  return Math.min(Math.max(sampleSize, 0) / TIMELINE_LOOKBACK_ENTRIES, 1);
}
