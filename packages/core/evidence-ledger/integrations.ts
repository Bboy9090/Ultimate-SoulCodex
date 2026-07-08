/**
 * Evidence Ledger Integrations
 *
 * Lightweight wrappers for high-value engine outputs.
 * Each integration emits evidence metadata alongside the calculation.
 */

import {
  createEvidenceEntry,
  type EvidenceEntry,
} from './index.js';
import { calcPersonalDay, calcPersonalMonth, calcPersonalYear } from '../compute/personal-numbers.js';

export function calcPersonalDayWithEvidence(
  birthDate: string,
  targetDate: Date = new Date()
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

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Day',
    personalDay,
    90, // birth date verified produces high confidence
    'high',
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
      limitations: [],
    }
  );

  return { value: personalDay, evidence };
}

export function calcPersonalYearWithEvidence(
  birthDate: string,
  targetYear: number
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalYear = calcPersonalYear(birthDate, targetYear);

  const birth = new Date(birthDate);
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Year',
    personalYear,
    90,
    'high',
    {
      inputsUsed: [
        `birth_date_verified`,
        `target_year_${targetYear}`,
      ],
      reasoning: [
        `Birth month ${birthMonth} + birth day ${birthDay} + target year ${targetYear}`,
        'All values reduced to single digits',
        `Sum reduced to single digit = Year ${personalYear}`,
      ],
      limitations: [],
    }
  );

  return { value: personalYear, evidence };
}

export function calcPersonalMonthWithEvidence(
  personalYear: number,
  targetMonth: number
): {
  value: number;
  evidence: EvidenceEntry;
} {
  const personalMonth = calcPersonalMonth(personalYear, targetMonth);

  const evidence = createEvidenceEntry(
    'numerology',
    'Personal Month',
    personalMonth,
    90,
    'high',
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
      limitations: [],
    }
  );

  return { value: personalMonth, evidence };
}
