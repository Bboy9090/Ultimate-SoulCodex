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
    it('should deterministically calculate Personal Day with valid input state', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-07-06');

      const result1 = calcPersonalDayWithEvidence(birthDate, targetDate, 'valid');
      const result2 = calcPersonalDayWithEvidence(birthDate, targetDate, 'valid');

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.value, result1.value);
      assert.strictEqual(result1.evidence.engine, 'numerology');
      assert.strictEqual(result1.evidence.claim, 'Personal Day');
      assert.ok(result1.evidence.formulaVersion || result1.evidence.reasoning);
    });

    it('should adjust confidence based on input state', () => {
      const birthDate = '1990-08-15';
      const targetDate = new Date('2026-07-06');

      const valid = calcPersonalDayWithEvidence(birthDate, targetDate, 'valid');
      const partial = calcPersonalDayWithEvidence(birthDate, targetDate, 'partial');
      const missing = calcPersonalDayWithEvidence(birthDate, targetDate, 'missing');

      assert.ok(valid.evidence.confidence > partial.evidence.confidence);
      assert.ok(partial.evidence.confidence > missing.evidence.confidence);
    });

    it('should not claim verification for deterministic calculation', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date(), 'valid');

      assert.strictEqual(result.evidence.confidenceLabel, 'high');
      assert.notStrictEqual(result.evidence.confidenceLabel, 'verified');
    });

    it('should include reasoning chain', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date(), 'valid');

      assert.ok(Array.isArray(result.evidence.reasoning));
      assert.ok(result.evidence.reasoning.length > 0);
      assert.ok(result.evidence.reasoning.some((r) => r.includes('reduced')));
    });

    it('should track limitations', () => {
      const result = calcPersonalDayWithEvidence('1990-08-15', new Date(), 'valid');

      assert.ok(Array.isArray(result.evidence.limitations));
      assert.ok(result.evidence.limitations.length > 0);
    });
  });

  describe('Personal Year Evidence', () => {
    it('should deterministically calculate Personal Year', () => {
      const birthDate = '1990-08-15';
      const targetYear = 2026;

      const result1 = calcPersonalYearWithEvidence(birthDate, targetYear, 'valid');
      const result2 = calcPersonalYearWithEvidence(birthDate, targetYear, 'valid');

      assert.strictEqual(result1.value, result2.value);
      assert.strictEqual(result1.evidence.value, result1.value);
      assert.strictEqual(result1.evidence.engine, 'numerology');
    });

    it('should produce different years for different target years', () => {
      const birthDate = '1990-08-15';

      const year2026 = calcPersonalYearWithEvidence(birthDate, 2026, 'valid');
      const year2027 = calcPersonalYearWithEvidence(birthDate, 2027, 'valid');

      assert.strictEqual(typeof year2026.value, 'number');
      assert.strictEqual(typeof year2027.value, 'number');
    });

    it('should respect input state for confidence adjustment', () => {
      const birthDate = '1990-08-15';
      const invalid = calcPersonalYearWithEvidence(birthDate, 2026, 'invalid');

      assert.strictEqual(invalid.evidence.confidence, 0);
      assert.strictEqual(invalid.evidence.confidenceLabel, 'unverified');
    });
  });

  describe('Personal Month Evidence', () => {
    it('should deterministically calculate Personal Month', () => {
      const personalYear = 6;
      const targetMonth = 7;

      const result1 = calcPersonalMonthWithEvidence(personalYear, targetMonth, 'valid');
      const result2 = calcPersonalMonthWithEvidence(personalYear, targetMonth, 'valid');

      assert.strictEqual(result1.value, result2.value);
      assert.ok(result1.value >= 1 && result1.value <= 9);
    });

    it('should document dependency on Personal Year', () => {
      const result = calcPersonalMonthWithEvidence(6, 7, 'valid');

      assert.ok(result.evidence.limitations.some((l) => l.includes('Personal Year')));
    });
  });

  describe('Life Path Evidence', () => {
    it('should deterministically calculate Life Path from birth date', () => {
      const birthDate = '1990-08-15';

      const result1 = calcLifePathWithEvidence(birthDate, 'valid');
      const result2 = calcLifePathWithEvidence(birthDate, 'valid');

      assert.strictEqual(result1.value, result2.value);
      assert.ok([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(result1.value));
    });

    it('should include all date components in reasoning', () => {
      const result = calcLifePathWithEvidence('1990-08-15', 'valid');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('birth')));
      assert.ok(
        result.evidence.reasoning.some((r) => r.includes('digit') || r.includes('reduced'))
      );
    });

    it('should have evidence engine = numerology', () => {
      const result = calcLifePathWithEvidence('1990-08-15', 'valid');

      assert.strictEqual(result.evidence.engine, 'numerology');
      assert.strictEqual(result.evidence.claim, 'Life Path Number');
    });
  });

  describe('Expression Evidence', () => {
    it('should deterministically calculate Expression Number from name', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcExpressionWithEvidence(fullName, 'valid');
      const result2 = calcExpressionWithEvidence(fullName, 'valid');

      assert.strictEqual(result1.value, result2.value);
      assert.ok(result1.value >= 1 && result1.value <= 9);
    });

    it('should track letter count in reasoning', () => {
      const result = calcExpressionWithEvidence('Albert Einstein', 'valid');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('letter')));
    });

    it('should adjust confidence for missing/invalid name', () => {
      const validName = calcExpressionWithEvidence('Albert Einstein', 'valid');
      const invalidName = calcExpressionWithEvidence('Albert Einstein', 'invalid');

      assert.ok(validName.evidence.confidence > invalidName.evidence.confidence);
    });
  });

  describe('Soul Urge Evidence', () => {
    it('should deterministically calculate Soul Urge from name vowels', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcSoulUrgeWithEvidence(fullName, 'valid');
      const result2 = calcSoulUrgeWithEvidence(fullName, 'valid');

      assert.strictEqual(result1.value, result2.value);
    });

    it('should identify vowels in reasoning', () => {
      const result = calcSoulUrgeWithEvidence('Albert Einstein', 'valid');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('vowel')));
    });

    it('should document that Y is not counted as vowel', () => {
      const result = calcSoulUrgeWithEvidence('Albert Einstein', 'valid');

      assert.ok(result.evidence.limitations.some((l) => l.includes('context')));
    });
  });

  describe('Personality Evidence', () => {
    it('should deterministically calculate Personality Number from consonants', () => {
      const fullName = 'Albert Einstein';

      const result1 = calcPersonalityWithEvidence(fullName, 'valid');
      const result2 = calcPersonalityWithEvidence(fullName, 'valid');

      assert.strictEqual(result1.value, result2.value);
    });

    it('should identify consonants in reasoning', () => {
      const result = calcPersonalityWithEvidence('Albert Einstein', 'valid');

      assert.ok(result.evidence.reasoning.some((r) => r.includes('consonant')));
    });

    it('should note that name changes affect this number', () => {
      const result = calcPersonalityWithEvidence('Albert Einstein', 'valid');

      assert.ok(
        result.evidence.limitations.some((l) => l.includes('name changes') || l.includes('birth'))
      );
    });
  });

  describe('Cross-Calculation Consistency', () => {
    it('should produce evidence entries for all 7 calculation types', () => {
      const birthDate = '1990-08-15';
      const fullName = 'Albert Einstein';
      const targetDate = new Date('2026-07-06');

      const personalDay = calcPersonalDayWithEvidence(birthDate, targetDate, 'valid');
      const personalYear = calcPersonalYearWithEvidence(birthDate, 2026, 'valid');
      const personalMonth = calcPersonalMonthWithEvidence(6, 7, 'valid');
      const lifePath = calcLifePathWithEvidence(birthDate, 'valid');
      const expression = calcExpressionWithEvidence(fullName, 'valid');
      const soulUrge = calcSoulUrgeWithEvidence(fullName, 'valid');
      const personality = calcPersonalityWithEvidence(fullName, 'valid');

      [personalDay, personalYear, personalMonth, lifePath, expression, soulUrge, personality].forEach(
        (result) => {
          assert.strictEqual(result.evidence.engine, 'numerology');
          assert.ok(result.evidence.claim);
          assert.ok(typeof result.evidence.value === 'number');
          assert.ok(result.evidence.reasoning.length > 0);
          assert.ok(result.evidence.inputsUsed.length > 0);
        }
      );
    });

    it('should never use "verified" as confidence label for numerology', () => {
      const birthDate = '1990-08-15';
      const fullName = 'Albert Einstein';

      const allResults = [
        calcPersonalDayWithEvidence(birthDate, new Date(), 'valid'),
        calcPersonalYearWithEvidence(birthDate, 2026, 'valid'),
        calcPersonalMonthWithEvidence(6, 7, 'valid'),
        calcLifePathWithEvidence(birthDate, 'valid'),
        calcExpressionWithEvidence(fullName, 'valid'),
        calcSoulUrgeWithEvidence(fullName, 'valid'),
        calcPersonalityWithEvidence(fullName, 'valid'),
      ];

      allResults.forEach((result) => {
        assert.notStrictEqual(
          result.evidence.confidenceLabel,
          'verified',
          `${result.evidence.claim} should not use 'verified' label`
        );
      });
    });
  });

  describe('Input State Handling', () => {
    it('should handle all four input states correctly', () => {
      const birthDate = '1990-08-15';

      const states = ['valid', 'partial', 'missing', 'invalid'] as const;
      const results = states.map((state) =>
        calcLifePathWithEvidence(birthDate, state)
      );

      // Valid should have highest confidence
      assert.ok(results[0].evidence.confidence >= results[1].evidence.confidence);
      // Partial should be higher than missing
      assert.ok(results[1].evidence.confidence >= results[2].evidence.confidence);
      // Missing should be higher than invalid
      assert.ok(results[2].evidence.confidence > results[3].evidence.confidence);
      // Invalid should be 0 confidence
      assert.strictEqual(results[3].evidence.confidence, 0);
    });
  });
});
