import assert from 'node:assert/strict';
import test from 'node:test';
import { generateTimeline } from '../timeline/index.js';

test('timeline birthday math is invariant across host timezones', () => {
  const originalTimezone = process.env.TZ;
  const outputs = [];

  try {
    for (const timezone of [
      'UTC',
      'America/New_York',
      'Pacific/Honolulu',
      'Asia/Tokyo',
    ]) {
      process.env.TZ = timezone;
      outputs.push({
        timezone,
        value: generateTimeline({
          profile: {
            birthDate: '1990-09-17',
            birthTime: '11:11',
            confidence: { badge: 'verified', label: 'Verified' },
          },
          currentDateISO: '2026-09-17T12:00:00.000Z',
        }),
      });
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }

  const baseline = outputs[0].value;
  for (const output of outputs.slice(1)) {
    assert.deepEqual(output.value, baseline, output.timezone);
  }
});
