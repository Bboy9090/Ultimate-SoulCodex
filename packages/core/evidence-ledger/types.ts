/**
 * Evidence Ledger Types
 *
 * Every major engine output carries traceable evidence metadata:
 * - What was claimed
 * - Why we believe it (reasoning)
 * - How confident we are (and why)
 * - What data fed it (inputs)
 * - What we didn't account for (limitations)
 * - Verification status of the inputs
 */

export type EngineType =
  | 'astrology'
  | 'numerology'
  | 'human-design'
  | 'behavior'
  | 'dominance'
  | 'synergy'
  | 'timeline'
  | 'pattern'
  | 'predictive'
  | 'interpretation';

export type EvidenceConfidenceLevel = 'verified' | 'high' | 'moderate' | 'partial' | 'low' | 'unverified';

export interface EvidenceEntry {
  id: string;
  engine: EngineType;
  claim: string;
  value: string | number | boolean | Record<string, unknown>;
  confidence: number; // 0-100
  confidenceLabel: EvidenceConfidenceLevel;
  inputsUsed: string[]; // e.g., ["birth_date_verified", "birth_time_estimated"]
  limitations: string[]; // e.g., ["No birth time provided", "Limited sample size"]
  reasoning: string[]; // e.g., ["Personal Year is 5 + current month 7 = 3", "Pattern matches historical data"]
  generatedAt: string; // ISO 8601 timestamp
  version: string; // e.g., "1.0"
}

export interface EvidenceLedger {
  readingId: string;
  entries: EvidenceEntry[];
  generatedAt: string;
  version: string;
}

export type EvidenceGroupedByEngine = Partial<Record<EngineType, EvidenceEntry[]>>;

export interface EvidenceSummary {
  totalClaims: number;
  averageConfidence: number;
  byConfidenceLevel: Record<EvidenceConfidenceLevel, number>;
  byEngine: Record<EngineType, number>;
  lowConfidenceClaims: EvidenceEntry[];
  conflictingClaims: Array<{
    engines: EngineType[];
    claim: string;
    conflicts: EvidenceEntry[];
  }>;
}
