import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync('routes.ts', 'utf8');

function posterSource(): string {
  const start = routes.indexOf('app.post("/api/poster/render"');
  const end = routes.indexOf('// Full chart endpoint', start);
  assert.ok(start >= 0 && end > start);
  return routes.slice(start, end);
}

test('poster rendering requires an owned saved profile', () => {
  const source = posterSource();

  assert.match(source, /const profileId = req\.body\?\.profileId/);
  assert.match(source, /await storage\.getProfile\(profileId\)/);
  assert.match(source, /profileBelongsToActor\(storedProfile/);
  assert.doesNotMatch(source, /const data = req\.body as PosterSvgData/);
});

test('poster identity fields come from governed stored evidence', () => {
  const source = posterSource();

  assert.match(source, /extractVerifiedAstrology\(storedProfile\)/);
  assert.match(source, /calcLifePath\(storedProfile\.birthDate\)/);
  assert.match(source, /verified\.sun/);
  assert.match(source, /verified\.moon/);
  assert.match(source, /verified\.rising/);
  assert.match(source, /status === "verified"/);
  assert.match(source, /evidence\?\.source && evidence\?\.engine && evidence\?\.calculatedAt/);

  assert.doesNotMatch(source, /req\.body\.sunSign/);
  assert.doesNotMatch(source, /req\.body\.moonSign/);
  assert.doesNotMatch(source, /req\.body\.lifePathNumber/);
});

test('poster fails closed when verified Sun or Moon is unavailable', () => {
  const source = posterSource();

  assert.match(source, /!verified\.sun \|\| !verified\.moon/);
  assert.match(source, /verified_poster_evidence_required/);
});
