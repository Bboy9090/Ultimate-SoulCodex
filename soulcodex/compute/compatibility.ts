import type { SoulSignals, CompatibilityScore, CompatibilityDimension } from "../types";

function normalizedValues(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function overlapCount(a: string[], b: string[]): number {
  const set = new Set(normalizedValues(a));
  return normalizedValues(b).filter((value) => set.has(value)).length;
}

function withheld(label: string, note: string): CompatibilityDimension {
  return { label, score: null, note };
}

export function compatibility(a: SoulSignals, b: SoulSignals): CompatibilityScore {
  // This legacy signal shape carries values, but it does not carry the provenance
  // required to prove astrology verification or distinguish direct behavioral
  // self-report from inferred/defaulted legacy fields. Those dimensions therefore
  // fail closed instead of manufacturing neutral or positive compatibility scores.
  const identity = withheld(
    "Identity",
    "Not scored here. Identity compatibility requires field-level verified astrology evidence for both people.",
  );

  const stress = withheld(
    "Stress",
    "Not scored here. Legacy stress-element fields may be inferred from questionnaire answers and are supporting reflection, not stable compatibility evidence.",
  );

  const decisions = withheld(
    "Decisions",
    "Not scored here. Decision-style compatibility requires direct self-report provenance for both people; legacy defaults are excluded.",
  );

  const aValues = normalizedValues(a.nonNegotiables);
  const bValues = normalizedValues(b.nonNegotiables);
  const hasDirectValues = aValues.length > 0 && bValues.length > 0;
  const valuesOverlap = hasDirectValues ? overlapCount(a.nonNegotiables, b.nonNegotiables) : 0;
  const valuesScore = hasDirectValues ? Math.min(100, 40 + valuesOverlap * 20) : null;
  const values: CompatibilityDimension = {
    label: "Values",
    score: valuesScore,
    note:
      valuesScore === null
        ? "Not scored. Both people need directly supplied non-negotiables before values compatibility can be compared."
        : valuesOverlap >= 2
          ? "Several directly supplied non-negotiables overlap. Treat this as a conversation starting point, not a relationship verdict."
          : "Few directly supplied non-negotiables overlap. Compare the actual priorities before drawing conclusions.",
  };

  // A single available dimension is not enough to claim an overall compatibility
  // percentage. Future evidence-aware callers may score additional dimensions.
  const scoredDimensions = [identity, stress, values, decisions].filter(
    (dimension) => typeof dimension.score === "number",
  );
  const overall =
    scoredDimensions.length >= 2
      ? Math.round(
          scoredDimensions.reduce((sum, dimension) => sum + (dimension.score ?? 0), 0) /
            scoredDimensions.length,
        )
      : null;

  const friction: string[] = [];
  const synergy: string[] = [];

  if (typeof values.score === "number" && values.score < 60) {
    friction.push("Your stated non-negotiables overlap only lightly; discuss the differences directly.");
  }
  if (typeof values.score === "number" && values.score >= 75) {
    synergy.push("Your stated non-negotiables show substantial overlap.");
  }

  return {
    overall,
    dimensions: { identity, stress, values, decisions },
    friction,
    synergy,
  };
}
