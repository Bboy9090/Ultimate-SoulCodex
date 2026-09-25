import {
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcPersonalYear,
} from "@soulcodex/core";

/**
 * Legacy compatibility adapter.
 *
 * All math delegates to the canonical @soulcodex/core numerology engine so
 * date-only parsing, master-number policy, and cross-platform behavior cannot
 * diverge between old routes and the production engine.
 */
export const lifePath = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  try {
    return calcLifePath(isoDOB);
  } catch {
    return null;
  }
};

export const birthDay = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  try {
    return calcBirthday(isoDOB);
  } catch {
    return null;
  }
};

export const personalYear = (isoDOB?: string, today = new Date()): number | null => {
  if (!isoDOB) return null;
  try {
    return calcPersonalYear(isoDOB, today.getFullYear());
  } catch {
    return null;
  }
};

export const hasNineHarmony = (lp1: number | null, bd2: number | null): boolean => {
  if (lp1 === null || bd2 === null) return false;
  return (lp1 + bd2) === 9;
};

export const expressionNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  try {
    return calcExpression(fullName);
  } catch {
    return null;
  }
};

export const calculateNumerology = (name?: string, birthDate?: string) => {
  return {
    lifePath: lifePath(birthDate),
    birthDay: birthDay(birthDate),
    expressionNumber: expressionNumber(name),
    personalYear: personalYear(birthDate),
  };
};
