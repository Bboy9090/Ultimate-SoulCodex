import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deterministicFallback,
  deterministicArchetypeProfile,
} from '../services/deterministic-fallback';

const speculativeProfile = {
  name: 'Test',
  astrologyData: {
    sunSign: 'Capricorn',
    moonSign: 'Pisces',
  },
  humanDesignData: {
    type: 'Reflector',
    strategy: 'To Wait a Lunar Cycle',
    authority: 'Lunar Authority',
  },
  numerologyData: {
    lifePath: 11,
  },
  archetypeData: {
    archetype: 'Mystic Builder',
    themes: ['depth', 'precision'],
    strengths: ['Intuition'],
    shadows: ['Overthinking'],
  },
};

test('AI-outage fallback never infers psychology from symbolic profile fields', () => {
  const promptTypes = [
    'soul_guide',
    'daily_guidance',
    'daily_horoscope',
    'codex_reading',
    'biography',
    'compatibility',
  ] as const;

  for (const promptType of promptTypes) {
    const result = deterministicFallback({
      prompt: 'fallback test',
      promptType: promptType as any,
      profile: speculativeProfile,
    });

    const text = result.content;
    assert.doesNotMatch(
      text,
      /trauma response|burn out|burnout|aura|life force|designed to|you are here to|emotional engine|soft interior|short fuse|mirror of my environment|fixed center|destiny|soul blueprint/i,
    );
  }
});

test('Today-card deterministic fallback uses evidence-first structured output', () => {
  const result = deterministicFallback({
    prompt: 'today',
    promptType: 'today_card' as any,
    profile: speculativeProfile,
    dailyCard: { focus: 'Finish the next concrete task' },
  });

  assert.match(result.content, /^RECOGNITION:/m);
  assert.match(result.content, /^FOCUS:/m);
  assert.match(result.content, /^DO:/m);
  assert.match(result.content, /^DONT:/m);
  assert.match(result.content, /^DECISION:/m);
  assert.match(result.content, /Previous generated cards are prompts, not behavioral evidence/);
  assert.match(result.content, /Treat symbolism as a prediction/);
});

test('legacy deterministic archetype export returns no inferred strengths or shadows', () => {
  const result = deterministicArchetypeProfile({
    sunSign: 'Leo',
    moonSign: 'Scorpio',
    lifePath: 8,
    archetypeName: 'Leader',
  });

  assert.deepEqual(result.strengths, []);
  assert.deepEqual(result.shadows, []);
  assert.match(result.bio, /No deterministic behavioral biography is inferred/);
  assert.match(result.purpose, /No life purpose or destiny is inferred/);
});

test('fallback can use explicit supplied focus without inventing supporting behavior', () => {
  const result = deterministicFallback({
    prompt: 'guide',
    promptType: 'soul_guide',
    profile: speculativeProfile,
    dailyCard: { focus: 'Review the release checklist' },
  });

  assert.match(result.content, /Review the release checklist/);
  assert.match(result.content, /No hidden behavioral pattern is inferred/);
  assert.doesNotMatch(result.content, /Capricorn|Pisces|Reflector|Life Path 11|Mystic Builder/);
});
