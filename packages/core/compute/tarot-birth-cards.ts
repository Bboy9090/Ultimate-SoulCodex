import { parseDateOnly } from './date-only.js';

export const TAROT_BIRTH_CARD_POLICY = Object.freeze({
  policyId: 'TAROT-BIRTH-CARDS-TAROT-SCHOOL-v1',
  system: 'Tarot School birth-card reduction',
  evidenceClass: 'symbolic-tradition',
  scientificClaim: false,
  mayInfluenceStableIdentity: false,
  foolPolicy: 'excluded-from-birth-card-numbering',
  specialCase19: 'Sun / Wheel of Fortune / Magician',
  specialCase30: 'Hanged Man / Empress',
});

const MAJOR_ARCANA: Readonly<Record<number, string>> = Object.freeze({
  1: 'The Magician',
  2: 'The High Priestess',
  3: 'The Empress',
  4: 'The Emperor',
  5: 'The Hierophant',
  6: 'The Lovers',
  7: 'The Chariot',
  8: 'Strength',
  9: 'The Hermit',
  10: 'Wheel of Fortune',
  11: 'Justice',
  12: 'The Hanged Man',
  13: 'Death',
  14: 'Temperance',
  15: 'The Devil',
  16: 'The Tower',
  17: 'The Star',
  18: 'The Moon',
  19: 'The Sun',
  20: 'Judgement',
  21: 'The World',
});

export type TarotBirthCardResult = {
  policyId: string;
  sourceTotal: number;
  reductionPath: number[];
  cardNumbers: number[];
  cards: string[];
  card1: string;
  card2: string;
  card3?: string;
  interpretation: string;
};

function digitSum(value: number): number {
  return String(Math.abs(value))
    .split('')
    .reduce((sum, digit) => sum + Number.parseInt(digit, 10), 0);
}

/**
 * Tarot School-style birth-card reduction.
 *
 * This is a documented symbolic convention, not a scientific measurement.
 * The birth date is parsed as calendar-only data so host timezone can never
 * change the result.
 */
export function calculateTarotBirthCards(birthDate: string): TarotBirthCardResult {
  const { year, month, day } = parseDateOnly(birthDate);
  const century = Math.floor(year / 100);
  const yearWithinCentury = year % 100;
  const sourceTotal = month + day + century + yearWithinCentury;

  let reduced = sourceTotal;
  const reductionPath = [sourceTotal];

  while (reduced > 21) {
    if (reduced === 30) {
      reduced = 12;
    } else if (reduced > 99) {
      const text = String(reduced);
      reduced = Number.parseInt(text.slice(0, -1), 10) + Number.parseInt(text.slice(-1), 10);
    } else {
      reduced = digitSum(reduced);
    }
    reductionPath.push(reduced);
  }

  let cardNumbers: number[];
  if (reduced === 19) {
    cardNumbers = [19, 10, 1];
  } else if (reduced >= 10) {
    cardNumbers = [reduced, digitSum(reduced)];
  } else {
    // For a single-digit first result, use the paired Major Arcana number
    // that reduces to it (10→1 through 18→9). The documented 30→12 case is
    // handled above before this branch.
    cardNumbers = [reduced + 9, reduced];
  }

  const cards = cardNumbers.map((number) => {
    const card = MAJOR_ARCANA[number];
    if (!card) throw new RangeError(`Unsupported Tarot birth-card number: ${number}`);
    return card;
  });

  return {
    policyId: TAROT_BIRTH_CARD_POLICY.policyId,
    sourceTotal,
    reductionPath,
    cardNumbers,
    cards,
    card1: cards[0],
    card2: cards[1],
    ...(cards[2] ? { card3: cards[2] } : {}),
    interpretation:
      `${cards.join(' / ')} under the Tarot School birth-card reduction. ` +
      'Use this as a symbolic reflection prompt, not as factual or predictive evidence.',
  };
}
