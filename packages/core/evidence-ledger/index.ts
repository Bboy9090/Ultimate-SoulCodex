/**
 * Evidence Ledger
 *
 * Observability infrastructure for Soul Codex engines.
 * Every major output carries traceable evidence metadata.
 */

export type {
  EngineType,
  EvidenceConfidenceLevel,
  EvidenceEntry,
  EvidenceLedger,
  EvidenceGroupedByEngine,
  EvidenceSummary,
} from './types.js';

export {
  createEvidenceEntry,
  createLedger,
  groupEvidenceByEngine,
  findLowConfidenceClaims,
  findConflictingClaims,
  summarizeEvidenceLedger,
} from './ledger.js';

export { calculateConfidenceLabel, isHighConfidence, isLowConfidence, confidenceLabelToScore } from './confidence.js';

export {
  formatConfidenceAsPercent,
  formatConfidenceExplanation,
  formatEvidenceEntry,
  formatValue,
  formatSummaryAsText,
} from './format.js';

export {
  calcPersonalDayWithEvidence,
  calcPersonalYearWithEvidence,
  calcPersonalMonthWithEvidence,
  calcLifePathWithEvidence,
  calcExpressionWithEvidence,
  calcSoulUrgeWithEvidence,
  calcPersonalityWithEvidence,
} from './integrations.js';
