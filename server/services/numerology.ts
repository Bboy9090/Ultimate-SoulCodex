import {
  calcLifePath,
  calcBirthday,
  calcExpression,
  calcSoulUrge,
  calcPersonality,
  calcMaturity,
  calcPersonalYear,
  normalizeNumerologyName,
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Reject invalid month/day ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Round-trip validation: ensure JavaScript doesn't normalize the date
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
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
export function calculateNumerology(fullName: string, birthDate: string): NumerologyData {
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

  // Only calculate if inputs are valid
  const lifePath = calcLifePath(birthDate);
  const birthday = calcBirthday(birthDate);
  const expression = calcExpression(fullName);
  const soulUrge = calcSoulUrge(fullName);
  const personality = calcPersonality(fullName);
  const maturity = calcMaturity(birthDate, fullName);
  const personalYear = calcPersonalYear(birthDate);

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
      personalYear: `Personal Year ${personalYear}: deterministic calendar-year cycle under the Soul Codex numerology policy, used as a reflective timing theme rather than a prediction.`
    }
  };
}
