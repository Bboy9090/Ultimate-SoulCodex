/**
 * Cross-Engine Validation Types
 *
 * Types for comparing and validating outputs across multiple Soul Codex engines.
 * Surfaces agreements, conflicts, and internal support signals when engines align or diverge.
 * Cross-system agreement is resonance/corroboration, not a vote that increases truth probability.
 */

import type { EvidenceEntry, EngineType } from '../evidence-ledger/types.js';

export type AgreementLevel = 'full' | 'partial' | 'conflict' | 'insufficient-data';

export interface EngineAgreement {
  claim: string;
  engines: EngineType[];
  agreementLevel: AgreementLevel;
  confidence: number; // 0-100 internal aggregate support index; not a truth probability
  reasonsForAgreement: string[];
  divergenceExplanation?: string; // Why engines diverge if not full agreement
}

export interface ValidationResult {
  readingId: string;
  agreements: EngineAgreement[];
  conflicts: ConflictAnalysis[];
  overallAgreementScore: number; // 0-100, percentage of claims with full agreement
  overallConfidence: number; // 0-100 internal aggregate support index across entries
  timestamp: string;
  version: string;
}

export interface ConflictAnalysis {
  claim: string;
  engines: {
    engine: EngineType;
    value: string | number | boolean | Record<string, unknown>;
    confidence: number;
    reasoning: string[];
  }[];
  likelyExplanation: string; // Why engines disagree
  dataQualityIssue?: string; // e.g., "birth time estimated", "limited sample size"
  stressOverride?: boolean; // Does one engine apply stress/override logic?
  suggestedResolution?: string; // Recommended interpretation
}

export interface ValidationReport {
  summary: {
    totalClaims: number;
    fullyAgreed: number;
    partiallyAgreed: number;
    conflicts: number;
    insufficientData: number;
    overallAgreementPercentage: number;
  };
  enginePerformance: {
    engine: EngineType;
    claimsContributed: number;
    averageConfidence: number; // internal support average; not a user-facing probability
    agreementRate: number; // % of claims where this engine agreed with others
  }[];
  keyFindings: string[];
  recommendations: string[];
}
