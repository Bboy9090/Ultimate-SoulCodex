import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDailyInsights } from '../packages/astrology/daily-insights';

const baseProfile = {
  id: 'daily-insights-boundary',
  name: 'Boundary Test',
  birthDate: '1990-09-17',
};

test('daily insights require profile timezone when no explicit calendar date is supplied', () => {
  assert.throws(
    () => generateDailyInsights(
      baseProfile as any,
      [],
      undefined,
      new Date('2026-09-26T00:30:00.000Z'),
    ),
    /Daily insights timezone is required/,
  );
});

test('explicit calendarDateISO is authoritative for daily insights date identity', () => {
  const result = generateDailyInsights(
    { ...baseProfile, timezone: 'Mars/Olympus_Mons' } as any,
    [],
    '2026-09-25',
    new Date('2026-09-26T00:30:00.000Z'),
  );

  assert.equal(result.data.date, '2026-09-25');
});
