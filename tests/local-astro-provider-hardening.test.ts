import test from 'node:test';
import assert from 'node:assert/strict';
import { localAstroProvider } from '../server/astro/providers/localProvider';

test('local astrology provider does not invent natal placements when civil time is unresolved', async () => {
  const unknownTime = await localAstroProvider.getChart({
    dateISO: '1990-09-17',
    timeUnknown: true,
    place: 'Bronx, NY',
    timezone: 'America/New_York',
    lat: 40.8448,
    lon: -73.8648,
  });

  assert.equal(unknownTime.sun, 'Unknown');
  assert.equal(unknownTime.moon, 'Unknown');
  assert.match(unknownTime.notes?.join(' ') ?? '', /Birth time unknown/i);

  const missingTimezone = await localAstroProvider.getChart({
    dateISO: '1990-09-17',
    time24: '11:11',
    timeUnknown: false,
    place: 'Bronx, NY',
    lat: 40.8448,
    lon: -73.8648,
  });

  assert.equal(missingTimezone.sun, 'Unknown');
  assert.equal(missingTimezone.moon, 'Unknown');
});
