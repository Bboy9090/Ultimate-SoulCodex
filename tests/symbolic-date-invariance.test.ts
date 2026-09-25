import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRunes as packageRunes } from '../packages/astrology/runes';
import { calculateRunes as legacyRunes } from '../services/runes';
import { calculateSacredGeometry as packageSacredGeometry } from '../packages/astrology/sacred-geometry';
import { calculateSacredGeometry as legacySacredGeometry } from '../services/sacred-geometry';
import { dailyPull } from '../services/codex-tools/daily-pull';
import { timingWindow } from '../services/codex-tools/timing-windows';

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

test('runes date-only seed is invariant across host timezones', () => {
  for (const calculate of [packageRunes, legacyRunes]) {
    const utc = underTimezone('UTC', () => calculate('Bobby', '1990-09-17', 9));
    const ny = underTimezone('America/New_York', () => calculate('Bobby', '1990-09-17', 9));
    const la = underTimezone('America/Los_Angeles', () => calculate('Bobby', '1990-09-17', 9));
    assert.deepEqual(ny, utc);
    assert.deepEqual(la, utc);
  }
});

test('sacred geometry date-only seed is invariant across host timezones', () => {
  for (const calculate of [packageSacredGeometry, legacySacredGeometry]) {
    const utc = underTimezone('UTC', () => calculate('1990-09-17', 9, 'Bobby'));
    const ny = underTimezone('America/New_York', () => calculate('1990-09-17', 9, 'Bobby'));
    const la = underTimezone('America/Los_Angeles', () => calculate('1990-09-17', 9, 'Bobby'));
    assert.deepEqual(ny, utc);
    assert.deepEqual(la, utc);
  }
});

test('Daily Pull honors the requested date and keeps date-only birth seed stable', () => {
  const profile = {
    birthDate: '1990-09-17',
    numerologyData: { lifePath: 9 },
    astrologyData: { sunSign: 'Virgo' },
  };
  const run = (tz: string) => underTimezone(tz, () => {
    const date = new Date(2026, 8, 24, 12, 0, 0);
    return dailyPull(profile, date);
  });

  assert.deepEqual(run('America/New_York'), run('UTC'));
  assert.deepEqual(run('America/Los_Angeles'), run('UTC'));
});

test('Timing Window uses canonical Personal Day for string birth dates', () => {
  const profile = { birthDate: '1990-09-17', numerologyData: { lifePath: 9 } };
  const run = (tz: string) => underTimezone(tz, () => {
    const date = new Date(2026, 8, 24, 12, 0, 0);
    return timingWindow(profile, date);
  });

  assert.deepEqual(run('America/New_York'), run('UTC'));
  assert.deepEqual(run('America/Los_Angeles'), run('UTC'));
});
