import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCivilTimeStrict } from '../packages/core/compute/civil-time';
import { calculateAstrology } from '../server/services/astrology';
import { calculateAstrology as calculatePackageAstrology } from '../packages/astrology/astrology';
import { calculateHumanDesign } from '../packages/astrology/human-design';

test('strict civil time rejects New York spring-forward gap', () => {
  const resolved = resolveCivilTimeStrict(
    '2023-03-12',
    '02:30',
    'America/New_York',
  );

  assert.equal(resolved.status, 'nonexistent');
  assert.equal(resolved.utc, null);
});

test('strict civil time rejects New York repeated fall-back hour', () => {
  const resolved = resolveCivilTimeStrict(
    '2023-11-05',
    '01:30',
    'America/New_York',
  );

  assert.equal(resolved.status, 'ambiguous');
  assert.equal(resolved.utc, null);
  assert.equal(resolved.candidates.length, 2);
});

test('strict civil time accepts an ordinary local timestamp exactly', () => {
  const resolved = resolveCivilTimeStrict(
    '2023-03-12',
    '03:30',
    'America/New_York',
  );

  assert.equal(resolved.status, 'valid');
  assert.equal(resolved.utc?.toISOString(), '2023-03-12T07:30:00.000Z');
});

test('timed astrology does not promote a DST-gap Moon candidate', () => {
  const result = calculateAstrology({
    birthDate: '2023-03-12',
    birthTime: '02:30',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
  });

  assert.equal(result.moon.sign, null);
  assert.equal(result.moon.internalCandidate, undefined);
  assert.equal(result.moon.verificationStatus, 'pending_ephemeris');
});

test('Human Design refuses ambiguous repeated-hour birth time', () => {
  const result = calculateHumanDesign({
    name: 'DST ambiguity regression',
    birthDate: '2023-11-05',
    birthTime: '01:30',
    birthLocation: 'New York, NY',
    timezone: 'America/New_York',
    latitude: '40.7128',
    longitude: '-74.0060',
  });

  assert.equal(result.status, 'unresolved');
  assert.equal(result.reason, 'ambiguous_local_time');
});


test('an exact recorded noon birth time is not treated as unknown', () => {
  const result = calculatePackageAstrology({
    birthDate: '1990-09-17',
    birthTime: '12:00',
    timezone: 'America/New_York',
    latitude: 40.8448,
    longitude: -73.8648,
  });

  assert.equal(result.placements?.moon?.verificationStatus, 'calculated');
  assert.equal(result.placements?.rising?.verificationStatus, 'calculated');
});


test('strict civil time detects Lord Howe 30-minute repeated interval', () => {
  const resolved = resolveCivilTimeStrict(
    '2023-04-02',
    '01:45',
    'Australia/Lord_Howe',
  );

  assert.equal(resolved.status, 'ambiguous');
  assert.equal(resolved.utc, null);
  assert.equal(resolved.candidates.length, 2);
  const offsets = [...resolved.candidateUtcOffsetsMinutes].sort((a, b) => a - b);
  assert.deepEqual(offsets, [630, 660]);
});

test('strict civil time rejects Samoa skipped civil date', () => {
  const resolved = resolveCivilTimeStrict(
    '2011-12-30',
    '12:00',
    'Pacific/Apia',
  );

  assert.equal(resolved.status, 'nonexistent');
  assert.equal(resolved.utc, null);
});


test('strict civil time detects London spring gap and repeated fall hour', () => {
  const gap = resolveCivilTimeStrict(
    '2023-03-26',
    '01:30',
    'Europe/London',
  );
  assert.equal(gap.status, 'nonexistent');
  assert.equal(gap.utc, null);

  const repeat = resolveCivilTimeStrict(
    '2023-10-29',
    '01:30',
    'Europe/London',
  );
  assert.equal(repeat.status, 'ambiguous');
  assert.equal(repeat.utc, null);
  assert.deepEqual(
    [...repeat.candidateUtcOffsetsMinutes].sort((a, b) => a - b),
    [0, 60],
  );
});

test('strict civil time detects Newfoundland half-hour DST transitions', () => {
  const gap = resolveCivilTimeStrict(
    '2023-03-12',
    '02:30',
    'America/St_Johns',
  );
  assert.equal(gap.status, 'nonexistent');
  assert.equal(gap.utc, null);

  const repeat = resolveCivilTimeStrict(
    '2023-11-05',
    '01:30',
    'America/St_Johns',
  );
  assert.equal(repeat.status, 'ambiguous');
  assert.equal(repeat.utc, null);
  assert.deepEqual(
    [...repeat.candidateUtcOffsetsMinutes].sort((a, b) => a - b),
    [-210, -150],
  );
});

test('strict civil time preserves quarter-hour timezone offsets exactly', () => {
  const kathmandu = resolveCivilTimeStrict(
    '2026-09-26',
    '12:00',
    'Asia/Kathmandu',
  );
  assert.equal(kathmandu.status, 'valid');
  assert.equal(kathmandu.utc?.toISOString(), '2026-09-26T06:15:00.000Z');
  assert.deepEqual(kathmandu.candidateUtcOffsetsMinutes, [345]);
});

test('strict civil time detects Lord Howe 30-minute spring-forward gap', () => {
  const resolved = resolveCivilTimeStrict(
    '2023-10-01',
    '02:15',
    'Australia/Lord_Howe',
  );

  assert.equal(resolved.status, 'nonexistent');
  assert.equal(resolved.utc, null);
});

test('strict civil time rejects malformed calendar and timezone inputs without normalization', () => {
  for (const [date, time, timezone] of [
    ['2023-02-29', '12:00', 'UTC'],
    ['2023-04-31', '12:00', 'UTC'],
    ['2023-01-01', '24:00', 'UTC'],
    ['2023-01-01', '12:60', 'UTC'],
    ['2023-01-01', '12:00', 'Mars/Olympus'],
  ] as const) {
    const resolved = resolveCivilTimeStrict(date, time, timezone);
    assert.equal(resolved.status, 'invalid', `${date} ${time} ${timezone}`);
    assert.equal(resolved.utc, null);
  }
});
