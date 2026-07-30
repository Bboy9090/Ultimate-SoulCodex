/**
 * Soul Codex Reading Types - Phase 1
 *
 * Tracks data integrity: verified ephemeris vs approximations
 * Never displays legacy approximations when verified data is available
 */

import type { BirthData } from "./types.js";

export type AstrologyDataStatus =
  | "verified_ephemeris"
  | "estimated_birth_window"
  | "date_only"
  | "legacy_approximation"
  | "unavailable";

export type EvidenceInputStatus =
  | "user_entered"
  | "document_verified"
  | "self_reported"
  | "system_imported";

export type EvidenceCalculationStatus =
  | "deterministic"
  | "ephemeris_verified"
  | "estimated"
  | "legacy"
  | "not_calculated";

export type EvidenceInterpretationStatus =
  | "direct"
  | "synthesized"
  | "provisional";

export interface EvidenceItem {
  value: string;
  inputStatus: EvidenceInputStatus;
  calculationStatus: EvidenceCalculationStatus;
  interpretationStatus: EvidenceInterpretationStatus;
  confidence: "high" | "moderate" | "low";
  timeStratum?: number; // milliseconds since birth
  calculationTrail?: string; // for audit: "R(9)+O(6)+B(2)..."
}

export interface AstrologyOutput {
  status: AstrologyDataStatus;
  sunSign: string;
  sunDegree: number;
  moonSign: string;
  moonDegree: number;
  ascendant?: string;
  ascendantDegree?: number;
  houses?: Array<{ number: number; sign: string; degree: number }>;
  remark?: string; // e.g. "Moon could be Virgo or Libra depending on birth time"
}

export interface NumerologyOutput {
  lifePathNumber: number;
  birthdayNumber: number;
  expressionNumber?: number;
  expressionStatus?: "provisional" | "confirmed";
  soulUrgeNumber?: number;
  personalYearNumber?: number;
}

export interface HumanDesignOutput {
  profileType: string; // e.g. "5/1"
  strategy: string;
  authority: string;
  type?: string;
}

export interface VerifiedSystems {
  astrology: AstrologyOutput;
  numerology?: NumerologyOutput;
  humanDesign?: HumanDesignOutput;
}

export interface CodexSnapshot {
  archetype: string;
  archetypeStatus: "provisional" | "complete";
  coreFormula: string;
  centralPattern: string;
  gift: string;
  tension: string;
  nextAction: string;
}

export interface EngineInsight {
  id: string;
  type: "identity" | "emotional" | "decision" | "relationship" | "stress" | "work" | "shadow" | "growth";
  title: string;
  observation: string;
  meaning: string;
  gift: string;
  shadow: string;
  action: string;
  evidenceRef: string;
}

export interface InteractionInsight {
  inputA: string;
  inputB: string;
  operator: "+" | "⇄" | "×";
  result: string;
  explanation: string;
  pattern: string;
  recommendation: string;
  strength: "very-high" | "high" | "moderate" | "low";
}

export interface Interactions {
  reinforcements: InteractionInsight[];
  balances: InteractionInsight[];
  conflicts: InteractionInsight[];
}

export interface DominantSignal {
  theme: string;
  influence: "Very High" | "High" | "Moderate" | "Low";
  reasoning: string;
}

export interface ActionPlan {
  avoid: string;
  today: string;
  thisWeek: string;
  relationshipAction: string;
  workAction: string;
}

export interface TechnicalRecord {
  birthData: BirthData;
  calculationMethod: string;
  houseSystem: string;
  zodiac: string;
  ephemeris: string;
  engineVersion: string;
  generatedAt: string;
  disclaimer: string;
}

export interface SoulCodexReading {
  meta: {
    subjectName: string;
    birthData: BirthData;
    calculationStatus: AstrologyDataStatus;
    confidence: "high" | "moderate" | "low";
    engineVersion: string;
    generatedAt?: string;
  };
  snapshot: CodexSnapshot;
  verifiedSystems: VerifiedSystems;
  engines: EngineInsight[];
  interactions: Interactions;
  dominance: DominantSignal[];
  actionPlan: ActionPlan;
  technicalAppendix?: TechnicalRecord;
}

export interface ReadingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
