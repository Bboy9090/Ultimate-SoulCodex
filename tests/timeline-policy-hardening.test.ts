import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveTimeline,
  resolveTimelineFromProfile,
  timelinePhaseCycleYear,
} from '../src/timeline/engine';
import { buildLifeMap } from '../src/lifemap/engine';

test('timeline phase policy maps master Personal Years explicitly', () => {
  assert.equal(timelinePhaseCycleYear(11), 2);
  assert.equal(timelinePhaseCycleYear(22), 4);
  assert.equal(timelinePhaseCycleYear(33), 6);

  assert.equal(resolveTimeline({ personalYear: 11, themes: [] }), 'Integration');
  assert.equal(resolveTimeline({ personalYear: 22, themes: [] }), 'Construction');
  assert.equal(resolveTimeline({ personalYear: 33, themes: [] }), 'Legacy');
});

test('timeline phase policy rejects unsupported Personal Year values', () => {
  for (const value of [0, 10, 12, 23, 34, 99, 1.5]) {
    assert.throws(
      () => timelinePhaseCycleYear(value),
      /Timeline Personal Year/,
    );
  }
});

test('profile timeline does not invent Personal Year 1 when data is missing', () => {
  assert.throws(
    () => resolveTimelineFromProfile({ numerology: undefined } as any),
    /timeline_personal_year_required/,
  );
});

test('LifeMap does not invent a base Personal Year when data is missing', () => {
  assert.throws(
    () => buildLifeMap({ currentYear: 2026, profile: {} }),
    /lifemap_personal_year_required/,
  );
});
