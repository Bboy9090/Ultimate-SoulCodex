import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePersonalDayNumber,
  calculateUniversalDayNumber,
  getDailyContext,
} from '../daily-context.js';

test('daily numerology resolves the calendar day in the profile timezone', () => {
  const instant = new Date('2026-09-25T01:30:00.000Z');
  const birthDate = '1990-09-17';

  const newYork = getDailyContext(birthDate, instant, 'America/New_York');
  const tokyo = getDailyContext(birthDate, instant, 'Asia/Tokyo');

  assert.equal(newYork.date, '2026-09-24');
  assert.equal(tokyo.date, '2026-09-25');

  assert.equal(
    calculatePersonalDayNumber(birthDate, instant, 'America/New_York'),
    33,
  );
  assert.equal(
    calculatePersonalDayNumber(birthDate, instant, 'Asia/Tokyo'),
    7,
  );

  assert.equal(calculateUniversalDayNumber(instant, 'America/New_York'), 7);
  assert.equal(calculateUniversalDayNumber(instant, 'Asia/Tokyo'), 8);

  assert.equal(newYork.personalDayNumber, 33);
  assert.equal(tokyo.personalDayNumber, 7);
  assert.equal(newYork.universalDayNumber, 7);
  assert.equal(tokyo.universalDayNumber, 8);
});

test('timezone-explicit daily numerology is independent of host timezone', () => {
  const originalTimezone = process.env.TZ;
  const instant = new Date('2026-09-25T01:30:00.000Z');
  const values: number[] = [];

  try {
    for (const hostTimezone of ['UTC', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = hostTimezone;
      values.push(
        calculatePersonalDayNumber(
          '1990-09-17',
          instant,
          'America/New_York',
        ),
      );
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }

  assert.deepEqual(values, [33, 33, 33]);
});
