/**
 * Evidence Ledger Integrations
 *
 * Lightweight wrappers for high-value engine outputs.
 * Each integration emits evidence metadata alongside the calculation.
 *
 * Key principle: Numerology is deterministically calculated, never "verified".
 * Evidence tracks input quality, not verification status.
 */

import {
  createEvidenceEntry,
  type EvidenceEntry,
  type EvidenceConfidenceLevel,
} from './index.js';
import { calcPersonalDay, calcPersonalMonth, calcPersonalYear } from '../compute/personal-numbers.js';
import { calcLifePath, calcExpression, calcSoulUrge, calcPersonality } from '../compute/numerology.js';

type InputState = 'valid' | 'partial' | 'missing' | 'invalid';

/**
 * Determine confidence level and label based on input state.
 * Numerology confidence depends on input quality, not verification.
 */
function confidenceForInputState(inputState: InputState): {
  confidence: number;
  label: EvidenceConfidenceLevel;
} {
  switch (inputState) {
    case 'valid':
      return { confidence: 90, label: 'high' };
    case 'partial':
      return { confidence: 70, label: 'moderate' };
    case 'missing':
      return { confidence: 40, label: 'partial' };
    case 'invalid':
      return { confidence: 0, label: 'unverified' };
  }
}

export function calcPersonalDayWithEvidence(
  birthDate: string,
  targetDate: Date = new Date(),
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalDay = calcPersonalDay(birthDate, targetDate);

  const birth = new Date(birthDate);
  const birthDay = birth.getDate();
  const birthMonth = birth.getMonth() + 1;
  const targetDay = targetDate.getDate();
  const targetMonth = targetDate.getMonth() + 1;
  const targetYear = targetDate.getFullYear();

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Day',
    personalDay,
    confidence,
    label,
    {
      inputsUsed: [
        `birth_day_${birthDay}`,
        `birth_month_${birthMonth}`,
        `target_day_${targetDay}`,
        `target_month_${targetMonth}`,
        `target_year_${targetYear}`,
      ],
      reasoning: [
        `Birth day ${birthDay} + birth month ${birthMonth} + current day ${targetDay} + current month ${targetMonth} + current year ${targetYear}`,
        'All values reduced to single digits',
        `Sum reduced to single digit = Day ${personalDay}`,
      ],
      limitations: [
        'Personal Day changes daily',
        'Calculation does not account for birth time',
      ],
    }
  );

  return { value: personalDay, evidence };
}

export function calcPersonalYearWithEvidence(
  birthDate: string,
  targetYear: number,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalYear = calcPersonalYear(birthDate, targetYear);

  const birth = new Date(birthDate);
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Year',
    personalYear,
    confidence,
    label,
    {
      inputsUsed: [
        `birth_month_${birthMonth}`,
        `birth_day_${birthDay}`,
        `target_year_${targetYear}`,
      ],
      reasoning: [
        `Birth month ${birthMonth} + birth day ${birthDay} + target year ${targetYear}`,
        'All values reduced to single digits',
        `Sum reduced to single digit = Year ${personalYear}`,
      ],
      limitations: [
        'Personal Year cycles annually, changes on birthday',
        'Calculation does not account for birth time',
      ],
    }
  );

  return { value: personalYear, evidence };
}

export function calcPersonalMonthWithEvidence(
  personalYear: number,
  targetMonth: number,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalMonth = calcPersonalMonth(personalYear, targetMonth);

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Month',
    personalMonth,
    confidence,
    label,
    {
      inputsUsed: [
        `personal_year_${personalYear}`,
        `calendar_month_${targetMonth}`,
      ],
      reasoning: [
        `Personal Year ${personalYear} + calendar month ${targetMonth}`,
        'Both reduced to single digits',
        `Sum reduced to single digit = Month ${personalMonth}`,
      ],
      limitations: [
        'Derived from Personal Year; dependent on year accuracy',
        'Calendar month only; does not account for birth date transition',
      ],
    }
  );

  return { value: personalMonth, evidence };
}

export function calcLifePathWithEvidence(
  birthDate: string,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const lifePathValue = calcLifePath(birthDate);

  const birth = new Date(birthDate);
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();
  const birthYear = birth.getFullYear();

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Life Path Number',
    lifePathValue,
    confidence,
    label,
    {
      inputsUsed: [
        `birth_month_${birthMonth}`,
        `birth_day_${birthDay}`,
        `birth_year_${birthYear}`,
      ],
      reasoning: [
        `All digits of birth date summed: ${birthMonth} + ${birthDay} + ${birthYear}`,
        'Sum reduced to single digit',
        `Life Path Number = ${lifePathValue}`,
      ],
      limitations: [
        'Calculation uses full birth date only',
        'Does not account for birth time or location',
        'Life Path is constant throughout life',
      ],
    }
  );

  return { value: lifePathValue, evidence };
}

export function calcExpressionWithEvidence(
  fullName: string,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const expressionValue = calcExpression(fullName);
  const letterCount = fullName.replace(/[^A-Za-z]/g, '').length;

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Expression Number',
    expressionValue,
    confidence,
    label,
    {
      inputsUsed: [`full_name_${letterCount}_letters`],
      reasoning: [
        `Letter-to-number mapping applied to all ${letterCount} letters in name`,
        'Sum of all letter values calculated',
        'Sum reduced to single digit',
        `Expression Number = ${expressionValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name provided',
        'Middle names optional; affects calculation if included',
        'Letter-to-number mapping is Pythagorean',
      ],
    }
  );

  return { value: expressionValue, evidence };
}

export function calcSoulUrgeWithEvidence(
  fullName: string,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const soulUrgeValue = calcSoulUrge(fullName);
  const vowelCount = (fullName.match(/[aeiouAEIOU]/g) || []).length;

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Soul Urge Number',
    soulUrgeValue,
    confidence,
    label,
    {
      inputsUsed: [`full_name_${vowelCount}_vowels`],
      reasoning: [
        `Vowels identified: ${vowelCount} vowels in name`,
        'Letter-to-number mapping applied to vowels only',
        'Sum of vowel values calculated',
        'Sum reduced to single digit',
        `Soul Urge Number = ${soulUrgeValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name',
        'Y as vowel depends on context (not included)',
        'Reveals inner desires but not actions taken',
      ],
    }
  );

  return { value: soulUrgeValue, evidence };
}

export function calcPersonalityWithEvidence(
  fullName: string,
  inputState: InputState = 'valid'
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalityValue = calcPersonality(fullName);
  const consonantCount =
    fullName.replace(/[^A-Za-z]/g, '').length -
    (fullName.match(/[aeiouAEIOU]/g) || []).length;

  const { confidence, label } = confidenceForInputState(inputState);

  const evidence = createEvidenceEntry(
    'numerology',
    'Personality Number',
    personalityValue,
    confidence,
    label,
    {
      inputsUsed: [`full_name_${consonantCount}_consonants`],
      reasoning: [
        `Consonants identified: ${consonantCount} consonants in name`,
        'Letter-to-number mapping applied to consonants only',
        'Sum of consonant values calculated',
        'Sum reduced to single digit',
        `Personality Number = ${personalityValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name',
        'Reveals external persona; may differ from inner self',
        'Name changes after birth would alter this number',
      ],
    }
  );

  return { value: personalityValue, evidence };
}
