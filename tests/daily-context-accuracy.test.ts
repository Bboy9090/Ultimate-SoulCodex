import test from 'node:test';
import assert from 'node:assert/strict';
import * as Astronomy from 'astronomy-engine';
import {
  getDailyContext as getServerDailyContext,
  getMoonPhase as getServerMoonPhase,
  getCurrentHDGate as getServerHDGate,
  calculateUniversalDayNumber as getServerUniversalDay,
} from '../services/daily-context';
import {
  getDailyContext as getPackageDailyContext,
  getMoonPhase as getPackageMoonPhase,
  getCurrentHDGate as getPackageHDGate,
  calculateUniversalDayNumber as getPackageUniversalDay,
} from '../packages/astrology/daily-context';
import { degreeToGateAndLine } from '../packages/astrology/human-design';
import { calcPersonalDay, calcUniversalDay } from '../packages/core/compute/personal-numbers';
import { selectTemplates } from '../packages/astrology/template-bank';

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


test('daily template rotation excludes registry-disabled systems and renders governed context cleanly', () => {
  const context = {
    date: '2026-09-25',
    personalDayNumber: 9,
    universalDayNumber: 8,
    moonSign: 'Pisces',
    moonPhase: 'Full Moon',
    moonPhasePercentage: 97,
    currentHDGate: 18,
    currentHDLine: 3,
    planetaryHour: null,
  };

  const { selectedTemplates } = selectTemplates(context, { id: 'profile-test' }, []);
  const allowed = new Set(['numerology', 'astrology', 'humandesign']);

  assert.ok(selectedTemplates.length >= 3);
  for (const template of selectedTemplates) {
    assert.ok(allowed.has(template.category), `unexpected daily category: ${template.category}`);
    const rendered = template.template({ ...context, profile: { id: 'profile-test', name: 'Test' } });
    assert.doesNotMatch(rendered, /NaN|nakshatra|birth rune|dosha|Gene Key|hexagram|Sabian|fixed star|Part of Fortune/i);
  }
});


test('Universal Day uses the governed core reduction policy everywhere', () => {
  const dates = [
    '2026-09-25',
    '2026-11-11',
    '2033-03-03',
  ];

  for (const date of dates) {
    const expected = calcUniversalDay(date);
    assert.equal(getPackageUniversalDay(date), expected);
    assert.equal(getServerUniversalDay(date), expected);
  }
});

test('Universal Day preserves declared master-number results when reached', () => {
  let foundMaster = false;
  for (let month = 1; month <= 12 && !foundMaster; month += 1) {
    for (let day = 1; day <= 28 && !foundMaster; day += 1) {
      const date = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const value = calcUniversalDay(date);
      if ([11, 22, 33].includes(value)) {
        foundMaster = true;
        assert.equal(getPackageUniversalDay(date), value);
        assert.equal(getServerUniversalDay(date), value);
      }
    }
  }
  assert.equal(foundMaster, true);
});


test('profile-local calendar date drives daily numerology while sky context uses the same instant', () => {
  // 00:30 UTC is still the previous civil day in New York.
  const instant = new Date('2026-09-26T00:30:00.000Z');
  const utcDay = getPackageDailyContext('1990-09-17', instant, '2026-09-26');
  const newYorkDay = getPackageDailyContext('1990-09-17', instant, '2026-09-25');

  assert.equal(utcDay.date, '2026-09-26');
  assert.equal(newYorkDay.date, '2026-09-25');

  // Astronomical context is instant-based and therefore identical.
  assert.equal(newYorkDay.moonSign, utcDay.moonSign);
  assert.equal(newYorkDay.moonPhase, utcDay.moonPhase);
  assert.equal(newYorkDay.moonPhasePercentage, utcDay.moonPhasePercentage);
  assert.equal(newYorkDay.currentHDGate, utcDay.currentHDGate);
  assert.equal(newYorkDay.currentHDLine, utcDay.currentHDLine);

  // Calendar numerology is local-date based.
  assert.equal(
    newYorkDay.personalDayNumber,
    calcPersonalDay('1990-09-17', '2026-09-25'),
  );
  assert.equal(
    utcDay.personalDayNumber,
    calcPersonalDay('1990-09-17', '2026-09-26'),
  );
  assert.equal(newYorkDay.universalDayNumber, getPackageUniversalDay('2026-09-25'));
  assert.equal(utcDay.universalDayNumber, getPackageUniversalDay('2026-09-26'));

  const server = getServerDailyContext('1990-09-17', instant, '2026-09-25');
  assert.deepEqual(server, newYorkDay);
});
