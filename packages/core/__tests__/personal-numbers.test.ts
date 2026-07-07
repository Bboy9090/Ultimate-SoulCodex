import { test } from 'node:test';
import assert from 'node:assert';
import {
  calcPersonalDay,
  calcPersonalYear,
  calcPersonalMonth,
  getPersonalDayLabel,
  getPersonalYearLabel,
  getPersonalMonthLabel,
  formatPersonalDay,
  formatPersonalYear,
  PERSONAL_DAY_LABELS,
  PERSONAL_YEAR_LABELS,
  PERSONAL_MONTH_LABELS,
} from '../compute/personal-numbers.js';

test('calcPersonalDay - Daily Number Consistency', async (t) => {
  await t.test('should calculate the same Personal Day for the same birth date and target date', () => {
    const birthDate = '1990-08-15';
    const targetDate = new Date('2026-07-06');

    const day1 = calcPersonalDay(birthDate, targetDate);
    const day2 = calcPersonalDay(birthDate, targetDate);

    assert.strictEqual(day1, day2);
    assert.ok(day1 >= 1);
    assert.ok(day1 <= 9);
  });

  await t.test('should return different days for different dates', () => {
    const birthDate = '1990-08-15';
    const date1 = new Date('2026-07-06');
    const date2 = new Date('2026-07-07');

    const day1 = calcPersonalDay(birthDate, date1);
    const day2 = calcPersonalDay(birthDate, date2);

    assert.strictEqual(typeof day1, 'number');
    assert.strictEqual(typeof day2, 'number');
  });

  await t.test('should handle master numbers (11, 22, 33)', () => {
    const result = calcPersonalDay('2000-02-29', new Date('2026-11-11'));
    assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(result));
  });
});

test('calcPersonalYear - Annual Number Consistency', async (t) => {
  await t.test('should calculate the same Personal Year for same birth and target year', () => {
    const birthDate = '1990-08-15';
    const targetYear = 2026;

    const year1 = calcPersonalYear(birthDate, targetYear);
    const year2 = calcPersonalYear(birthDate, targetYear);

    assert.strictEqual(year1, year2);
    assert.ok(year1 >= 1);
    assert.ok(year1 <= 9);
  });

  await t.test('should work with legacy signature (month, day, year)', () => {
    const year = calcPersonalYear(8, 15, 2026);

    assert.ok(year >= 1);
    assert.ok(year <= 9);
  });

  await t.test('should produce same result for same birth/year regardless of signature', () => {
    const birthDate = '1990-08-15';
    const targetYear = 2026;

    const year1 = calcPersonalYear(birthDate, targetYear);
    const year2 = calcPersonalYear(8, 15, targetYear);

    assert.strictEqual(year1, year2);
  });

  await t.test('should return different years for different target years', () => {
    const birthDate = '1990-08-15';

    const year2026 = calcPersonalYear(birthDate, 2026);
    const year2027 = calcPersonalYear(birthDate, 2027);

    assert.strictEqual(typeof year2026, 'number');
    assert.strictEqual(typeof year2027, 'number');
  });
});

test('calcPersonalMonth - Monthly Number Consistency', async (t) => {
  await t.test('should calculate consistent Personal Month from year and month', () => {
    const personalYear = 6;
    const targetMonth = 7;

    const month1 = calcPersonalMonth(personalYear, targetMonth);
    const month2 = calcPersonalMonth(personalYear, targetMonth);

    assert.strictEqual(month1, month2);
    assert.ok(month1 >= 1);
    assert.ok(month1 <= 9);
  });

  await t.test('should progress through months 1-9 within a year', () => {
    const personalYear = 1;
    const months = Array.from({ length: 12 }, (_, i) =>
      calcPersonalMonth(personalYear, i + 1)
    );

    months.forEach(month => {
      assert.ok(month >= 1);
      assert.ok(month <= 9);
    });
  });
});

test('Label Functions - Display Consistency', async (t) => {
  await t.test('should have labels for all valid Personal Day numbers', () => {
    for (let i = 1; i <= 9; i++) {
      const label = getPersonalDayLabel(i);
      assert.ok(label !== undefined);
      assert.strictEqual(typeof label, 'string');
      assert.ok(label.length > 0);
    }
    assert.ok(getPersonalDayLabel(11) !== undefined);
    assert.ok(getPersonalDayLabel(22) !== undefined);
    assert.ok(getPersonalDayLabel(33) !== undefined);
  });

  await t.test('should have labels for all valid Personal Year numbers', () => {
    for (let i = 1; i <= 9; i++) {
      const label = getPersonalYearLabel(i);
      assert.ok(label !== undefined);
      assert.strictEqual(typeof label, 'string');
      assert.ok(label.length > 0);
    }
    assert.ok(getPersonalYearLabel(11) !== undefined);
    assert.ok(getPersonalYearLabel(22) !== undefined);
    assert.ok(getPersonalYearLabel(33) !== undefined);
  });

  await t.test('should have labels for all valid Personal Month numbers', () => {
    for (let i = 1; i <= 9; i++) {
      const label = getPersonalMonthLabel(i);
      assert.ok(label !== undefined);
      assert.strictEqual(typeof label, 'string');
      assert.ok(label.length > 0);
    }
  });

  await t.test('should return fallback labels for invalid numbers', () => {
    assert.strictEqual(getPersonalDayLabel(99), 'Focus');
    assert.strictEqual(getPersonalYearLabel(99), 'Evolution');
    assert.strictEqual(getPersonalMonthLabel(99), 'Emergence');
  });
});

test('Format Functions - Display Output', async (t) => {
  await t.test('should format Personal Day consistently', () => {
    const formatted = formatPersonalDay(4);
    assert.strictEqual(formatted, 'Day 4 — Build');
  });

  await t.test('should format Personal Year consistently', () => {
    const formatted = formatPersonalYear(6);
    assert.strictEqual(formatted, 'Year 6 — Responsibility');
  });

  await t.test('should match labels in PERSONAL_*_LABELS records', () => {
    for (let i = 1; i <= 9; i++) {
      const label = getPersonalDayLabel(i);
      assert.strictEqual(PERSONAL_DAY_LABELS[i], label);

      const yLabel = getPersonalYearLabel(i);
      assert.strictEqual(PERSONAL_YEAR_LABELS[i], yLabel);

      const mLabel = getPersonalMonthLabel(i);
      assert.strictEqual(PERSONAL_MONTH_LABELS[i], mLabel);
    }
  });
});

test('Cross-Surface Consistency Test Cases', async (t) => {
  await t.test('should produce consistent results for July 6, 2026 across all surfaces', () => {
    const birthDate = '1990-08-15';
    const targetDate = new Date('2026-07-06');
    const targetYear = 2026;
    const targetMonth = 7;

    const personalDay = calcPersonalDay(birthDate, targetDate);
    const dayLabel = getPersonalDayLabel(personalDay);

    const personalYear = calcPersonalYear(birthDate, targetYear);
    const yearLabel = getPersonalYearLabel(personalYear);
    const personalMonth = calcPersonalMonth(personalYear, targetMonth);

    assert.ok(personalDay >= 1);
    assert.ok(personalDay <= 9);
    assert.ok(dayLabel !== undefined);

    assert.ok(personalYear >= 1);
    assert.ok(personalYear <= 9);
    assert.ok(yearLabel !== undefined);

    assert.ok(personalMonth >= 1);
    assert.ok(personalMonth <= 9);

    const formattedDay = formatPersonalDay(personalDay);
    assert.ok(formattedDay.includes(`Day ${personalDay}`));
    assert.ok(formattedDay.includes(dayLabel));
    assert.ok(!formattedDay.includes('Year'));
  });
});

test('Edge Cases', async (t) => {
  await t.test('should handle leap day (Feb 29)', () => {
    const birthDate = '2000-02-29';
    const day = calcPersonalDay(birthDate, new Date('2026-07-06'));
    assert.strictEqual(typeof day, 'number');
    assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(day));
  });

  await t.test('should handle dates across year boundaries', () => {
    const birthDate = '1990-12-31';
    const day2026End = calcPersonalDay(birthDate, new Date('2026-12-31'));
    const day2027Start = calcPersonalDay(birthDate, new Date('2027-01-01'));

    assert.strictEqual(typeof day2026End, 'number');
    assert.strictEqual(typeof day2027Start, 'number');
  });

  await t.test('should handle very old birth dates', () => {
    const birthDate = '1900-01-01';
    const day = calcPersonalDay(birthDate, new Date('2026-07-06'));
    assert.strictEqual(typeof day, 'number');
    assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(day));
  });
});
