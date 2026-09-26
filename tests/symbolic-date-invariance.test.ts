import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRunes as packageRunes } from '../packages/astrology/runes';
import { calculateRunes as legacyRunes } from '../services/runes';
import { calculateIChing as packageIChing } from '../packages/astrology/i-ching';
import { calculateIChing as legacyIChing } from '../services/i-ching';
import { calculateSacredGeometry as packageSacredGeometry } from '../packages/astrology/sacred-geometry';
import { calculateSacredGeometry as legacySacredGeometry } from '../services/sacred-geometry';
import { dailyPull } from '../services/codex-tools/daily-pull';
import { timingWindow } from '../services/codex-tools/timing-windows';
import { calculateBiorhythms } from '../packages/astrology/biorhythms';

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

function errorMessageUnderTimezone(timezone: string, callback: () => unknown): string {
  return underTimezone(timezone, () => {
    try {
      callback();
      return 'NO_ERROR';
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  });
}

test('runes quarantine is invariant across host timezones', () => {
  for (const calculate of [packageRunes, legacyRunes]) {
    const utc = errorMessageUnderTimezone('UTC', () => calculate('Bobby', '1990-09-17', 9));
    const ny = errorMessageUnderTimezone('America/New_York', () => calculate('Bobby', '1990-09-17', 9));
    const la = errorMessageUnderTimezone('America/Los_Angeles', () => calculate('Bobby', '1990-09-17', 9));
    assert.match(utc, /runes_unavailable/);
    assert.equal(ny, utc);
    assert.equal(la, utc);
  }
});

test('sacred geometry quarantine is invariant across host timezones', () => {
  for (const calculate of [packageSacredGeometry, legacySacredGeometry]) {
    const utc = errorMessageUnderTimezone('UTC', () => calculate('1990-09-17', 9, 'Bobby'));
    const ny = errorMessageUnderTimezone('America/New_York', () => calculate('1990-09-17', 9, 'Bobby'));
    const la = errorMessageUnderTimezone('America/Los_Angeles', () => calculate('1990-09-17', 9, 'Bobby'));
    assert.match(utc, /sacred_geometry_unavailable/);
    assert.equal(ny, utc);
    assert.equal(la, utc);
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


test('I Ching quarantine is invariant across host timezones', () => {
  for (const calculate of [packageIChing, legacyIChing]) {
    const utc = errorMessageUnderTimezone('UTC', () => calculate('1990-09-17'));
    const ny = errorMessageUnderTimezone('America/New_York', () => calculate('1990-09-17'));
    const la = errorMessageUnderTimezone('America/Los_Angeles', () => calculate('1990-09-17'));
    assert.match(utc, /i_ching_unavailable/);
    assert.equal(ny, utc);
    assert.equal(la, utc);
  }
});

test('biorhythm date-only math is timezone-stable and explicitly symbolic', () => {
  const utc = underTimezone('UTC', () => calculateBiorhythms('1990-09-17', '2026-09-25'));
  const ny = underTimezone('America/New_York', () => calculateBiorhythms('1990-09-17', '2026-09-25'));
  const la = underTimezone('America/Los_Angeles', () => calculateBiorhythms('1990-09-17', '2026-09-25'));

  assert.deepEqual(ny, utc);
  assert.deepEqual(la, utc);
  assert.equal(utc.calculationBasis, 'date-only-symbolic');
  assert.match(utc.overall.interpretation, /mathematical visualization only/i);
  assert.doesNotMatch(utc.overall.interpretation, /health|mood|cognition.*measurement/i);
});
