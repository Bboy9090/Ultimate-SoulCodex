import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from 'astronomy-engine';
import {
  getDailyContext as getServerDailyContext,
  getMoonPhase as getServerMoonPhase,
  getCurrentHDGate as getServerHDGate,
} from '../services/daily-context';
import {
  getDailyContext as getPackageDailyContext,
  getMoonPhase as getPackageMoonPhase,
  getCurrentHDGate as getPackageHDGate,
} from '../packages/astrology/daily-context';
import { degreeToGateAndLine } from '../packages/astrology/human-design';

function expectedPhase(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return 'New Moon';
  if (angle < 67.5) return 'Waxing Crescent';
  if (angle < 112.5) return 'First Quarter';
  if (angle < 157.5) return 'Waxing Gibbous';
  if (angle < 202.5) return 'Full Moon';
  if (angle < 247.5) return 'Waning Gibbous';
  if (angle < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

test('daily Moon phase follows Astronomy Engine MoonPhase rather than illumination phase angle', () => {
  const date = new Date('2026-09-24T12:00:00.000Z');
  const phaseAngle = Astronomy.MoonPhase(date);
  const expected = expectedPhase(phaseAngle);

  assert.equal(getServerMoonPhase(date).phase, expected);
  assert.equal(getPackageMoonPhase(date).phase, expected);
});

test('daily Human Design transit uses the canonical mandala gate/line mapping', () => {
  const date = new Date('2026-09-24T12:00:00.000Z');
  const sunLongitude = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Sun, date, false),
  ).elon;
  const expected = degreeToGateAndLine(sunLongitude);

  assert.deepEqual(getServerHDGate(date), expected);
  assert.deepEqual(getPackageHDGate(date), expected);
});

test('daily context withholds planetary hour without observer-backed sunrise and sunset', () => {
  const date = new Date('2026-09-24T12:00:00.000Z');
  const server = getServerDailyContext('1990-09-17', date);
  const pkg = getPackageDailyContext('1990-09-17', date);

  assert.equal(server.planetaryHour, null);
  assert.equal(pkg.planetaryHour, null);
  assert.equal(server.currentHDGate, pkg.currentHDGate);
  assert.equal(server.currentHDLine, pkg.currentHDLine);
  assert.equal(server.moonPhase, pkg.moonPhase);
  assert.equal(server.personalDayNumber, pkg.personalDayNumber);
});
