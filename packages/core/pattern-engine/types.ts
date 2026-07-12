export type MoodType = "low" | "steady" | "charged" | "heavy" | "clear";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type AlignmentLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyPulseEntry {
  version: 1;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  energy: EnergyLevel;
  alignment: AlignmentLevel;
  theme?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConfidenceLevel = "Very Low" | "Low" | "Moderate" | "High" | "Very High";

export interface EnergyPattern {
  avgEnergy: number;
  minEnergy: number;
  maxEnergy: number;
  consistency: number;
  trend: "rising" | "falling" | "stable";
}

export interface AlignmentPattern {
  avgAlignment: number;
  minAlignment: number;
  maxAlignment: number;
  consistency: number;
  trend: "rising" | "falling" | "stable";
}

export interface MoodFrequency {
  mood: string;
  count: number;
  percentage: number;
}

export interface Streak {
  type: "high_energy" | "low_energy" | "high_alignment" | "low_alignment" | "mood_pattern";
  value: string | number;
  length: number;
  startDate: string;
  endDate: string;
}

export interface PatternMetrics {
  energy: EnergyPattern;
  alignment: AlignmentPattern;
  moodFrequencies: MoodFrequency[];
  streaks: Streak[];
}

export interface RollingWindow {
  days: 7 | 14 | 30;
  metrics: PatternMetrics;
  dataPoints: number;
  dateRange: { start: string; end: string } | null;
}

export interface PatternCorrelation {
  metric1: string;
  metric2: string;
  correlation: number;
  description: string;
}

export interface PatternSummary {
  version: 1;
  generatedAt: string;
  confidence: ConfidenceLevel;
  dataPoints: number;
  dateRange: { start: string; end: string } | null;

  // Rolling windows for different time scales
  window7d: RollingWindow;
  window14d: RollingWindow;
  window30d: RollingWindow;

  // Aggregate patterns
  overallEnergyTrend: "rising" | "falling" | "stable";
  overallAlignmentTrend: "rising" | "falling" | "stable";
  dominantMood?: string;

  // Notable patterns
  longestHighEnergyStreak?: Streak;
  longestLowEnergyStreak?: Streak;
  longestHighAlignmentStreak?: Streak;

  // Correlations
  energyAlignmentCorrelation: number;

  // Observations (factual only)
  observations: string[];
}

export interface PatternEngineOptions {
  lookbackDays?: number;
  minDataPoints?: number;
}
