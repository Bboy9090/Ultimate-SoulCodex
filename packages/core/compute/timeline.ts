/**
 * Shared Timeline logic: Numerology Cycles & Transitions
 *
 * This file contains the "reusable logic" extracted from the client-side
 * TimelinePage. It focuses on the math and reasoning (timing) while
 * leaving the presentation content (copy) in the UI layer.
 */

import { calcPersonalYear, calcPersonalMonth } from './personal-numbers.js';

export { calcPersonalYear, calcPersonalMonth };

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
