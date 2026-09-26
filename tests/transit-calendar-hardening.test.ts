import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatInTimeZone } from 'date-fns-tz';
import {
  generateTransitsCalendar,
  getUpcomingSignificantTransits,
} from '../packages/astrology/transits-calendar';

const evidence = {
  source: 'independent reference',
  engine: 'verified-test-engine',
  calculatedAt: '2026-09-25T12:00:00.000Z',
};

const profile = {
  id: 'transit-hardening',
  timezone: 'America/New_York',
  astrologyData: {
    planets: {
      sun: {
        sign: 'Virgo',
        longitude: 174,
        verificationStatus: 'verified',
        evidence,
      },
    },
  },
};

test('transit calendar preserves profile-local date-only range semantics', () => {
  const calendar = generateTransitsCalendar(
    profile as any,
    '2026-09-25',
    '2026-09-27',
  );

  assert.equal(calendar.days.length, 3);
  assert.deepEqual(
    calendar.days.map((day) =>
      formatInTimeZone(day.date, 'America/New_York', 'yyyy-MM-dd')
    ),
    ['2026-09-25', '2026-09-26', '2026-09-27'],
  );

  for (const day of calendar.days) {
    assert.equal(formatInTimeZone(day.date, 'America/New_York', 'HH:mm'), '12:00');
  }
});

test('transit calendar rejects reversed, oversized, and invalid-zone ranges', () => {
  assert.throws(
    () => generateTransitsCalendar(profile as any, '2026-09-27', '2026-09-25'),
    /end date must be on or after start date/,
  );

  assert.throws(
    () => generateTransitsCalendar(profile as any, '2026-01-01', '2027-12-31'),
    /range exceeds 366 days/,
  );

  assert.throws(
    () => generateTransitsCalendar(
      { ...profile, timezone: 'Mars/Olympus_Mons' } as any,
      '2026-09-25',
      '2026-09-26',
    ),
    /Invalid transit calendar timezone/,
  );
});

test('upcoming transit horizon is explicitly bounded', () => {
  assert.throws(
    () => getUpcomingSignificantTransits(profile as any, 0),
    /Transit upcoming days must be 1-366/,
  );
  assert.throws(
    () => getUpcomingSignificantTransits(profile as any, 367),
    /Transit upcoming days must be 1-366/,
  );
});

test('transit notifications use reflection language and local-date identity keys', () => {
  const source = readFileSync('packages/astrology/transit-notifications.ts', 'utf8');
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(source, /Transit Reflection/);
  assert.match(source, /reflection prompt, not a prediction/);
  assert.doesNotMatch(source, /Spiritual Awakening|Mastery Challenge|Expansion Opportunity|Revolutionary Energy/);
  assert.match(source, /notificationDateKey\(profile, date\)/);
  assert.match(source, /\$\{transit\.aspect\}-\$\{dateKey\}/);
  assert.match(routes, /days must be an integer from 1 to 366/);
});


test('transit calendar recommendations remain reflection experiments rather than predictions', () => {
  const source = readFileSync('packages/astrology/transits-calendar.ts', 'utf8');

  assert.match(source, /TRANSITS REFLECTION CALENDAR/);
  assert.match(source, /Reflection experiment:/);
  assert.match(source, /not measured intensity/);
  assert.match(source, /not predicted peak events/);
  assert.doesNotMatch(
    source,
    /This is a powerful time|Say yes to new opportunities|Embrace change and innovation|Connect with spirituality and intuition|Release what no longer serves you/,
  );
  assert.doesNotMatch(source, /overallIntensity >= 7|overallIntensity >= 8/);
});


test('transit calendar requires explicit profile timezone instead of assuming UTC', () => {
  assert.throws(
    () => generateTransitsCalendar(
      { ...profile, timezone: undefined } as any,
      '2026-09-25',
      '2026-09-26',
    ),
    /Transit calendar timezone is required/,
  );

  assert.throws(
    () => getUpcomingSignificantTransits(
      { ...profile, timezone: '' } as any,
      7,
    ),
    /Transit calendar timezone is required/,
  );
});

test('upcoming transit dedupe preserves profile-local date identity', () => {
  const source = readFileSync('packages/astrology/transits-calendar.ts', 'utf8');
  const transitSource = readFileSync('transits.ts', 'utf8');

  assert.match(transitSource, /dateISO\?: string/);
  assert.match(source, /map\(\(transit\) => \(\{ \.\.\.transit, dateISO \}\)\)/);
  assert.match(source, /\$\{t\.dateISO \?\? 'undated'\}-\$\{t\.planet\}-\$\{t\.natalPlanet\}-\$\{t\.aspect\}/);
});
