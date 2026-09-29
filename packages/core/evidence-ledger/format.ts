/**
 * Evidence Formatting & Display
 *
 * Helpers for presenting evidence to users in a readable way.
 */

import type {
  EvidenceConfidenceLevel,
  EvidenceEntry,
  EvidenceSummary,
} from './types.js';

/**
 * Internal diagnostic formatter.
 *
 * Numeric confidence weights are useful for engine ranking and threshold logic,
 * but they are not empirical probabilities that a symbolic interpretation is
 * "true". User-facing surfaces should prefer formatConfidenceAsSupportLabel().
 */
export function formatConfidenceAsPercent(confidence: number): string {
  return `${Math.round(confidence)}%`;
}

export function formatConfidenceAsSupportLabel(
  label: EvidenceConfidenceLevel,
): string {
  const labels: Record<EvidenceConfidenceLevel, string> = {
    verified: 'Verified source support',
    high: 'High source support',
    moderate: 'Moderate source support',
    partial: 'Partial source support',
    low: 'Low source support',
    unverified: 'Unverified source support',
  };
  return labels[label];
}

export function formatConfidenceExplanation(
  label: EvidenceConfidenceLevel,
): string {
  const explanations: Record<EvidenceConfidenceLevel, string> = {
    verified:
      'The relevant calculation or source evidence passed its approved verification contract.',
    high:
      'The claim has strong source/calculation support, but the label is not a probability of psychological truth.',
    moderate:
      'The claim has usable support with meaningful limitations or incomplete verification.',
    partial:
      'Only part of the required evidence is available or independently qualified.',
    low:
      'The claim has substantial evidence limitations and should be treated cautiously.',
    unverified:
      'The claim has not passed a verification contract and should not be presented as established fact.',
  };
  return explanations[label];
}

export function formatEvidenceEntry(entry: EvidenceEntry): {
  claim: string;
  value: string;
  confidence: string;
  inputs: string;
  reasoning: string;
  limitations: string;
} {
  return {
    claim: entry.claim,
    value: formatValue(entry.value),
    confidence: formatConfidenceAsSupportLabel(entry.confidenceLabel),
    inputs: entry.inputsUsed.join(', ') || 'No inputs tracked',
    reasoning: entry.reasoning.join(' → ') || 'No reasoning provided',
    limitations: entry.limitations.join('; ') || 'No known limitations',
  };
}

export function formatValue(value: string | number | boolean | Record<string, unknown>): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  return JSON.stringify(value);
}

export function formatSummaryAsText(summary: EvidenceSummary): string {
  const lines: string[] = [];

  lines.push(`Total Claims: ${summary.totalClaims}`);
  lines.push('Support tiers describe provenance/calculation support, not probability.');
  lines.push('');

  lines.push('By Support Tier:');
  for (const [level, count] of Object.entries(summary.byConfidenceLevel)) {
    if (count > 0) {
      lines.push(`  ${level}: ${count}`);
    }
  }
  lines.push('');

  lines.push('By Engine:');
  for (const [engine, count] of Object.entries(summary.byEngine)) {
    lines.push(`  ${engine}: ${count}`);
  }

  if (summary.lowConfidenceClaims.length > 0) {
    lines.push('');
    lines.push(`Low Confidence Claims (${summary.lowConfidenceClaims.length}):`);
    for (const claim of summary.lowConfidenceClaims.slice(0, 5)) {
      lines.push(
        `  - ${claim.claim} (${formatConfidenceAsSupportLabel(claim.confidenceLabel)})`
      );
    }
  }

  if (summary.conflictingClaims.length > 0) {
    lines.push('');
    lines.push(`Conflicting Claims (${summary.conflictingClaims.length}):`);
    for (const conflict of summary.conflictingClaims.slice(0, 5)) {
      lines.push(`  - ${conflict.claim}`);
      lines.push(`    Engines: ${conflict.engines.join(', ')}`);
    }
  }

  return lines.join('\n');
}
