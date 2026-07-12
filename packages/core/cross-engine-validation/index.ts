/**
 * Cross-Engine Validation Framework
 *
 * Compares evidence across Soul Codex engines to surface agreements,
 * conflicts, and data quality issues.
 */

export type { EngineAgreement, ValidationResult, ConflictAnalysis, AgreementLevel, ValidationReport } from './types.js';

export { validateEngineAgreement } from './validator.js';

export { analyzeConflicts, explainDisagreement, type ConflictExplanation } from './conflict-analyzer.js';

export { scoreAgreement, scoreDisagreement, type AgreementScore } from './agreement-scorer.js';
