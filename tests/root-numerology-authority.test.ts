import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNumerology as rootCalculateNumerology } from '../services/numerology';
import { calculateNumerology as governedCalculateNumerology } from '../server/services/numerology';

test('root numerology calculation uses the governed server authority', () => {
  const root = rootCalculateNumerology('Bobby', '1990-09-17', 2026);
  const governed = governedCalculateNumerology('Bobby', '1990-09-17', 2026);

  assert.deepEqual(root, governed);
  assert.equal(root.status, 'resolved');
  if (root.status === 'resolved') {
    assert.equal(root.personalYear, governed.status === 'resolved' ? governed.personalYear : null);
    assert.ok(root.interpretations.personalYear.includes('2026'));
    assert.equal(typeof root.birthday, 'number');
    assert.equal(typeof root.expression, 'number');
  }
});

test('root numerology honors explicit target year instead of host clock', () => {
  const year2026 = rootCalculateNumerology('Bobby', '1990-09-17', 2026);
  const year2027 = rootCalculateNumerology('Bobby', '1990-09-17', 2027);

  assert.equal(year2026.status, 'resolved');
  assert.equal(year2027.status, 'resolved');

  if (year2026.status === 'resolved' && year2027.status === 'resolved') {
    assert.notEqual(year2026.personalYear, year2027.personalYear);
    assert.match(year2026.interpretations.personalYear, /2026/);
    assert.match(year2027.interpretations.personalYear, /2027/);
  }
});

test('root numerology fails closed with governed unresolved shape', () => {
  const invalid = rootCalculateNumerology('', 'not-a-date', 2026);

  assert.equal(invalid.status, 'unresolved');
  assert.equal(invalid.lifePath, undefined);
  assert.equal(invalid.personalYear, undefined);
  assert.match(invalid.reason, /Name is required|Birth date/);
});
