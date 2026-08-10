import {
  calcLifePath,
  calcExpression,
  calcSoulUrge,
  calcPersonality,
} from '@soulcodex/core/compute/numerology';
import { calcPersonalYear } from '@soulcodex/core/compute/personal-numbers';

interface ResolvedNumerologyData {
  status: 'resolved';
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  personalYear: number;
  interpretations: {
    lifePath: string;
    expression: string;
    soulUrge: string;
    personality: string;
    personalYear: string;
  };
}

interface UnresolvedNumerologyData {
  status: 'unresolved';
  reason: string;
  lifePath?: undefined;
  expression?: undefined;
  soulUrge?: undefined;
  personality?: undefined;
  personalYear?: undefined;
  interpretations?: undefined;
}

export type NumerologyData = ResolvedNumerologyData | UnresolvedNumerologyData;

function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return true;
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
  const expression = calcExpression(fullName);
  const soulUrge = calcSoulUrge(fullName);
  const personality = calcPersonality(fullName);
  const personalYear = calcPersonalYear(birthDate);

  return {
    status: 'resolved',
    lifePath,
    expression,
    soulUrge,
    personality,
    personalYear,
    interpretations: {
      lifePath: interpretations.lifePath[lifePath as keyof typeof interpretations.lifePath] || "Unique path of spiritual growth",
      expression: `Expression Number ${expression}: Your talents and abilities shine through creative manifestation.`,
      soulUrge: `Soul Urge ${soulUrge}: Your heart's deepest desires drive you toward meaningful experiences.`,
      personality: `Personality Number ${personality}: Others perceive you as someone with distinctive character traits.`,
      personalYear: `Personal Year ${personalYear}: This year brings opportunities aligned with your current growth cycle.`
    }
  };
}
