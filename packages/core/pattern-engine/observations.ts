import type { DailyPulseEntry, ConfidenceLevel, Streak } from "./types.js";

export interface ObservationContext {
  confidence: ConfidenceLevel;
  energyTrend: "rising" | "falling" | "stable";
  alignmentTrend: "rising" | "falling" | "stable";
  dominantMood?: string;
  energyAlignmentCorrelation: number;
  longestHighEnergyStreak?: Streak;
  longestLowEnergyStreak?: Streak;
}

export function generateObservations(
  entries: DailyPulseEntry[],
  context: ObservationContext
): string[] {
  const observations: string[] = [];

  if (entries.length === 0) {
    observations.push("No pulse data logged. Observations will appear as data accumulates.");
    return observations;
  }

  // Energy observation
  const energyValues = entries.map((e) => e.energy);
  const avgEnergy = Math.round((energyValues.reduce((a, b) => a + b, 0) / energyValues.length) * 10) / 10;
  observations.push(`Energy averaged ${avgEnergy} over ${entries.length} logged entries.`);

  // Energy trend
  if (context.energyTrend === "rising") {
    observations.push("Energy levels show a rising trend across the period.");
  } else if (context.energyTrend === "falling") {
    observations.push("Energy levels show a falling trend across the period.");
  }

  // Alignment observation
  const alignmentValues = entries.map((e) => e.alignment);
  const avgAlignment =
    Math.round((alignmentValues.reduce((a, b) => a + b, 0) / alignmentValues.length) * 10) / 10;
  observations.push(`Alignment averaged ${avgAlignment} over the same period.`);

  // Alignment trend
  if (context.alignmentTrend === "rising") {
    observations.push("Alignment levels show a rising trend across the period.");
  } else if (context.alignmentTrend === "falling") {
    observations.push("Alignment levels show a falling trend across the period.");
  }

  // Mood observation
  if (context.dominantMood) {
    const moodCount = entries.filter((e) => e.mood === context.dominantMood).length;
    const moodPercentage = Math.round((moodCount / entries.length) * 100);
    observations.push(`${capitalizeFirst(context.dominantMood)} was logged ${moodPercentage}% of the time.`);
  }

  // Energy-alignment correlation
  if (context.energyAlignmentCorrelation > 0.5) {
    observations.push(
      "Energy and alignment show strong positive correlation — high energy entries tend to have high alignment."
    );
  } else if (context.energyAlignmentCorrelation > 0.2) {
    observations.push(
      "Energy and alignment show moderate positive correlation — some alignment between these metrics."
    );
  } else if (context.energyAlignmentCorrelation < -0.5) {
    observations.push(
      "Energy and alignment show inverse correlation — high energy entries often have lower alignment."
    );
  }

  // Streak observations
  if (context.longestHighEnergyStreak && context.longestHighEnergyStreak.length >= 2) {
    const streak = context.longestHighEnergyStreak;
    observations.push(
      `Longest high-energy streak: ${streak.length} days (${streak.startDate} to ${streak.endDate}).`
    );
  }

  if (context.longestLowEnergyStreak && context.longestLowEnergyStreak.length >= 2) {
    const streak = context.longestLowEnergyStreak;
    observations.push(
      `Longest low-energy streak: ${streak.length} days (${streak.startDate} to ${streak.endDate}).`
    );
  }

  // Confidence caveat
  if (context.confidence === "Very Low" || context.confidence === "Low") {
    observations.push("Note: Limited data. Patterns become clearer with more entries.");
  }

  return observations;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
