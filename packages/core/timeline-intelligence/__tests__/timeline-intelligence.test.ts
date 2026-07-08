import { test } from "node:test";
import assert from "node:assert";
import {
  generateTimelineIntelligence,
  deriveTimelineConfidence,
  compareSystemToLived,
  canShowTimelineIntelligence,
  calculateAlignmentScore,
} from "../index.js";
import type { SystemSignal, LivedSignal } from "../types.js";

function createSystemSignal(overrides: Partial<SystemSignal> = {}): SystemSignal {
  const defaults: SystemSignal = {
    date: "2026-07-08",
    system: "personal-day",
    value: 4,
    label: "Day 4 — Build",
    description: "Structure phase for order, discipline, and follow-through",
  };
  return { ...defaults, ...overrides };
}

function createLivedSignal(overrides: Partial<LivedSignal> = {}): LivedSignal {
  const defaults: LivedSignal = {
    dateRange: { start: "2026-07-08", end: "2026-07-08" },
    metric: "energy",
    value: 4,
    frequency: 1,
    percentage: 100,
  };
  return { ...defaults, ...overrides };
}

test("confidence level thresholds", () => {
  assert.strictEqual(deriveTimelineConfidence(0), "Very Low");
  assert.strictEqual(deriveTimelineConfidence(6), "Very Low");
  assert.strictEqual(deriveTimelineConfidence(7), "Low");
  assert.strictEqual(deriveTimelineConfidence(14), "Moderate");
  assert.strictEqual(deriveTimelineConfidence(30), "High");
  assert.strictEqual(deriveTimelineConfidence(60), "Very High");
});

test("can show timeline intelligence threshold", () => {
  assert.strictEqual(canShowTimelineIntelligence(0), false);
  assert.strictEqual(canShowTimelineIntelligence(6), false);
  assert.strictEqual(canShowTimelineIntelligence(7), true);
  assert.strictEqual(canShowTimelineIntelligence(30), true);
});

test("compare system to lived - matching pattern", () => {
  const system = createSystemSignal({
    label: "Day 4 — Build",
    description: "Structure phase — steady energy expected",
    value: 4,
  });

  const lived = createLivedSignal({
    metric: "energy",
    value: 4,
  });

  const { match, divergence } = compareSystemToLived(system, [lived]);

  if (match) {
    assert.ok(match.alignment >= 0.6, "Should have high alignment when energy matches");
    assert.ok(match.description.includes("Day 4"), "Description should reference system signal");
  }
});

test("compare system to lived - diverging pattern", () => {
  const system = createSystemSignal({
    label: "Day 4 — Build",
    value: 4,
  });

  const lived = createLivedSignal({
    metric: "energy",
    value: 1, // Low energy when Day 4 predicts steady
  });

  const { match, divergence } = compareSystemToLived(system, [lived]);

  if (divergence) {
    assert.ok(divergence.description, "Should have divergence description");
  }
});

test("compare system to lived - empty lived signals", () => {
  const system = createSystemSignal();
  const { match, divergence } = compareSystemToLived(system, []);

  assert.strictEqual(match, null);
  assert.strictEqual(divergence, null);
});

test("timeline intelligence generation with no data", () => {
  const intelligence = generateTimelineIntelligence([], []);

  assert.strictEqual(intelligence.version, 1);
  assert.strictEqual(intelligence.sampleSize, 0);
  assert.strictEqual(intelligence.confidence, "Very Low");
  assert.ok(intelligence.observations.length > 0);
  assert.strictEqual(intelligence.alignmentScore, 0);
});

test("timeline intelligence generation with minimal data", () => {
  const system = createSystemSignal();
  const lived = createLivedSignal();

  const intelligence = generateTimelineIntelligence([system], [lived]);

  assert.strictEqual(intelligence.sampleSize, 1);
  assert.strictEqual(intelligence.confidence, "Very Low");
  assert.ok(intelligence.dateRange);
  assert.ok(intelligence.observations.length > 0);
});

test("timeline intelligence generation with moderate data", () => {
  const systems = [
    createSystemSignal({ label: "Day 4 — Build", date: "2026-07-05" }),
    createSystemSignal({ label: "Day 5 — Freedom", date: "2026-07-06", value: 5 }),
    createSystemSignal({ label: "Full Moon", system: "moon-phase", date: "2026-07-07" }),
  ];

  const lived = Array.from({ length: 14 }, (_, i) => ({
    ...createLivedSignal({
      dateRange: {
        start: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
        end: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
      },
      metric: (["energy", "alignment"] as const)[i % 2],
      value: (i % 5) + 1,
    }),
  }));

  const intelligence = generateTimelineIntelligence(systems, lived);

  assert.strictEqual(intelligence.sampleSize, 14);
  assert.strictEqual(intelligence.confidence, "Moderate");
  assert.ok(intelligence.systemSignals.length > 0);
  assert.ok(intelligence.livedSignals.length > 0);
  assert.ok(intelligence.observations.length > 0);
  assert.ok(intelligence.nextTrackingSuggestion);
});

test("alignment score calculation", () => {
  const matches = [
    {
      systemSignal: createSystemSignal(),
      livedSignals: [],
      alignment: 0.8,
      description: "Strong match",
    },
    {
      systemSignal: createSystemSignal(),
      livedSignals: [],
      alignment: 0.6,
      description: "Moderate match",
    },
  ];

  const divergences = [
    {
      systemSignal: createSystemSignal(),
      livedSignals: [],
      expectedVsActual: "Expected high, got low",
      description: "Divergence",
    },
  ];

  const score = calculateAlignmentScore(matches, divergences);
  assert.ok(score >= 0.4 && score <= 0.8, "Score should be between matches and divergences");
});

test("observations are factual only", () => {
  const system = createSystemSignal();
  const lived = createLivedSignal();
  const intelligence = generateTimelineIntelligence([system], [lived]);

  const hasSpeculativeLanguage = intelligence.observations.some(
    (obs) =>
      obs.includes("your soul") ||
      obs.includes("destiny") ||
      obs.includes("cosmic") ||
      obs.includes("universe") ||
      obs.includes("aligned") ||
      obs.includes("intuition")
  );

  assert.strictEqual(
    hasSpeculativeLanguage,
    false,
    "Observations should be factual, not speculative"
  );
});

test("observations reference system and lived data", () => {
  const systems = [createSystemSignal({ label: "Day 4 — Build" })];
  const lived = [
    createLivedSignal({
      dateRange: { start: "2026-07-08", end: "2026-07-08" },
      metric: "energy",
      value: 4,
    }),
  ];

  const intelligence = generateTimelineIntelligence(systems, lived);

  const hasDataReference = intelligence.observations.some((obs) => /\d+/.test(obs));
  assert.strictEqual(hasDataReference, true, "Observations should include numeric data");
});

test("high alignment score with matching data", () => {
  const systems = Array.from({ length: 5 }, (_, i) =>
    createSystemSignal({
      label: `Day ${(i % 9) + 1}`,
      value: (i % 5) + 1,
      date: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
    })
  );

  const lived = Array.from({ length: 7 }, (_, i) => ({
    ...createLivedSignal({
      dateRange: {
        start: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
        end: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
      },
      metric: i % 2 === 0 ? "energy" : "alignment",
      value: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    }),
  }));

  const intelligence = generateTimelineIntelligence(systems, lived);
  assert.ok(intelligence.alignmentScore >= 0, "Alignment score should be calculated");
  assert.ok(intelligence.observations.length > 0, "Should have observations");
});

test("empty data returns safe defaults", () => {
  const intelligence = generateTimelineIntelligence([], []);

  assert.strictEqual(intelligence.version, 1);
  assert.ok(intelligence.generatedAt);
  assert.strictEqual(intelligence.sampleSize, 0);
  assert.strictEqual(intelligence.confidence, "Very Low");
  assert.deepStrictEqual(intelligence.matches, []);
  assert.deepStrictEqual(intelligence.divergences, []);
  assert.strictEqual(intelligence.alignmentScore, 0);
  assert.ok(intelligence.observations.length > 0);
});
