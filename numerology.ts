import {
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcPersonality,
  calcPersonalYear,
  calcSoulUrge,
} from "@soulcodex/core";

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

export const personalYear = (
  isoDOB?: string,
  today = new Date(),
): number | null => {
  if (!isoDOB || Number.isNaN(today.getTime())) return null;
  try {
    return calcPersonalYear(isoDOB, today.getFullYear());
  } catch {
    return null;
  }
};

export const hasNineHarmony = (
  lp1: number | null,
  bd2: number | null,
): boolean => {
  if (lp1 === null || bd2 === null) return false;
  return lp1 + bd2 === 9;
};

export const expressionNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  try {
    return calcExpression(fullName);
  } catch {
    return null;
  }
};

export const soulUrge = (fullName?: string): number | null => {
  if (!fullName) return null;
  try {
    return calcSoulUrge(fullName);
  } catch {
    return null;
  }
};

export const personalityNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  try {
    return calcPersonality(fullName);
  } catch {
    return null;
  }
};

export const calculateNumerology = (name?: string, birthDate?: string) => ({
  lifePath: lifePath(birthDate),
  birthDay: birthDay(birthDate),
  expressionNumber: expressionNumber(name),
  soulUrge: soulUrge(name),
  personalityNumber: personalityNumber(name),
  personalYear: personalYear(birthDate),
});
