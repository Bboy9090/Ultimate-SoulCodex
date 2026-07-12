/**
 * Conflict Analyzer
 *
 * Analyzes why engines produce different outputs on the same claim.
 * Surfaces data quality issues, stress overrides, and calculation differences.
 */

import type { EvidenceEntry } from '../evidence-ledger/types.js';

export interface ConflictExplanation {
  explanation: string;
  dataQualityIssue?: string;
  stressOverride?: boolean;
  severity: 'low' | 'medium' | 'high';
}

export function analyzeConflicts(entries: EvidenceEntry[]): ConflictExplanation[] {
  if (entries.length < 2) {
    return [];
  }

  const conflicts: ConflictExplanation[] = [];

  // Check for data quality differences
  const allLimitations = entries.flatMap(e => e.limitations);
  if (allLimitations.length > 0) {
    const limitation = allLimitations[0];
    conflicts.push({
      explanation: `Data quality impact: ${limitation}`,
      dataQualityIssue: limitation,
      severity: limitation.includes('unverified') ? 'high' : 'medium',
    });
  }

  // Check for low confidence in conflicting entries
  const lowConfidenceEntries = entries.filter(e => e.confidence < 60);
  if (lowConfidenceEntries.length > 0 && entries.some(e => e.confidence >= 80)) {
    conflicts.push({
      explanation: `Confidence variance: ${lowConfidenceEntries.length} engine(s) have lower confidence in this claim`,
      severity: 'medium',
    });
  }

  // Check for stress override patterns (predictive/behavior engines may override during stress)
  const predictiveEngines = entries.filter(e =>
    ['predictive', 'behavior', 'dominance'].includes(e.engine)
  );
  const staticEngines = entries.filter(e =>
    ['numerology', 'astrology', 'human-design'].includes(e.engine)
  );

  if (predictiveEngines.length > 0 && staticEngines.length > 0) {
    const predictiveValue = predictiveEngines[0]?.value;
    const staticValue = staticEngines[0]?.value;
    if (predictiveValue !== staticValue) {
      conflicts.push({
        explanation: `Engine type difference: Behavior/predictive engines may override static predictions during stress periods`,
        stressOverride: true,
        severity: 'medium',
      });
    }
  }

  // Check for sample size or data completeness issues
  const insufficientData = entries.filter(e =>
    e.limitations.some(l => l.includes('sample') || l.includes('data'))
  );
  if (insufficientData.length > 0 && insufficientData.length < entries.length) {
    conflicts.push({
      explanation: `${insufficientData.length} engine(s) report insufficient data for confident prediction`,
      severity: 'medium',
    });
  }

  return conflicts;
}

export function explainDisagreement(
  entries: EvidenceEntry[],
  engines: string[]
): string {
  if (entries.length < 2) return 'Insufficient data for comparison';

  const reasons: string[] = [];

  // Confidence variance
  const confidences = entries.map(e => e.confidence);
  const minConfidence = Math.min(...confidences);
  const maxConfidence = Math.max(...confidences);
  if (maxConfidence - minConfidence > 30) {
    reasons.push(
      `Confidence range: ${minConfidence}% - ${maxConfidence}% suggests data quality variance`
    );
  }

  // Input quality
  const inputCounts = entries.map(e => e.inputsUsed.length);
  if (Math.max(...inputCounts) - Math.min(...inputCounts) > 2) {
    reasons.push(
      'Some engines used different numbers of inputs, leading to different conclusions'
    );
  }

  // Engine-specific patterns
  if (entries.some(e => e.engine === 'predictive')) {
    reasons.push(
      'Predictive engines may diverge from static systems based on current conditions'
    );
  }

  return reasons.length > 0
    ? reasons.join('; ')
    : 'Engines use different calculation methods or weightings';
}
