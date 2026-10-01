import {
  calcLifePath,
  calcBirthday,
  calcExpression,
  calcSoulUrge,
  calcPersonality,
  calcMaturity,
  calcPersonalYear,
} from '@soulcodex/core';

interface ResolvedNumerologyData {
  status: 'resolved';
  lifePath: number;
  birthday: number;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
  maturity: number | null;
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
  if (!name || typeof name !== 'string') return false;
  const letters = name.replace(/[^A-Za-z]/g, '');
  return letters.length > 0;
}

const interpretations = {
  lifePath: {
    1: "The Leader - You are here to pioneer new paths and lead with independence and innovation.",
    2: "The Peacemaker - Your purpose involves cooperation, diplomacy, and bringing harmony to relationships.",
    3: "The Creative Communicator - You're meant to express yourself creatively and inspire others through art and communication.",
    4: "The Builder - Your mission is to create stable foundations and work systematically toward practical goals.",
    5: "The Freedom Seeker - You're here to experience variety, adventure, and help others embrace change.",
    6: "The Nurturer - Your path involves caring for others, creating harmony in home and community.",
    7: "The Seeker - You're meant to search for deeper truths and develop your spiritual understanding.",
    8: "The Achiever - Your purpose involves material mastery and learning to balance power with wisdom.",
    9: "The Humanitarian - You're here to serve the greater good and help humanity evolve.",
    11: "The Intuitive Master - You have a special mission to inspire others through your heightened sensitivity and intuition.",
    22: "The Master Builder - You're here to manifest grand visions that benefit humanity on a large scale.",
    33: "The Master Healer - Your purpose involves healing and uplifting others through unconditional love."
  }
};

export function calculateNumerology(fullBirthName: string | null | undefined, birthDate: string): NumerologyData {
  // Date-based numerology must remain available even when the full birth name
  // is unknown. Name-based numerology is never inferred from a display name.
  if (!isValidDate(birthDate)) {
    return {
      status: 'unresolved',
      reason: birthDate ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format or is not a real date` : 'Birth date is required',
    };
  }

  const lifePath = calcLifePath(birthDate);
  const birthday = calcBirthday(birthDate);
  const personalYear = calcPersonalYear(birthDate);

  const normalizedBirthName =
    typeof fullBirthName === 'string' && fullBirthName.trim()
      ? fullBirthName.trim()
      : null;
  const usableBirthName =
    normalizedBirthName && isValidName(normalizedBirthName)
      ? normalizedBirthName
      : null;
  const expression = usableBirthName ? calcExpression(usableBirthName) : null;
  const soulUrge = usableBirthName ? calcSoulUrge(usableBirthName) : null;
  const personality = usableBirthName ? calcPersonality(usableBirthName) : null;
  const maturity = usableBirthName ? calcMaturity(birthDate, usableBirthName) : null;

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
      lifePath: interpretations.lifePath[lifePath as keyof typeof interpretations.lifePath] || "Unique path of spiritual growth",
      birthday: `Birthday Number ${birthday}: a deterministic reduction of the calendar day of birth used as symbolic reflection.`,
      expression: expression === null
        ? "Expression unavailable: full birth name was not supplied."
        : `Expression Number ${expression}: deterministic from the supplied full birth name; interpretation is symbolic.`,
      soulUrge: soulUrge === null
        ? "Soul Urge unavailable: full birth name was not supplied."
        : `Soul Urge ${soulUrge}: deterministic from vowels in the supplied full birth name; interpretation is symbolic.`,
      personality: personality === null
        ? "Personality Number unavailable: full birth name was not supplied."
        : `Personality Number ${personality}: deterministic from consonants in the supplied full birth name; interpretation is symbolic.`,
      maturity: maturity === null
        ? "Maturity Number unavailable: full birth name was not supplied."
        : `Maturity Number ${maturity}: deterministic from Life Path plus Expression using the supplied full birth name; interpretation is symbolic.`,
      personalYear: `Personal Year ${personalYear}: This year brings opportunities aligned with your current growth cycle.`
    }
  };
}
