import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateActiveTransits } from '../transits';

test('transits require at least one verified-consistent natal position', () => {
  assert.throws(
    () => calculateActiveTransits({}, new Date('2026-09-25T12:00:00Z')),
    /transit_verified_natal_positions_required/,
  );
});

test('transits reject invalid calculation dates', () => {
  assert.throws(
    () => calculateActiveTransits(
      { Sun: { longitude: 174, sign: 'Virgo' } },
      new Date('invalid'),
    ),
    /transit_date_invalid/,
  );
});

test('transits reject natal sign/longitude disagreement', () => {
  assert.throws(
    () => calculateActiveTransits(
      { Sun: { longitude: 174, sign: 'Leo' } },
      new Date('2026-09-25T12:00:00Z'),
    ),
    /transit_natal_sign_longitude_mismatch:Sun/,
  );
});
