const digitSum = (n: number): number => 
  Math.abs(n).toString().split("").reduce((a, b) => a + Number(b), 0);

const dateOnlyParts = (isoDOB: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDOB);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() + 1 !== month ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
};

const reduceCore = (n: number): number => {
  while (![11, 22, 33].includes(n) && n > 9) {
    n = digitSum(n);
  }
  return n;
};

export const lifePath = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  const d = dateOnlyParts(isoDOB);
  if (!d) return null;
  const total = digitSum(d.year) + digitSum(d.month) + digitSum(d.day);
  return reduceCore(reduceCore(total));
};

export const birthDay = (isoDOB?: string): number | null => {
  if (!isoDOB) return null;
  const d = dateOnlyParts(isoDOB);
  return d ? reduceCore(d.day) : null;
};

export const personalYear = (isoDOB?: string, today = new Date()): number | null => {
  if (!isoDOB) return null;
  const d = dateOnlyParts(isoDOB);
  if (!d) return null;
  const total = digitSum(d.month) + digitSum(d.day) + digitSum(today.getFullYear());
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

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export const soulUrge = (fullName?: string): number | null => {
  if (!fullName) return null;
  const sum = fullName
    .toUpperCase()
    .split('')
    .filter(c => VOWELS.has(c))
    .reduce((total, letter) => total + getLetterValue(letter), 0);
  return sum === 0 ? null : reduceCore(sum);
};

export const personalityNumber = (fullName?: string): number | null => {
  if (!fullName) return null;
  const sum = fullName
    .toUpperCase()
    .split('')
    .filter(c => /[A-Z]/.test(c) && !VOWELS.has(c))
    .reduce((total, letter) => total + getLetterValue(letter), 0);
  return sum === 0 ? null : reduceCore(sum);
};

export const calculateNumerology = (name?: string, birthDate?: string) => {
  return {
    lifePath: lifePath(birthDate),
    birthDay: birthDay(birthDate),
    expressionNumber: expressionNumber(name),
    soulUrge: soulUrge(name),
    personalityNumber: personalityNumber(name),
    personalYear: personalYear(birthDate),
  };
};
