import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCivilTimeStrict } from '../packages/core/compute/civil-time';
import { getNextMonthNum, getNextYearNum } from '../packages/core/compute/timeline';

test('strict civil time rejects DST gaps and overlaps', () => {
  const gap = resolveCivilTimeStrict('2023-03-12', '02:30', 'America/New_York');
  assert.equal(gap.status, 'nonexistent');
  assert.equal(gap.utc, null);

  const overlap = resolveCivilTimeStrict('2023-11-05', '01:30', 'America/New_York');
  assert.equal(overlap.status, 'ambiguous');
  assert.equal(overlap.utc, null);
  assert.equal(overlap.candidates.length, 2);

  const valid = resolveCivilTimeStrict('2023-03-12', '03:30', 'America/New_York');
  assert.equal(valid.status, 'valid');
  assert.equal(valid.utc?.toISOString(), '2023-03-12T07:30:00.000Z');
});

test('timeline next-cycle helpers canonically reduce master values', () => {
  assert.equal(getNextYearNum(9), 1);
  assert.equal(getNextYearNum(11), 3);
  assert.equal(getNextYearNum(22), 5);
  assert.equal(getNextYearNum(33), 7);
  assert.equal(getNextMonthNum(11), 3);
  assert.equal(getNextMonthNum(22), 5);
  assert.equal(getNextMonthNum(33), 7);
});
