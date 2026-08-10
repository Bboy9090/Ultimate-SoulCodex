import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateNumerology } from '../services/numerology';
import {
  calcLifePath,
  calcExpression,
  calcSoulUrge,
  calcPersonality,
} from '@soulcodex/core/compute/numerology';
import { calcPersonalYear } from '@soulcodex/core/compute/personal-numbers';

/**
 * Server/Core Contract Tests
 *
 * Verifies that server numerology orchestration produces values
 * identical to canonical core calculations.
 * Server adds interpretation but must not alter calculation results.
 */

describe('Server/Core Numerology Contract', () => {
  describe('Fixture: Ordinary Case (Albert Einstein)', () => {
    const fullName = 'Albert Einstein';
    const birthDate = '1879-03-14';

    it('should resolve valid input', () => {
      const serverResult = calculateNumerology(fullName, birthDate);

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(typeof serverResult.lifePath === 'number');
      assert.ok(typeof serverResult.expression === 'number');
      assert.ok(typeof serverResult.soulUrge === 'number');
      assert.ok(typeof serverResult.personality === 'number');
      assert.ok(typeof serverResult.personalYear === 'number');
    });

    it('should match core lifePath calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcLifePath(birthDate);

      assert.strictEqual(
        serverResult.lifePath,
        coreResult,
        `Server lifePath ${serverResult.lifePath} should match core ${coreResult}`
      );
    });

    it('should match core expression calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcExpression(fullName);

      assert.strictEqual(
        serverResult.expression,
        coreResult,
        `Server expression ${serverResult.expression} should match core ${coreResult}`
      );
    });

    it('should match core soulUrge calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcSoulUrge(fullName);

      assert.strictEqual(
        serverResult.soulUrge,
        coreResult,
        `Server soulUrge ${serverResult.soulUrge} should match core ${coreResult}`
      );
    });

    it('should match core personality calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonality(fullName);

      assert.strictEqual(
        serverResult.personality,
        coreResult,
        `Server personality ${serverResult.personality} should match core ${coreResult}`
      );
    });

    it('should match core personalYear calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonalYear(birthDate);

      assert.strictEqual(
        serverResult.personalYear,
        coreResult,
        `Server personalYear ${serverResult.personalYear} should match core ${coreResult}`
      );
    });
  });

  describe('Fixture: Master Number Sensitive Case (1990-08-15)', () => {
    const fullName = 'John Smith';
    const birthDate = '1990-08-15';

    it('should resolve valid input', () => {
      const serverResult = calculateNumerology(fullName, birthDate);

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(typeof serverResult.lifePath === 'number');
      assert.ok(typeof serverResult.expression === 'number');
    });

    it('should match core lifePath calculation (tests master number handling)', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcLifePath(birthDate);

      assert.strictEqual(serverResult.lifePath, coreResult);
      assert.ok(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(serverResult.lifePath),
        `Master numbers must be in valid range`
      );
    });

    it('should match core expression calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcExpression(fullName);

      assert.strictEqual(serverResult.expression, coreResult);
    });

    it('should match core soulUrge calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcSoulUrge(fullName);

      assert.strictEqual(serverResult.soulUrge, coreResult);
    });

    it('should match core personality calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonality(fullName);

      assert.strictEqual(serverResult.personality, coreResult);
    });

    it('should match core personalYear calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonalYear(birthDate);

      assert.strictEqual(serverResult.personalYear, coreResult);
    });
  });

  describe('Fixture: Mixed Case Name (Jane O\'Connor-Smith)', () => {
    const fullName = "Jane O'Connor-Smith";
    const birthDate = '1985-12-25';

    it('should resolve valid input', () => {
      const serverResult = calculateNumerology(fullName, birthDate);

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(typeof serverResult.lifePath === 'number');
      assert.ok(typeof serverResult.expression === 'number');
    });

    it('should match core lifePath calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcLifePath(birthDate);

      assert.strictEqual(serverResult.lifePath, coreResult);
    });

    it('should match core expression calculation (tests punctuation handling)', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcExpression(fullName);

      assert.strictEqual(
        serverResult.expression,
        coreResult,
        'Punctuation should be stripped before calculation'
      );
    });

    it('should match core soulUrge calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcSoulUrge(fullName);

      assert.strictEqual(serverResult.soulUrge, coreResult);
    });

    it('should match core personality calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonality(fullName);

      assert.strictEqual(serverResult.personality, coreResult);
    });

    it('should match core personalYear calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonalYear(birthDate);

      assert.strictEqual(serverResult.personalYear, coreResult);
    });
  });

  describe('Fixture: Name with Spaces (Marie Rose du Pont)', () => {
    const fullName = 'Marie Rose du Pont';
    const birthDate = '1950-06-21';

    it('should resolve valid input', () => {
      const serverResult = calculateNumerology(fullName, birthDate);

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(typeof serverResult.lifePath === 'number');
      assert.ok(typeof serverResult.expression === 'number');
    });

    it('should match core lifePath calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcLifePath(birthDate);

      assert.strictEqual(serverResult.lifePath, coreResult);
    });

    it('should match core expression calculation (tests multi-word name)', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcExpression(fullName);

      assert.strictEqual(
        serverResult.expression,
        coreResult,
        'Multi-word names should be processed entirely'
      );
    });

    it('should match core soulUrge calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcSoulUrge(fullName);

      assert.strictEqual(serverResult.soulUrge, coreResult);
    });

    it('should match core personality calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonality(fullName);

      assert.strictEqual(serverResult.personality, coreResult);
    });

    it('should match core personalYear calculation', () => {
      const serverResult = calculateNumerology(fullName, birthDate);
      assert.strictEqual(serverResult.status, 'resolved');
      const coreResult = calcPersonalYear(birthDate);

      assert.strictEqual(serverResult.personalYear, coreResult);
    });
  });

  describe('Fail-Closed Boundary: Invalid Inputs Return Unresolved', () => {
    it('should return unresolved status for empty name', () => {
      const serverResult = calculateNumerology('', '1990-08-15');

      assert.strictEqual(serverResult.status, 'unresolved');
      assert.ok(serverResult.reason);
      assert.ok(serverResult.reason.includes('Name'));
      assert.strictEqual(serverResult.lifePath, undefined);
      assert.strictEqual(serverResult.expression, undefined);
    });

    it('should return unresolved status for malformed date', () => {
      const serverResult = calculateNumerology('John Doe', 'invalid-date');

      assert.strictEqual(serverResult.status, 'unresolved');
      assert.ok(serverResult.reason);
      assert.ok(serverResult.reason.includes('Birth date'));
      assert.strictEqual(serverResult.lifePath, undefined);
      assert.strictEqual(serverResult.personalYear, undefined);
    });

    it('should return unresolved status for punctuation-only name', () => {
      const serverResult = calculateNumerology('!@#$%^&*()', '1990-08-15');

      assert.strictEqual(serverResult.status, 'unresolved');
      assert.ok(serverResult.reason);
      assert.ok(serverResult.reason.includes('Name'));
      assert.strictEqual(serverResult.expression, undefined);
      assert.strictEqual(serverResult.personality, undefined);
      assert.strictEqual(serverResult.soulUrge, undefined);
    });
  });

  describe('Interpretation Layer (Server-Added Value)', () => {
    it('should include interpretation text for valid lifePath', () => {
      const serverResult = calculateNumerology('John Smith', '1990-08-15');

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(serverResult.interpretations.lifePath);
      assert.ok(typeof serverResult.interpretations.lifePath === 'string');
      assert.ok(serverResult.interpretations.lifePath.length > 0);
    });

    it('should include interpretation text for valid expression', () => {
      const serverResult = calculateNumerology('John Smith', '1990-08-15');

      assert.strictEqual(serverResult.status, 'resolved');
      assert.ok(serverResult.interpretations.expression);
      assert.strictEqual(
        serverResult.interpretations.expression,
        `Expression Number ${serverResult.expression}: Your talents and abilities shine through creative manifestation.`
      );
    });

    it('should not alter calculation values when adding interpretations', () => {
      const fullName = 'Albert Einstein';
      const birthDate = '1879-03-14';
      const serverResult = calculateNumerology(fullName, birthDate);

      assert.strictEqual(serverResult.status, 'resolved');
      const coreValues = {
        lifePath: calcLifePath(birthDate),
        expression: calcExpression(fullName),
        soulUrge: calcSoulUrge(fullName),
        personality: calcPersonality(fullName),
        personalYear: calcPersonalYear(birthDate),
      };

      assert.strictEqual(serverResult.lifePath, coreValues.lifePath);
      assert.strictEqual(serverResult.expression, coreValues.expression);
      assert.strictEqual(serverResult.soulUrge, coreValues.soulUrge);
      assert.strictEqual(serverResult.personality, coreValues.personality);
      assert.strictEqual(serverResult.personalYear, coreValues.personalYear);
    });
  });

  describe('Contract Guarantee: Resolved Results Have 5 Values', () => {
    it('should return all 5 numerology values when resolved', () => {
      const result = calculateNumerology('Jane Doe', '1990-08-15');

      assert.strictEqual(result.status, 'resolved');
      assert.ok(typeof result.lifePath === 'number');
      assert.ok(typeof result.expression === 'number');
      assert.ok(typeof result.soulUrge === 'number');
      assert.ok(typeof result.personality === 'number');
      assert.ok(typeof result.personalYear === 'number');
    });

    it('should return all 5 interpretation texts when resolved', () => {
      const result = calculateNumerology('Jane Doe', '1990-08-15');

      assert.strictEqual(result.status, 'resolved');
      assert.ok(typeof result.interpretations.lifePath === 'string');
      assert.ok(typeof result.interpretations.expression === 'string');
      assert.ok(typeof result.interpretations.soulUrge === 'string');
      assert.ok(typeof result.interpretations.personality === 'string');
      assert.ok(typeof result.interpretations.personalYear === 'string');
    });

    it('should return unresolved status for invalid input', () => {
      const result = calculateNumerology('', 'invalid-date');

      assert.strictEqual(result.status, 'unresolved');
      assert.ok(result.reason);
    });
  });
});
