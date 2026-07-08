export type TimelineConfidenceLevel = "Very Low" | "Low" | "Moderate" | "High" | "Very High";

export interface SystemSignal {
  date: string;
  system: "personal-day" | "personal-month" | "personal-year" | "moon-phase" | "transit" | "timeline-phase";
  value: string | number;
  label: string;
  description?: string;
}

export interface LivedSignal {
  dateRange: { start: string; end: string };
  metric: "energy" | "alignment" | "mood";
  value: number | string;
  frequency?: number;
  percentage?: number;
}

export interface Match {
  systemSignal: SystemSignal;
  livedSignals: LivedSignal[];
  alignment: number; // 0-1 or 0-100
  description: string;
}

export interface Divergence {
  systemSignal: SystemSignal;
  livedSignals: LivedSignal[];
  expectedVsActual: string;
  description: string;
}

export interface TimelineIntelligenceSummary {
  version: 1;
  generatedAt: string;
  dateRange: { start: string; end: string } | null;
  sampleSize: number; // number of Daily Pulse entries analyzed
  confidence: TimelineConfidenceLevel;

  // What systems predicted
  systemSignals: SystemSignal[];

  // What user logged
  livedSignals: LivedSignal[];

  // Correspondence
  matches: Match[];
  divergences: Divergence[];
  alignmentScore: number; // 0-1 scale

  // Factual observations
  observations: string[];

  // Next step
  nextTrackingSuggestion: string | null;
}

export interface TimelineIntelligenceOptions {
  lookbackDays?: number;
  minDataPoints?: number;
}
