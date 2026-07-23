import type { TimelineIntelligenceSummary, TimelineIntelligenceOptions, SystemSignal, LivedSignal, Match, Divergence } from "./types.js";
import { deriveTimelineConfidence, canShowTimelineIntelligence } from "./confidence.js";
import { compareSystemToLived } from "./comparisons.js";
import { calculateAlignmentScore } from "./scoring.js";
import { generateObservations, generateNextSuggestion } from "./observations.js";

export * from "./types.js";
export * from "./scoring.js";
export * from "./comparisons.js";
export * from "./observations.js";
export * from "./confidence.js";

export function generateTimelineIntelligence(
  systemSignals: SystemSignal[],
  livedSignals: LivedSignal[],
  options: TimelineIntelligenceOptions = {}
): TimelineIntelligenceSummary {
  const lookbackDays = options.lookbackDays || 30;
  const minDataPoints = options.minDataPoints || 1;

  const sampleSize = livedSignals.length;
  const confidence = deriveTimelineConfidence(sampleSize);

  // Organize lived signals by date range
  const allDates = livedSignals
    .map((s) => [s.dateRange.start, s.dateRange.end])
    .flat()
    .sort();

  const dateRange =
    allDates.length > 0
      ? {
          start: allDates[0],
          end: allDates[allDates.length - 1],
        }
      : null;

  // Compare each system signal against lived data
  const matches: Match[] = [];
  const divergences: Divergence[] = [];

  systemSignals.forEach((signal) => {
    const comparison = compareSystemToLived(signal, livedSignals);
    if (comparison.match) {
      matches.push(comparison.match);
    }
    if (comparison.divergence) {
      divergences.push(comparison.divergence);
    }
  });

  // Calculate alignment score
  const alignmentScore = calculateAlignmentScore(matches, divergences);

  // Generate observations
  const observations = generateObservations(matches, divergences, alignmentScore, sampleSize);

  // Generate next tracking suggestion
  const nextTrackingSuggestion = generateNextSuggestion(
    matches,
    divergences,
    alignmentScore,
    sampleSize
  );

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    dateRange,
    sampleSize,
    confidence,
    systemSignals,
    livedSignals,
    matches,
    divergences,
    alignmentScore,
    observations,
    nextTrackingSuggestion,
  };
}

export function clearTimelineIntelligenceCache(): void {
  try {
    localStorage.removeItem("soulcodex.timelineIntelligence.v1");
  } catch (e) {
    console.warn("[timeline-intelligence] Failed to clear cache:", e);
  }
}

export function saveTimelineIntelligence(summary: TimelineIntelligenceSummary): void {
  try {
    localStorage.setItem("soulcodex.timelineIntelligence.v1", JSON.stringify(summary));
  } catch (e) {
    console.warn("[timeline-intelligence] Failed to save summary:", e);
  }
}

export function loadTimelineIntelligence(): TimelineIntelligenceSummary | null {
  try {
    const raw = localStorage.getItem("soulcodex.timelineIntelligence.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version === 1) return parsed as TimelineIntelligenceSummary;
    return null;
  } catch (e) {
    console.warn("[timeline-intelligence] Failed to load summary:", e);
    return null;
  }
}
