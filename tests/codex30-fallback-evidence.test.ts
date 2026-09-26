import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync('routes.ts', 'utf8');

test('Codex30 deterministic fallback does not fabricate generic behavioral history', () => {
  assert.doesNotMatch(routes, /I have a limited tolerance for inefficiency under stress/);
  assert.doesNotMatch(routes, /I do not perform calm/);
  assert.doesNotMatch(routes, /That came from lived experience, not theory/);
  assert.doesNotMatch(routes, /I am in a longer build cycle than most people realize/);
  assert.doesNotMatch(routes, /I do not negotiate with people who have already decided they won't change/);

  assert.match(routes, /Candidate strength to verify:/);
  assert.match(routes, /No pressure response is assumed from symbolic systems/);
  assert.match(routes, /Candidate trigger to verify:/);
  assert.match(routes, /I test the pattern against what actually happens/);
});

test('Codex30 AI field fallbacks avoid mystical filler and unsupported certainty', () => {
  assert.doesNotMatch(routes, /My path is carved by intention/);
  assert.doesNotMatch(routes, /Aligning with the cosmic cycle/);
  assert.doesNotMatch(routes, /Returning to the center/);
  assert.doesNotMatch(routes, /Static energy and noise/);
  assert.doesNotMatch(routes, /A foundation for the eternal now/);

  assert.match(routes, /I test what fits and discard what does not/);
  assert.match(routes, /supported themes as reflection prompts, not as fixed identity facts/);
});

test('Codex30 narrative hard rejects trigger replacement instead of log-only continuation', () => {
  assert.match(routes, /const langCheck = checkNarrative\(narrative\)/);
  assert.match(routes, /if \(!langCheck\.pass\)/);
  assert.match(routes, /Rejecting narrative phrases/);
  assert.match(
    routes,
    /narrative = scrubNarrative\(\s*buildFallbackNarrative\(codename, anchors, themes, strengths, triggers\),?\s*\)/,
  );
  assert.doesNotMatch(routes, /Hard-reject phrases in narrative/);
});
