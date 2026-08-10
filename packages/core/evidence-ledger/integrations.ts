/**
 * Evidence Ledger Integrations
 *
 * Lightweight wrappers for high-value engine outputs.
 * Each integration emits evidence metadata alongside the calculation.
 *
 * Key principle: Numerology is deterministically calculated, never "verified".
 * Evidence tracks input quality, not verification status.
 * Input state is DERIVED from actual input, never caller-supplied.
 */

import {
  createEvidenceEntry,
  type EvidenceEntry,
  type EvidenceConfidenceLevel,
} from './index.js';
import { calcPersonalDay, calcPersonalMonth, calcPersonalYear } from '../compute/personal-numbers.js';
import { calcLifePath, calcExpression, calcSoulUrge, calcPersonality } from '../compute/numerology.js';

type InputState = 'valid' | 'partial' | 'missing' | 'invalid';

function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return true;
}

function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const letters = name.replace(/[^A-Za-z]/g, '');
  return letters.length > 0;
}

function deriveInputStateForDate(dateStr: string): InputState {
  if (!dateStr) return 'missing';
  if (!isValidDate(dateStr)) return 'invalid';
  return 'valid';
}

function deriveInputStateForName(name: string): InputState {
  if (!name) return 'missing';
  if (!isValidName(name)) return 'invalid';
  return 'valid';
}

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
  targetDate: Date = new Date()
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForDate(birthDate);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  // Fail-closed: only calculate if input is valid
  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Personal Day',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [`birth_date_${birthDate || 'missing'}`],
        reasoning: [
          derivedInputState === 'missing' ? 'Birth date not provided' :
          derivedInputState === 'invalid' ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format` :
          'Birth date could not be processed',
        ],
        limitations: [
          'Personal Day changes daily',
          'Calculation does not account for birth time',
        ],
        formulaId: 'numerology.personal-day',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const personalDay = calcPersonalDay(birthDate, targetDate);
  const birth = new Date(birthDate);
  const birthDay = birth.getDate();
  const birthMonth = birth.getMonth() + 1;
  const targetDay = targetDate.getDate();
  const targetMonth = targetDate.getMonth() + 1;
  const targetYear = targetDate.getFullYear();

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
      formulaId: 'numerology.personal-day',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: personalDay, evidence };
}

export function calcPersonalYearWithEvidence(
  birthDate: string,
  targetYear: number
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForDate(birthDate);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Personal Year',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [
          `birth_date_${birthDate || 'missing'}`,
          `target_year_${targetYear}`,
        ],
        reasoning: [
          derivedInputState === 'missing' ? 'Birth date not provided' :
          derivedInputState === 'invalid' ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format` :
          'Birth date could not be processed',
        ],
        limitations: [
          'Personal Year cycles annually, changes on birthday',
          'Calculation does not account for birth time',
        ],
        formulaId: 'numerology.personal-year',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const personalYear = calcPersonalYear(birthDate, targetYear);
  const birth = new Date(birthDate);
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();

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
      formulaId: 'numerology.personal-year',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: personalYear, evidence };
}

export function calcPersonalMonthWithEvidence(
  personalYear: number,
  targetMonth: number
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const yearValid = typeof personalYear === 'number' && personalYear >= 1 && personalYear <= 9;
  const monthValid = typeof targetMonth === 'number' && targetMonth >= 1 && targetMonth <= 12;

  let derivedInputState: InputState = 'valid';
  if (!yearValid || !monthValid) {
    derivedInputState = !yearValid || !monthValid ? 'invalid' : 'valid';
  }

  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Personal Month',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [
          `personal_year_${personalYear}`,
          `calendar_month_${targetMonth}`,
        ],
        reasoning: [
          !yearValid ? `Personal Year ${personalYear} must be 1-9` : '',
          !monthValid ? `Calendar month ${targetMonth} must be 1-12` : '',
        ].filter(Boolean),
        limitations: [
          'Derived from Personal Year; dependent on year accuracy',
          'Calendar month only; does not account for birth date transition',
        ],
        formulaId: 'numerology.personal-month',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const personalMonth = calcPersonalMonth(personalYear, targetMonth);

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
      formulaId: 'numerology.personal-month',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: personalMonth, evidence };
}

export function calcLifePathWithEvidence(
  birthDate: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForDate(birthDate);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Life Path Number',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [`birth_date_${birthDate || 'missing'}`],
        reasoning: [
          derivedInputState === 'missing' ? 'Birth date not provided' :
          derivedInputState === 'invalid' ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format` :
          'Birth date could not be processed',
        ],
        limitations: [
          'Calculation uses full birth date only',
          'Does not account for birth time or location',
          'Life Path is constant throughout life',
        ],
        formulaId: 'numerology.life-path',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const lifePathValue = calcLifePath(birthDate);
  const birth = new Date(birthDate);
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();
  const birthYear = birth.getFullYear();

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
      formulaId: 'numerology.life-path',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: lifePathValue, evidence };
}

export function calcExpressionWithEvidence(
  fullName: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForName(fullName);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Expression Number',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [`full_name_${fullName || 'missing'}`],
        reasoning: [
          derivedInputState === 'missing' ? 'Full name not provided' :
          derivedInputState === 'invalid' ? `Name "${fullName}" contains no letters` :
          'Full name could not be processed',
        ],
        limitations: [
          'Depends on accuracy of full name provided',
          'Middle names optional; affects calculation if included',
          'Letter-to-number mapping is Pythagorean',
        ],
        formulaId: 'numerology.expression',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const expressionValue = calcExpression(fullName);
  const letterCount = fullName.replace(/[^A-Za-z]/g, '').length;

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
      formulaId: 'numerology.expression',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: expressionValue, evidence };
}

export function calcSoulUrgeWithEvidence(
  fullName: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForName(fullName);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Soul Urge Number',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [`full_name_${fullName || 'missing'}`],
        reasoning: [
          derivedInputState === 'missing' ? 'Full name not provided' :
          derivedInputState === 'invalid' ? `Name "${fullName}" contains no letters` :
          'Full name could not be processed',
        ],
        limitations: [
          'Depends on accuracy of full name',
          'Y as vowel depends on context (not included)',
          'Reveals inner desires but not actions taken',
        ],
        formulaId: 'numerology.soul-urge',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const soulUrgeValue = calcSoulUrge(fullName);
  const vowelCount = (fullName.match(/[aeiouAEIOU]/g) || []).length;

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
      formulaId: 'numerology.soul-urge',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: soulUrgeValue, evidence };
}

export function calcPersonalityWithEvidence(
  fullName: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForName(fullName);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    const evidence = createEvidenceEntry(
      'numerology',
      'Personality Number',
      'UNRESOLVED',
      confidence,
      label,
      {
        inputsUsed: [`full_name_${fullName || 'missing'}`],
        reasoning: [
          derivedInputState === 'missing' ? 'Full name not provided' :
          derivedInputState === 'invalid' ? `Name "${fullName}" contains no letters` :
          'Full name could not be processed',
        ],
        limitations: [
          'Depends on accuracy of full name',
          'Reveals external persona; may differ from inner self',
          'Name changes after birth would alter this number',
        ],
        formulaId: 'numerology.personality',
        formulaVersion: '1.0.0',
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const personalityValue = calcPersonality(fullName);
  const consonantCount =
    fullName.replace(/[^A-Za-z]/g, '').length -
    (fullName.match(/[aeiouAEIOU]/g) || []).length;

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
      formulaId: 'numerology.personality',
      formulaVersion: '1.0.0',
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: personalityValue, evidence };
}
