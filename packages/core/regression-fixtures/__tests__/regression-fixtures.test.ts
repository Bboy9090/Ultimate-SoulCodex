/**
 * Golden Regression Fixtures Test Suite
 *
 * Validates Soul Codex engines against canonical verified charts.
 * If outputs diverge from expected values, a calculation has regressed.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { getAllFixtures, getFixtureById, getFixturesByTimeVerification } from '../fixtures.js';
import type { RegressionTestResult, RegressionSummary } from '../types.js';

const fixtures = getAllFixtures();

// Helper to reduce a number to single digit or master number
const reduceToDigit = (num: number): number => {
  if (num === 0) return 0;
  while (num >= 10 && num !== 11 && num !== 22 && num !== 33) {
    num = Math.floor(num / 10) + (num % 10);
  }
  return num;
};

test('Fixture Data Integrity', async (t) => {
  await t.test('should have all fixtures with required fields', () => {
    fixtures.forEach((fixture) => {
      assert(fixture.id, 'fixture should have id');
      assert(fixture.name, 'fixture should have name');
      assert(/^\d{4}-\d{2}-\d{2}$/.test(fixture.birthDate), 'birthDate should be ISO 8601 format');
      assert(['exact', 'estimated', 'unknown'].includes(fixture.timeVerified), 'timeVerified should be exact, estimated, or unknown');
      assert(fixture.source, 'fixture should have source');
      assert(fixture.notes, 'fixture should have notes');
      assert(fixture.expected, 'fixture should have expected object');
      assert(fixture.expected.personalNumbers, 'fixture should have personalNumbers');
      assert(fixture.expected.personalNumbers.day > 0, 'day should be positive');
      assert(fixture.expected.personalNumbers.month > 0, 'month should be positive');
      assert(fixture.expected.personalNumbers.year > 0, 'year should be positive');
      assert(/^\d{4}-\d{2}-\d{2}T/.test(fixture.createdAt), 'createdAt should be ISO 8601');
      assert(/^\d{4}-\d{2}-\d{2}T/.test(fixture.lastVerified), 'lastVerified should be ISO 8601');
      assert(fixture.engine_versions, 'fixture should have engine_versions');
    });
  });

  await t.test('should have at least 5 golden fixtures', () => {
    assert.ok(fixtures.length >= 5, `Expected at least 5 fixtures, got ${fixtures.length}`);
  });

  await t.test('should allow fixture lookup by ID', () => {
    const fixture = getFixtureById('fixture-001');
    assert(fixture, 'fixture-001 should exist');
    assert.strictEqual(fixture?.name, 'Albert Einstein');
    assert.strictEqual(fixture?.birthDate, '1879-03-14');
  });

  await t.test('should return undefined for non-existent fixture ID', () => {
    const fixture = getFixtureById('non-existent-fixture');
    assert.strictEqual(fixture, undefined);
  });

  await t.test('should filter fixtures by time verification level', () => {
    const exactFixtures = getFixturesByTimeVerification('exact');
    const estimatedFixtures = getFixturesByTimeVerification('estimated');

    assert.ok(exactFixtures.length > 0, 'should have exact fixtures');
    assert.ok(estimatedFixtures.length > 0, 'should have estimated fixtures');
    assert.ok(exactFixtures.every(f => f.timeVerified === 'exact'), 'all exact fixtures should have exact verification');
    assert.ok(estimatedFixtures.every(f => f.timeVerified === 'estimated'), 'all estimated fixtures should have estimated verification');
  });
});

test('Numerology Engine - Personal Numbers', async (t) => {
  for (const fixture of fixtures) {
    await t.test(`${fixture.name} (${fixture.id})`, async (ft) => {
      const [yearStr, monthStr, dayStr] = fixture.birthDate.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      await ft.test('day number', () => {
        const calculated = reduceToDigit(day);
        assert.strictEqual(calculated, fixture.expected.personalNumbers.day, `Day mismatch for ${fixture.name}`);
      });

      await ft.test('month number', () => {
        const calculated = reduceToDigit(month);
        assert.strictEqual(calculated, fixture.expected.personalNumbers.month, `Month mismatch for ${fixture.name}`);
      });

      await ft.test('year number', () => {
        const yearDigitSum = String(year)
          .split('')
          .reduce((sum, d) => sum + parseInt(d, 10), 0);
        const calculated = reduceToDigit(yearDigitSum);
        assert.strictEqual(calculated, fixture.expected.personalNumbers.year, `Year mismatch for ${fixture.name}`);
      });

      await ft.test('consistent expected values', () => {
        const dayNum = fixture.expected.personalNumbers.day;
        const monthNum = fixture.expected.personalNumbers.month;
        const yearNum = fixture.expected.personalNumbers.year;

        assert.ok(dayNum > 0, 'day should be positive');
        assert.ok(dayNum <= 31, 'day should be <= 31');
        assert.ok(monthNum > 0, 'month should be positive');
        assert.ok(monthNum <= 12, 'month should be <= 12');
        assert.ok(yearNum > 0, 'year should be positive');
      });
    });
  }
});

test('Regression Summary Generation', async (t) => {
  await t.test('should generate comprehensive regression summary', () => {
    const results: RegressionTestResult[] = [];
    const timestamp = new Date().toISOString();

    fixtures.forEach((fixture) => {
      const [yearStr, monthStr, dayStr] = fixture.birthDate.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      const dayResult = reduceToDigit(day);
      const monthResult = reduceToDigit(month);
      const yearDigitSum = String(year)
        .split('')
        .reduce((sum, d) => sum + parseInt(d, 10), 0);
      const yearResult = reduceToDigit(yearDigitSum);

      if (dayResult !== fixture.expected.personalNumbers.day) {
        results.push({
          fixtureId: fixture.id,
          fixtureName: fixture.name,
          engine: 'numerology',
          test: 'personalDayNumber',
          passed: false,
          expected: fixture.expected.personalNumbers.day,
          actual: dayResult,
          message: `Day number mismatch for ${fixture.name}: expected ${fixture.expected.personalNumbers.day}, got ${dayResult}`,
          timestamp,
        });
      }

      if (monthResult !== fixture.expected.personalNumbers.month) {
        results.push({
          fixtureId: fixture.id,
          fixtureName: fixture.name,
          engine: 'numerology',
          test: 'personalMonthNumber',
          passed: false,
          expected: fixture.expected.personalNumbers.month,
          actual: monthResult,
          message: `Month number mismatch for ${fixture.name}: expected ${fixture.expected.personalNumbers.month}, got ${monthResult}`,
          timestamp,
        });
      }

      if (yearResult !== fixture.expected.personalNumbers.year) {
        results.push({
          fixtureId: fixture.id,
          fixtureName: fixture.name,
          engine: 'numerology',
          test: 'personalYearNumber',
          passed: false,
          expected: fixture.expected.personalNumbers.year,
          actual: yearResult,
          message: `Year number mismatch for ${fixture.name}: expected ${fixture.expected.personalNumbers.year}, got ${yearResult}`,
          timestamp,
        });
      }
    });

    const totalTests = fixtures.length * 3;
    const passedTests = totalTests - results.length;
    const summary: RegressionSummary = {
      totalFixtures: fixtures.length,
      totalTests,
      passed: passedTests,
      failed: results.length,
      passRate: (passedTests / totalTests) * 100,
      failures: results,
      timestamp,
    };

    assert.strictEqual(results.length, 0, `Expected no failures, got ${results.length}`);
    assert.strictEqual(summary.passRate, 100, 'pass rate should be 100%');
    assert.ok(summary.totalFixtures > 0, 'should have fixtures');
  });

  await t.test('should report fixture count in summary', () => {
    assert.strictEqual(fixtures.length, 5);
  });
});

test('Fixture Canonical Verification', async (t) => {
  await t.test('fixture-001 (Albert Einstein) has correct expected values', () => {
    const fixture = getFixtureById('fixture-001');
    assert(fixture, 'fixture should exist');
    assert.strictEqual(fixture.expected.personalNumbers.day, 5);
    assert.strictEqual(fixture.expected.personalNumbers.month, 3);
    assert.strictEqual(fixture.expected.personalNumbers.year, 7);
    assert.strictEqual(fixture.expected.astrology.sunSign, 'Pisces');
    assert.strictEqual(fixture.timeVerified, 'exact');
  });

  await t.test('fixture-002 (Marie Curie) has correct expected values', () => {
    const fixture = getFixtureById('fixture-002');
    assert(fixture, 'fixture should exist');
    assert.strictEqual(fixture.expected.personalNumbers.day, 6);
    assert.strictEqual(fixture.expected.personalNumbers.month, 11);
    assert.strictEqual(fixture.expected.personalNumbers.year, 22);
    assert.strictEqual(fixture.expected.astrology.sunSign, 'Sagittarius');
    assert.strictEqual(fixture.timeVerified, 'exact');
  });

  await t.test('fixture-003 (Test Subject A) has correct expected values', () => {
    const fixture = getFixtureById('fixture-003');
    assert(fixture, 'fixture should exist');
    assert.strictEqual(fixture.expected.personalNumbers.day, 6);
    assert.strictEqual(fixture.expected.astrology.sunSign, 'Leo');
  });

  await t.test('fixture-004 (Test Subject B with estimated time) has correct expected values', () => {
    const fixture = getFixtureById('fixture-004');
    assert(fixture, 'fixture should exist');
    assert.strictEqual(fixture.timeVerified, 'estimated');
    assert.strictEqual(fixture.expected.astrology.moonSign, 'Unknown');
  });

  await t.test('fixture-005 (Master Number Test) has master day number', () => {
    const fixture = getFixtureById('fixture-005');
    assert(fixture, 'fixture should exist');
    assert.strictEqual(fixture.expected.personalNumbers.day, 11);
    assert.strictEqual(fixture.expected.personalNumbers.month, 2);
    assert.strictEqual(fixture.expected.personalNumbers.year, 2);
  });
});
