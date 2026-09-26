import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync('routes.ts', 'utf8');

function blueprintSource(): string {
  const start = routes.indexOf('app.post("/api/blueprint/generate"');
  const end = routes.indexOf('// ', start + 1);
  assert.ok(start >= 0, 'blueprint route must exist');
  const nextRoute = routes.indexOf('app.', start + 10);
  return routes.slice(start, nextRoute > start ? nextRoute : routes.length);
}

test('blueprint generation requires an owned server-saved profile', () => {
  const source = blueprintSource();

  assert.match(source, /requestedProfileId = req\.body\?\.profileId \?\? req\.body\?\.profile\?\.id/);
  assert.match(source, /await storage\.getProfile\(requestedProfileId\)/);
  assert.match(source, /profileBelongsToActor\(trustedProfile, actor\)/);
  assert.match(source, /return res\.status\(404\)\.json\(\{ message: "Profile not found" \}\)/);
});

test('blueprint identity evidence comes from trusted stored data, not caller-supplied labels', () => {
  const source = blueprintSource();

  assert.match(source, /calcLifePath\(trustedProfile\.birthDate\)/);
  assert.match(source, /extractVerifiedAstrology\(trustedProfile\)/);
  assert.match(source, /trustedProfile\.humanDesignData/);
  assert.match(source, /hd\?\.status === "resolved"/);
  assert.match(source, /trustedProfile\.personalityData/);

  assert.doesNotMatch(source, /profile\.lifePathNumber/);
  assert.doesNotMatch(source, /profile\.sunSign/);
  assert.doesNotMatch(source, /profile\.moonSign/);
  assert.doesNotMatch(source, /profile\.risingSign/);
  assert.doesNotMatch(source, /profile\.humanDesign/);
  assert.doesNotMatch(source, /profile\.human_design/);
});

test('blueprint planetary summary accepts only verified stored placements and omits houses', () => {
  const source = blueprintSource();

  assert.match(source, /trustedProfile\.astrologyData/);
  assert.match(source, /status === "verified"/);
  assert.match(source, /evidence\?\.source && evidence\?\.engine && evidence\?\.calculatedAt/);
  assert.match(source, /map\(\(\[planet, p\]\) => `\$\{planet\} in \$\{String\(p\.sign\)\}`\)/);
  assert.doesNotMatch(source, /House \$\{houseNum\}/);
});
