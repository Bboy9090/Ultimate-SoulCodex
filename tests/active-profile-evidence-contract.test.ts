import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { synthesizeArchetype } from '../server/services/archetype';

const routes = fs.readFileSync(new URL('../server/routes.ts', import.meta.url), 'utf8');
const numerology = fs.readFileSync(new URL('../server/services/numerology.ts', import.meta.url), 'utf8');

test('active profile route does not auto-attach Tarot to stable profile identity', () => {
  assert.doesNotMatch(routes, /getTarotBirthCards/);
  assert.doesNotMatch(routes, /archetypeData:\s*\{\s*\.\.\.archetypeData,\s*tarotCards/);
});

test('MBTI and Enneagram updates store assessment data without rewriting archetypeData', () => {
  const assessmentStart = routes.indexOf('app.post("/api/profiles/:id/enneagram"');
  const upgradeStart = routes.indexOf('// Retired direct-card upgrade route', assessmentStart);
  assert.ok(assessmentStart >= 0 && upgradeStart > assessmentStart);
  const assessmentRoutes = routes.slice(assessmentStart, upgradeStart);

  assert.doesNotMatch(assessmentRoutes, /synthesizeArchetype\(/);
  assert.match(assessmentRoutes, /personalityData:\s*updatedPersonalityData/);
  assert.doesNotMatch(assessmentRoutes, /archetypeData:/);
});

test('unresolved active archetype does not manufacture strengths shadows or themes', () => {
  const result = synthesizeArchetype({}, { status: 'unresolved' }, {});
  assert.equal(result.title, 'Archetype unresolved');
  assert.deepEqual(result.strengths, []);
  assert.deepEqual(result.shadows, []);
  assert.deepEqual(result.themes, []);
});

test('numerology interpretations identify meaning as symbolic or traditional', () => {
  assert.match(numerology, /traditionally associated/);
  assert.match(numerology, /symbolic reflection rather than a factual statement about inner desires/);
  assert.match(numerology, /reflective timing theme rather than a prediction/);
  assert.doesNotMatch(numerology, /You're here to/);
  assert.doesNotMatch(numerology, /Your heart's deepest desires drive you/);
});
