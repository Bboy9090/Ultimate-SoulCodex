import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveOfflineSun,
  generateOfflineCodexProfile,
} from '../packages/core/index';
import { generateFoundationOfflineCodexProfile } from '../client/src/lib/foundationOfflineCodex';

test('offline Sun uses ephemeris math for an ordinary exact birth time', () => {
  const result = resolveOfflineSun(
    '1990-09-17',
    '11:11',
    'America/New_York',
  );

  assert.equal(result.status, 'resolved');
  if (result.status === 'resolved') {
    assert.equal(result.sign, 'Virgo');
    assert.equal(result.policy, 'exact-local-time');
    assert.ok(result.longitudeDegrees >= 0 && result.longitudeDegrees < 360);
    assert.equal(result.engine, 'astronomy-engine@2.1.19');
  }
});

test('date-only Sun exposes a stable sign without inventing an exact longitude', () => {
  const result = resolveOfflineSun(
    '1990-09-17',
    null,
    'America/New_York',
  );

  assert.equal(result.status, 'resolved');
  if (result.status === 'resolved') {
    assert.equal(result.sign, 'Virgo');
    assert.equal(result.policy, 'stable-across-local-day');
    assert.equal(result.longitudeDegrees, null);
  }
});

test('date-only Sun fails closed on the annual sign-ingress day', () => {
  let ingressDate: string | null = null;

  for (let day = 20; day <= 25; day += 1) {
    const date = `2026-09-${String(day).padStart(2, '0')}`;
    const result = resolveOfflineSun(date, null, 'UTC');
    if (
      result.status === 'unresolved' &&
      result.reason === 'sun_sign_changes_within_local_day'
    ) {
      ingressDate = date;
      break;
    }
  }

  assert.ok(ingressDate, 'September 2026 should contain a Virgo→Libra ingress day');

  const profile = generateFoundationOfflineCodexProfile(
    {
      name: 'Ingress Boundary',
      birthDate: ingressDate!,
      birthTime: '',
      birthLocation: 'Greenwich, UK',
      timezone: 'UTC',
      latitude: '51.4769',
      longitude: '0',
    },
    {
      id: 'local-ingress-boundary',
      generatedAt: '2026-09-25T00:00:00.000Z',
      currentYear: 2026,
    },
  );

  assert.equal(profile.astrologyData.sunSign, '');
  const evidenceIds = profile.depthInterpretation.evidence.map((entry) => entry.id);
  assert.ok(!evidenceIds.includes('offline.astrology.sun'));
  assert.match(profile.depthInterpretation.missingData.join(' '), /Sun sign is unresolved locally/);
});

test('legacy offline generator never manufactures Moon, Rising, planets, houses, nodes, aspects, or Chiron', () => {
  const profile = generateOfflineCodexProfile(
    {
      name: 'No Fake Geometry',
      birthDate: '1990-09-17',
      birthTime: '11:11',
      birthLocation: 'Bronx, New York',
      timezone: 'America/New_York',
      latitude: '40.8448',
      longitude: '-73.8648',
    },
    {
      id: 'legacy-offline-no-fakes',
      generatedAt: '2026-09-25T00:00:00.000Z',
      currentYear: 2026,
    },
  );

  assert.equal(profile.astrologyData.sunSign, 'Virgo');
  assert.equal(profile.astrologyData.moonSign, '');
  assert.equal(profile.astrologyData.risingSign, '');
  assert.deepEqual(profile.astrologyData.planets, {});
  assert.deepEqual(profile.astrologyData.houses, []);
  assert.deepEqual(profile.astrologyData.aspects, []);
  assert.equal(profile.astrologyData.northNode, null);
  assert.equal(profile.astrologyData.southNode, null);
  assert.equal(profile.astrologyData.chiron, null);
});

test('legacy offline numerology matches canonical name normalization', () => {
  const profile = generateOfflineCodexProfile(
    {
      name: 'José González',
      birthDate: '1990-09-17',
      birthTime: '',
      birthLocation: 'Bronx, New York',
      timezone: 'America/New_York',
    },
    {
      id: 'legacy-offline-accented-name',
      generatedAt: '2026-09-25T00:00:00.000Z',
      currentYear: 2026,
    },
  );

  const ascii = generateOfflineCodexProfile(
    {
      name: 'Jose Gonzalez',
      birthDate: '1990-09-17',
      birthTime: '',
      birthLocation: 'Bronx, New York',
      timezone: 'America/New_York',
    },
    {
      id: 'legacy-offline-ascii-name',
      generatedAt: '2026-09-25T00:00:00.000Z',
      currentYear: 2026,
    },
  );

  assert.equal(profile.numerologyData.expression, ascii.numerologyData.expression);
  assert.equal(profile.numerologyData.soulUrge, ascii.numerologyData.soulUrge);
  assert.equal(profile.numerologyData.personality, ascii.numerologyData.personality);
});


test('offline Sun does not reinterpret malformed explicit birth time as date-only', () => {
  const result = resolveOfflineSun(
    '1990-09-17',
    '99:99',
    'America/New_York',
  );

  assert.equal(result.status, 'unresolved');
  if (result.status === 'unresolved') {
    assert.equal(result.reason, 'invalid_or_ambiguous_local_time');
  }
});

test('offline Sun does not normalize a nonexistent DST spring-forward birth time', () => {
  const result = resolveOfflineSun(
    '2023-03-12',
    '02:30',
    'America/New_York',
  );

  assert.equal(result.status, 'unresolved');
  if (result.status === 'unresolved') {
    assert.equal(result.reason, 'invalid_or_ambiguous_local_time');
  }
});
