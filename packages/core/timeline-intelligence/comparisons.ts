import type { Match, Divergence, SystemSignal, LivedSignal } from "./types.js";
import { calculateEnergyAlignmentMatch } from "./scoring.js";

export function compareSystemToLived(
  systemSignal: SystemSignal,
  livedSignals: LivedSignal[]
): { match: Match | null; divergence: Divergence | null } {
  if (livedSignals.length === 0) {
    return { match: null, divergence: null };
  }

  // Extract energy and alignment data if available
  const energySignals = livedSignals.filter((s) => s.metric === "energy");
  const alignmentSignals = livedSignals.filter((s) => s.metric === "alignment");
  const moodSignals = livedSignals.filter((s) => s.metric === "mood");

  let alignmentScore = 0.5; // Default neutral

  // Calculate alignment score based on system type
  if (energySignals.length > 0 && alignmentSignals.length > 0) {
    const avgEnergy = (energySignals[0].value as number) || 3;
    const avgAlignment = (alignmentSignals[0].value as number) || 3;
    alignmentScore = calculateEnergyAlignmentMatch(systemSignal.label, avgEnergy, avgAlignment);
  }

  // Determine if this is a match or divergence based on threshold
  const MATCH_THRESHOLD = 0.6;

  if (alignmentScore >= MATCH_THRESHOLD) {
    const match: Match = {
      systemSignal,
      livedSignals,
      alignment: alignmentScore,
      description: describeMatch(systemSignal, livedSignals, alignmentScore),
    };
    return { match, divergence: null };
  } else {
    const divergence: Divergence = {
      systemSignal,
      livedSignals,
      expectedVsActual: generateExpectationVsActual(systemSignal, livedSignals),
      description: describeDivergence(systemSignal, livedSignals),
    };
    return { match: null, divergence };
  }
}

function describeMatch(signal: SystemSignal, lived: LivedSignal[], alignment: number): string {
  const alignmentPct = Math.round(alignment * 100);
  const energyLived = lived.find((s) => s.metric === "energy");
  const alignmentLived = lived.find((s) => s.metric === "alignment");

  if (signal.system === "personal-day") {
    if (energyLived) {
      return `${signal.label} predicted steady energy. Logged energy averaged ${energyLived.value}. (${alignmentPct}% alignment)`;
    }
  }

  if (signal.system === "moon-phase") {
    if (signal.label.includes("Full Moon")) {
      return `Full Moon phase predicted high energy. Logged ${energyLived?.value || "variable"} energy. (${alignmentPct}% alignment)`;
    }
    if (signal.label.includes("New Moon")) {
      return `New Moon phase predicted introspection. Logged ${alignmentLived?.value || "varied"} alignment. (${alignmentPct}% alignment)`;
    }
  }

  return `System prediction matched lived data at ${alignmentPct}% alignment.`;
}

function describeDivergence(signal: SystemSignal, lived: LivedSignal[]): string {
  const energyLived = lived.find((s) => s.metric === "energy");
  const alignmentLived = lived.find((s) => s.metric === "alignment");

  if (signal.system === "personal-day") {
    return `${signal.label} suggested one pattern, but logged energy was ${energyLived?.value || "different"}.`;
  }

  if (signal.system === "moon-phase") {
    return `${signal.label} phase did not match logged experience: ${alignmentLived?.value || "alignment was different"}.`;
  }

  return `System prediction diverged from lived data.`;
}

function generateExpectationVsActual(signal: SystemSignal, lived: LivedSignal[]): string {
  const energyLived = lived.find((s) => s.metric === "energy");

  if (signal.system === "personal-day") {
    return `Expected: ${signal.description || signal.label}. Actual: Energy averaged ${energyLived?.value || "N/A"}.`;
  }

  if (signal.system === "moon-phase") {
    return `Expected: ${signal.description || signal.label}. Actual: Lived data showed different pattern.`;
  }

  return `Expected: ${signal.description}. Actual: See lived signals.`;
}
