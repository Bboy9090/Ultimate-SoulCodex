/**
 * Centralized Personal Numerology Calculations
 *
 * Single source of truth for all Personal Day, Personal Year, and Personal Month calculations.
 * Used consistently across Today, Profile, Timeline, and Codex surfaces.
 */

import { parseDateOnly } from './date-only.js';

export const PERSONAL_NUMEROLOGY_POLICY = Object.freeze({
  engineVersion: 'personal-numerology-v2',
  personalYearConvention: 'calendar-year' as const,
  personalYearRollover: 'January 1 of target calendar year' as const,
  masterNumbers: [11, 22, 33] as const,
});

type CalendarDateInput = string | Date;

function targetCalendarParts(targetDate: CalendarDateInput): { year: number; month: number; day: number } {
  if (typeof targetDate === 'string') {
    return parseDateOnly(targetDate);
  }
  if (!(targetDate instanceof Date) || Number.isNaN(targetDate.getTime())) {
    throw new RangeError('Target date must be a valid Date or YYYY-MM-DD string');
  }
  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1,
    day: targetDate.getDate(),
  };
}

export const PERSONAL_NUMEROLOGY_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
export type PersonalNumerologyValue = (typeof PERSONAL_NUMEROLOGY_VALUES)[number];
export const PERSONAL_YEAR_BOUNDARY_POLICY = 'calendar-year' as const;

export function isPersonalNumerologyValue(value: number): value is PersonalNumerologyValue {
  return PERSONAL_NUMEROLOGY_VALUES.includes(value as PersonalNumerologyValue);
}


function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function validMonthDay(month: number, day: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  const maximumDay = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return month >= 1 && month <= 12 && day >= 1 && day <= maximumDay;
}

/**
 * Calculates Personal Day Number based on birth date and target date.
 * Personal Day changes daily and is calculated from the entered birth month/day
 * plus the target calendar date. Soul Codex preserves 11, 22, and 33 whenever
 * the declared reduction policy reaches them.
 *
 * @example
 * calcPersonalDay("1990-08-15", new Date("2026-07-06")) // July 6, 2026 for someone born Aug 15
 */
export function dateOnlyFromLocalDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Target date must be valid');
  }
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function calcPersonalDayForDateISO(
  birthDate: string,
  targetDateISO: string,
): number {
  const { day: birthDay, month: birthMonth } = parseDateOnly(birthDate);
  const { day: targetDay, month: targetMonth, year: targetYear } = parseDateOnly(targetDateISO);

  const sum =
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(birthMonth) +
    reduceToSingleDigit(targetDay) +
    reduceToSingleDigit(targetMonth) +
    reduceToSingleDigit(targetYear);

  return reduceToSingleDigit(sum);
}

export function calcPersonalDay(
  birthDate: string,
  targetDate: Date | string = new Date(),
): number {
  const targetDateISO =
    typeof targetDate === 'string' ? targetDate : dateOnlyFromLocalDate(targetDate);
  return calcPersonalDayForDateISO(birthDate, targetDateISO);
}

/**
 * Calculates the Universal Day from the target calendar date using the same
 * declared reduction policy as the personal-number engine.
 */
export function calcUniversalDay(
  targetDate: Date | string = new Date(),
): number {
  const { year, month, day } = targetCalendarParts(targetDate);
  const sum =
    reduceToSingleDigit(day) +
    reduceToSingleDigit(month) +
    reduceToSingleDigit(year);
  return reduceToSingleDigit(sum);
}

/**
 * Calculates Personal Year Number based on birth month/day and target year.
 * Soul Codex uses the explicit calendar-year convention: the target year's
 * Personal Year applies from January 1 through December 31. It is calculated
 * from reduced birth month + reduced birth day + reduced target year, with
 * master numbers 11, 22, and 33 preserved when reached.
 *
 * @example
 * calcPersonalYear("1990-08-15", 2026) // 2026 year cycle for someone born Aug 15
 * calcPersonalYear("1990-08-15", 2026) // also accepts just the year as number
 */
export function calcPersonalYear(
  birthDateOrMonth: string | number,
  targetYearOrDay?: number,
  targetYearIfThreeArgs?: number
): number {
  let birthMonth: number;
  let birthDay: number;
  let targetYear: number;

  // Handle both signatures:
  // 1. (birthDate: string, targetYear: number)
  // 2. (birthMonth: number, birthDay: number, targetYear: number)
  if (typeof birthDateOrMonth === 'string') {
    const birth = parseDateOnly(birthDateOrMonth);
    birthMonth = birth.month;
    birthDay = birth.day;
    targetYear = targetYearOrDay ?? new Date().getUTCFullYear();
  } else {
    // Legacy signature: (month, day, year)
    birthMonth = birthDateOrMonth;
    birthDay = targetYearOrDay ?? 1;
    targetYear = targetYearIfThreeArgs ?? new Date().getUTCFullYear();
  }

  if (
    !validMonthDay(birthMonth, birthDay) ||
    !Number.isInteger(targetYear) || targetYear < 1 || targetYear > 9999
  ) {
    throw new RangeError('Personal Year requires a valid birth month/day and target year');
  }

  const sum =
    reduceToSingleDigit(birthMonth) +
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(targetYear);

  return reduceToSingleDigit(sum);
}

/**
 * Calculates Personal Month Number based on Personal Year and target month.
 * Personal Month is monthly within the Personal Year and follows the same
 * reduction policy, including preservation of 11, 22, and 33 when reached.
 * Calculated from: reduced(personal year) + reduced(target month)
 *
 * @example
 * calcPersonalMonth(6, 7) // Personal Month during July if Personal Year is 6
 */
export function calcPersonalMonth(personalYear: number, targetMonth: number): number {
  if (!isPersonalNumerologyValue(personalYear)) {
    throw new RangeError('Personal Month requires Personal Year 1-9, 11, 22, or 33');
  }
  if (!Number.isInteger(targetMonth) || targetMonth < 1 || targetMonth > 12) {
    throw new RangeError('Personal Month requires calendar month 1-12');
  }

  const sum = reduceToSingleDigit(personalYear) + reduceToSingleDigit(targetMonth);
  return reduceToSingleDigit(sum);
}

/**
 * Personal Number Labels - displayed across all surfaces
 */
export const PERSONAL_DAY_LABELS: Record<number, string> = {
  1: "Initiate",
  2: "Cooperate",
  3: "Create",
  4: "Build",
  5: "Liberate",
  6: "Refine",
  7: "Introspect",
  8: "Execute",
  9: "Complete",
  11: "Illuminate",
  22: "Manifest",
  33: "Transcend",
};

export const PERSONAL_YEAR_LABELS: Record<number, string> = {
  1: "New Cycle",
  2: "Partnership",
  3: "Creative Expression",
  4: "Foundation",
  5: "Liberation",
  6: "Responsibility",
  7: "Reflection",
  8: "Abundance",
  9: "Completion",
  11: "Spiritual Awakening",
  22: "Master Building",
  33: "Divine Service",
};

export const PERSONAL_MONTH_LABELS: Record<number, string> = {
  1: "Beginning",
  2: "Alignment",
  3: "Expression",
  4: "Grounding",
  5: "Evolution",
  6: "Nurturing",
  7: "Stillness",
  8: "Power",
  9: "Closure",
  11: "Intuition",
  22: "Vision",
  33: "Compassion",
};

/**
 * Gets the display label for a Personal Day
 * @example
 * getPersonalDayLabel(4) // "Build"
 */
export function getPersonalDayLabel(dayNumber: number): string {
  return PERSONAL_DAY_LABELS[dayNumber] || "Focus";
}

/**
 * Gets the display label for a Personal Year
 * @example
 * getPersonalYearLabel(6) // "Responsibility"
 */
export function getPersonalYearLabel(yearNumber: number): string {
  return PERSONAL_YEAR_LABELS[yearNumber] || "Evolution";
}

/**
 * Gets the display label for a Personal Month
 * @example
 * getPersonalMonthLabel(3) // "Expression"
 */
export function getPersonalMonthLabel(monthNumber: number): string {
  return PERSONAL_MONTH_LABELS[monthNumber] || "Emergence";
}

/**
 * Format for consistent display across all surfaces
 * @example
 * formatPersonalDay(4) // "Day 4 — Build"
 */
export function formatPersonalDay(dayNumber: number): string {
  return `Day ${dayNumber} — ${getPersonalDayLabel(dayNumber)}`;
}

/**
 * Format for consistent display across all surfaces
 * @example
 * formatPersonalYear(6) // "Year 6 — Responsibility"
 */
export function formatPersonalYear(yearNumber: number): string {
  return `Year ${yearNumber} — ${getPersonalYearLabel(yearNumber)}`;
}
