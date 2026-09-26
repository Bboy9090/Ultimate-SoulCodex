import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('daily profile routes resolve today from the profile timezone', () => {
  const routes = readFileSync('routes.ts', 'utf8');

  assert.match(routes, /function profileLocalDateKey/);
  assert.match(routes, /formatInTimeZone\(now, timezone, "yyyy-MM-dd"\)/);
  assert.match(routes, /const today = profileLocalDateKey\(profile\)/);

  const dailyStart = routes.indexOf('app.get("/api/daily-insights/:profileId"');
  const dailyEnd = routes.indexOf('app.get("/api/profiles/:id/daily-horoscope"', dailyStart);
  const dailyBlock = routes.slice(dailyStart, dailyEnd);
  assert.doesNotMatch(dailyBlock, /new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/);

  const ritualStart = routes.indexOf('app.get("/api/profiles/:id/rituals"');
  const ritualEnd = routes.indexOf('// Get user subscription status', ritualStart);
  const ritualBlock = routes.slice(ritualStart, ritualEnd > ritualStart ? ritualEnd : ritualStart + 12000);
  assert.doesNotMatch(ritualBlock, /new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/);
});
