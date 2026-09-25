import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveExactCivilTime } from '../compute/civil-time.js';

test('resolves an ordinary exact civil time deterministically', () => {
  const result = resolveExactCivilTime(
    '1990-09-17',
    '11:11',
    'America/New_York',
  );

  assert.equal(result.status, 'resolved');
  if (result.status !== 'resolved') return;
  assert.equal(result.instant.toISOString(), '1990-09-17T15:11:00.000Z');
  assert.equal(result.utcOffset, '-04:00');
});

test('rejects a spring-forward wall-clock time that never existed', () => {
  const result = resolveExactCivilTime(
    '2024-03-10',
    '02:30',
    'America/New_York',
  );

  assert.deepEqual(result, {
    status: 'unresolved',
    reason: 'nonexistent_local_time',
    localTimestamp: '2024-03-10T02:30:00',
    timezone: 'America/New_York',
  });
});

test('rejects a repeated fall-back wall-clock time as ambiguous', () => {
  const result = resolveExactCivilTime(
    '2024-11-03',
    '01:30',
    'America/New_York',
  );

  assert.equal(result.status, 'unresolved');
  if (result.status !== 'unresolved') return;
  assert.equal(result.reason, 'ambiguous_local_time');
  assert.deepEqual(result.candidateInstants, [
    '2024-11-03T05:30:00.000Z',
    '2024-11-03T06:30:00.000Z',
  ]);
});

test('supports non-hour offsets without rounding them away', () => {
  const result = resolveExactCivilTime(
    '2020-02-29',
    '17:12',
    'Asia/Kathmandu',
  );

  assert.equal(result.status, 'resolved');
  if (result.status !== 'resolved') return;
  assert.equal(result.instant.toISOString(), '2020-02-29T11:27:00.000Z');
  assert.equal(result.utcOffset, '+05:45');
});

test('rejects impossible calendar dates and invalid timezones', () => {
  assert.equal(
    resolveExactCivilTime('2024-02-30', '12:00', 'America/New_York').status,
    'unresolved',
  );
  const badTimezone = resolveExactCivilTime(
    '2024-02-29',
    '12:00',
    'Not/A_Real_Zone',
  );
  assert.equal(badTimezone.status, 'unresolved');
  if (badTimezone.status === 'unresolved') {
    assert.equal(badTimezone.reason, 'invalid_timezone');
  }
});
