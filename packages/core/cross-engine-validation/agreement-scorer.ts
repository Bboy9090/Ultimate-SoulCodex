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

  const engineCount = new Set(entries.map((entry) => entry.engine)).size;
  const averageConfidence =
    entries.reduce((sum, entry) => sum + entry.confidence, 0) / entries.length;
  const hasHighConfidenceEngine = entries.some((entry) => entry.confidence >= 80);

  // Agreement is useful for organizing resonance/corroboration, but engine
  // count must not mechanically increase epistemic certainty. Each entry's
  // own support score already reflects its input and verification quality.
  let supportScore = averageConfidence;
  const reasoning: string[] = [
    engineCount > 1
      ? `${engineCount} engines express the same claim; treated as resonance/corroboration, not extra proof`
      : 'Only one engine contributes to this claim',
  ];

  // Mixed source-support levels justify a conservative aggregate, but the
  // penalty depends on support variance rather than the number of engines.
  const confidenceRange =
    Math.max(...entries.map((entry) => entry.confidence)) -
    Math.min(...entries.map((entry) => entry.confidence));
  if (confidenceRange > 40) {
    supportScore = Math.max(0, supportScore - 15);
    reasoning.push('Wide source-support variance detected; aggregate support reduced conservatively');
  } else if (confidenceRange > 20) {
    supportScore = Math.max(0, supportScore - 5);
    reasoning.push('Moderate source-support variance detected; aggregate support reduced conservatively');
  }

  reasoning.push(
    'No bonus is awarded for engine count, repeated symbolic agreement, verification labels already represented in entry support, or reasoning length',
  );

  return {
    confidence: Math.round(Math.max(0, Math.min(100, supportScore))),
    reasoning,
    engineCount,
    averageConfidence: Math.round(averageConfidence),
    hasHighConfidenceEngine,
  };
}

export function scoreDisagreement(entries: EvidenceEntry[]): number {
  if (entries.length < 2) return 0;

  const averageConfidence =
    entries.reduce((sum, entry) => sum + entry.confidence, 0) / entries.length;

  // Conflict is represented once. Additional symbolic engines must not
  // mechanically make disagreement "more uncertain" simply by existing.
  const conflictAdjustment = 10;
  return Math.max(0, Math.round(averageConfidence - conflictAdjustment));
}
