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
  assert.match(routes, /calculatePersonalDayNumber\([\s\S]*dateOnlyFromStoredValue\(profileForToday\.birthDate\)[\s\S]*date[\s\S]*\)/);
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


test('Today Card AI prompt does not inject a synthetic precision theme', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.doesNotMatch(
    routes,
    /base\.topTheme \?\? "precision"/,
  );
  assert.match(
    routes,
    /TOP THEMES: \$\{themes \|\| "Unavailable — do not infer"\}/,
  );
});


test('Today Card decision-style guidance never invents clock windows or certainty', () => {
  const styles = [
    'calm_logic',
    'sleep_on_it',
    'quiet_instinct',
    'willpower',
    'gut_yes_no',
    'analysis',
    'gut',
    'consensus',
    'impulse',
    'avoidance',
  ];

  for (const decisionStyle of styles) {
    const card = buildTodayCard(
      {
        date: '2026-09-25',
        personalDayNumber: 7,
        moonPhase: { phase: 'First Quarter', percentage: 50 },
        personalTransits: [],
      },
      { userInputs: { decisionStyle } },
    );

    assert.doesNotMatch(card.decisionAdvice, /\b(?:10\s?am|noon|2\s?pm|tonight|this morning)\b/i);
    assert.doesNotMatch(card.decisionAdvice, /probably right|ahead of my logic|best answer comes/i);
    assert.match(card.decisionAdvice, /I\s/);
  }
});


test('Today Card Personal Day guidance stays reflective rather than predictive or high-stakes prescriptive', () => {
  for (const personalDayNumber of [1,2,3,4,5,6,7,8,9,11,22,33]) {
    const card = buildTodayCard(
      {
        date: '2026-09-25',
        personalDayNumber,
        moonPhase: { phase: 'Waxing Crescent', percentage: 18 },
        personalTransits: [],
      },
      {},
    );

    const combined = [
      ...card.doList,
      ...card.dontList,
      ...card.watchouts,
      card.decisionAdvice,
    ].join(' ');

    assert.doesNotMatch(combined, /make one bold financial|trust my first instinct|probably right|intuition is ahead of my logic/i);
    assert.doesNotMatch(combined, /because the day symbolism says|today is special/i);
  }
});


test('Today Card route preserves stored profile context and profile-local fallback date', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(routes, /let resolvedProfile: any = profile \?\? null/);
  assert.match(routes, /resolvedProfile = storedProfile/);
  assert.match(routes, /const profileForToday = resolvedProfile \?\? \{\}/);
  assert.match(routes, /const date = profileLocalDateKey\(profileForToday, today\)/);
  assert.match(routes, /buildTodayCard\(horoscopeData, profileForToday, codexSynthesis\)/);
  assert.match(routes, /generateTodayCardAI\(card, profileForToday, horoscopeData, codexSynthesis\)/);
  assert.doesNotMatch(routes, /buildTodayCard\(horoscopeData, profile \?\? \{\}, codexSynthesis\)/);
});


test('Today Card does not treat generated card history as behavioral evidence', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(routes, /RECENT CARD OUTPUTS — NOT BEHAVIORAL EVIDENCE/);
  assert.match(routes, /Do not treat a previous generated card as proof that a behavior occurred/);
  assert.doesNotMatch(routes, /RECENT BEHAVIORAL HISTORY/);
  assert.doesNotMatch(routes, /confront me directly/);
});

test('Today Card trusts explicit user-entered behavior fields instead of synthesized signals', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(routes, /USER-ENTERED DECISION STYLE/);
  assert.match(routes, /USER-ENTERED PRESSURE STYLE/);
  assert.match(routes, /profile\?\.userInputs\?\.decisionStyle \?\? ""/);
  assert.match(routes, /profile\?\.userInputs\?\.pressureStyle \?\? ""/);
  assert.doesNotMatch(
    routes,
    /profile\?\.userInputs\?\.decisionStyle \?\? profile\?\.signals\?\.decisionStyle/,
  );
  assert.doesNotMatch(
    routes,
    /profile\?\.userInputs\?\.pressureStyle \?\? profile\?\.signals\?\.pressureStyle/,
  );
});

test('Today Card symbolic daily inputs remain reflection prompts rather than behavioral facts', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(
    routes,
    /Personal Day, Moon phase, transit text, codename, and synthesis themes as reflection prompts only/,
  );
  assert.match(routes, /They do not prove what I will do, feel, or experience/);
  assert.match(routes, /Do not predict tomorrow/);
  assert.doesNotMatch(routes, /behavioral confession/);
});


test('Today Card deterministic fallback ignores synthesized decision-style signals', () => {
  const card = buildTodayCard(
    {
      date: '2026-09-25',
      personalDayNumber: 7,
      moonPhase: { phase: 'First Quarter', percentage: 50 },
      personalTransits: [],
    },
    {
      signals: { decisionStyle: 'impulse' },
    },
  );

  assert.equal(
    card.decisionAdvice,
    'I let my decision breathe before committing. Clarity comes after the noise settles.',
  );
});


test('Today card never invents a UTC civil date when profile-local date is unavailable', () => {
  const supplied = buildTodayCard(
    { date: '2026-09-25', personalDayNumber: 9, moonPhase: { phase: 'Full Moon' } },
    {},
  );
  assert.equal(supplied.date, '2026-09-25');

  const noTimezone = buildTodayCard(
    { personalDayNumber: 9, moonPhase: { phase: 'Full Moon' } },
    {},
  );
  assert.equal(noTimezone.date, 'Unavailable');

  const invalidTimezone = buildTodayCard(
    { personalDayNumber: 9, moonPhase: { phase: 'Full Moon' } },
    { timezone: 'Mars/Olympus_Mons' },
  );
  assert.equal(invalidTimezone.date, 'Unavailable');
});
