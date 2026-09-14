import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NUMEROLOGY_ENGINE_VERSION,
  calcBirthday,
  calcCoreNumerology,
  calcExpression,
  calcLifePath,
  calcMaturity,
  calcPersonality,
  calcSoulUrge,
  normalizeNumerologyName,
  reduceNumerology,
} from '../compute/numerology.js';
import { calcPersonalYear } from '../compute/personal-numbers.js';
import { calcLifePathWithEvidence } from '../evidence-ledger/integrations.js';

test('Bobby fixture resolves Life Path 9 in every host timezone', () => {
  const originalTimezone = process.env.TZ;

  try {
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = timezone;
      assert.equal(calcLifePath('1990-09-17'), 9, timezone);
      assert.equal(calcPersonalYear('1990-09-17', 2026), 9, timezone);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test('Life Path evidence preserves the entered calendar date', () => {
  const result = calcLifePathWithEvidence('1990-09-17');

  assert.equal(result.value, 9);
  assert.deepEqual(result.evidence.inputsUsed, [
    'birth_month_9',
    'birth_day_17',
    'birth_year_1990',
  ]);
});

test('date-only numerology rejects impossible calendar dates', () => {
  assert.throws(() => calcLifePath('1990-02-30'), /real calendar date/);
  assert.throws(() => calcBirthday('1990-02-30'), /real calendar date/);
});

test('Birthday number preserves master-number birthdays', () => {
  assert.equal(calcBirthday('1990-09-17'), 8);
  assert.equal(calcBirthday('1990-09-11'), 11);
  assert.equal(calcBirthday('1990-09-22'), 22);
});

test('name normalization is stable across accents and punctuation', () => {
  assert.equal(normalizeNumerologyName('José González'), 'JOSEGONZALEZ');
  assert.equal(calcExpression('José González'), calcExpression('Jose Gonzalez'));
  assert.equal(calcSoulUrge('José González'), calcSoulUrge('Jose Gonzalez'));
  assert.equal(calcPersonality('José González'), calcPersonality('Jose Gonzalez'));

  assert.equal(
    calcExpression("Anne-Marie O'Neill"),
    calcExpression('Anne Marie ONeill'),
  );
});

test('canonical Pythagorean name mapping preserves master numbers', () => {
  assert.equal(calcExpression('José González'), 11);
});

test('Maturity number combines canonical Life Path and Expression', () => {
  assert.equal(calcLifePath('1990-09-17'), 9);
  assert.equal(calcExpression('Robert Gonzalez'), 4);
  assert.equal(calcMaturity('1990-09-17', 'Robert Gonzalez'), 4);
});

test('reduction metadata exposes master and karmic-debt paths without changing value', () => {
  assert.deepEqual(reduceNumerology(16), {
    value: 7,
    sourceTotal: 16,
    reductionPath: [16, 7],
    karmicDebt: 16,
  });
  assert.deepEqual(reduceNumerology(29), {
    value: 11,
    sourceTotal: 29,
    reductionPath: [29, 11],
    karmicDebt: null,
  });
});

test('core numerology snapshot is deterministic and versioned', () => {
  const first = calcCoreNumerology('1990-09-17', 'Robert Gonzalez');
  const second = calcCoreNumerology('1990-09-17', 'Robert Gonzalez');

  assert.deepEqual(first, second);
  assert.equal(first.engineVersion, NUMEROLOGY_ENGINE_VERSION);
  assert.deepEqual(first, {
    engineVersion: 'pythagorean-v2',
    lifePath: 9,
    birthday: 8,
    expression: 4,
    soulUrge: 5,
    personality: 8,
    maturity: 4,
  });
});
