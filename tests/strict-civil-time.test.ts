import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCivilTimeStrict } from '../packages/core/compute/civil-time';
import { calculateAstrology } from '../server/services/astrology';
import { calculateAstrology as calculatePackageAstrology } from '../packages/astrology/astrology';
import { calculateHumanDesign } from '../packages/astrology/human-design';
import { calculateAstrology as calculateRootAstrology } from '../services/astrology';

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


test('shared astrology refuses timed calculation without timezone or resolvable coordinates', () => {
  assert.throws(
    () =>
      calculatePackageAstrology({
        birthDate: '1990-09-17',
        birthTime: '11:11',
      }),
    /valid IANA timezone|resolvable birth coordinates|precise birth time/i,
  );
});

test('shared astrology may resolve an IANA zone from exact birth coordinates without coarse longitude guessing', () => {
  const result = calculatePackageAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    latitude: 40.8448,
    longitude: -73.8648,
  });

  assert.equal(result.placements?.moon?.verificationStatus, 'calculated');
  assert.equal(result.placements?.rising?.verificationStatus, 'calculated');
});

test('historical IANA timezone resolution preserves pre-standard local mean time', () => {
  const resolved = resolveCivilTimeStrict(
    '1850-05-15',
    '09:30',
    'Africa/Cairo',
  );

  assert.equal(resolved.status, 'valid');
  assert.equal(resolved.utc?.toISOString(), '1850-05-15T07:24:51.000Z');
});


test('reachable root astrology refuses missing timed inputs instead of fabricating noon/UTC/zero coordinates', () => {
  assert.throws(
    () =>
      calculateRootAstrology({
        name: 'Missing data',
        birthDate: '1990-09-17',
        birthLocation: 'Unknown',
        birthTime: '',
        timezone: '',
        latitude: '',
        longitude: '',
      } as any),
    /Exact birth time|required|timezone|coordinates/i,
  );
});

test('reachable root astrology still calculates with exact supported inputs', () => {
  const result = calculateRootAstrology({
    name: 'Exact data',
    birthDate: '1990-09-17',
    birthTime: '11:11',
    birthLocation: 'Bronx, NY',
    timezone: 'America/New_York',
    latitude: '40.8448',
    longitude: '-73.8648',
  } as any);

  assert.equal(typeof result.sunSign, 'string');
  assert.equal(typeof result.moonSign, 'string');
  assert.equal(typeof result.risingSign, 'string');
});
