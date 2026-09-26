import test from 'node:test';
import assert from 'node:assert/strict';
import { getHumanDesignInterpretation } from '../packages/astrology/human-design';

test('Human Design interpretation distinguishes calculated labels from symbolic framework claims', () => {
  const text = getHumanDesignInterpretation({
    type: 'Reflector',
    strategy: 'To Wait a Lunar Cycle',
    authority: 'Lunar Authority',
    profile: '2/5',
  } as any);

  assert.match(text, /Calculated Human Design labels/);
  assert.match(text, /Human Design interpretive framework/);
  assert.match(text, /not measured personality traits/i);
  assert.match(text, /not .* destiny|not.*proof/i);
  assert.doesNotMatch(text, /You are here to|Your aura is|life force energy is sustainable/i);
});

test('unsupported Human Design types never fall back to Generator interpretation', () => {
  assert.throws(
    () => getHumanDesignInterpretation({
      type: 'Super Generator',
      strategy: 'To Respond',
      authority: 'Sacral Authority',
      profile: '2/4',
    } as any),
    /Unsupported Human Design type/,
  );
});
