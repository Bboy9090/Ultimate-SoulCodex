function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return num;
}

export function calcLifePath(dateISO: string): number {
  const date = new Date(dateISO);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let sum = day + month + year;
  return reduceToSingleDigit(sum);
}

function getLetterValue(letter: string): number {
  const values: { [key: string]: number } = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
    J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
    S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
  };
  return values[letter.toUpperCase()] || 0;
}

/**
 * Expression Number: Sum of all letters in full name
 * Reveals talents and abilities
 */
export function calcExpression(fullName: string): number {
  const sum = fullName
    .replace(/[^A-Z]/gi, '')
    .split('')
    .reduce((total, letter) => total + getLetterValue(letter), 0);
  return reduceToSingleDigit(sum);
}

/**
 * Soul Urge Number: Sum of vowels only in full name
 * Reveals heart's desires and inner motivation
 */
export function calcSoulUrge(fullName: string): number {
  const vowels = 'AEIOU';
  const sum = fullName
    .replace(/[^A-Z]/gi, '')
    .split('')
    .reduce((total, letter) => {
      return vowels.includes(letter.toUpperCase())
        ? total + getLetterValue(letter)
        : total;
    }, 0);
  return reduceToSingleDigit(sum);
}

/**
 * Personality Number: Sum of consonants only in full name
 * Reveals how others perceive you
 */
export function calcPersonality(fullName: string): number {
  const vowels = 'AEIOU';
  const sum = fullName
    .replace(/[^A-Z]/gi, '')
    .split('')
    .reduce((total, letter) => {
      return !vowels.includes(letter.toUpperCase())
        ? total + getLetterValue(letter)
        : total;
    }, 0);
  return reduceToSingleDigit(sum);
}
