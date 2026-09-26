import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  numerologyNameComponentAvailability,
  reduceNumerology,
} from '../compute/numerology.js';
import {
  calcPersonalDayForDateISO,
  calcPersonalMonth,
  calcPersonalYear,
  calcUniversalDay,
  isPersonalNumerologyValue,
  PERSONAL_YEAR_BOUNDARY_POLICY,
} from '../compute/personal-numbers.js';
import {
  calcLifePathWithEvidence,
  calcPersonalityWithEvidence,
  calcSoulUrgeWithEvidence,
} from '../evidence-ledger/integrations.js';

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

test('canonical name normalization handles supported special Latin letters', () => {
  assert.equal(normalizeNumerologyName('Ægir Øst Łukasz'), 'AEGIROSTLUKASZ');
  assert.doesNotThrow(() => calcExpression('Ægir Øst Łukasz'));
});

test('unsupported scripts do not collapse into a fake numerology zero', () => {
  assert.equal(normalizeNumerologyName('Мария'), '');
  assert.throws(
    () => calcExpression('Мария'),
    /requires at least one canonical A-Z letter/,
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


test('Personal Year boundary policy is explicitly calendar-year', () => {
  assert.equal(PERSONAL_YEAR_BOUNDARY_POLICY, 'calendar-year');
  assert.equal(calcPersonalYear('1990-09-17', 2026), calcPersonalYear('1990-09-17', 2026));
});


test('personal numerology core rejects invalid direct-call domains', () => {
  assert.throws(() => calcPersonalYear(13, 1, 2026), /valid birth month\/day/);
  assert.throws(() => calcPersonalYear(9, 17, 0), /target year/);
  assert.throws(() => calcPersonalMonth(12, 5), /Personal Year 1-9, 11, 22, or 33/);
  assert.throws(() => calcPersonalMonth(9, 13), /calendar month 1-12/);
});


test('name numerology normalizes supported Latin characters deterministically', () => {
  assert.equal(normalizeNumerologyName('José Núñez'), 'JOSENUNEZ');
  assert.equal(normalizeNumerologyName('Łukasz Żółć'), 'LUKASZZOLC');
  assert.equal(normalizeNumerologyName('Straße'), 'STRASSE');
});

test('name numerology fails closed for unsupported non-Latin scripts', () => {
  assert.equal(normalizeNumerologyName('Алексей'), '');
  assert.throws(() => calcExpression('Алексей'), /canonical A-Z letter/);
});


test('legacy Personal Year month/day signature rejects impossible calendar pairs', () => {
  assert.throws(() => calcPersonalYear(2, 30, 2026), /valid birth month\/day/);
  assert.throws(() => calcPersonalYear(4, 31, 2026), /valid birth month\/day/);
  assert.doesNotThrow(() => calcPersonalYear(2, 29, 2026));
});

test('Personal Year omitted target year uses UTC year deterministically', () => {
  const currentUtcYear = new Date().getUTCFullYear();
  assert.equal(
    calcPersonalYear('1990-09-17'),
    calcPersonalYear('1990-09-17', currentUtcYear),
  );
});


test('canonical numerology reduction is idempotent across the supported integer domain', () => {
  for (let value = 0; value <= 9999; value += 1) {
    const reduced = reduceNumerology(value).value;
    assert.equal(
      reduceNumerology(reduced).value,
      reduced,
      `reduction must be idempotent for ${value}`,
    );
    if (value > 0) {
      assert.ok(
        isPersonalNumerologyValue(reduced),
        `positive reduction ${value} -> ${reduced} must remain in the governed value set`,
      );
    }
  }
});

test('personal cycles stay inside the governed value set across representative calendar space', () => {
  const years = [1900, 1999, 2000, 2026, 2099];
  for (const year of years) {
    for (let month = 1; month <= 12; month += 1) {
      for (const day of [1, 7, 11, 17, 22, 28]) {
        const target = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        assert.ok(isPersonalNumerologyValue(calcUniversalDay(target)), target);
        assert.ok(
          isPersonalNumerologyValue(calcPersonalDayForDateISO('1990-09-17', target)),
          target,
        );
      }
      assert.ok(
        isPersonalNumerologyValue(calcPersonalYear('1990-09-17', year)),
        String(year),
      );
    }
  }
});

test('personal-cycle arithmetic uses the canonical core reducer', () => {
  const source = readFileSync(
    new URL('../compute/personal-numbers.ts', import.meta.url),
    'utf8',
  );
  assert.match(source, /import \{ reduceNumerology \} from ['"]\.\/numerology\.js['"]/);
  assert.doesNotMatch(source, /while \(num > 9/);
});


test('name-number components fail closed instead of producing numerology zero', () => {
  const noGovernedVowels = numerologyNameComponentAvailability('Lynn');
  assert.equal(noGovernedVowels.vowelCount, 0);
  assert.ok(noGovernedVowels.consonantCount > 0);
  assert.throws(() => calcSoulUrge('Lynn'), /Soul Urge is unresolved/);

  const allVowels = numerologyNameComponentAvailability('Aeia');
  assert.equal(allVowels.consonantCount, 0);
  assert.ok(allVowels.vowelCount > 0);
  assert.throws(() => calcPersonality('Aeia'), /Personality is unresolved/);

  const lynn = calcCoreNumerology('1990-09-17', 'Lynn');
  assert.equal(lynn.soulUrge, null);
  assert.ok(isPersonalNumerologyValue(lynn.personality as number));

  const aeia = calcCoreNumerology('1990-09-17', 'Aeia');
  assert.equal(aeia.personality, null);
  assert.ok(isPersonalNumerologyValue(aeia.soulUrge as number));
});

test('name-component evidence records partial unresolved state without zero', () => {
  const soul = calcSoulUrgeWithEvidence('Lynn');
  assert.equal(soul.value, undefined);
  assert.equal(soul.evidence.calculationStatus, 'unresolved');
  assert.equal(soul.evidence.inputState, 'partial');
  assert.notEqual(soul.evidence.value, 0);

  const personality = calcPersonalityWithEvidence('Aeia');
  assert.equal(personality.value, undefined);
  assert.equal(personality.evidence.calculationStatus, 'unresolved');
  assert.equal(personality.evidence.inputState, 'partial');
  assert.notEqual(personality.evidence.value, 0);
});

test('date numerology remains in the governed value set across every calendar day from 1900 through 2100', () => {
  let checked = 0;
  for (let year = 1900; year <= 2100; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        assert.ok(isPersonalNumerologyValue(calcLifePath(date)), `Life Path ${date}`);
        assert.ok(isPersonalNumerologyValue(calcBirthday(date)), `Birthday ${date}`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 73_000);
});
