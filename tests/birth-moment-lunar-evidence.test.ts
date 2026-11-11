import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateBirthMomentLunarEvidence } from '../packages/astrology/birth-moment';
import { getMoonPhase } from '../packages/astrology/daily-context';

test('birth moment does not guess any astronomical state when birth time is unknown', () => {
  for (const value of [null, undefined, '1990-09-17T11:11:00-04:00']) {
    assert.deepEqual(calculateBirthMomentLunarEvidence(value, false), {
      status: 'unavailable',
      reason: 'birth_time_unknown',
      astronomicalFacts: null,
      symbolicInterpretation: null,
    });
  }
});

test('birth moment requires an explicit ISO offset instead of guessing local timezone', () => {
  for (const timestamp of ['1990-09-17', '1990-09-17T11:11:00', '1990-09-17T11:11:00 America/New_York', '1990-09-17T11:11:00-25:00']) {
    assert.throws(() => calculateBirthMomentLunarEvidence(timestamp, true), RangeError);
  }
});

test('New York birth instants resolve to UTC while retaining explicit offset provenance', () => {
  const fixtures = [
    ['1987-11-16T21:00:00-05:00', '1987-11-17T02:00:00.000Z'],
    ['1990-09-17T11:11:00-04:00', '1990-09-17T15:11:00.000Z'],
    ['1992-01-11T06:42:00-05:00', '1992-01-11T11:42:00.000Z'],
  ] as const;
  for (const [local, utc] of fixtures) {
    const outcome = calculateBirthMomentLunarEvidence(local, true);
    assert.equal(outcome.status, 'verified_calculation');
    if (outcome.status !== 'verified_calculation') continue;
    const facts = outcome.astronomicalFacts;
    assert.equal(facts.utcInstant, utc);
    assert.equal(facts.timezoneProvenance.kind, 'explicit_iso_offset');
    assert.equal(facts.timezoneProvenance.suppliedOffset, local.slice(-6));
    assert.equal(facts.calculationContract, 'SOUL-BIRTH-MOMENT-LUNAR-v1');
    assert.equal(facts.source, 'astronomy-engine');
    assert.equal(facts.symbolicInterpretation, undefined);
    assert.equal(outcome.symbolicInterpretation, null);
    assert.ok(facts.elongationDegrees >= 0 && facts.elongationDegrees < 360);
    assert.ok(facts.illuminationPercent >= 0 && facts.illuminationPercent <= 100);
    const existing = getMoonPhase(new Date(utc));
    assert.equal(facts.moonPhase, existing.phase);
    assert.equal(facts.illuminationPercent, existing.percentage);
  }
});

test('equivalent instants are invariant to the supplied clock offset', () => {
  const a = calculateBirthMomentLunarEvidence('1990-09-17T11:11:00-04:00', true);
  const b = calculateBirthMomentLunarEvidence('1990-09-17T15:11:00Z', true);
  assert.equal(a.status, 'verified_calculation');
  assert.equal(b.status, 'verified_calculation');
  if (a.status !== 'verified_calculation' || b.status !== 'verified_calculation') return;
  assert.equal(a.astronomicalFacts.utcInstant, b.astronomicalFacts.utcInstant);
  assert.equal(a.astronomicalFacts.moonPhase, b.astronomicalFacts.moonPhase);
  assert.equal(a.astronomicalFacts.elongationDegrees, b.astronomicalFacts.elongationDegrees);
  assert.notEqual(a.astronomicalFacts.timezoneProvenance.suppliedOffset, b.astronomicalFacts.timezoneProvenance.suppliedOffset);
});

test('invalid and missing offsets fail closed rather than creating guessed birth facts', () => {
  for (const value of ['1990-09-17T11:11:00-04:60', '1990-13-17T11:11:00-04:00', 'not-a-date']) {
    assert.throws(() => calculateBirthMomentLunarEvidence(value, true), RangeError);
  }
});
