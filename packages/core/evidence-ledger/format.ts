/**
 * Evidence Formatting & Display
 *
 * Helpers for presenting evidence to users in a readable way.
 */

import type { EvidenceEntry, EvidenceSummary } from './types.js';

export function formatConfidenceAsPercent(confidence: number): string {
  return `${Math.round(confidence)}%`;
}

export function formatConfidenceExplanation(label: string): string {
  const explanations: Record<string, string> = {
    verified:
      'Verified from reliable sources (birth certificate, exact birth time). Highest confidence.',
    high: 'Calculated from verified inputs with strong patterns.',
    moderate: 'Calculated from verified core data with some estimation.',
    partial: 'Estimated inputs or limited historical patterns.',
    low: 'Multiple unknowns or weak pattern matches.',
    unverified: 'Not enough reliable data to form confident conclusion.',
  };
  return explanations[label] || 'Confidence level unknown';
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
    confidence: `${formatConfidenceAsPercent(entry.confidence)} (${entry.confidenceLabel})`,
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
  lines.push(`Average Confidence: ${formatConfidenceAsPercent(summary.averageConfidence)}`);
  lines.push('');

  lines.push('By Confidence Level:');
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
        `  - ${claim.claim} (${formatConfidenceAsPercent(claim.confidence)}, ${claim.confidenceLabel})`
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
