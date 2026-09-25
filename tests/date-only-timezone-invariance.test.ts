import test from 'node:test';
import assert from 'node:assert/strict';
import { getTarotBirthCards as getServerTarot } from '../server/services/astrology';
import { getTarotBirthCards as getPackageTarot } from '../packages/astrology/astrology';
import { getTarotBirthCards as getLegacyTarot } from '../services/astrology';
import { personalYear as packagePersonalYear } from '../packages/astrology/timeline/numerology';
import { getAstrologySignals as packageAstrologySignals } from '../packages/astrology/timeline/astrology';
import { personalYear as legacyPersonalYear } from '../services/timeline/numerology';
import { getAstrologySignals as legacyAstrologySignals } from '../services/timeline/astrology';

function underTimezone<T>(timezone: string, callback: () => T): T {
  const previous = process.env.TZ;
  process.env.TZ = timezone;
  try {
    return callback();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

test('Tarot birth-card date-only input is invariant across host timezones', () => {
  const birthDate = '1990-09-17';

  for (const calculate of [getServerTarot, getPackageTarot, getLegacyTarot]) {
    const utc = underTimezone('UTC', () => calculate(birthDate));
    const newYork = underTimezone('America/New_York', () => calculate(birthDate));
    const losAngeles = underTimezone('America/Los_Angeles', () => calculate(birthDate));

    assert.deepEqual(newYork, utc);
    assert.deepEqual(losAngeles, utc);
  }
});

test('timeline Personal Year birth date is invariant across host timezones', () => {
  const birthDate = '1990-09-17';

  for (const calculate of [packagePersonalYear, legacyPersonalYear]) {
    const utc = underTimezone('UTC', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));
    const newYork = underTimezone('America/New_York', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));
    const losAngeles = underTimezone('America/Los_Angeles', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));

    assert.equal(newYork, utc);
    assert.equal(losAngeles, utc);
  }
});

test('timeline age-cycle signals do not shift around the birthday by host timezone', () => {
  const birthDate = '1990-09-17';

  for (const calculate of [packageAstrologySignals, legacyAstrologySignals]) {
    const utc = underTimezone('UTC', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));
    const newYork = underTimezone('America/New_York', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));
    const losAngeles = underTimezone('America/Los_Angeles', () => calculate(birthDate, new Date(2026, 8, 17, 12, 0)));

    assert.deepEqual(newYork, utc);
    assert.deepEqual(losAngeles, utc);
  }
});
