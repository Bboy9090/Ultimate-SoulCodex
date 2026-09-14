import { parseDateOnly } from './date-only.js';

export const NUMEROLOGY_ENGINE_VERSION = 'pythagorean-v2';

export const NUMEROLOGY_POLICY = Object.freeze({
  system: 'Pythagorean',
  masterNumbers: [11, 22, 33] as const,
  karmicDebtNumbers: [13, 14, 16, 19] as const,
  vowels: 'AEIOU',
  yPolicy: 'consonant' as const,
  lifePathFormula: 'birth month + birth day + birth year, then digit-reduce while preserving 11/22/33',
  nameNormalization: 'Unicode NFKD transliteration to A-Z before Pythagorean letter mapping',
});

export type NumerologyReduction = {
  value: number;
  sourceTotal: number;
  reductionPath: number[];
  karmicDebt: 13 | 14 | 16 | 19 | null;
};

const MASTER_NUMBERS = new Set<number>(NUMEROLOGY_POLICY.masterNumbers);
const KARMIC_DEBT_NUMBERS = new Set<number>(NUMEROLOGY_POLICY.karmicDebtNumbers);

export function reduceNumerology(num: number): NumerologyReduction {
  if (!Number.isInteger(num) || num < 0) {
    throw new Error('Numerology reduction requires a non-negative integer');
  }

  const sourceTotal = num;
  const reductionPath = [num];
  let karmicDebt: NumerologyReduction['karmicDebt'] = KARMIC_DEBT_NUMBERS.has(num)
    ? (num as NumerologyReduction['karmicDebt'])
    : null;

  while (num > 9 && !MASTER_NUMBERS.has(num)) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0);
    reductionPath.push(num);

    if (karmicDebt === null && KARMIC_DEBT_NUMBERS.has(num)) {
      karmicDebt = num as NumerologyReduction['karmicDebt'];
    }
  }

  return { value: num, sourceTotal, reductionPath, karmicDebt };
}

function reduceToSingleDigit(num: number): number {
  return reduceNumerology(num).value;
}

/**
 * Canonical date-based Life Path calculation used by Soul Codex.
 * The entered calendar date is parsed as a date-only value; host timezone
 * must never alter the birth day.
 */
export function calcLifePath(dateISO: string): number {
  const { day, month, year } = parseDateOnly(dateISO);
  return reduceToSingleDigit(day + month + year);
}

/** Birthday Number: the entered day of month, reduced with master numbers preserved. */
export function calcBirthday(dateISO: string): number {
  const { day } = parseDateOnly(dateISO);
  return reduceToSingleDigit(day);
}

const LETTER_VALUES: Readonly<Record<string, number>> = Object.freeze({
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
});

const PRE_NORMALIZATION_TRANSLITERATION: Readonly<Record<string, string>> = Object.freeze({
  ß: 'SS', ẞ: 'SS', Æ: 'AE', æ: 'AE', Œ: 'OE', œ: 'OE', Ø: 'O', ø: 'O',
  Ł: 'L', ł: 'L', Ð: 'D', ð: 'D', Þ: 'TH', þ: 'TH',
});

/**
 * Normalize a human name to the canonical A-Z stream used for numerology.
 * Diacritics and punctuation do not silently change letter values.
 */
export function normalizeNumerologyName(fullName: string): string {
  const transliterated = [...fullName]
    .map((character) => PRE_NORMALIZATION_TRANSLITERATION[character] ?? character)
    .join('');

  return transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function getLetterValue(letter: string): number {
  return LETTER_VALUES[letter] ?? 0;
}

function sumNameLetters(fullName: string, include: (letter: string) => boolean): number {
  return [...normalizeNumerologyName(fullName)]
    .filter(include)
    .reduce((total, letter) => total + getLetterValue(letter), 0);
}

/**
 * Expression / Destiny Number: Pythagorean sum of every normalized name letter.
 */
export function calcExpression(fullName: string): number {
  return reduceToSingleDigit(sumNameLetters(fullName, () => true));
}

/**
 * Soul Urge Number: Pythagorean sum of AEIOU vowels.
 * Soul Codex freezes Y as a consonant for deterministic cross-surface behavior.
 */
export function calcSoulUrge(fullName: string): number {
  return reduceToSingleDigit(
    sumNameLetters(fullName, (letter) => NUMEROLOGY_POLICY.vowels.includes(letter)),
  );
}

/** Personality Number: Pythagorean sum of normalized consonants. */
export function calcPersonality(fullName: string): number {
  return reduceToSingleDigit(
    sumNameLetters(fullName, (letter) => !NUMEROLOGY_POLICY.vowels.includes(letter)),
  );
}

/** Maturity Number: Life Path + Expression, reduced with master numbers preserved. */
export function calcMaturity(dateISO: string, fullName: string): number {
  return reduceToSingleDigit(calcLifePath(dateISO) + calcExpression(fullName));
}

/**
 * Returns the canonical core numerology values from the minimum required inputs.
 * This is calculation data only; interpretation belongs in the synthesis layer.
 */
export function calcCoreNumerology(dateISO: string, fullName: string) {
  return {
    engineVersion: NUMEROLOGY_ENGINE_VERSION,
    lifePath: calcLifePath(dateISO),
    birthday: calcBirthday(dateISO),
    expression: calcExpression(fullName),
    soulUrge: calcSoulUrge(fullName),
    personality: calcPersonality(fullName),
    maturity: calcMaturity(dateISO, fullName),
  } as const;
}
