import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSolarReturn,
  calculateLunarReturn,
  calculateSecondaryProgressions,
} from '../services/progressions';

const profile = {
  birthDate: '1990-09-17',
  birthTime: '11:11',
  timezone: 'America/New_York',
  latitude: '40.8448',
  longitude: '-73.8648',
} as any;

test('placeholder return and progression charts remain quarantined', () => {
  assert.throws(
    () => calculateSolarReturn(profile, 2026),
    /solar_return_not_production_ready/,
  );
  assert.throws(
    () => calculateLunarReturn(profile, new Date('2026-09-25T12:00:00Z')),
    /lunar_return_not_production_ready/,
  );
  assert.throws(
    () => calculateSecondaryProgressions(profile, new Date('2026-09-25T12:00:00Z')),
    /secondary_progressions_not_production_ready/,
  );
});
