export type TimelinePhase =
  | "Ignition"
  | "Exposure"
  | "Construction"
  | "Expansion"
  | "Friction"
  | "Refinement"
  | "Integration"
  | "Legacy";

export type TimelineConfidence = "Full" | "Partial";

export interface TimelineOutput {
  phase: TimelinePhase;
  confidence: TimelineConfidence;
  reasons: string[];
  focus: string;
  do: string[];
  dont: string[];
  nextPhase: TimelinePhase;
  narrative: string;
}

export interface TimelineInput {
  profile: {
    birthDate?: string;
    birthTime?: string;
    name?: string;
    signals?: Record<string, unknown>;
    confidenceLabel?: string;
  };
  fullChart?: {
    planets?: {
      saturn?: { sign?: string; degree?: number };
      jupiter?: { sign?: string; degree?: number };
    };
    northNode?: { sign?: string; house?: number; degree?: number };
    southNode?: { sign?: string; house?: number; degree?: number };
  };
  currentDateISO: string;
}

export interface PhaseSignal {
  phase: TimelinePhase;
  weight: number;
  reason: string;
}
