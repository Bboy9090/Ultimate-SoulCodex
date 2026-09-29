import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  createEvidenceEntry,
  createLedger,
  groupEvidenceByEngine,
  findLowConfidenceClaims,
  findConflictingClaims,
  summarizeEvidenceLedger,
  calculateConfidenceLabel,
  isHighConfidence,
  isLowConfidence,
  formatConfidenceAsPercent,
  formatConfidenceAsSupportLabel,
  formatConfidenceExplanation,
  formatEvidenceEntry,
  formatSummaryAsText,
  type EvidenceEntry,
} from '../index.js';

test('createEvidenceEntry - basic creation', () => {
  const entry = createEvidenceEntry(
    'numerology',
    'Personal Year',
    5,
    85,
    'high',
    {
      inputsUsed: ['birth_date_verified'],
      reasoning: ['8 + 15 + 2026 = 49 → 4 + 9 = 13 → 1 + 3 = 4... wait that should be 5'],
    }
  );

  assert.ok(entry.id);
  assert.equal(entry.engine, 'numerology');
  assert.equal(entry.claim, 'Personal Year');
  assert.equal(entry.value, 5);
  assert.equal(entry.confidence, 85);
  assert.equal(entry.confidenceLabel, 'high');
  assert.equal(entry.inputsUsed.length, 1);
  assert.equal(entry.version, '1.0');
});

test('createEvidenceEntry - confidence clamping', () => {
  const entry1 = createEvidenceEntry('astrology', 'Test', 'value', 150, 'high');
  assert.equal(entry1.confidence, 100);

  const entry2 = createEvidenceEntry('astrology', 'Test', 'value', -50, 'low');
  assert.equal(entry2.confidence, 0);
});

test('calculateConfidenceLabel - verified inputs', () => {
  const label = calculateConfidenceLabel(95, 'verified', 85);
  assert.equal(label, 'verified');
});

test('calculateConfidenceLabel - partial inputs', () => {
  const label = calculateConfidenceLabel(75, 'partial', 60);
  assert.equal(label, 'moderate');
});

test('calculateConfidenceLabel - estimated inputs', () => {
  const label = calculateConfidenceLabel(50, 'estimated', 40);
  assert.equal(label, 'low');
});

test('isHighConfidence and isLowConfidence', () => {
  assert.ok(isHighConfidence('verified'));
  assert.ok(isHighConfidence('high'));
  assert.ok(!isHighConfidence('moderate'));

  assert.ok(isLowConfidence('low'));
  assert.ok(isLowConfidence('unverified'));
  assert.ok(!isLowConfidence('moderate'));
});

test('createLedger - structure', () => {
  const entries = [
    createEvidenceEntry('numerology', 'Personal Day', 3, 90, 'high'),
    createEvidenceEntry('astrology', 'Moon Sign', 'Cancer', 85, 'high'),
  ];

  const ledger = createLedger(entries, 'test-reading-123');

  assert.equal(ledger.readingId, 'test-reading-123');
  assert.equal(ledger.entries.length, 2);
  assert.equal(ledger.version, '1.0');
});

test('groupEvidenceByEngine', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 90, 'high'),
    createEvidenceEntry('numerology', 'Personal Month', 3, 85, 'high'),
    createEvidenceEntry('astrology', 'Sun Sign', 'Leo', 95, 'verified'),
  ];

  const grouped = groupEvidenceByEngine(entries);

  assert.equal(grouped.numerology?.length, 2);
  assert.equal(grouped.astrology?.length, 1);
  assert.equal(Object.keys(grouped).length, 2);
});

test('findLowConfidenceClaims', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'High confidence', 5, 90, 'high'),
    createEvidenceEntry('numerology', 'Low confidence', 3, 25, 'low'),
    createEvidenceEntry('numerology', 'Unverified', 2, 10, 'unverified'),
  ];

  const lowConfidence = findLowConfidenceClaims(entries);

  assert.equal(lowConfidence.length, 2);
  assert.ok(lowConfidence.every(e => e.confidenceLabel === 'low' || e.confidenceLabel === 'unverified'));
});

test('findConflictingClaims - no conflicts', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 90, 'high'),
    createEvidenceEntry('astrology', 'Sun Sign', 'Leo', 95, 'verified'),
  ];

  const conflicts = findConflictingClaims(entries);

  assert.equal(conflicts.length, 0);
});

test('findConflictingClaims - with conflicts', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Strength', 'High', 90, 'high'),
    createEvidenceEntry('behavior', 'Strength', 'Low', 80, 'high'),
  ];

  const conflicts = findConflictingClaims(entries);

  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].engines.length, 2);
  assert.equal(conflicts[0].conflicts.length, 2);
});

test('summarizeEvidenceLedger - basic summary', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified'),
    createEvidenceEntry('numerology', 'Personal Month', 3, 85, 'high'),
    createEvidenceEntry('astrology', 'Sun Sign', 'Leo', 80, 'moderate'),
  ];

  const summary = summarizeEvidenceLedger(entries);

  assert.equal(summary.totalClaims, 3);
  assert.equal(summary.averageConfidence, 87);
  assert.equal(summary.byConfidenceLevel.verified, 1);
  assert.equal(summary.byConfidenceLevel.high, 1);
  assert.equal(summary.byConfidenceLevel.moderate, 1);
  assert.equal(summary.byEngine.numerology, 2);
  assert.equal(summary.byEngine.astrology, 1);
});

test('summarizeEvidenceLedger - empty ledger', () => {
  const summary = summarizeEvidenceLedger([]);

  assert.equal(summary.totalClaims, 0);
  assert.equal(summary.averageConfidence, 0);
  assert.equal(summary.lowConfidenceClaims.length, 0);
  assert.equal(summary.conflictingClaims.length, 0);
});

test('summarizeEvidenceLedger - low confidence detection', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Claim 1', 'value', 90, 'high'),
    createEvidenceEntry('numerology', 'Claim 2', 'value', 30, 'low'),
    createEvidenceEntry('numerology', 'Claim 3', 'value', 10, 'unverified'),
  ];

  const summary = summarizeEvidenceLedger(entries);

  assert.equal(summary.lowConfidenceClaims.length, 2);
});

test('formatConfidenceAsPercent', () => {
  assert.equal(formatConfidenceAsPercent(85.6), '86%');
  assert.equal(formatConfidenceAsPercent(50), '50%');
});

test('formatEvidenceEntry', () => {
  const entry = createEvidenceEntry('numerology', 'Personal Year', 5, 90, 'high', {
    inputsUsed: ['birth_date_verified'],
    reasoning: ['Sum reduced to single digit'],
    limitations: ['No birth time'],
  });

  const formatted = formatEvidenceEntry(entry);

  assert.equal(formatted.claim, 'Personal Year');
  assert.equal(formatted.value, '5');
  assert.equal(formatted.confidence, 'High source support');
  assert.equal(formatted.inputs, 'birth_date_verified');
  assert.equal(formatted.reasoning, 'Sum reduced to single digit');
  assert.equal(formatted.limitations, 'No birth time');
});

test('formatSummaryAsText', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('numerology', 'Personal Year', 5, 95, 'verified'),
    createEvidenceEntry('numerology', 'Low confidence', 3, 25, 'low'),
  ];

  const summary = summarizeEvidenceLedger(entries);
  const text = formatSummaryAsText(summary);

  assert.ok(text.includes('Total Claims: 2'));
  assert.ok(text.includes('Support tiers describe provenance/calculation support, not probability.'));
  assert.ok(text.includes('Low Confidence Claims'));
  assert.ok(text.includes('numerology'));
});

test('deterministic output - same inputs produce same results', () => {
  const entry1 = createEvidenceEntry('numerology', 'Test', 'value', 75, 'moderate', {
    inputsUsed: ['birth_date'],
    reasoning: ['Test reasoning'],
    limitations: ['Test limitation'],
  });

  const entry2 = createEvidenceEntry('numerology', 'Test', 'value', 75, 'moderate', {
    inputsUsed: ['birth_date'],
    reasoning: ['Test reasoning'],
    limitations: ['Test limitation'],
  });

  assert.equal(entry1.engine, entry2.engine);
  assert.equal(entry1.claim, entry2.claim);
  assert.equal(entry1.value, entry2.value);
  assert.equal(entry1.confidence, entry2.confidence);
  assert.equal(entry1.confidenceLabel, entry2.confidenceLabel);
  assert.deepEqual(entry1.inputsUsed, entry2.inputsUsed);
  assert.deepEqual(entry1.reasoning, entry2.reasoning);
  assert.deepEqual(entry1.limitations, entry2.limitations);
});


test('formatConfidenceAsSupportLabel keeps user-facing confidence non-probabilistic', () => {
  assert.equal(formatConfidenceAsSupportLabel('verified'), 'Verified source support');
  assert.equal(formatConfidenceAsSupportLabel('high'), 'High source support');
  assert.equal(formatConfidenceAsSupportLabel('moderate'), 'Moderate source support');
  assert.equal(formatConfidenceAsSupportLabel('partial'), 'Partial source support');
  assert.equal(formatConfidenceAsSupportLabel('low'), 'Low source support');
  assert.equal(formatConfidenceAsSupportLabel('unverified'), 'Unverified source support');

  for (const label of ['verified', 'high', 'moderate', 'partial', 'low', 'unverified'] as const) {
    const rendered = `${formatConfidenceAsSupportLabel(label)} ${formatConfidenceExplanation(label)}`;
    assert.equal(rendered.includes('%'), false, label);
    assert.doesNotMatch(rendered, /probability of psychological truth|chance that|percent true/i);
  }
});

test('formatSummaryAsText never exposes internal confidence weights as truth percentages', () => {
  const entries: EvidenceEntry[] = [
    createEvidenceEntry('astrology', 'Sun Sign', 'Virgo', 95, 'verified'),
    createEvidenceEntry('numerology', 'Life Path', 9, 85, 'high'),
  ];
  const text = formatSummaryAsText(summarizeEvidenceLedger(entries));

  assert.doesNotMatch(text, /Average Confidence:/);
  assert.doesNotMatch(text, /\b\d{1,3}%\b/);
  assert.match(text, /not probability/i);
});
