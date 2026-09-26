import {
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcPersonalYear,
  calcPersonality,
  calcSoulUrge,
  normalizeNumerologyName,
  parseDateOnly,
} from '@soulcodex/core';

function validDateOnly(value?: string): value is string {
  if (!value) return false;
  try {
    parseDateOnly(value);
    return true;
  } catch {
    return false;
  }
}

function validNumerologyName(value?: string): value is string {
  return typeof value === 'string' && normalizeNumerologyName(value).length > 0;
}

/**
 * Legacy astrology-package adapters.
 *
 * Calculation authority lives in @soulcodex/core. These wrappers preserve the
 * nullable historical API without maintaining a second numerology algorithm.
 */
export const lifePath = (isoDOB?: string): number | null =>
  validDateOnly(isoDOB) ? calcLifePath(isoDOB) : null;

export const birthDay = (isoDOB?: string): number | null =>
  validDateOnly(isoDOB) ? calcBirthday(isoDOB) : null;

export const personalYear = (isoDOB?: string, today = new Date()): number | null => {
  if (!validDateOnly(isoDOB) || Number.isNaN(today.getTime())) return null;
  return calcPersonalYear(isoDOB, today.getFullYear());
};

export const hasNineHarmony = (lp1: number | null, bd2: number | null): boolean => {
  if (lp1 === null || bd2 === null) return false;
  return lp1 + bd2 === 9;
};

export const expressionNumber = (fullName?: string): number | null =>
  validNumerologyName(fullName) ? calcExpression(fullName) : null;

export const soulUrge = (fullName?: string): number | null =>
  validNumerologyName(fullName) ? calcSoulUrge(fullName) : null;

export const personalityNumber = (fullName?: string): number | null =>
  validNumerologyName(fullName) ? calcPersonality(fullName) : null;

export const calculateNumerology = (name?: string, birthDate?: string) => ({
  lifePath: lifePath(birthDate),
  birthDay: birthDay(birthDate),
  expressionNumber: expressionNumber(name),
  soulUrge: soulUrge(name),
  personalityNumber: personalityNumber(name),
  personalYear: personalYear(birthDate),
});
