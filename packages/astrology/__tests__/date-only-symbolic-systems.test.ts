import assert from 'node:assert/strict';
import test from 'node:test';
import { getTarotBirthCards } from '../astrology.js';
import { calculateRunes } from '../runes.js';
import { calculateIChing } from '../i-ching.js';

const HOST_TIMEZONES = [
  'UTC',
  'America/New_York',
  'Pacific/Honolulu',
  'Asia/Tokyo',
] as const;

test('birth-card, rune, and birth-hexagram outputs do not depend on host timezone', () => {
  const originalTimezone = process.env.TZ;
  const snapshots: Array<{
    timezone: string;
    tarot: ReturnType<typeof getTarotBirthCards>;
    runes: ReturnType<typeof calculateRunes>;
    iChingBirth: ReturnType<typeof calculateIChing>['birthHexagram'];
    changingLines: number[];
  }> = [];

  try {
    for (const timezone of HOST_TIMEZONES) {
      process.env.TZ = timezone;
      const iChing = calculateIChing('1990-09-17');
      snapshots.push({
        timezone,
        tarot: getTarotBirthCards('1990-09-17'),
        runes: calculateRunes('Robert Gonzalez', '1990-09-17', 9),
        iChingBirth: iChing.birthHexagram,
        changingLines: iChing.changingLines,
      });
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }

  const baseline = snapshots[0];
  for (const snapshot of snapshots.slice(1)) {
    assert.deepEqual(snapshot.tarot, baseline.tarot, snapshot.timezone);
    assert.deepEqual(snapshot.runes, baseline.runes, snapshot.timezone);
    assert.deepEqual(snapshot.iChingBirth, baseline.iChingBirth, snapshot.timezone);
    assert.deepEqual(snapshot.changingLines, baseline.changingLines, snapshot.timezone);
  }
});
