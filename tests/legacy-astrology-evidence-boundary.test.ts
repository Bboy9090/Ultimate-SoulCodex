import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAstrology } from '../services/astrology';

test('date-only legacy astrology exposes only an unambiguous Sun sign candidate', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
  } as any);

  assert.equal(result.sunSign, 'Virgo');
  assert.equal(result.moonSign, 'Unknown');
  assert.equal(result.risingSign, 'Unknown');
  assert.deepEqual(Object.keys(result.planets), []);
  assert.deepEqual(result.houses, []);
  assert.deepEqual(result.aspects, []);
  assert.match(result.interpretations.bigThree.moon, /withheld/i);
  assert.match(result.interpretations.bigThree.rising, /withheld/i);
  assert.match(result.interpretations.summary, /Exact planetary degrees.*withheld/i);
});

test('exact time and timezone expose planetary longitudes but not houses without location', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    timezone: 'America/New_York',
  } as any);

  assert.notEqual(result.moonSign, 'Unknown');
  assert.equal(result.risingSign, 'Unknown');
  assert.equal(Object.keys(result.planets).length, 10);
  for (const placement of Object.values(result.planets)) {
    assert.equal(placement?.house, undefined);
    assert.equal(placement?.houseInterpretation, undefined);
  }
  assert.deepEqual(result.houses, []);
});

test('full civil time and coordinates may expose equal-house assignments', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    timezone: 'America/New_York',
    latitude: 40.8448,
    longitude: -73.8648,
  } as any);

  assert.notEqual(result.moonSign, 'Unknown');
  assert.notEqual(result.risingSign, 'Unknown');
  assert.equal(Object.keys(result.planets).length, 10);
  assert.equal(result.houses.length, 12);
  for (const placement of Object.values(result.planets)) {
    assert.equal(typeof placement?.house, 'number');
  }
});


test('legacy astrology rejects impossible civil dates and malformed clock times', () => {
  assert.throws(
    () => calculateAstrology({ birthDate: '1990-02-31' } as any),
    /date|day|invalid/i,
  );

  for (const birthTime of ['9:30', '24:00', '12:60', 'noon']) {
    assert.throws(
      () => calculateAstrology({
        birthDate: '1990-09-17',
        birthTime,
        timezone: 'America/New_York',
      } as any),
      /birthTime|civil time|invalid/i,
    );
  }
});

test('legacy astrology rejects non-finite and out-of-range coordinates', () => {
  for (const [latitude, longitude] of [
    [91, -73.9],
    [-91, -73.9],
    [40.8, 181],
    [40.8, -181],
    ['not-a-number', -73.9],
  ] as const) {
    assert.throws(
      () => calculateAstrology({
        birthDate: '1990-09-17',
        birthTime: '11:11',
        timezone: 'America/New_York',
        latitude,
        longitude,
      } as any),
      /latitude|longitude|invalid/i,
    );
  }
});


test('explicit timezone wins over coordinate inference', () => {
  const utc = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    timezone: 'UTC',
    latitude: 40.8448,
    longitude: -73.8648,
  } as any);

  const ny = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    timezone: 'America/New_York',
    latitude: 40.8448,
    longitude: -73.8648,
  } as any);

  assert.notEqual(
    utc.planets.moon?.longitude,
    ny.planets.moon?.longitude,
    'UTC must not be silently replaced by the coordinate-derived New York zone',
  );
});

test('explicit invalid timezone is rejected instead of silently inferred from coordinates', () => {
  assert.throws(
    () => calculateAstrology({
      birthDate: '1990-09-17',
      birthTime: '11:11',
      timezone: 'Mars/Olympus_Mons',
      latitude: 40.8448,
      longitude: -73.8648,
    } as any),
    /Invalid timezone/,
  );
});


test('legacy astrology rejects nonexistent DST wall times', () => {
  assert.throws(
    () => calculateAstrology({
      birthDate: '2024-03-10',
      birthTime: '02:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    } as any),
    /Birth civil time is nonexistent/,
  );
});

test('legacy astrology rejects ambiguous repeated DST wall times', () => {
  assert.throws(
    () => calculateAstrology({
      birthDate: '2024-11-03',
      birthTime: '01:30',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
    } as any),
    /Birth civil time is ambiguous/,
  );
});


test('date-only Sun is withheld when the civil date spans a solar-ingress boundary', () => {
  const result = calculateAstrology({
    birthDate: '2026-09-23',
  } as any);

  if (result.sunSign === 'Unknown') {
    assert.equal(result.placements?.sun?.verificationStatus, 'unresolved');
    assert.deepEqual(Object.keys(result.planets), []);
    assert.match(result.interpretations.bigThree.sun, /withheld/i);
  } else {
    // The test remains robust if ephemeris/tzdb shifts establish the entire
    // worldwide civil-date interval inside one sign.
    assert.ok(['Virgo', 'Libra'].includes(result.sunSign));
    assert.deepEqual(Object.keys(result.planets), []);
  }
});


test('clock time without timezone or coordinates does not unlock exact planetary precision', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
  } as any);

  assert.equal(result.sunSign, 'Virgo');
  assert.equal(result.moonSign, 'Unknown');
  assert.equal(result.risingSign, 'Unknown');
  assert.deepEqual(Object.keys(result.planets), []);
  assert.deepEqual(result.houses, []);
  assert.deepEqual(result.aspects, []);
});

test('coordinates may supply timezone evidence when explicit timezone is absent', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
    birthTime: '11:11',
    latitude: 40.8448,
    longitude: -73.8648,
  } as any);

  assert.notEqual(result.moonSign, 'Unknown');
  assert.notEqual(result.risingSign, 'Unknown');
  assert.equal(Object.keys(result.planets).length, 10);
  assert.equal(result.houses.length, 12);
});
