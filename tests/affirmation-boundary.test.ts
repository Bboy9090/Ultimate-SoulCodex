import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDailyAffirmations } from '../packages/astrology/affirmations';

test('daily affirmations are deterministic for the same profile and civil date', () => {
  const profile = {
    id: 'affirmation-test',
    birthDate: '1990-09-17',
    timezone: 'America/New_York',
  } as any;

  const a = generateDailyAffirmations(profile, 3, '2026-09-26');
  const b = generateDailyAffirmations(profile, 3, '2026-09-26');
  assert.deepEqual(a, b);
  assert.equal(a.length, 3);
});

test('daily affirmations avoid predictive and metaphysical guarantees', () => {
  const profile = {
    id: 'affirmation-grounded',
    birthDate: '1990-09-17',
    timezone: 'America/New_York',
  } as any;

  const text = JSON.stringify(
    generateDailyAffirmations(profile, 8, '2026-09-26'),
  );

  assert.doesNotMatch(
    text,
    /universe|divine timing|guarantee|effortlessly|flows to me|attracts? .*opportunit|natural leader|manifestor|destiny|soul[- ]aligned/i,
  );
  assert.match(text, /I can /);
});

test('master Life Path 11 keeps its own affirmation pool rather than collapsing to 1', () => {
  const profile = {
    id: 'affirmation-master-11',
    birthDate: '1990-08-11',
    timezone: 'America/New_York',
  } as any;

  const text = JSON.stringify(
    generateDailyAffirmations(profile, 8, '2026-09-26'),
  );

  assert.match(text, /inspiration|symbolism|impression|evidence/i);
  assert.doesNotMatch(text, /natural leader|pioneering spirit/i);
});

test('daily affirmations require explicit date identity or profile timezone', () => {
  assert.throws(
    () => generateDailyAffirmations(
      { id: 'no-date', birthDate: '1990-09-17' } as any,
      3,
    ),
    /date or profile timezone is required/,
  );

  assert.throws(
    () => generateDailyAffirmations(
      {
        id: 'bad-zone',
        birthDate: '1990-09-17',
        timezone: 'Mars/Olympus_Mons',
      } as any,
      3,
    ),
    /Invalid daily affirmation timezone/,
  );
});
