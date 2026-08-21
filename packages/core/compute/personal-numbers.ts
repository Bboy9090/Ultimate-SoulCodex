/**
 * Centralized Personal Numerology Calculations
 *
 * Single source of truth for all Personal Day, Personal Year, and Personal Month calculations.
 * Used consistently across Today, Profile, Timeline, and Codex surfaces.
 */

import { parseDateOnly } from './date-only.js';

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

/**
 * Calculates Personal Day Number based on birth date and target date.
 * Personal Day changes daily and is calculated from:
 * reduced(birth day) + reduced(birth month) + reduced(current day) + reduced(current month) + reduced(current year)
 *
 * @example
 * calcPersonalDay("1990-08-15", new Date("2026-07-06")) // July 6, 2026 for someone born Aug 15
 */
export function calcPersonalDay(birthDate: string, targetDate: Date = new Date()): number {
  const { day: birthDay, month: birthMonth } = parseDateOnly(birthDate);
  const targetDay = targetDate.getDate();
  const targetMonth = targetDate.getMonth() + 1;
  const targetYear = targetDate.getFullYear();

  const sum =
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(birthMonth) +
    reduceToSingleDigit(targetDay) +
    reduceToSingleDigit(targetMonth) +
    reduceToSingleDigit(targetYear);

  return reduceToSingleDigit(sum);
}

/**
 * Calculates Personal Year Number based on birth month/day and target year.
 * Personal Year is annual and changes on each birthday.
 * Calculated from: reduced(birth month) + reduced(birth day) + reduced(target year)
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
    targetYear = targetYearOrDay || new Date().getFullYear();
  } else {
    // Legacy signature: (month, day, year)
    birthMonth = birthDateOrMonth;
    birthDay = targetYearOrDay || 1;
    targetYear = targetYearIfThreeArgs || new Date().getFullYear();
  }

  const sum =
    reduceToSingleDigit(birthMonth) +
    reduceToSingleDigit(birthDay) +
    reduceToSingleDigit(targetYear);

  return reduceToSingleDigit(sum);
}

/**
 * Calculates Personal Month Number based on Personal Year and target month.
 * Personal Month is monthly and cycles 1-9 within the Personal Year.
 * Calculated from: reduced(personal year) + reduced(target month)
 *
 * @example
 * calcPersonalMonth(6, 7) // Personal Month during July if Personal Year is 6
 */
export function calcPersonalMonth(personalYear: number, targetMonth: number): number {
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
