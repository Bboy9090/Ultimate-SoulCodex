import type { Match, Divergence } from "./types.js";

export function generateObservations(
  matches: Match[],
  divergences: Divergence[],
  alignmentScore: number,
  sampleSize: number,
): string[] {
  const observations: string[] = [];

  if (sampleSize === 0) {
    observations.push(
      "No logged data to compare yet. Log at least 7 Daily Pulse entries to begin Timeline Intelligence.",
    );
    return observations;
  }

  const comparisonCount = matches.length + divergences.length;
  if (comparisonCount === 0) {
    observations.push(
      "No supported signal-to-lived-data comparison is available for the current inputs. Logged data is retained, but no match or divergence claim is made.",
    );
  } else {
    const alignmentPct = Math.round(alignmentScore * 100);

    if (alignmentScore >= 0.7) {
      observations.push(
        `Modeled signals corresponded with logged data on ${matches.length} of ${comparisonCount} supported comparisons (aggregate correspondence ${alignmentPct}%).`,
      );
    } else if (alignmentScore >= 0.5) {
      observations.push(
        `Mixed correspondence: the supported comparison rules produced an aggregate score of ${alignmentPct}% across ${comparisonCount} comparisons.`,
      );
    } else {
      observations.push(
        `Modeled signals differed from logged data on ${divergences.length} of ${comparisonCount} supported comparisons.`,
      );
    }
  }

  for (const match of matches.slice(0, 2)) {
    observations.push(`✓ ${match.description}`);
  }

  for (const divergence of divergences.slice(0, 2)) {
    observations.push(`○ ${divergence.description}`);
  }

  if (sampleSize < 14) {
    observations.push(
      "Note: this is an early observation window. More entries increase coverage, not certainty.",
    );
  } else if (sampleSize >= 30) {
    observations.push(
      "The 30-entry analysis window is filled. This increases coverage; it does not establish correctness, causation, or predictive accuracy.",
    );
  }

  return observations;
}

export function generateNextSuggestion(
  matches: Match[],
  divergences: Divergence[],
  alignmentScore: number,
  sampleSize: number,
): string | null {
  if (sampleSize < 7) {
    return null;
  }

  const comparisonCount = matches.length + divergences.length;
  if (comparisonCount === 0) {
    return "Continue logging. The current symbolic signals do not yet have a supported comparison rule for the available lived metrics.";
  }

  if (alignmentScore >= 0.7) {
    return "The modeled signals and logged metrics corresponded in this window. Keep tracking to see whether that correspondence persists.";
  }

  if (divergences.length > 0) {
    const firstDivergence = divergences[0];
    return `Keep observing: ${firstDivergence.systemSignal.label} differed from the logged metrics under its predefined comparison rule. See whether that difference persists over the next 14 days.`;
  }

  return "Continue logging to expand the observation window. More entries can show whether the current correspondence pattern persists.";
}
