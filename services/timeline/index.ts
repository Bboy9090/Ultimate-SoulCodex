import type { TimelineInput, TimelineOutput, TimelineConfidence } from "./types";
import { getNumerologySignal } from "./numerology";
import { getAstrologySignals } from "./astrology";
import { getThemeSignals, resolvePhase, nextPhaseFor } from "./engine";
import { buildNarrative } from "./narrative";
import { PHASES } from "./phases";

export function generateTimeline(input: TimelineInput): TimelineOutput {
  const { profile, fullChart, currentDateISO } = input;
  const currentDate = new Date(currentDateISO);

  const signals = [];

  // 1. Personal year numerology
  if (profile.birthDate) {
    const numSig = getNumerologySignal(profile.birthDate, currentDate);
    if (numSig) signals.push(numSig);
  }

  // 2. Astrology cycle markers
  if (profile.birthDate) {
    const astroSigs = getAstrologySignals(profile.birthDate, currentDate, fullChart);
    signals.push(...astroSigs);
  }

  // 3. Profile themes from Codex30 (can be at top-level or nested in signals)
  const profileAny = profile as Record<string, unknown>;
  const topThemes =
    (profileAny.topThemes as { tag: string; score: number }[] | undefined) ??
    ((profileAny.signals as Record<string, unknown> | undefined)?.topThemes as
      | { tag: string; score: number }[]
      | undefined);
  if (Array.isArray(topThemes)) {
    const themeSigs = getThemeSignals(topThemes);
    signals.push(...themeSigs);
  }

  // Resolve dominant phase
  const phase = resolvePhase(signals);
  const next = nextPhaseFor(phase);
  const def = PHASES[phase];

  // Build reasons list (deduplicated, sorted by weight)
  const sortedReasons = [...signals]
    .sort((a, b) => b.weight - a.weight)
    .map((s) => s.reason)
    .filter(Boolean);

  const reasons = Array.from(new Set(sortedReasons)).slice(0, 5);

  // Determine confidence
  const hasBirthTime = Boolean(
    profile.birthTime && profile.birthTime.trim().length > 0
  );
  const profileConfidence = (profile.confidenceLabel ?? "").toLowerCase();
  let confidence: TimelineConfidence = "Full";
  if (!hasBirthTime || profileConfidence === "partial" || profileConfidence === "unverified") {
    confidence = "Partial";
  }

  // Normalize to the same confidence object used across the app.
  const badge = confidence === "Full" ? "verified" : "partial";
  const label = badge === "verified" ? "Verified" : "Partial";
  const reason =
    badge === "verified"
      ? "Birth time and location are set — full chart layer (houses, rising) is included."
      : "Birth time unknown or not trusted — rising sign and houses are omitted from timeline-sensitive claims.";
  const aiAssuranceNote =
    badge === "verified"
      ? "Timeline timing is derived from your birth record and major cycles. Interpretive language is guidance, not a guarantee."
      : "Timeline themes still apply, but time-specific timing is softened without a verified birth time.";

  const narrative = buildNarrative(phase, confidence, reasons);

  return {
    phase,
    confidenceLabel: confidence,
    confidence: { badge, label, reason, aiAssuranceNote },
    reasons,
    focus: def.focus,
    do: def.do,
    dont: def.dont,
    nextPhase: next,
    narrative,
  };
}
