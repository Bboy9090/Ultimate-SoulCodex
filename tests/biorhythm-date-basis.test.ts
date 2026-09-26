import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBiorhythms } from '../services/biorhythms';

test('biorhythm day count is date-only and timezone-explicit', () => {
  const instant = new Date('2026-09-26T00:30:00Z');

  const ny = calculateBiorhythms(
    '1990-09-17',
    instant,
    'America/New_York',
  );
  const tokyo = calculateBiorhythms(
    '1990-09-17',
    instant,
    'Asia/Tokyo',
  );

  assert.equal(ny.referenceDate, '2026-09-25');
  assert.equal(tokyo.referenceDate, '2026-09-26');
  assert.equal(ny.calculationBasis, 'date-only-symbolic');
  assert.equal(tokyo.calculationBasis, 'date-only-symbolic');
});

test('biorhythm calculation rejects reference dates before birth', () => {
  assert.throws(
    () => calculateBiorhythms('1990-09-17', '1990-09-16'),
    /cannot precede birth date/,
  );
});

test('explicit date-only reference is host-timezone invariant', () => {
  const original = process.env.TZ;
  try {
    const values = new Set<string>();
    for (const timezone of ['UTC', 'America/New_York', 'Pacific/Honolulu', 'Asia/Tokyo']) {
      process.env.TZ = timezone;
      values.add(JSON.stringify(calculateBiorhythms('1990-09-17', '2026-09-25')));
    }
    assert.equal(values.size, 1);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
