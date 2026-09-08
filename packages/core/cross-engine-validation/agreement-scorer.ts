/**
 * Agreement Scorer
 *
 * Calculates confidence scores when engines agree or partially agree.
 * Higher when multiple high-confidence engines concur.
 */

import type { EvidenceEntry } from '../evidence-ledger/types.js';

export interface AgreementScore {
  confidence: number; // 0-100
  reasoning: string[];
  engineCount: number;
  averageConfidence: number;
  hasHighConfidenceEngine: boolean;
}

export function scoreAgreement(entries: EvidenceEntry[]): AgreementScore {
  if (entries.length === 0) {
    return {
      confidence: 0,
      reasoning: ['No evidence entries to score'],
      engineCount: 0,
      averageConfidence: 0,
      hasHighConfidenceEngine: false,
    };
  }

  const engineCount = new Set(entries.map(e => e.engine)).size;
  const averageConfidence =
    entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length;
  const hasHighConfidenceEngine = entries.some(e => e.confidence >= 80);
  const verifiedEntries = entries.filter(e => e.confidenceLabel === 'verified');
  const highEntries = entries.filter(e =>
    ['verified', 'high'].includes(e.confidenceLabel)
  );

  let baseScore = averageConfidence;
  const reasoning: string[] = [];

  // Bonus for multiple independent engines agreeing
  if (engineCount >= 3) {
    baseScore = Math.min(100, baseScore + 10);
    reasoning.push(`${engineCount} independent engines agree (+10 confidence)`);
  } else if (engineCount === 2) {
    baseScore = Math.min(100, baseScore + 5);
    reasoning.push('2 engines agree (+5 confidence)');
  }

  // Bonus for verified inputs
  if (verifiedEntries.length === entries.length) {
    baseScore = Math.min(100, baseScore + 10);
    reasoning.push('All inputs verified (+10 confidence)');
  } else if (verifiedEntries.length > 0) {
    const bonus = Math.min(5, verifiedEntries.length * 2);
    baseScore = Math.min(100, baseScore + bonus);
    reasoning.push(`${verifiedEntries.length} engines use verified inputs (+${bonus} confidence)`);
  }

  // Bonus for consistency across high-confidence engines
  if (highEntries.length === entries.length) {
    baseScore = Math.min(100, baseScore + 5);
    reasoning.push('All engines report high+ confidence (+5 confidence)');
  }

  // Penalty if engines have mixed confidence
  const confidenceRange = Math.max(...entries.map(e => e.confidence)) -
    Math.min(...entries.map(e => e.confidence));
  if (confidenceRange > 40) {
    baseScore = Math.max(0, baseScore - 15);
    reasoning.push(`High confidence variance (-15 confidence): ${confidenceRange}% spread`);
  } else if (confidenceRange > 20) {
    baseScore = Math.max(0, baseScore - 5);
    reasoning.push(`Confidence variance (-5 confidence): ${confidenceRange}% spread`);
  }

  // Check reasoning depth (more reasoning = more thought went into it)
  const avgReasoningSteps = entries.reduce((sum, e) => sum + e.reasoning.length, 0) /
    entries.length;
  if (avgReasoningSteps >= 3) {
    baseScore = Math.min(100, baseScore + 5);
    reasoning.push(
      `Deep reasoning documented (+5 confidence): avg ${Math.round(avgReasoningSteps)} steps`
    );
  }

  return {
    confidence: Math.round(Math.max(0, Math.min(100, baseScore))),
    reasoning,
    engineCount,
    averageConfidence: Math.round(averageConfidence),
    hasHighConfidenceEngine,
  };
}

export function scoreDisagreement(entries: EvidenceEntry[]): number {
  if (entries.length < 2) return 0;

  // When engines disagree, lower score reflects uncertainty
  const averageConfidence =
    entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length;

  // Disagreement penalty
  const penalty = Math.min(
    30,
    10 * (entries.length - 1) // Penalty increases with more disagreeing engines
  );

  return Math.max(0, Math.round(averageConfidence - penalty));
}
