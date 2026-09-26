import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildTodayCard } from '../server/todayRender';

test('Today Card keeps missing Personal Day missing instead of inventing Day 4', () => {
  const card = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: null,
      moonPhase: { phase: 'Waxing Crescent', percentage: 18 },
      personalTransits: [],
    },
    {},
  );

  assert.equal(card.personalDayNumber, null);
  assert.equal(card.personalDayLabel, 'Unavailable');
  assert.equal(card.title, 'Today — Evidence First');
  assert.match(card.focus, /Personal Day unavailable/);
  assert.equal(card.moonPhase, 'Waxing Crescent');
  assert.doesNotMatch(card.focus, /Personal Day 4/);
});

test('Today Card preserves master Personal Day identity while using a rooted action lane', () => {
  const eleven = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: 11,
      moonPhase: { phase: 'First Quarter', percentage: 50 },
      personalTransits: [],
    },
    {},
  );
  const twentyTwo = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: 22,
      moonPhase: { phase: 'First Quarter', percentage: 50 },
      personalTransits: [],
    },
    {},
  );
  const thirtyThree = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: 33,
      moonPhase: { phase: 'First Quarter', percentage: 50 },
      personalTransits: [],
    },
    {},
  );

  assert.equal(eleven.personalDayNumber, 11);
  assert.match(eleven.title, /Day 11/);
  assert.equal(twentyTwo.personalDayNumber, 22);
  assert.match(twentyTwo.title, /Day 22/);
  assert.equal(thirtyThree.personalDayNumber, 33);
  assert.match(thirtyThree.title, /Day 33/);
});

test('Today Card renderer does not invent a Full Moon when Moon phase is missing', () => {
  const card = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: null,
      personalTransits: [],
    },
    {},
  );

  assert.equal(card.moonPhase, 'Unavailable');
});

test('Today Card fallback route uses governed current context instead of hard-coded placeholders', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.doesNotMatch(routes, /birth = profile\?\.signals\?\.lifePath \?\? 4/);
  assert.doesNotMatch(routes, /Waxing Gibbous/);
  assert.doesNotMatch(routes, /percentage:\s*65/);
  assert.match(routes, /calculatePersonalDayNumber\(profile\.birthDate, date\)/);
  assert.match(routes, /const moonPhase = getMoonPhase\(today\)/);
});


test('Today Card does not invent identity codename or theme without synthesis evidence', () => {
  const card = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: null,
      moonPhase: { phase: 'Waxing Crescent', percentage: 18 },
      personalTransits: [],
    },
    {},
  );

  assert.equal(card.codename, 'Identity unresolved');
  assert.equal(card.topTheme, undefined);
  assert.doesNotMatch(card.focus, /precision/i);
  assert.doesNotMatch(card.codename, /Quiet Builder/);
});
