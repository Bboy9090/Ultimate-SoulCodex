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
  let hasNumerologySignal = false;

  // 1. Personal year numerology
  if (profile.birthDate) {
    const numSig = getNumerologySignal(profile.birthDate, currentDate);
    if (numSig) {
      signals.push(numSig);
      hasNumerologySignal = true;
    }
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

  // Confidence reflects the evidence actually used by the current Timeline
  // model. Birth time/location are not confidence inputs while time-dependent
  // astrology cycle claims remain quarantined.
  const profileConfidence = (profile.confidenceLabel ?? "").toLowerCase();
  const confidence: TimelineConfidence =
    hasNumerologySignal &&
    profileConfidence !== "partial" &&
    profileConfidence !== "unverified"
      ? "Full"
      : "Partial";

  // Normalize to the same confidence object used across the app.
  const badge = confidence === "Full" ? "verified" : "partial";
  const label = badge === "verified" ? "Verified" : "Partial";
  const reason =
    badge === "verified"
      ? "A governed Personal Year signal is available for Timeline phase scoring. Time-dependent astrology cycle claims are not included."
      : "Governed Personal Year evidence is missing or the profile is marked partial/unverified. Time-dependent astrology cycle claims are not included.";
  const aiAssuranceNote =
    "Timeline phase language is interpretive guidance based on the governed signals shown in the reasons list; it is not a prediction or guarantee.";

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
