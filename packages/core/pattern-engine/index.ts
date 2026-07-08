import type { DailyPulseEntry, PatternSummary, PatternEngineOptions } from "./types.js";
import { deriveConfidenceLevel } from "./confidence.js";
import {
  generateRollingWindow,
  generateOverallTrend,
  generateAlignmentTrend,
  getDominantMood,
} from "./summaries.js";
import {
  findHighEnergyStreaks,
  findLowEnergyStreaks,
  findHighAlignmentStreaks,
  findLowAlignmentStreaks,
} from "./streaks.js";
import { calculateEnergyAlignmentCorrelation, findCorrelations } from "./correlations.js";
import { generateObservations } from "./observations.js";

export * from "./types.js";
export * from "./scoring.js";
export * from "./streaks.js";
export * from "./consistency.js";
export * from "./confidence.js";
export * from "./correlations.js";
export * from "./summaries.js";

export function generatePatternSummary(
  entries: DailyPulseEntry[],
  options: PatternEngineOptions = {}
): PatternSummary {
  const lookbackDays = options.lookbackDays || 30;
  const minDataPoints = options.minDataPoints || 1;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recentEntries = sortedEntries.slice(0, lookbackDays);

  const dataPoints = recentEntries.length;
  const confidence = deriveConfidenceLevel(dataPoints);

  // Generate rolling windows
  const window7d = generateRollingWindow(recentEntries, 7);
  const window14d = generateRollingWindow(recentEntries, 14);
  const window30d = generateRollingWindow(recentEntries, 30);

  // Calculate trends
  const overallEnergyTrend = generateOverallTrend(recentEntries);
  const overallAlignmentTrend = generateAlignmentTrend(recentEntries);
  const dominantMood = getDominantMood(recentEntries);

  // Find notable streaks
  const highEnergyStreaks = findHighEnergyStreaks(recentEntries);
  const lowEnergyStreaks = findLowEnergyStreaks(recentEntries);
  const highAlignmentStreaks = findHighAlignmentStreaks(recentEntries);
  const longestHighEnergyStreak = highEnergyStreaks[0];
  const longestLowEnergyStreak = lowEnergyStreaks[0];
  const longestHighAlignmentStreak = highAlignmentStreaks[0];

  // Calculate correlations
  const energyAlignmentCorrelation = calculateEnergyAlignmentCorrelation(recentEntries);

  // Generate observations
  const observations = generateObservations(recentEntries, {
    confidence,
    energyTrend: overallEnergyTrend,
    alignmentTrend: overallAlignmentTrend,
    dominantMood,
    energyAlignmentCorrelation,
    longestHighEnergyStreak,
    longestLowEnergyStreak,
  });

  // Build date range
  const dateRange =
    recentEntries.length > 0
      ? {
          start: recentEntries[recentEntries.length - 1].date,
          end: recentEntries[0].date,
        }
      : null;

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    confidence,
    dataPoints,
    dateRange,
    window7d,
    window14d,
    window30d,
    overallEnergyTrend,
    overallAlignmentTrend,
    dominantMood,
    longestHighEnergyStreak,
    longestLowEnergyStreak,
    longestHighAlignmentStreak,
    energyAlignmentCorrelation,
    observations,
  };
}

export function clearPatternHistory(): void {
  try {
    localStorage.removeItem("soulcodex.patternSummary.v1");
  } catch (e) {
    console.warn("[pattern-engine] Failed to clear pattern history:", e);
  }
}

export function savePatternSummary(summary: PatternSummary): void {
  try {
    localStorage.setItem("soulcodex.patternSummary.v1", JSON.stringify(summary));
  } catch (e) {
    console.warn("[pattern-engine] Failed to save pattern summary:", e);
  }
}

export function loadPatternSummary(): PatternSummary | null {
  try {
    const raw = localStorage.getItem("soulcodex.patternSummary.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version === 1) return parsed as PatternSummary;
    return null;
  } catch (e) {
    console.warn("[pattern-engine] Failed to load pattern summary:", e);
    return null;
  }
}
