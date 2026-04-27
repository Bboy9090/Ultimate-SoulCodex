/**
 * Shared Timeline logic: Numerology Cycles & Transitions
 * 
 * This file contains the "reusable logic" extracted from the client-side
 * TimelinePage. It focuses on the math and reasoning (timing) while
 * leaving the presentation content (copy) in the UI layer.
 */

function reduceToSingle(n: number): number {
  let s = n;
  while (s > 9) {
    const digits = String(s).split("");
    s = digits.reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return s;
}

/**
 * Calculates the Personal Year number based on birth month/day and the target year.
 */
export function calcPersonalYear(birthMonth: number, birthDay: number, targetYear: number): number {
  return reduceToSingle(reduceToSingle(birthMonth) + reduceToSingle(birthDay) + reduceToSingle(targetYear));
}

/**
 * Calculates the Personal Month number based on the Personal Year and target month.
 */
export function calcPersonalMonth(personalYear: number, targetMonth: number): number {
  return reduceToSingle(personalYear + targetMonth);
}

/**
 * Reasoning for the transition state between phases.
 */
export function getCycleTransitionState(currentMonth: number) {
  const monthsRemaining = 12 - currentMonth; // 0 = December, 8 = April
  return {
    monthsRemaining,
    isUrgent: monthsRemaining <= 1, // this month or next month
    isNear: monthsRemaining <= 3,   // within 3 months
  };
}

export function getNextYearNum(py: number): number {
  return py === 9 ? 1 : py + 1;
}

export function getNextMonthNum(pm: number): number {
  return pm === 9 ? 1 : pm + 1;
}
