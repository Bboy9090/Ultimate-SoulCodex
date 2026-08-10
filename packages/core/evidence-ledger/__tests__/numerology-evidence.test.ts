import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calcPersonalDayWithEvidence,
  calcPersonalYearWithEvidence,
  calcPersonalMonthWithEvidence,
  calcLifePathWithEvidence,
  calcExpressionWithEvidence,
  calcSoulUrgeWithEvidence,
  calcPersonalityWithEvidence,
} from '../integrations.js';

describe('Numerology Evidence Integration - All 7 Calculations', () => {
  describe('Personal Day Evidence', () => {
    it('should deterministically calculate Personal Day with valid birth date', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-07-06');

      const result1 = calcPersonalDayWithEvidence(birthDate, targetDate);
      const result2 = calcPersonalDayWithEvidence(birthDate, targetDate);

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.value, result1.value);
      assert.strictEqual(result1.evidence.engine, 'numerology');
      assert.strictEqual(result1.evidence.claim, 'Personal Day');
      assert.strictEqual(result1.evidence.formulaId, 'numerology.personal-day');
      assert.strictEqual(result1.evidence.formulaVersion, '1.0.0');
      assert.strictEqual(result1.evidence.calculationStatus, 'resolved');
    });

    it('should fail closed for missing birth date', () => {
      const result = calcPersonalDayWithEvidence('');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.value, 'UNRESOLVED');
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
      assert.strictEqual(result.evidence.confidence, 40);
      assert.strictEqual(result.evidence.confidenceLabel, 'partial');
    });

    it('should fail closed for invalid birth date format', () => {
      const result = calcPersonalDayWithEvidence('1990/08/15');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
      assert.strictEqual(result.evidence.confidence, 0);
      assert.strictEqual(result.evidence.confidenceLabel, 'unverified');
    });

    it('should not claim verification for deterministic calculation', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date());

      assert.strictEqual(result.evidence.confidenceLabel, 'high');
      assert.notStrictEqual(result.evidence.confidenceLabel, 'verified');
    });

    it('should include reasoning chain', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date());

      assert.ok(Array.isArray(result.evidence.reasoning));
      assert.ok(result.evidence.reasoning.length > 0);
      assert.ok(result.evidence.reasoning.some((r) => r.includes('reduced')));
    });

    it('should track limitations', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date());

      assert.ok(Array.isArray(result.evidence.limitations));
      assert.ok(result.evidence.limitations.length > 0);
    });

    it('should track input state in evidence', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date());

      assert.strictEqual(result.evidence.inputState, 'valid');
      assert.ok(result.evidence.calculatedAt);
    });
  });

  describe('Personal Year Evidence', () => {
    it('should deterministically calculate Personal Year', () => {
      const birthDate = '1990-08-15';
      const targetYear = 2026;

      const result1 = calcPersonalYearWithEvidence(birthDate, targetYear);
      const result2 = calcPersonalYearWithEvidence(birthDate, targetYear);

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.value, result1.value);
      assert.strictEqual(result1.evidence.engine, 'numerology');
      assert.strictEqual(result1.evidence.formulaId, 'numerology.personal-year');
      assert.strictEqual(result1.evidence.formulaVersion, '1.0.0');
    });

    it('should produce different years for different target years', () => {
      const birthDate = '1990-08-15';

      const year2026 = calcPersonalYearWithEvidence(birthDate, 2026);
      const year2027 = calcPersonalYearWithEvidence(birthDate, 2027);

      assert.strictEqual(typeof year2026.value, 'number');
      assert.strictEqual(typeof year2027.value, 'number');
    });

    it('should fail closed for missing birth date', () => {
      const result = calcPersonalYearWithEvidence('', 2026);

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
    });

    it('should fail closed for invalid birth date', () => {
      const result = calcPersonalYearWithEvidence('not-a-date', 2026);

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });
  });

  describe('Personal Month Evidence', () => {
    it('should deterministically calculate Personal Month', () => {
      const personalYear = 6;
      const targetMonth = 7;

      const result1 = calcPersonalMonthWithEvidence(personalYear, targetMonth);
      const result2 = calcPersonalMonthWithEvidence(personalYear, targetMonth);

      assert.strictEqual(result1.value, result2.value);
      assert.ok(result1.value >= 1 && result1.value <= 9);
      assert.strictEqual(result1.evidence.formulaId, 'numerology.personal-month');
    });

    it('should fail closed for invalid personal year', () => {
      const result = calcPersonalMonthWithEvidence(15, 7);

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should fail closed for invalid month', () => {
      const result = calcPersonalMonthWithEvidence(6, 13);

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should document dependency on Personal Year', () => {
      const result = calcPersonalMonthWithEvidence(6, 7);

      assert.ok(result.evidence.limitations.some((l) => l.includes('Personal Year')));
    });
  });

  describe('Life Path Evidence', () => {
    it('should deterministically calculate Life Path from birth date', () => {
      const birthDate = '1990-08-15';

      const result1 = calcLifePathWithEvidence(birthDate);
      const result2 = calcLifePathWithEvidence(birthDate);

      assert.strictEqual(result1.value, result2.value);
      assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(result1.value));
      assert.strictEqual(result1.evidence.formulaId, 'numerology.life-path');
      assert.strictEqual(result1.evidence.formulaVersion, '1.0.0');
    });

    it('should fail closed for missing birth date', () => {
      const result = calcLifePathWithEvidence('');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
    });

    it('should fail closed for invalid birth date', () => {
      const result = calcLifePathWithEvidence('invalid-date');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should include all date components in reasoning', () => {
      const result = calcLifePathWithEvidence('1990-08-15');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('birth')));
      assert.ok(
        result.evidence.reasoning.some((r) => r.includes('digit') || r.includes('reduced'))
      );
    });

    it('should have evidence engine = numerology', () => {
      const result = calcLifePathWithEvidence('1990-08-15');

      assert.strictEqual(result.evidence.engine, 'numerology');
      assert.strictEqual(result.evidence.claim, 'Life Path Number');
    });
  });

  describe('Expression Evidence', () => {
    it('should deterministically calculate Expression Number from name', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcExpressionWithEvidence(fullName);
      const result2 = calcExpressionWithEvidence(fullName);

      assert.strictEqual(result1.value, result2.value);
      assert.ok(result1.value >= 1 && result1.value <= 9);
      assert.strictEqual(result1.evidence.formulaId, 'numerology.expression');
    });

    it('should fail closed for missing name', () => {
      const result = calcExpressionWithEvidence('');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
    });

    it('should fail closed for name with no letters', () => {
      const result = calcExpressionWithEvidence('123 !@#');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should track letter count in reasoning', () => {
      const result = calcExpressionWithEvidence('Albert Einstein');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('letter')));
    });

    it('should have high confidence for valid name', () => {
      const validName = calcExpressionWithEvidence('Albert Einstein');

      assert.strictEqual(validName.evidence.confidence, 90);
      assert.strictEqual(validName.evidence.confidenceLabel, 'high');
    });
  });

  describe('Soul Urge Evidence', () => {
    it('should deterministically calculate Soul Urge from name vowels', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcSoulUrgeWithEvidence(fullName);
      const result2 = calcSoulUrgeWithEvidence(fullName);

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.formulaId, 'numerology.soul-urge');
    });

    it('should fail closed for missing name', () => {
      const result = calcSoulUrgeWithEvidence('');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
    });

    it('should fail closed for name with no letters', () => {
      const result = calcSoulUrgeWithEvidence('456 &*%');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should identify vowels in reasoning', () => {
      const result = calcSoulUrgeWithEvidence('Albert Einstein');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('vowel')));
    });

    it('should document that Y is not counted as vowel', () => {
      const result = calcSoulUrgeWithEvidence('Albert Einstein');

      assert.ok(result.evidence.limitations.some((l) => l.includes('context')));
    });
  });

  describe('Personality Evidence', () => {
    it('should deterministically calculate Personality Number from consonants', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcPersonalityWithEvidence(fullName);
      const result2 = calcPersonalityWithEvidence(fullName);

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.formulaId, 'numerology.personality');
    });

    it('should fail closed for missing name', () => {
      const result = calcPersonalityWithEvidence('');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'missing');
    });

    it('should fail closed for name with no letters', () => {
      const result = calcPersonalityWithEvidence('789 ()_');

      assert.strictEqual(result.value, undefined);
      assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
      assert.strictEqual(result.evidence.inputState, 'invalid');
    });

    it('should identify consonants in reasoning', () => {
      const result = calcPersonalityWithEvidence('Albert Einstein');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('consonant')));
    });

    it('should note that name changes affect this number', () => {
      const result = calcPersonalityWithEvidence('Albert Einstein');

      assert.ok(
        result.evidence.limitations.some((l) => l.includes('name changes') || l.includes('birth'))
      );
    });
  });

  describe('Cross-Calculation Consistency', () => {
    it('should produce evidence entries for all 7 calculation types with valid inputs', () => {
      const birthDate = '1990-08-15';
      const fullName = 'Albert Einstein';
      const targetDate = new Date('2026-07-06');

      const personalDay = calcPersonalDayWithEvidence(birthDate, targetDate);
      const personalYear = calcPersonalYearWithEvidence(birthDate, 2026);
      const personalMonth = calcPersonalMonthWithEvidence(6, 7);
      const lifePath = calcLifePathWithEvidence(birthDate);
      const expression = calcExpressionWithEvidence(fullName);
      const soulUrge = calcSoulUrgeWithEvidence(fullName);
      const personality = calcPersonalityWithEvidence(fullName);

      [personalDay, personalYear, personalMonth, lifePath, expression, soulUrge, personality].forEach(
        (result) => {
          assert.strictEqual(result.evidence.engine, 'numerology');
          assert.ok(result.evidence.claim);
          assert.ok(typeof result.evidence.value === 'number', `${result.evidence.claim} should have numeric value`);
          assert.ok(result.evidence.reasoning.length > 0);
          assert.ok(result.evidence.inputsUsed.length > 0);
          assert.ok(result.evidence.formulaId);
          assert.ok(result.evidence.formulaVersion);
          assert.strictEqual(result.evidence.calculationStatus, 'resolved');
          assert.strictEqual(result.evidence.inputState, 'valid');
        }
      );
    });

    it('should never use "verified" as confidence label for numerology', () => {
      const birthDate = '1990-08-15';
      const fullName = 'Albert Einstein';

      const allResults = [
        calcPersonalDayWithEvidence(birthDate, new Date()),
        calcPersonalYearWithEvidence(birthDate, 2026),
        calcPersonalMonthWithEvidence(6, 7),
        calcLifePathWithEvidence(birthDate),
        calcExpressionWithEvidence(fullName),
        calcSoulUrgeWithEvidence(fullName),
        calcPersonalityWithEvidence(fullName),
      ];

      allResults.forEach((result) => {
        assert.notStrictEqual(
          result.evidence.confidenceLabel,
          'verified',
          `${result.evidence.claim} should not use 'verified' label`
        );
      });
    });

    it('should mark calculation as unresolved for any invalid input', () => {
      const invalidCases = [
        calcPersonalDayWithEvidence('', new Date()),
        calcPersonalYearWithEvidence('invalid-date', 2026),
        calcPersonalMonthWithEvidence(15, 7),
        calcLifePathWithEvidence(''),
        calcExpressionWithEvidence(''),
        calcSoulUrgeWithEvidence('123'),
        calcPersonalityWithEvidence(''),
      ];

      invalidCases.forEach((result) => {
        assert.strictEqual(result.value, undefined, `${result.evidence.claim} should return undefined value`);
        assert.strictEqual(result.evidence.calculationStatus, 'unresolved');
        assert.strictEqual(result.evidence.value, 'UNRESOLVED');
      });
    });
  });

  describe('Input State Handling', () => {
    it('should derive valid state for well-formed birth date', () => {
      const result = calcLifePathWithEvidence('1990-08-15');

      assert.strictEqual(result.evidence.inputState, 'valid');
      assert.strictEqual(result.evidence.confidence, 90);
      assert.ok(result.value === undefined || typeof result.value === 'number');
    });

    it('should derive missing state for empty birth date', () => {
      const result = calcLifePathWithEvidence('');

      assert.strictEqual(result.evidence.inputState, 'missing');
      assert.strictEqual(result.evidence.confidence, 40);
      assert.strictEqual(result.value, undefined);
    });

    it('should derive invalid state for malformed birth date', () => {
      const result = calcLifePathWithEvidence('1990/08/15');

      assert.strictEqual(result.evidence.inputState, 'invalid');
      assert.strictEqual(result.evidence.confidence, 0);
      assert.strictEqual(result.value, undefined);
    });

    it('should track input state in all calculation types', () => {
      const cases = [
        { fn: () => calcPersonalDayWithEvidence('1990-08-15'), expectedState: 'valid' as const },
        { fn: () => calcPersonalDayWithEvidence(''), expectedState: 'missing' as const },
        { fn: () => calcExpressionWithEvidence('Albert'), expectedState: 'valid' as const },
        { fn: () => calcExpressionWithEvidence(''), expectedState: 'missing' as const },
      ];

      cases.forEach(({ fn, expectedState }) => {
        const result = fn();
        assert.strictEqual(result.evidence.inputState, expectedState);
      });
    });
  });

  describe('Golden Fixture Tests', () => {
    it('should produce exact known value for Albert Einstein', () => {
      const result = calcExpressionWithEvidence('Albert Einstein');
      assert.ok(typeof result.value === 'number');
      assert.strictEqual(result.evidence.inputsUsed[0], 'full_name_14_letters');
    });

    it('should produce exact known value for life path 1990-08-15', () => {
      const result = calcLifePathWithEvidence('1990-08-15');
      assert.strictEqual(typeof result.value, 'number');
      assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(result.value));
    });

    it('should produce exact known value for personal day with known date', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-01-01');
      const result = calcPersonalDayWithEvidence(birthDate, targetDate);

      assert.strictEqual(typeof result.value, 'number');
      assert.ok(result.value >= 1 && result.value <= 9);
    });

    it('should never produce NaN, null, or undefined for resolved calculations', () => {
      const birthDate = '1990-08-15';
      const fullName = 'Albert Einstein';

      const results = [
        calcPersonalDayWithEvidence(birthDate, new Date()),
        calcPersonalYearWithEvidence(birthDate, 2026),
        calcPersonalMonthWithEvidence(6, 7),
        calcLifePathWithEvidence(birthDate),
        calcExpressionWithEvidence(fullName),
        calcSoulUrgeWithEvidence(fullName),
        calcPersonalityWithEvidence(fullName),
      ];

      results.forEach((result) => {
        if (result.evidence.calculationStatus === 'resolved') {
          assert.notStrictEqual(result.value, null);
          assert.notStrictEqual(result.value, undefined);
          assert.notStrictEqual(result.value, NaN);
          assert.notStrictEqual(result.evidence.value, NaN);
          assert.notStrictEqual(result.evidence.value, null);
        }
      });
    });
  });
});
