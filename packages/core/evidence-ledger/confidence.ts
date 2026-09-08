/**
 * Confidence Calculation & Labeling
 *
 * Converts raw confidence scores (0-100) to human-readable labels
 * based on input quality and reasoning strength.
 */

import type { EvidenceConfidenceLevel } from './types.js';

export function calculateConfidenceLabel(
  confidenceScore: number,
  inputQuality: 'verified' | 'partial' | 'estimated' | 'unverified',
  reasoningStrength: number // 0-100, based on pattern match or statistical support
): EvidenceConfidenceLevel {
  // Verified inputs with strong reasoning → high confidence
  if (inputQuality === 'verified' && reasoningStrength >= 80) {
    return confidenceScore >= 90 ? 'verified' : 'high';
  }

  // Verified inputs but weaker reasoning → moderate
  if (inputQuality === 'verified' && reasoningStrength >= 50) {
    return confidenceScore >= 75 ? 'high' : 'moderate';
  }

  // Partial inputs (e.g., birth date but no time) → partial/moderate
  if (inputQuality === 'partial') {
    return confidenceScore >= 70 ? 'moderate' : 'partial';
  }

  // Estimated inputs → low/partial
  if (inputQuality === 'estimated') {
    return confidenceScore >= 60 ? 'partial' : 'low';
  }

  // Unverified inputs → low/unverified
  return confidenceScore >= 40 ? 'low' : 'unverified';
}

export function isHighConfidence(label: EvidenceConfidenceLevel): boolean {
  return label === 'verified' || label === 'high';
}

export function isLowConfidence(label: EvidenceConfidenceLevel): boolean {
  return label === 'low' || label === 'unverified';
}

export function confidenceLabelToScore(label: EvidenceConfidenceLevel): number {
  const scores: Record<EvidenceConfidenceLevel, number> = {
    verified: 95,
    high: 85,
    moderate: 70,
    partial: 55,
    low: 35,
    unverified: 15,
  };
  return scores[label];
}
