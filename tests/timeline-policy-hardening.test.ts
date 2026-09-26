import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveTimeline,
  resolveTimelineFromProfile,
  timelinePhaseCycleYear,
} from '../src/timeline/engine';
import { buildLifeMap } from '../src/lifemap/engine';
import {
  getNumerologySignal as getServiceTimelineNumerologySignal,
  personalYear as getServiceTimelinePersonalYear,
} from '../services/timeline/numerology';
import { getAstrologySignals as getServiceTimelineAstrologySignals } from '../services/timeline/astrology';
import {
  getNumerologySignal as getPackageTimelineNumerologySignal,
  personalYear as getPackageTimelinePersonalYear,
} from '../packages/astrology/timeline/numerology';
import { getAstrologySignals as getPackageTimelineAstrologySignals } from '../packages/astrology/timeline/astrology';
import { generateTimeline as generateServiceTimeline } from '../services/timeline';
import { generateTimeline as generatePackageTimeline } from '../packages/astrology/timeline';

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


test('legacy Timeline stacks use the governed Personal Year engine and master-number phase roots', () => {
  const date = new Date('2026-06-15T12:00:00Z');
  const fixtures = [
    { birthDate: '1990-09-17', expectedYear: 9 },
    { birthDate: '2000-01-01', expectedYear: 3 },
  ];

  for (const fixture of fixtures) {
    assert.equal(
      getServiceTimelinePersonalYear(fixture.birthDate, date),
      getPackageTimelinePersonalYear(fixture.birthDate, date),
    );
  }

  // Explicitly prove master-number phase scoring stays governed even when
  // the underlying Personal Year retains its master-number identity.
  const master11BirthDate = '1990-01-01';
  let candidateYear: number | null = null;
  for (let year = 2026; year <= 2050; year += 1) {
    const candidate = getServiceTimelinePersonalYear(
      master11BirthDate,
      new Date(`${year}-06-15T12:00:00Z`),
    );
    if (candidate === 11) {
      candidateYear = year;
      break;
    }
  }

  if (candidateYear !== null) {
    const current = new Date(`${candidateYear}-06-15T12:00:00Z`);
    const service = getServiceTimelineNumerologySignal(master11BirthDate, current);
    const pkg = getPackageTimelineNumerologySignal(master11BirthDate, current);
    assert.equal(service?.phase, 'Integration');
    assert.equal(pkg?.phase, 'Integration');
    assert.match(service?.reason ?? '', /preserves its master-number identity/);
  }
});

test('age alone never creates astronomy cycle claims in Timeline scoring', () => {
  const birthDate = '1990-09-17';
  const currentDate = new Date('2026-09-25T12:00:00Z');

  assert.deepEqual(
    getServiceTimelineAstrologySignals(birthDate, currentDate, {}),
    [],
  );
  assert.deepEqual(
    getPackageTimelineAstrologySignals(birthDate, currentDate, {}),
    [],
  );
});


test('Timeline confidence follows governed Personal Year evidence, not unused birth-time fields', () => {
  const input = {
    profile: {
      birthDate: '1990-09-17',
    },
    currentDateISO: '2026-09-25T12:00:00.000Z',
  };

  const service = generateServiceTimeline(input as any);
  const pkg = generatePackageTimeline(input as any);

  assert.equal(service.confidenceLabel, 'Full');
  assert.equal(service.confidence.badge, 'verified');
  assert.match(service.confidence.reason, /Personal Year signal/);
  assert.match(service.confidence.reason, /Time-dependent astrology cycle claims are not included/);
  assert.doesNotMatch(service.confidence.reason, /Birth time and location are set/);

  assert.equal(pkg.confidence, 'Full');
  assert.equal(service.phase, pkg.phase);
});

test('Timeline confidence stays partial when profile evidence is explicitly partial', () => {
  const input = {
    profile: {
      birthDate: '1990-09-17',
      confidenceLabel: 'partial',
    },
    currentDateISO: '2026-09-25T12:00:00.000Z',
  };

  const service = generateServiceTimeline(input as any);
  const pkg = generatePackageTimeline(input as any);

  assert.equal(service.confidenceLabel, 'Partial');
  assert.equal(service.confidence.badge, 'partial');
  assert.equal(pkg.confidence, 'Partial');
});
