import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAstrology } from '../services/astrology';

test('date-only legacy astrology exposes only the Sun candidate', () => {
  const result = calculateAstrology({
    birthDate: '1990-09-17',
  } as any);

  assert.equal(result.moonSign, 'Unknown');
  assert.equal(result.risingSign, 'Unknown');
  assert.deepEqual(Object.keys(result.planets), ['sun']);
  assert.equal(result.planets.sun?.house, undefined);
  assert.deepEqual(result.houses, []);
  assert.deepEqual(result.aspects, []);
  assert.match(result.interpretations.bigThree.moon, /withheld/i);
  assert.match(result.interpretations.bigThree.rising, /withheld/i);
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
