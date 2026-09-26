import test from 'node:test';
import assert from 'node:assert/strict';
import {
  soulGuideFallback,
  answerFromProfile,
} from '../packages/astrology/soul-guide-fallback';

test('package Soul Guide does not synthesize identity guidance from raw profile fields', () => {
  const rawProfile = {
    astrologyData: { sunSign: 'Virgo', moonSign: 'Scorpio' },
    chart: { sun: { sign: 'Virgo' }, moon: { sign: 'Scorpio' } },
    numerology: { lifePath: 9 },
    archetype: { name: 'Precision Engine' },
    themes: { topThemes: ['precision'] },
    humanDesign: { type: 'Reflector', authority: 'Lunar' },
  };

  const fallback = soulGuideFallback(rawProfile);
  assert.match(fallback.message, /unavailable/i);
  for (const card of fallback.cards) {
    assert.match(card.body, /Unavailable: deterministic synthesis is required/i);
    assert.doesNotMatch(card.body, /Virgo|Scorpio|Reflector|Precision Engine|Life Path/i);
  }

  const answer = answerFromProfile('What is my core pattern?', rawProfile);
  assert.match(answer, /Unavailable: deterministic synthesis is required/i);
  assert.doesNotMatch(answer, /Virgo|Scorpio|Reflector|Precision Engine|Life Path/i);
});

test('package Soul Guide may use an already-produced synthesis object', () => {
  const profile = {
    synthesis: {
      archetype: 'Test Archetype',
      topThemes: ['clarity'],
      coreNature: 'Evidence-linked core nature.',
      stressPattern: 'Evidence-linked stress pattern.',
      decisionStyle: 'Evidence-linked decision style.',
      relationshipStyle: 'Evidence-linked relationship style.',
      blindSpot: 'Evidence-linked blind spot.',
      growthEdge: 'Evidence-linked growth edge.',
      currentPhaseMeaning: 'Evidence-linked phase meaning.',
      practicalGuidance: ['Evidence-linked action.'],
    },
  };

  const fallback = soulGuideFallback(profile);
  assert.match(fallback.cards[0]?.body ?? '', /Evidence-linked core nature/);
  assert.match(answerFromProfile('What is my strength?', profile), /Evidence-linked core nature/);
});
