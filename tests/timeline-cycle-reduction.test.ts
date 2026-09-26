import test from 'node:test';
import assert from 'node:assert/strict';
import { getNextMonthNum, getNextYearNum } from '../packages/core/compute/timeline';

test('timeline next-cycle helpers reduce canonical master-number transitions', () => {
  assert.equal(getNextYearNum(9), 1);
  assert.equal(getNextYearNum(11), 3);
  assert.equal(getNextYearNum(22), 5);
  assert.equal(getNextYearNum(33), 7);

  assert.equal(getNextMonthNum(9), 1);
  assert.equal(getNextMonthNum(11), 3);
  assert.equal(getNextMonthNum(22), 5);
  assert.equal(getNextMonthNum(33), 7);
});

test('timeline next-cycle helpers preserve ordinary progression', () => {
  assert.equal(getNextYearNum(1), 2);
  assert.equal(getNextYearNum(8), 9);
  assert.equal(getNextMonthNum(4), 5);
});
