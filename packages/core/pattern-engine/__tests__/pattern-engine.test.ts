import { test } from "node:test";
import assert from "node:assert";
import {
  generatePatternSummary,
  deriveConfidenceLevel,
  calculateEnergyPattern,
  calculateAlignmentPattern,
  calculateMoodFrequencies,
  calculateEnergyAlignmentCorrelation,
  findHighEnergyStreaks,
  findLowEnergyStreaks,
  calculateEnergyConsistency,
  calculateAlignmentConsistency,
  generateRollingWindow,
  generateOverallTrend,
} from "../index.js";
import type { DailyPulseEntry } from "../types.js";

function createEntry(overrides: Partial<DailyPulseEntry> = {}): DailyPulseEntry {
  const defaults: DailyPulseEntry = {
    version: 1,
    date: "2026-07-08",
    mood: "steady",
    energy: 3,
    alignment: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...defaults, ...overrides };
}

test("confidence level thresholds", () => {
  assert.strictEqual(deriveConfidenceLevel(0), "Very Low");
  assert.strictEqual(deriveConfidenceLevel(2), "Very Low");
  assert.strictEqual(deriveConfidenceLevel(3), "Low");
  assert.strictEqual(deriveConfidenceLevel(7), "Moderate");
  assert.strictEqual(deriveConfidenceLevel(14), "High");
  assert.strictEqual(deriveConfidenceLevel(30), "Very High");
});

test("energy pattern calculation", () => {
  const entries = [
    createEntry({ date: "2026-07-05", energy: 2 }),
    createEntry({ date: "2026-07-06", energy: 3 }),
    createEntry({ date: "2026-07-07", energy: 4 }),
    createEntry({ date: "2026-07-08", energy: 5 }),
  ];

  const pattern = calculateEnergyPattern(entries);
  assert.strictEqual(pattern.avgEnergy, 3.5);
  assert.strictEqual(pattern.minEnergy, 2);
  assert.strictEqual(pattern.maxEnergy, 5);
  assert.ok(pattern.consistency > 0);
  assert.ok(pattern.consistency < 1);
});

test("energy pattern with rising trend", () => {
  const entries = [
    createEntry({ date: "2026-07-05", energy: 2 }),
    createEntry({ date: "2026-07-06", energy: 2 }),
    createEntry({ date: "2026-07-07", energy: 4 }),
    createEntry({ date: "2026-07-08", energy: 5 }),
  ];

  const pattern = calculateEnergyPattern(entries);
  assert.strictEqual(pattern.trend, "rising");
});

test("alignment pattern calculation", () => {
  const entries = [
    createEntry({ date: "2026-07-05", alignment: 1 }),
    createEntry({ date: "2026-07-06", alignment: 3 }),
    createEntry({ date: "2026-07-07", alignment: 5 }),
  ];

  const pattern = calculateAlignmentPattern(entries);
  assert.strictEqual(pattern.avgAlignment, 3);
  assert.strictEqual(pattern.minAlignment, 1);
  assert.strictEqual(pattern.maxAlignment, 5);
});

test("mood frequencies", () => {
  const entries = [
    createEntry({ date: "2026-07-05", mood: "charged" as const }),
    createEntry({ date: "2026-07-06", mood: "charged" as const }),
    createEntry({ date: "2026-07-07", mood: "steady" as const }),
  ];

  const frequencies = calculateMoodFrequencies(entries);
  assert.strictEqual(frequencies[0].mood, "charged");
  assert.strictEqual(frequencies[0].count, 2);
  assert.strictEqual(frequencies[0].percentage, 67);
  assert.strictEqual(frequencies[1].mood, "steady");
  assert.strictEqual(frequencies[1].count, 1);
  assert.strictEqual(frequencies[1].percentage, 33);
});

test("energy-alignment correlation", () => {
  const entries = [
    createEntry({ date: "2026-07-05", energy: 5, alignment: 5 }),
    createEntry({ date: "2026-07-06", energy: 4, alignment: 4 }),
    createEntry({ date: "2026-07-07", energy: 3, alignment: 3 }),
    createEntry({ date: "2026-07-08", energy: 2, alignment: 2 }),
  ];

  const correlation = calculateEnergyAlignmentCorrelation(entries);
  assert.ok(correlation > 0.9, "Should have strong positive correlation");
});

test("high energy streaks detection", () => {
  const entries = [
    createEntry({ date: "2026-07-05", energy: 5 }),
    createEntry({ date: "2026-07-06", energy: 4 }),
    createEntry({ date: "2026-07-07", energy: 2 }),
    createEntry({ date: "2026-07-08", energy: 3 }),
  ];

  const streaks = findHighEnergyStreaks(entries, 4);
  assert.ok(streaks.length > 0);
  assert.strictEqual(streaks[0].type, "high_energy");
  assert.ok(streaks[0].length >= 1);
});

test("low energy streaks detection", () => {
  const entries = [
    createEntry({ date: "2026-07-05", energy: 1 }),
    createEntry({ date: "2026-07-06", energy: 2 }),
    createEntry({ date: "2026-07-07", energy: 4 }),
    createEntry({ date: "2026-07-08", energy: 5 }),
  ];

  const streaks = findLowEnergyStreaks(entries, 2);
  assert.ok(streaks.length > 0);
  assert.strictEqual(streaks[0].type, "low_energy");
});

test("consistency calculation", () => {
  const consistentEntries = [
    createEntry({ date: "2026-07-05", energy: 3 }),
    createEntry({ date: "2026-07-06", energy: 3 }),
    createEntry({ date: "2026-07-07", energy: 3 }),
  ];

  const variableEntries = [
    createEntry({ date: "2026-07-05", energy: 1 }),
    createEntry({ date: "2026-07-06", energy: 3 }),
    createEntry({ date: "2026-07-07", energy: 5 }),
  ];

  const consistentScore = calculateEnergyConsistency(consistentEntries);
  const variableScore = calculateEnergyConsistency(variableEntries);

  assert.ok(consistentScore > variableScore, "Consistent entries should have higher consistency score");
});

test("rolling window calculation", () => {
  const entries = Array.from({ length: 10 }, (_, i) => ({
    ...createEntry({
      date: new Date(2026, 6, 9 - i).toISOString().split("T")[0],
      energy: (((i % 3) + 2) as any) as 1 | 2 | 3 | 4 | 5,
    }),
  }));

  const window7d = generateRollingWindow(entries, 7);
  assert.strictEqual(window7d.days, 7);
  assert.strictEqual(window7d.dataPoints, 7);
  assert.ok(window7d.dateRange);
  assert.ok(window7d.metrics.energy.avgEnergy);
});

test("overall trend calculation", () => {
  const risingEntries = [
    createEntry({ date: "2026-07-05", energy: 2 }),
    createEntry({ date: "2026-07-06", energy: 2 }),
    createEntry({ date: "2026-07-07", energy: 4 }),
    createEntry({ date: "2026-07-08", energy: 5 }),
  ];

  const trend = generateOverallTrend(risingEntries);
  assert.strictEqual(trend, "rising");
});

test("pattern summary generation", () => {
  const entries = Array.from({ length: 15 }, (_, i) => ({
    ...createEntry({
      date: new Date(2026, 6, 9 - i).toISOString().split("T")[0],
      energy: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      alignment: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      mood: (["low", "steady", "charged"][Math.floor(Math.random() * 3)]) as
        | "low"
        | "steady"
        | "charged",
    }),
  }));

  const summary = generatePatternSummary(entries);
  assert.strictEqual(summary.version, 1);
  assert.ok(summary.generatedAt);
  assert.strictEqual(summary.dataPoints, 15);
  assert.ok(summary.confidence);
  assert.ok(summary.window7d);
  assert.ok(summary.window14d);
  assert.ok(summary.window30d);
  assert.ok(Array.isArray(summary.observations));
  assert.ok(summary.observations.length > 0);
});

test("pattern summary with minimal data", () => {
  const entries = [createEntry()];

  const summary = generatePatternSummary(entries);
  assert.strictEqual(summary.dataPoints, 1);
  assert.strictEqual(summary.confidence, "Very Low");
  assert.ok(summary.observations.length > 0);
});

test("pattern summary confidence levels", () => {
  const entries3 = Array.from({ length: 3 }, (_, i) =>
    createEntry({
      date: new Date(2026, 6, 9 - i).toISOString().split("T")[0],
      energy: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    })
  );
  const summary3 = generatePatternSummary(entries3);
  assert.strictEqual(summary3.confidence, "Low");

  const entries14 = Array.from({ length: 14 }, (_, i) =>
    createEntry({
      date: new Date(2026, 6, 14 - i).toISOString().split("T")[0],
      energy: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    })
  );
  const summary14 = generatePatternSummary(entries14);
  assert.strictEqual(summary14.confidence, "High");
});

test("empty entries returns safe defaults", () => {
  const summary = generatePatternSummary([]);
  assert.strictEqual(summary.dataPoints, 0);
  assert.strictEqual(summary.confidence, "Very Low");
  assert.ok(Array.isArray(summary.observations));
});

test("observations are factual only", () => {
  const entries = Array.from({ length: 7 }, (_, i) => ({
    ...createEntry({
      date: new Date(2026, 6, 9 - i).toISOString().split("T")[0],
      energy: 4,
      alignment: 4,
      mood: "charged" as const,
    }),
  }));

  const summary = generatePatternSummary(entries);

  const hasSpeculativeLanguage = summary.observations.some(
    (obs) =>
      obs.includes("your soul") ||
      obs.includes("you feel") ||
      obs.includes("cosmic") ||
      obs.includes("destiny") ||
      obs.includes("intuition") ||
      obs.includes("power") ||
      obs.includes("aligned")
  );

  assert.strictEqual(hasSpeculativeLanguage, false, "Observations should contain only factual data");
});

test("observations include measurements", () => {
  const entries = Array.from({ length: 7 }, (_, i) => ({
    ...createEntry({
      date: new Date(2026, 6, 9 - i).toISOString().split("T")[0],
      energy: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
    }),
  }));

  const summary = generatePatternSummary(entries);
  const hasAverage = summary.observations.some((obs) => obs.includes("averaged"));
  const hasNumber = summary.observations.some((obs) => /\d+/.test(obs));

  assert.strictEqual(hasAverage, true, "Observations should include averages");
  assert.strictEqual(hasNumber, true, "Observations should include numeric data");
});
