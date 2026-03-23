interface NumerologyData {
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

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

function calculateLifePath(birthDate: string): number {
  const date = new Date(birthDate);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  return reduceToSingleDigit(sum);
}

function getLetterValue(letter: string): number {
  const values: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };
  return values[letter.toUpperCase()] || 0;
}

function calculateExpression(fullName: string): number {
  const sum = fullName.replace(/[^A-Z]/gi, '').split('').reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  return reduceToSingleDigit(sum);
}

function calculateSoulUrge(fullName: string): number {
  const vowels = 'AEIOU';
  const sum = fullName.replace(/[^A-Z]/gi, '').split('').reduce((total, letter) => {
    return vowels.includes(letter.toUpperCase()) ? total + getLetterValue(letter) : total;
  }, 0);
  return reduceToSingleDigit(sum);
}

function calculatePersonality(fullName: string): number {
  const vowels = 'AEIOU';
  const sum = fullName.replace(/[^A-Z]/gi, '').split('').reduce((total, letter) => {
    return !vowels.includes(letter.toUpperCase()) ? total + getLetterValue(letter) : total;
  }, 0);
  return reduceToSingleDigit(sum);
}

function calculatePersonalYear(birthDate: string): number {
  const date = new Date(birthDate);
  const currentYear = new Date().getFullYear();
  const sum = date.getDate() + (date.getMonth() + 1) + currentYear;
  return reduceToSingleDigit(sum);
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
  const lifePath = calculateLifePath(birthDate);
  const expression = calculateExpression(fullName);
  const soulUrge = calculateSoulUrge(fullName);
  const personality = calculatePersonality(fullName);
  const personalYear = calculatePersonalYear(birthDate);

  return {
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
