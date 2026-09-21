import assert from 'node:assert/strict';
import test from 'node:test';
import { localBirthDateWindow, exploreBirthDate } from '../client/src/lib/birthDateExploration';
test('civil-day windows follow birthplace DST instead of assuming 24 hours', () => {
  for (const [date,hours] of [['2024-03-10',23],['2024-11-03',25],['1990-09-17',24]] as const) {
    const [start,end] = localBirthDateWindow(date,'America/New_York');
    assert.equal((end.getTime()-start.getTime())/3600000,hours);
  }
});
test('invalid input and skipped historical dates fail closed', () => {
  for (const [date,tz] of [['2024-02-30','UTC'],['1990-09-17',''],['1990-09-17','not-a-timezone'],['2011-12-30','Pacific/Apia']]) assert.throws(() => localBirthDateWindow(date,tz));
});
test('unknown-time date exploration returns possibilities, never houses or a saved identity', () => {
  const result = exploreBirthDate('1990-09-17','America/New_York');
  assert.equal(result.placements.length,10);
  assert.equal(result.samples,145);
  assert.ok(result.placements.find(p => p.body==='Sun')?.signs.includes('Virgo'));
  assert.ok(result.placements.every(p=>p.signs.length>=1));
  assert.equal('houses' in result,false);
  assert.equal('rising' in result,false);
  assert.equal('verificationStatus' in result,false);
});
