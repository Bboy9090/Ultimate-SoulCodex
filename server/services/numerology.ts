import {
  calcLifePath,
  calcBirthday,
  calcExpression,
  calcSoulUrge,
  calcPersonality,
  calcMaturity,
  calcPersonalYear,
  normalizeNumerologyName,
  parseDateOnly,
} from '@soulcodex/core';

interface ResolvedNumerologyData {
  status: 'resolved';
  lifePath: number;
  birthday: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
  personalYear: number;
  interpretations: {
    lifePath: string;
    birthday: string;
    expression: string;
    soulUrge: string;
    personality: string;
    maturity: string;
    personalYear: string;
  };
}

interface UnresolvedNumerologyData {
  status: 'unresolved';
  reason: string;
  lifePath?: undefined;
  birthday?: undefined;
  expression?: undefined;
  soulUrge?: undefined;
  personality?: undefined;
  maturity?: undefined;
  personalYear?: undefined;
  interpretations?: undefined;
}

export type NumerologyData = ResolvedNumerologyData | UnresolvedNumerologyData;

function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  try {
    parseDateOnly(dateStr);
    return true;
  } catch {
    return false;
  }
}

function isValidName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    normalizeNumerologyName(name).length > 0
  );
}

const interpretations = {
  lifePath: {
    1: "Life Path 1 is traditionally associated with initiative, independence, and beginning.",
    2: "Life Path 2 is traditionally associated with cooperation, sensitivity, and partnership.",
    3: "Life Path 3 is traditionally associated with expression, creativity, and communication.",
    4: "Life Path 4 is traditionally associated with structure, discipline, and practical building.",
    5: "Life Path 5 is traditionally associated with change, adaptability, and freedom.",
    6: "Life Path 6 is traditionally associated with responsibility, care, and stewardship.",
    7: "Life Path 7 is traditionally associated with inquiry, reflection, and analysis.",
    8: "Life Path 8 is traditionally associated with execution, material organization, and leadership.",
    9: "Life Path 9 is traditionally associated with completion, contribution, and broad perspective.",
    11: "Life Path 11 is traditionally treated as a master-number theme of inspiration and heightened perspective.",
    22: "Life Path 22 is traditionally treated as a master-number theme of large-scale building and implementation.",
    33: "Life Path 33 is traditionally treated as a master-number theme of teaching, service, and care."
  }
};
export function calculateNumerology(
  fullName: string,
  birthDate: string,
  targetYear: number = new Date().getUTCFullYear(),
): NumerologyData {
  // FAIL-CLOSED: Validate inputs before calculating
  if (!isValidName(fullName)) {
    return {
      status: 'unresolved',
      reason: fullName ? `Name "${fullName}" contains no usable letters` : 'Name is required',
    };
  }

  if (!isValidDate(birthDate)) {
    return {
      status: 'unresolved',
      reason: birthDate ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format or is not a real date` : 'Birth date is required',
    };
  }

  if (!Number.isInteger(targetYear) || targetYear < 1 || targetYear > 9999) {
    return {
      status: 'unresolved',
      reason: `Target year "${targetYear}" is invalid`,
    };
  }

  // Only calculate if inputs are valid
  const lifePath = calcLifePath(birthDate);
  const birthday = calcBirthday(birthDate);
  const expression = calcExpression(fullName);
  const soulUrge = calcSoulUrge(fullName);
  const personality = calcPersonality(fullName);
  const maturity = calcMaturity(birthDate, fullName);
  const personalYear = calcPersonalYear(birthDate, targetYear);

  return {
    status: 'resolved',
    lifePath,
    birthday,
    expression,
    soulUrge,
    personality,
    maturity,
    personalYear,
    interpretations: {
      lifePath: interpretations.lifePath[lifePath as keyof typeof interpretations.lifePath] || `Life Path ${lifePath} is a deterministic number used here as symbolic reflection.`,
      birthday: `Birthday Number ${birthday}: deterministic reduction of the calendar day, used here as symbolic reflection.`,
      expression: `Expression Number ${expression}: deterministic Pythagorean name-number mapping, used here as symbolic reflection rather than a measured talent profile.`,
      soulUrge: `Soul Urge ${soulUrge}: deterministic vowel-number mapping, used here as symbolic reflection rather than a factual statement about inner desires.`,
      personality: `Personality Number ${personality}: deterministic consonant-number mapping, used here as symbolic reflection rather than a factual statement about how others perceive you.`,
      maturity: `Maturity Number ${maturity}: deterministic combination of Life Path and Expression, used here as symbolic reflection.`,
      personalYear: `Personal Year ${personalYear} for ${targetYear}: deterministic calendar-year cycle under the Soul Codex numerology policy, used as a reflective timing theme rather than a prediction.`
    }
  };
}
