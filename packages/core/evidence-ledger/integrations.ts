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
import {
  NUMEROLOGY_ENGINE_VERSION,
  calcBirthday,
  calcExpression,
  calcLifePath,
  calcMaturity,
  calcPersonality,
  calcSoulUrge,
  normalizeNumerologyName,
} from '../compute/numerology.js';
import { parseDateOnly } from '../compute/date-only.js';

type InputState = 'valid' | 'partial' | 'missing' | 'invalid';

function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  try {
    parseDateOnly(dateStr);
    return true;
  } catch {
    return false;
  }
}

function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return normalizeNumerologyName(name).length > 0;
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
  const { day: birthDay, month: birthMonth } = parseDateOnly(birthDate);
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
  const dateInputState = deriveInputStateForDate(birthDate);
  const yearValid = Number.isInteger(targetYear) && targetYear > 0;
  const derivedInputState: InputState = dateInputState !== 'valid'
    ? dateInputState
    : yearValid
      ? 'valid'
      : 'invalid';
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
          dateInputState === 'missing' ? 'Birth date not provided' :
          dateInputState === 'invalid' ? `Birth date "${birthDate}" is not in valid YYYY-MM-DD format` :
          !yearValid ? `Target year ${targetYear} must be a positive integer` :
          'Birth date or target year could not be processed',
        ],
        limitations: [
          'Personal Year is keyed to the supplied calendar year under Soul Codex policy',
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
  const { month: birthMonth, day: birthDay } = parseDateOnly(birthDate);

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
        'Personal Year is keyed to the supplied calendar year under Soul Codex policy',
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
  const validPersonalYears = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);
  const yearValid = typeof personalYear === 'number' && validPersonalYears.has(personalYear);
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
          !yearValid ? `Personal Year ${personalYear} must be 1-9 or a supported master year (11, 22, 33)` : '',
          !monthValid ? `Calendar month ${targetMonth} must be 1-12` : '',
        ].filter(Boolean),
        limitations: [
          'Derived from Personal Year; dependent on year accuracy',
          'Personal Month is derived from the supplied Personal Year and calendar month',
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
        'Inputs are reduced with master numbers 11, 22, and 33 preserved',
        `Combined value reduces to Personal Month ${personalMonth}`,
      ],
      limitations: [
        'Derived from Personal Year; dependent on year accuracy',
        'Personal Month is derived from the supplied Personal Year and calendar month',
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
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const lifePathValue = calcLifePath(birthDate);
  const {
    month: birthMonth,
    day: birthDay,
    year: birthYear,
  } = parseDateOnly(birthDate);

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
        `Birth month ${birthMonth} + birth day ${birthDay} + full birth year ${birthYear}`,
        'Total digit-reduced with master numbers 11, 22, and 33 preserved',
        `Life Path Number = ${lifePathValue}`,
      ],
      limitations: [
        'Calculation uses full birth date only',
        'Does not account for birth time or location',
        'Life Path is constant throughout life',
      ],
      formulaId: 'numerology.life-path',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
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
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const expressionValue = calcExpression(fullName);
  const normalizedName = normalizeNumerologyName(fullName);
  const letterCount = normalizedName.length;

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
        'Total reduced with master numbers 11, 22, and 33 preserved',
        `Expression Number = ${expressionValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name provided',
        'Middle names optional; affects calculation if included',
        'Letter-to-number mapping is Pythagorean',
      ],
      formulaId: 'numerology.expression',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
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
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const soulUrgeValue = calcSoulUrge(fullName);
  const normalizedName = normalizeNumerologyName(fullName);
  const vowelCount = [...normalizedName].filter((letter) => 'AEIOU'.includes(letter)).length;

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
        'Total reduced with master numbers 11, 22, and 33 preserved',
        `Soul Urge Number = ${soulUrgeValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name',
        'Y as vowel depends on context (not included)',
        'Reveals inner desires but not actions taken',
      ],
      formulaId: 'numerology.soul-urge',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
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
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'unresolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    );
    return { evidence };
  }

  const personalityValue = calcPersonality(fullName);
  const normalizedName = normalizeNumerologyName(fullName);
  const consonantCount =
    normalizedName.length -
    [...normalizedName].filter((letter) => 'AEIOU'.includes(letter)).length;

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
        'Total reduced with master numbers 11, 22, and 33 preserved',
        `Personality Number = ${personalityValue}`,
      ],
      limitations: [
        'Depends on accuracy of full name',
        'Reveals external persona; may differ from inner self',
        'Name changes after birth would alter this number',
      ],
      formulaId: 'numerology.personality',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
      calculationStatus: 'resolved',
      inputState: derivedInputState,
      calculatedAt: new Date().toISOString(),
    }
  );

  return { value: personalityValue, evidence };
}


export function calcBirthdayWithEvidence(
  birthDate: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const derivedInputState = deriveInputStateForDate(birthDate);
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    return {
      evidence: createEvidenceEntry(
        'numerology',
        'Birthday Number',
        'UNRESOLVED',
        confidence,
        label,
        {
          inputsUsed: [`birth_date_${birthDate || 'missing'}`],
          reasoning: [
            derivedInputState === 'missing'
              ? 'Birth date not provided'
              : `Birth date "${birthDate}" is not a valid calendar date in YYYY-MM-DD format`,
          ],
          limitations: [
            'Birthday Number uses only the entered day of month',
            'Interpretation is symbolic even though the calculation is deterministic',
          ],
          formulaId: 'numerology.birthday',
          formulaVersion: NUMEROLOGY_ENGINE_VERSION,
          calculationStatus: 'unresolved',
          inputState: derivedInputState,
          calculatedAt: new Date().toISOString(),
        }
      ),
    };
  }

  const { day } = parseDateOnly(birthDate);
  const value = calcBirthday(birthDate);
  return {
    value,
    evidence: createEvidenceEntry(
      'numerology',
      'Birthday Number',
      value,
      confidence,
      label,
      {
        inputsUsed: [`birth_day_${day}`],
        reasoning: [
          `Birth day of month = ${day}`,
          'Day digit-reduced with master numbers 11, 22, and 33 preserved',
          `Birthday Number = ${value}`,
        ],
        limitations: [
          'Birthday Number uses only the entered day of month',
          'Interpretation is symbolic even though the calculation is deterministic',
        ],
        formulaId: 'numerology.birthday',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'resolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    ),
  };
}

export function calcMaturityWithEvidence(
  birthDate: string,
  fullName: string
): {
  value?: number;
  evidence: EvidenceEntry;
} {
  const dateState = deriveInputStateForDate(birthDate);
  const nameState = deriveInputStateForName(fullName);
  const derivedInputState: InputState =
    dateState === 'valid' && nameState === 'valid'
      ? 'valid'
      : dateState === 'missing' || nameState === 'missing'
        ? 'missing'
        : 'invalid';
  const { confidence, label } = confidenceForInputState(derivedInputState);

  if (derivedInputState !== 'valid') {
    return {
      evidence: createEvidenceEntry(
        'numerology',
        'Maturity Number',
        'UNRESOLVED',
        confidence,
        label,
        {
          inputsUsed: [
            `birth_date_${birthDate || 'missing'}`,
            `full_name_${fullName ? normalizeNumerologyName(fullName).length : 0}_letters`,
          ],
          reasoning: [
            dateState !== 'valid' ? 'A valid birth date is required' : '',
            nameState !== 'valid' ? 'A valid name containing supported letters is required' : '',
          ].filter(Boolean),
          limitations: [
            'Maturity Number depends on both Life Path and Expression inputs',
            'Name changes alter the Expression component',
            'Interpretation is symbolic even though the calculation is deterministic',
          ],
          formulaId: 'numerology.maturity',
          formulaVersion: NUMEROLOGY_ENGINE_VERSION,
          calculationStatus: 'unresolved',
          inputState: derivedInputState,
          calculatedAt: new Date().toISOString(),
        }
      ),
    };
  }

  const normalizedName = normalizeNumerologyName(fullName);
  const lifePath = calcLifePath(birthDate);
  const expression = calcExpression(fullName);
  const value = calcMaturity(birthDate, fullName);
  return {
    value,
    evidence: createEvidenceEntry(
      'numerology',
      'Maturity Number',
      value,
      confidence,
      label,
      {
        inputsUsed: [
          `birth_date_${birthDate}`,
          `full_name_${normalizedName.length}_letters`,
        ],
        reasoning: [
          `Life Path component = ${lifePath}`,
          `Expression component = ${expression}`,
          'Components combined and digit-reduced with master numbers 11, 22, and 33 preserved',
          `Maturity Number = ${value}`,
        ],
        limitations: [
          'Maturity Number depends on both Life Path and Expression inputs',
          'Name changes alter the Expression component',
          'Interpretation is symbolic even though the calculation is deterministic',
        ],
        formulaId: 'numerology.maturity',
        formulaVersion: NUMEROLOGY_ENGINE_VERSION,
        calculationStatus: 'resolved',
        inputState: derivedInputState,
        calculatedAt: new Date().toISOString(),
      }
    ),
  };
}
