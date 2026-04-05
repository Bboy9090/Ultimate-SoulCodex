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

export type ConfidenceBadge = "verified" | "partial" | "unverified";

export interface ConfidenceInfo {
  badge: ConfidenceBadge;
  label: "Verified" | "Partial" | "Unverified";
  reason: string;
  aiAssuranceNote?: string;
}

export interface TimelineOutput {
  phase: TimelinePhase;
  /** Canonical confidence for UI. */
  confidence: ConfidenceInfo;
  /** Legacy confidence for older clients. */
  confidenceLabel: TimelineConfidence;
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
    confidence?: { badge?: string; label?: string; reason?: string; aiAssuranceNote?: string };
    meta?: { confidence?: { badge?: string; label?: string; reason?: string; aiAssuranceNote?: string } };
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
