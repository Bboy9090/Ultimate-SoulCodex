import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  validateEngineAgreement,
  analyzeConflicts,
  scoreAgreement,
  scoreDisagreement,
  type AgreementLevel,
} from '../index.js';
import {
  createEvidenceEntry,
  type EvidenceEntry,
} from '../../evidence-ledger/index.js';

test('validateEngineAgreement - full agreement', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified', {
      inputsUsed: ['birth_date_verified'],
    }),
    createEvidenceEntry('astrology', 'Personal Year', 5, 90, 'high', {
      inputsUsed: ['birth_date_verified'],
    }),
  ];

  const result = validateEngineAgreement(entries, 'test-reading-1');

  assert.ok(result.agreements.length > 0);
  const agreement = result.agreements[0];
  assert.equal(agreement.agreementLevel, 'full');
  assert.equal(agreement.confidence, 93); // Average of 95 and 90
  assert.ok(agreement.reasonsForAgreement.length > 0);
});

test('validateEngineAgreement - partial agreement', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Strength', 'High', 85, 'high'),
    createEvidenceEntry('behavior', 'Strength', 'Moderate', 70, 'moderate'),
  ];

  const result = validateEngineAgreement(entries, 'test-reading-2');

  assert.ok(result.agreements.length > 0);
  const agreement = result.agreements[0];
  assert.equal(agreement.agreementLevel, 'partial');
});

test('validateEngineAgreement - single engine insufficient data', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Month', 3, 90, 'high'),
  ];

  const result = validateEngineAgreement(entries);

  const agreement = result.agreements[0];
  assert.equal(agreement.agreementLevel, 'insufficient-data');
});

test('validateEngineAgreement - multiple claims', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified'),
    createEvidenceEntry('astrology', 'Personal Year', 5, 90, 'high'),
    createEvidenceEntry('numerology', 'Personal Month', 3, 85, 'high'),
    createEvidenceEntry('pattern', 'Personal Month', 3, 80, 'high'),
  ];

  const result = validateEngineAgreement(entries);

  assert.equal(result.agreements.length, 2);
  assert.ok(result.overallAgreementScore > 0);
  assert.ok(result.overallConfidence > 0);
});

test('analyzeConflicts - detects data quality issues', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Test', 'value', 90, 'high', {
      limitations: ['Birth time estimated'],
    }),
    createEvidenceEntry('astrology', 'Test', 'value', 70, 'moderate'),
  ];

  const conflicts = analyzeConflicts(entries);

  assert.ok(conflicts.length > 0);
  const conflict = conflicts[0];
  assert.ok(conflict.explanation.includes('Data quality'));
});

test('analyzeConflicts - detects stress override pattern', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Tendency', 'Reserved', 95, 'verified'),
    createEvidenceEntry('behavior', 'Tendency', 'Assertive', 85, 'high', {
      reasoning: ['Stress override detected', 'Current situation escalates assertiveness'],
    }),
  ];

  const conflicts = analyzeConflicts(entries);

  assert.ok(conflicts.length > 0);
  assert.ok(conflicts.some(c => c.stressOverride));
});

test('analyzeConflicts - low confidence', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Test', 'value', 85, 'high'),
    createEvidenceEntry('astrology', 'Test', 'value', 'other', 40, 'low'),
  ];

  const conflicts = analyzeConflicts(entries);

  assert.ok(conflicts.length > 0);
  assert.ok(conflicts.some(c => c.explanation.includes('Confidence')));
});

test('scoreAgreement - multiple high-confidence engines', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Year', 5, 95, 'verified', {
      inputsUsed: ['birth_date_verified'],
    }),
    createEvidenceEntry('astrology', 'Year', 5, 90, 'high', {
      inputsUsed: ['birth_date_verified'],
    }),
    createEvidenceEntry('pattern', 'Year', 5, 88, 'high'),
  ];

  const score = scoreAgreement(entries);

  assert.ok(score.confidence > 90);
  assert.equal(score.engineCount, 3);
  assert.ok(score.reasoning.length > 0);
});

test('scoreAgreement - mixed confidence variance penalty', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Test', 'value', 95, 'verified'),
    createEvidenceEntry('astrology', 'Test', 'value', 'value', 50, 'moderate'),
  ];

  const score = scoreAgreement(entries);

  // High variance should reduce confidence
  assert.ok(score.confidence < 75);
  assert.ok(score.reasoning.some(r => r.includes('variance')));
});

test('scoreAgreement - verified inputs bonus', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Test', 5, 85, 'verified', {
      inputsUsed: ['birth_date_verified'],
    }),
    createEvidenceEntry('astrology', 'Test', 5, 85, 'verified', {
      inputsUsed: ['birth_date_verified'],
    }),
  ];

  const score = scoreAgreement(entries);

  assert.ok(score.confidence >= 90); // Base 85 + bonuses
});

test('scoreDisagreement - penalty increases with more disagreers', () => {
  const entries2 = [
    createEvidenceEntry('numerology', 'Test', 'A', 80, 'high'),
    createEvidenceEntry('astrology', 'Test', 'B', 80, 'high'),
  ];

  const entries3 = [
    createEvidenceEntry('numerology', 'Test', 'A', 80, 'high'),
    createEvidenceEntry('astrology', 'Test', 'B', 80, 'high'),
    createEvidenceEntry('pattern', 'Test', 'C', 80, 'high'),
  ];

  const score2 = scoreDisagreement(entries2);
  const score3 = scoreDisagreement(entries3);

  assert.ok(score3 < score2);
});

test('validateEngineAgreement - calculates overall agreement score', () => {
  const entries: EvidenceEntry[] = [
    // Claim 1: Full agreement
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified'),
    createEvidenceEntry('astrology', 'Personal Year', 5, 90, 'high'),
    // Claim 2: Full agreement
    createEvidenceEntry('numerology', 'Personal Month', 3, 85, 'high'),
    createEvidenceEntry('pattern', 'Personal Month', 3, 80, 'high'),
  ];

  const result = validateEngineAgreement(entries);

  assert.equal(result.overallAgreementScore, 100); // 2/2 claims fully agreed
});

test('validateEngineAgreement - timestamp and version', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Test', 5, 90, 'high'),
  ];

  const result = validateEngineAgreement(entries);

  assert.ok(result.timestamp);
  assert.equal(result.version, '1.0');
  assert.ok(result.readingId);
});

test('validateEngineAgreement - deterministic with same inputs', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified', {
      inputsUsed: ['birth_date_verified'],
      reasoning: ['calculation step 1'],
    }),
    createEvidenceEntry('astrology', 'Personal Year', 5, 90, 'high', {
      inputsUsed: ['birth_date_verified'],
      reasoning: ['calculation step 1'],
    }),
  ];

  const result1 = validateEngineAgreement(entries, 'test-1');
  const result2 = validateEngineAgreement(entries, 'test-1');

  assert.equal(result1.overallAgreementScore, result2.overallAgreementScore);
  assert.equal(result1.overallConfidence, result2.overallConfidence);
});
