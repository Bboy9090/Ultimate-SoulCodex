import test from 'node:test';
import assert from 'node:assert/strict';
import { getTarotBirthCards } from '../services/astrology';

test('tarot birth cards are invariant across host timezones', () => {
  const original = process.env.TZ;
  try {
    const outputs = new Set<string>();
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = timezone;
      outputs.add(JSON.stringify(getTarotBirthCards('1990-09-17')));
    }
    assert.equal(outputs.size, 1);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
