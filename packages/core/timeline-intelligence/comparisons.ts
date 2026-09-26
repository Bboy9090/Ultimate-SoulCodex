import type {
  Match,
  Divergence,
  SystemSignal,
  LivedSignal,
} from "./types.js";
import { calculateEnergyAlignmentMatch } from "./scoring.js";

function numericMetric(
  livedSignals: LivedSignal[],
  metric: "energy" | "alignment",
): number | null {
  const signal = livedSignals.find((entry) => entry.metric === metric);
  if (!signal || typeof signal.value !== "number") return null;
  return Number.isFinite(signal.value) ? signal.value : null;
}

export function compareSystemToLived(
  systemSignal: SystemSignal,
  livedSignals: LivedSignal[],
): { match: Match | null; divergence: Divergence | null } {
  if (livedSignals.length === 0) {
    return { match: null, divergence: null };
  }

  const livedEnergy = numericMetric(livedSignals, "energy");
  const livedAlignment = numericMetric(livedSignals, "alignment");

  // A comparison is not eligible unless both required lived metrics exist and
  // the symbolic signal has an explicit comparison model.
  if (livedEnergy === null || livedAlignment === null) {
    return { match: null, divergence: null };
  }

  const alignmentScore = calculateEnergyAlignmentMatch(
    systemSignal.label,
    livedEnergy,
    livedAlignment,
  );
  if (alignmentScore === null) {
    return { match: null, divergence: null };
  }

  const MATCH_THRESHOLD = 0.6;

  if (alignmentScore >= MATCH_THRESHOLD) {
    return {
      match: {
        systemSignal,
        livedSignals,
        alignment: alignmentScore,
        description: describeMatch(
          systemSignal,
          livedSignals,
          alignmentScore,
        ),
      },
      divergence: null,
    };
  }

  return {
    match: null,
    divergence: {
      systemSignal,
      livedSignals,
      expectedVsActual: generateModelVsObserved(
        systemSignal,
        livedSignals,
      ),
      description: describeDivergence(systemSignal, livedSignals),
    },
  };
}

function describeMatch(
  signal: SystemSignal,
  lived: LivedSignal[],
  alignment: number,
): string {
  const alignmentPct = Math.round(alignment * 100);
  const energyLived = lived.find((entry) => entry.metric === "energy");
  const alignmentLived = lived.find(
    (entry) => entry.metric === "alignment",
  );

  if (signal.system === "personal-day" && energyLived) {
    return (
      `${signal.label} used a predefined reflection mapping; logged energy was ` +
      `${energyLived.value}. The modeled correspondence score was ${alignmentPct}%.`
    );
  }

  if (signal.system === "moon-phase") {
    const normalized = signal.label.toLowerCase();
    if (normalized.includes("full moon")) {
      return (
        `For this reflection experiment, Full Moon was mapped to higher energy; ` +
        `logged energy was ${energyLived?.value ?? "unavailable"}. ` +
        `Modeled correspondence: ${alignmentPct}%.`
      );
    }
    if (normalized.includes("new moon")) {
      return (
        `For this reflection experiment, New Moon was mapped to a lower-energy, ` +
        `inward pattern; logged alignment was ${alignmentLived?.value ?? "unavailable"}. ` +
        `Modeled correspondence: ${alignmentPct}%.`
      );
    }
  }

  return `The modeled signal corresponded with the logged metrics at ${alignmentPct}% within this comparison rule.`;
}

function describeDivergence(
  signal: SystemSignal,
  lived: LivedSignal[],
): string {
  const energyLived = lived.find((entry) => entry.metric === "energy");
  const alignmentLived = lived.find(
    (entry) => entry.metric === "alignment",
  );

  if (signal.system === "personal-day") {
    return (
      `${signal.label}'s predefined reflection mapping differed from the logged metrics; ` +
      `energy was ${energyLived?.value ?? "unavailable"}.`
    );
  }

  if (signal.system === "moon-phase") {
    return (
      `${signal.label}'s predefined reflection mapping differed from the logged metrics; ` +
      `alignment was ${alignmentLived?.value ?? "unavailable"}.`
    );
  }

  return "The modeled signal differed from the logged metrics.";
}

function generateModelVsObserved(
  signal: SystemSignal,
  lived: LivedSignal[],
): string {
  const energyLived = lived.find((entry) => entry.metric === "energy");
  const alignmentLived = lived.find(
    (entry) => entry.metric === "alignment",
  );

  return (
    `Model: ${signal.description || signal.label}. ` +
    `Observed: energy ${energyLived?.value ?? "N/A"}; ` +
    `alignment ${alignmentLived?.value ?? "N/A"}.`
  );
}
