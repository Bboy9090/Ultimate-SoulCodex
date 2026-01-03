const digitSum = (n: number): number => 
  Math.abs(n).toString().split("").reduce((a, b) => a + Number(b), 0);

const reduceCore = (n: number): number => {
  while (![11, 22, 33].includes(n) && n > 9) {
    n = digitSum(n);
  }
  return n;
};

export const lifePath = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  const d = new Date(isoDOB);
  const total = digitSum(d.getFullYear()) + digitSum(d.getMonth() + 1) + digitSum(d.getDate());
  return reduceCore(reduceCore(total));
};

export const birthDay = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  return reduceCore(new Date(isoDOB).getDate());
};

export const personalYear = (isoDOB?: string, today = new Date()): number | null => {
  if (!isoDOB) return null;
  const d = new Date(isoDOB);
  const total = digitSum(d.getMonth() + 1) + digitSum(d.getDate()) + digitSum(today.getFullYear());
  return reduceCore(total);
};

// Enhanced compatibility: Life Path + Birth Day combinations that add to 9
export const hasNineHarmony = (lp1: number | null, bd2: number | null): boolean => {
  if (lp1 === null || bd2 === null) return false;
  return (lp1 + bd2) === 9;
};

// Expression number from full name
const getLetterValue = (letter: string): number => {
  const values: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
  };
  return values[letter.toUpperCase()] || 0;
};

export const expressionNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  const sum = fullName.replace(/[^A-Z]/gi, '').split('').reduce((total, letter) => {
    return total + getLetterValue(letter);
  }, 0);
  return reduceCore(sum);
};

// Soul Urge number (vowels only)
export const soulUrge = (fullName?: string): number | null => {
  if (!fullName) return null;
  const vowels = 'AEIOU';
  const sum = fullName.toUpperCase().split('').reduce((total, letter) => {
    return vowels.includes(letter) ? total + getLetterValue(letter) : total;
  }, 0);
  return sum > 0 ? reduceCore(sum) : null;
};

// Personality number (consonants only)
export const personalityNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  const vowels = 'AEIOU';
  const sum = fullName.toUpperCase().split('').filter(c => /[A-Z]/.test(c)).reduce((total, letter) => {
    return !vowels.includes(letter) ? total + getLetterValue(letter) : total;
  }, 0);
  return sum > 0 ? reduceCore(sum) : null;
};

// Life Path interpretations
const LIFE_PATH_MEANINGS: Record<number, { title: string; traits: string[]; purpose: string }> = {
  1: { title: "The Leader", traits: ["Independent", "Ambitious", "Original"], purpose: "To lead and pioneer new paths" },
  2: { title: "The Diplomat", traits: ["Cooperative", "Sensitive", "Intuitive"], purpose: "To create harmony and partnership" },
  3: { title: "The Communicator", traits: ["Creative", "Expressive", "Joyful"], purpose: "To inspire and entertain" },
  4: { title: "The Builder", traits: ["Practical", "Disciplined", "Reliable"], purpose: "To create lasting foundations" },
  5: { title: "The Adventurer", traits: ["Dynamic", "Curious", "Versatile"], purpose: "To experience freedom and change" },
  6: { title: "The Nurturer", traits: ["Responsible", "Caring", "Harmonious"], purpose: "To love and serve family/community" },
  7: { title: "The Seeker", traits: ["Analytical", "Introspective", "Spiritual"], purpose: "To seek truth and wisdom" },
  8: { title: "The Powerhouse", traits: ["Ambitious", "Authoritative", "Material"], purpose: "To achieve success and abundance" },
  9: { title: "The Humanitarian", traits: ["Compassionate", "Idealistic", "Universal"], purpose: "To serve humanity and inspire" },
  11: { title: "The Visionary", traits: ["Intuitive", "Inspirational", "Idealistic"], purpose: "To illuminate and inspire others" },
  22: { title: "The Master Builder", traits: ["Visionary", "Practical", "Powerful"], purpose: "To build great things for humanity" },
  33: { title: "The Master Teacher", traits: ["Nurturing", "Healing", "Selfless"], purpose: "To uplift and heal humanity" }
};

// Comprehensive numerology calculation
export interface NumerologyResult {
  lifePath: number | null;
  lifePathMeaning: { title: string; traits: string[]; purpose: string } | null;
  birthDay: number | null;
  personalYear: number | null;
  expression: number | null;
  soulUrge: number | null;
  personality: number | null;
}

export const calculateNumerology = (name: string, birthDate: string): NumerologyResult => {
  const lp = lifePath(birthDate);
  
  return {
    lifePath: lp,
    lifePathMeaning: lp !== null ? (LIFE_PATH_MEANINGS[lp] || LIFE_PATH_MEANINGS[reduceCore(lp)]) : null,
    birthDay: birthDay(birthDate),
    personalYear: personalYear(birthDate),
    expression: expressionNumber(name),
    soulUrge: soulUrge(name),
    personality: personalityNumber(name)
  };
};
