import test from 'node:test';
import assert from 'node:assert/strict';
import { dateOnlyFromStoredValue } from '../compute/date-only';

test('stored civil-date adapter accepts canonical date-only and UTC-midnight values', () => {
  assert.equal(dateOnlyFromStoredValue('1990-09-17'), '1990-09-17');
  assert.equal(
    dateOnlyFromStoredValue('1990-09-17T00:00:00.000Z'),
    '1990-09-17',
  );
  assert.equal(
    dateOnlyFromStoredValue('1990-09-17T00:00:00Z'),
    '1990-09-17',
  );
  assert.equal(
    dateOnlyFromStoredValue(new Date('1990-09-17T00:00:00.000Z')),
    '1990-09-17',
  );
});

test('stored civil-date adapter rejects non-midnight timestamp ambiguity', () => {
  assert.throws(
    () => dateOnlyFromStoredValue(new Date('1990-09-17T11:11:00.000Z')),
    /non-canonical.*ambiguous/i,
  );
  assert.throws(
    () => dateOnlyFromStoredValue('1990-09-17T11:11:00.000Z'),
    /Stored civil date must be YYYY-MM-DD or canonical UTC-midnight timestamp/,
  );
  assert.throws(
    () => dateOnlyFromStoredValue('1990-02-31'),
    /Stored civil date must be YYYY-MM-DD or canonical UTC-midnight timestamp/,
  );
});

test('stored civil-date adapter never depends on host timezone', () => {
  const previous = process.env.TZ;
  try {
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Auckland']) {
      process.env.TZ = timezone;
      assert.equal(
        dateOnlyFromStoredValue(new Date('1990-09-17T00:00:00.000Z')),
        '1990-09-17',
      );
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
