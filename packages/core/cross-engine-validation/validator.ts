/**
 * Cross-Engine Validator
 *
 * Main orchestrator for comparing evidence across engines.
 */

import type { EvidenceEntry } from '../evidence-ledger/types.js';
import { groupEvidenceByEngine, type EngineType } from '../evidence-ledger/index.js';
import type { EngineAgreement, ValidationResult, AgreementLevel } from './types.js';
import { analyzeConflicts } from './conflict-analyzer.js';
import { scoreAgreement } from './agreement-scorer.js';

export function validateEngineAgreement(
  entries: EvidenceEntry[],
  readingId: string = ''
): ValidationResult {
  const grouped = groupEvidenceByEngine(entries);
  const agreements: EngineAgreement[] = [];
  let totalClaimsAnalyzed = 0;
  let fullyAgreedClaims = 0;

  // Group entries by claim to compare engines on the same topic
  const claimMap = new Map<string, EvidenceEntry[]>();

  for (const entry of entries) {
    const key = entry.claim.toLowerCase();
    if (!claimMap.has(key)) {
      claimMap.set(key, []);
    }
    claimMap.get(key)!.push(entry);
  }

  // Analyze each claim across engines
  for (const [claim, claimEntries] of claimMap.entries()) {
    totalClaimsAnalyzed++;
    const engines = [...new Set(claimEntries.map(e => e.engine))];

    if (engines.length === 1) {
      // Only one engine made this claim
      const entry = claimEntries[0];
      agreements.push({
        claim: entry.claim,
        engines: [entry.engine],
        agreementLevel: 'insufficient-data',
        confidence: entry.confidence,
        reasonsForAgreement: ['Only one engine analyzed this claim'],
      });
      continue;
    }

    // Multiple engines on same claim - compare values
    const values = [...new Set(claimEntries.map(e => JSON.stringify(e.value)))];

    let agreementLevel: AgreementLevel;
    let reasonsForAgreement: string[] = [];
    let divergenceExplanation: string | undefined;

    if (values.length === 1) {
      // All engines agree on value
      agreementLevel = 'full';
      const avgConfidence =
        claimEntries.reduce((sum, e) => sum + e.confidence, 0) / claimEntries.length;
      reasonsForAgreement = [
        `All ${engines.length} engines agree on this claim`,
        `Average confidence: ${Math.round(avgConfidence)}%`,
        ...claimEntries.flatMap(e => e.reasoning),
      ];
      fullyAgreedClaims++;

      agreements.push({
        claim: claimEntries[0].claim,
        engines,
        agreementLevel,
        confidence: Math.round(avgConfidence),
        reasonsForAgreement,
      });
    } else {
      // Engines disagree on value
      const conflicts = analyzeConflicts(claimEntries);
      agreementLevel = conflicts.length > 0 ? 'conflict' : 'partial';

      const agreementScore = scoreAgreement(claimEntries);

      agreements.push({
        claim: claimEntries[0].claim,
        engines,
        agreementLevel,
        confidence: agreementScore.confidence,
        reasonsForAgreement: [
          `${engines.length} engines analyzed this claim`,
          `${values.length} different conclusions`,
          `Confidence in agreement: ${Math.round(agreementScore.confidence)}%`,
        ],
        divergenceExplanation: conflicts[0]?.explanation,
      });
    }
  }

  // Calculate overall scores
  const overallAgreementScore = Math.round(
    (fullyAgreedClaims / Math.max(1, totalClaimsAnalyzed)) * 100
  );

  const overallConfidence = Math.round(
    entries.reduce((sum, e) => sum + e.confidence, 0) / Math.max(1, entries.length)
  );

  // Build detailed conflict analysis
  const conflicts = agreements
    .filter(a => a.agreementLevel === 'conflict')
    .map(a => {
      const conflictEntries = entries.filter(e => e.claim.toLowerCase() === a.claim.toLowerCase());
      return {
        claim: a.claim,
        engines: conflictEntries.map(e => ({
          engine: e.engine,
          value: e.value,
          confidence: e.confidence,
          reasoning: e.reasoning,
        })),
        likelyExplanation: a.divergenceExplanation || 'Data interpretation difference',
        suggestedResolution: `Review ${a.engines.join(' vs ')} outputs for this claim`,
      };
    });

  return {
    readingId: readingId || generateReadingId(),
    agreements,
    conflicts,
    overallAgreementScore,
    overallConfidence,
    timestamp: new Date().toISOString(),
    version: '1.0',
  };
}

function generateReadingId(): string {
  return 'vld-' + Math.random().toString(36).substring(2, 10);
}
