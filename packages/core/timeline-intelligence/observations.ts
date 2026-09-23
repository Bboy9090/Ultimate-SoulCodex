import type { Match, Divergence, TimelineIntelligenceSummary, TimelineConfidenceLevel } from "./types.js";

export function generateObservations(
  matches: Match[],
  divergences: Divergence[],
  alignmentScore: number,
  sampleSize: number
): string[] {
  const observations: string[] = [];

  if (sampleSize === 0) {
    observations.push("No logged data to compare yet. Log at least 7 Daily Pulse entries to begin Timeline Intelligence.");
    return observations;
  }

  // Overall alignment observation
  const alignmentPct = Math.round(alignmentScore * 100);
  if (alignmentScore >= 0.7) {
    observations.push(
      `System signals and lived data aligned on ${matches.length} of ${matches.length + divergences.length} comparisons (${alignmentPct}%).`
    );
  } else if (alignmentScore >= 0.5) {
    observations.push(
      `Moderate alignment: system signals corresponded with ${alignmentPct}% of the comparisons.`
    );
  } else {
    observations.push(
      `System signals differed from lived data on ${divergences.length} of ${matches.length + divergences.length} comparisons.`
    );
  }

  // Match observations
  if (matches.length > 0) {
    const matchExamples = matches.slice(0, 2);
    matchExamples.forEach((m) => {
      observations.push(`✓ ${m.description}`);
    });
  }

  // Divergence observations
  if (divergences.length > 0) {
    const divergenceExamples = divergences.slice(0, 2);
    divergenceExamples.forEach((d) => {
      observations.push(`○ ${d.description}`);
    });
  }

  // Observation-window caveat
  if (sampleSize < 14) {
    observations.push("Note: Early data collection. Patterns become clearer with 14+ entries.");
  } else if (sampleSize >= 30) {
    observations.push("The 30-entry analysis window is filled. This increases coverage; it does not establish correctness or causation.");
  }

  return observations;
}

export function generateNextSuggestion(
  matches: Match[],
  divergences: Divergence[],
  alignmentScore: number,
  sampleSize: number
): string | null {
  if (sampleSize < 7) {
    return null;
  }

  if (alignmentScore >= 0.7) {
    return "Systems and lived experience are strongly aligned. Continue daily logging to confirm this pattern.";
  }

  if (divergences.length > 0) {
    const firstDivergence = divergences[0];
    return `Track closely: ${firstDivergence.systemSignal.label} differed from your logged experience. Watch this over the next 14 days.`;
  }

  return "Continue logging to build stronger signal. Patterns need consistent data to confirm.";
}
