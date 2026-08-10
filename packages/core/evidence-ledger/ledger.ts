/**
 * Evidence Ledger Operations
 *
 * Core functions for creating, managing, and analyzing evidence entries.
 */

import type {
  EvidenceEntry,
  EvidenceLedger,
  EvidenceGroupedByEngine,
  EvidenceSummary,
  EngineType,
  EvidenceConfidenceLevel,
} from './types.js';
import { isLowConfidence } from './confidence.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function createEvidenceEntry(
  engine: EngineType,
  claim: string,
  value: string | number | boolean | Record<string, unknown>,
  confidence: number,
  confidenceLabel: EvidenceConfidenceLevel,
  options: {
    inputsUsed?: string[];
    limitations?: string[];
    reasoning?: string[];
    formulaId?: string;
    formulaVersion?: string;
    calculationStatus?: 'resolved' | 'unresolved';
    inputState?: 'valid' | 'partial' | 'missing' | 'invalid';
    calculatedAt?: string;
  } = {}
): EvidenceEntry {
  return {
    id: generateId(),
    engine,
    claim,
    value,
    confidence: Math.min(100, Math.max(0, confidence)),
    confidenceLabel,
    inputsUsed: options.inputsUsed || [],
    limitations: options.limitations || [],
    reasoning: options.reasoning || [],
    generatedAt: new Date().toISOString(),
    version: '1.0',
    formulaId: options.formulaId,
    formulaVersion: options.formulaVersion,
    calculationStatus: options.calculationStatus,
    inputState: options.inputState,
    calculatedAt: options.calculatedAt,
  };
}

export function createLedger(entries: EvidenceEntry[], readingId?: string): EvidenceLedger {
  return {
    readingId: readingId || generateId(),
    entries,
    generatedAt: new Date().toISOString(),
    version: '1.0',
  };
}

export function groupEvidenceByEngine(entries: EvidenceEntry[]): EvidenceGroupedByEngine {
  const grouped: EvidenceGroupedByEngine = {};

  for (const entry of entries) {
    if (!grouped[entry.engine]) {
      grouped[entry.engine] = [];
    }
    grouped[entry.engine]!.push(entry);
  }

  return grouped;
}

export function findLowConfidenceClaims(entries: EvidenceEntry[]): EvidenceEntry[] {
  return entries.filter(entry => isLowConfidence(entry.confidenceLabel));
}

export function findConflictingClaims(entries: EvidenceEntry[]): Array<{
  engines: EngineType[];
  claim: string;
  conflicts: EvidenceEntry[];
}> {
  const conflictMap = new Map<string, EvidenceEntry[]>();

  for (const entry of entries) {
    const key = entry.claim.toLowerCase();
    if (!conflictMap.has(key)) {
      conflictMap.set(key, []);
    }
    conflictMap.get(key)!.push(entry);
  }

  const conflicts: Array<{
    engines: EngineType[];
    claim: string;
    conflicts: EvidenceEntry[];
  }> = [];

  for (const [claim, entries] of conflictMap.entries()) {
    const engines = [...new Set(entries.map(e => e.engine))];
    if (engines.length > 1) {
      // Multiple engines claim something about the same topic
      const valueDifferences = [...new Set(entries.map(e => JSON.stringify(e.value)))];
      if (valueDifferences.length > 1) {
        // And they have different values → conflict
        conflicts.push({
          engines,
          claim,
          conflicts: entries,
        });
      }
    }
  }

  return conflicts;
}

export function summarizeEvidenceLedger(ledger: EvidenceLedger | EvidenceEntry[]): EvidenceSummary {
  const entries = Array.isArray(ledger) ? ledger : ledger.entries;

  const summary: EvidenceSummary = {
    totalClaims: entries.length,
    averageConfidence:
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length)
        : 0,
    byConfidenceLevel: {
      verified: 0,
      high: 0,
      moderate: 0,
      partial: 0,
      low: 0,
      unverified: 0,
    },
    byEngine: {} as Record<EngineType, number>,
    lowConfidenceClaims: findLowConfidenceClaims(entries),
    conflictingClaims: findConflictingClaims(entries),
  };

  for (const entry of entries) {
    summary.byConfidenceLevel[entry.confidenceLabel]++;
    summary.byEngine[entry.engine] = (summary.byEngine[entry.engine] || 0) + 1;
  }

  return summary;
}
