import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLifeMap } from '../src/lifemap/forecast';

test('LifeMap uses explicit reference year deterministically', () => {
  const map = generateLifeMap('1990-09-17', 2, [], 2026);

  assert.equal(map.birthYear, 1990);
  assert.equal(map.currentYear, 2026);
  assert.ok(map.years.some((year) => year.year === 2026 && year.isCurrent));
  assert.ok(map.years.every((year) => year.year <= 2028));
});

test('LifeMap rejects invalid reference years', () => {
  assert.throws(
    () => generateLifeMap('1990-09-17', 2, [], 1989),
    /reference year must be a valid year on or after birth/,
  );
  assert.throws(
    () => generateLifeMap('1990-09-17', 2, [], 10000),
    /reference year must be a valid year on or after birth/,
  );
});
