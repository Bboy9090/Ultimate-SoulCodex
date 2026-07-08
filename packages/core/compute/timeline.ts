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

export function calcPersonalDay(birthMonth: number, birthDay: number, targetDate: Date): number {
  const py = calcPersonalYear(birthMonth, birthDay, targetDate.getFullYear());
  const pm = calcPersonalMonth(py, targetDate.getMonth() + 1);
  return reduceToSingle(pm + targetDate.getDate());
}

export const DAY_LABELS: Record<number, { label: string; theme: string }> = {
  1: { label: "Initiate", theme: "a starting phase for bold moves, independence, and forward momentum" },
  2: { label: "Connect", theme: "a receptive phase for listening, partnerships, and patience" },
  3: { label: "Express", theme: "a creative phase for speaking up, sharing, and social energy" },
  4: { label: "Build", theme: "a structure phase for order, discipline, and follow-through" },
  5: { label: "Shift", theme: "a change phase for movement, freedom, and clearing the stale" },
  6: { label: "Tend", theme: "a responsibility phase for home, health, and showing up" },
  7: { label: "Reflect", theme: "an inner phase for study, solitude, and trusting the pattern" },
  8: { label: "Command", theme: "a power phase for bold calls, boundaries, and leverage" },
  9: { label: "Release", theme: "a completion phase for closing chapters, giving, and letting go" },
};
