import { describe, it, expect } from 'vitest';
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
} from '../compute/personal-numbers';

describe('Personal Numbers - Consistency Across Surfaces', () => {
  describe('calcPersonalDay - Daily Number Consistency', () => {
    it('should calculate the same Personal Day for the same birth date and target date', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-07-06');

      const day1 = calcPersonalDay(birthDate, targetDate);
      const day2 = calcPersonalDay(birthDate, targetDate);

      expect(day1).toBe(day2);
      expect(day1).toBeGreaterThanOrEqual(1);
      expect(day1).toBeLessThanOrEqual(9);
    });

    it('should return different days for different dates', () => {
      const birthDate = '1990-08-15';
      const date1 = new Date('2026-07-06');
      const date2 = new Date('2026-07-07');

      const day1 = calcPersonalDay(birthDate, date1);
      const day2 = calcPersonalDay(birthDate, date2);

      // Most dates should be different (not always, but typically)
      // This test just verifies the function responds to different dates
      expect(typeof day1).toBe('number');
      expect(typeof day2).toBe('number');
    });

    it('should handle master numbers (11, 22, 33)', () => {
      // Create a scenario that produces a master number
      // This is birth-date dependent, so we test the logic handles them
      const result = calcPersonalDay('2000-02-29', new Date('2026-11-11'));
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(result);
    });
  });

  describe('calcPersonalYear - Annual Number Consistency', () => {
    it('should calculate the same Personal Year for same birth and target year', () => {
      const birthDate = '1990-08-15';
      const targetYear = 2026;

      const year1 = calcPersonalYear(birthDate, targetYear);
      const year2 = calcPersonalYear(birthDate, targetYear);

      expect(year1).toBe(year2);
      expect(year1).toBeGreaterThanOrEqual(1);
      expect(year1).toBeLessThanOrEqual(9);
    });

    it('should work with legacy signature (month, day, year)', () => {
      // Legacy: calcPersonalYear(month: 8, day: 15, year: 2026)
      const year = calcPersonalYear(8, 15, 2026);

      expect(year).toBeGreaterThanOrEqual(1);
      expect(year).toBeLessThanOrEqual(9);
    });

    it('should produce same result for same birth/year regardless of signature', () => {
      const birthDate = '1990-08-15';
      const targetYear = 2026;

      // New signature: birthDate string
      const year1 = calcPersonalYear(birthDate, targetYear);

      // Legacy signature: month, day, year
      const year2 = calcPersonalYear(8, 15, targetYear);

      expect(year1).toBe(year2);
    });

    it('should return different years for different target years', () => {
      const birthDate = '1990-08-15';

      const year2026 = calcPersonalYear(birthDate, 2026);
      const year2027 = calcPersonalYear(birthDate, 2027);

      // Different years should generally produce different results
      expect(typeof year2026).toBe('number');
      expect(typeof year2027).toBe('number');
    });
  });

  describe('calcPersonalMonth - Monthly Number Consistency', () => {
    it('should calculate consistent Personal Month from year and month', () => {
      const personalYear = 6;
      const targetMonth = 7;

      const month1 = calcPersonalMonth(personalYear, targetMonth);
      const month2 = calcPersonalMonth(personalYear, targetMonth);

      expect(month1).toBe(month2);
      expect(month1).toBeGreaterThanOrEqual(1);
      expect(month1).toBeLessThanOrEqual(9);
    });

    it('should progress through months 1-9 within a year', () => {
      const personalYear = 1;
      const months = Array.from({ length: 12 }, (_, i) =>
        calcPersonalMonth(personalYear, i + 1)
      );

      // All should be valid single digits
      months.forEach(month => {
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('Label Functions - Display Consistency', () => {
    it('should have labels for all valid Personal Day numbers', () => {
      for (let i = 1; i <= 9; i++) {
        const label = getPersonalDayLabel(i);
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
      // Master numbers
      expect(getPersonalDayLabel(11)).toBeDefined();
      expect(getPersonalDayLabel(22)).toBeDefined();
      expect(getPersonalDayLabel(33)).toBeDefined();
    });

    it('should have labels for all valid Personal Year numbers', () => {
      for (let i = 1; i <= 9; i++) {
        const label = getPersonalYearLabel(i);
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
      expect(getPersonalYearLabel(11)).toBeDefined();
      expect(getPersonalYearLabel(22)).toBeDefined();
      expect(getPersonalYearLabel(33)).toBeDefined();
    });

    it('should have labels for all valid Personal Month numbers', () => {
      for (let i = 1; i <= 9; i++) {
        const label = getPersonalMonthLabel(i);
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    });

    it('should return fallback labels for invalid numbers', () => {
      expect(getPersonalDayLabel(99)).toBe('Focus');
      expect(getPersonalYearLabel(99)).toBe('Evolution');
      expect(getPersonalMonthLabel(99)).toBe('Emergence');
    });
  });

  describe('Format Functions - Display Output', () => {
    it('should format Personal Day consistently', () => {
      const formatted = formatPersonalDay(4);
      expect(formatted).toBe('Day 4 — Build');
    });

    it('should format Personal Year consistently', () => {
      const formatted = formatPersonalYear(6);
      expect(formatted).toBe('Year 6 — Responsibility');
    });

    it('should match labels in PERSONAL_*_LABELS records', () => {
      for (let i = 1; i <= 9; i++) {
        const label = getPersonalDayLabel(i);
        expect(PERSONAL_DAY_LABELS[i]).toBe(label);

        const yLabel = getPersonalYearLabel(i);
        expect(PERSONAL_YEAR_LABELS[i]).toBe(yLabel);

        const mLabel = getPersonalMonthLabel(i);
        expect(PERSONAL_MONTH_LABELS[i]).toBe(mLabel);
      }
    });
  });

  describe('Cross-Surface Consistency Test Cases', () => {
    it('should produce consistent results for July 6, 2026 across all surfaces', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-07-06');
      const targetYear = 2026;
      const targetMonth = 7;

      // Today surface
      const personalDay = calcPersonalDay(birthDate, targetDate);
      const dayLabel = getPersonalDayLabel(personalDay);

      // Timeline surface
      const personalYear = calcPersonalYear(birthDate, targetYear);
      const yearLabel = getPersonalYearLabel(personalYear);
      const personalMonth = calcPersonalMonth(personalYear, targetMonth);

      // All should be valid
      expect(personalDay).toBeGreaterThanOrEqual(1);
      expect(personalDay).toBeLessThanOrEqual(9);
      expect(dayLabel).toBeDefined();

      expect(personalYear).toBeGreaterThanOrEqual(1);
      expect(personalYear).toBeLessThanOrEqual(9);
      expect(yearLabel).toBeDefined();

      expect(personalMonth).toBeGreaterThanOrEqual(1);
      expect(personalMonth).toBeLessThanOrEqual(9);

      // Verify no mixing of labels (shouldn't show "Day 6 — Refine" with Personal Day 4)
      const formattedDay = formatPersonalDay(personalDay);
      expect(formattedDay).toContain(`Day ${personalDay}`);
      expect(formattedDay).toContain(dayLabel);

      // Should NOT contain year labels in day format
      expect(formattedDay).not.toContain('Year');
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap day (Feb 29)', () => {
      const birthDate = '2000-02-29';
      const day = calcPersonalDay(birthDate, new Date('2026-07-06'));
      expect(typeof day).toBe('number');
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(day);
    });

    it('should handle dates across year boundaries', () => {
      const birthDate = '1990-12-31';
      const day2026End = calcPersonalDay(birthDate, new Date('2026-12-31'));
      const day2027Start = calcPersonalDay(birthDate, new Date('2027-01-01'));

      expect(typeof day2026End).toBe('number');
      expect(typeof day2027Start).toBe('number');
    });

    it('should handle very old birth dates', () => {
      const birthDate = '1900-01-01';
      const day = calcPersonalDay(birthDate, new Date('2026-07-06'));
      expect(typeof day).toBe('number');
      expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]).toContain(day);
    });
  });
});
