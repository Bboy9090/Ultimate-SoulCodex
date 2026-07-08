import { test } from "node:test";
import assert from "node:assert";
import {
  saveDailyPulseEntry,
  getDailyPulseForDate,
  loadDailyPulseEntries,
  clearDailyPulseEntries,
  getRecentDailyPulseEntries,
  getDailyPulseSummary,
  type DailyPulseEntry,
} from "../dailyPulseStorage.js";

// Mock localStorage for tests
const mockStorage = new Map<string, string>();
(global.localStorage as any) = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

test("save and load entry", () => {
  mockStorage.clear();

  const entry = saveDailyPulseEntry({
    date: "2026-07-08",
    mood: "charged" as const,
    energy: 4,
    alignment: 5,
    note: "Great day",
  });

  assert.strictEqual(entry.date, "2026-07-08");
  assert.strictEqual(entry.mood, "charged");
  assert.strictEqual(entry.energy, 4);
  assert.strictEqual(entry.alignment, 5);
  assert.strictEqual(entry.note, "Great day");

  const loaded = getDailyPulseForDate("2026-07-08");
  assert.ok(loaded);
  assert.strictEqual(loaded.date, "2026-07-08");
  assert.strictEqual(loaded.mood, "charged");
});

test("update same date", () => {
  mockStorage.clear();

  const entry1 = saveDailyPulseEntry({
    date: "2026-07-08",
    mood: "steady" as const,
    energy: 3,
    alignment: 3,
  });

  const createdAt1 = entry1.createdAt;

  const entry2 = saveDailyPulseEntry({
    date: "2026-07-08",
    mood: "charged" as const,
    energy: 5,
    alignment: 5,
  });

  assert.strictEqual(entry2.date, "2026-07-08");
  assert.strictEqual(entry2.mood, "charged");
  assert.strictEqual(entry2.energy, 5);
  assert.strictEqual(entry2.createdAt, createdAt1);
  assert(new Date(entry2.updatedAt) > new Date(entry1.updatedAt));

  const all = loadDailyPulseEntries();
  assert.strictEqual(all.length, 1);
});

test("recent entries sort newest first", () => {
  mockStorage.clear();

  saveDailyPulseEntry({ date: "2026-07-06", mood: "low" as const, energy: 2, alignment: 2 });
  saveDailyPulseEntry({ date: "2026-07-08", mood: "charged" as const, energy: 5, alignment: 5 });
  saveDailyPulseEntry({ date: "2026-07-07", mood: "steady" as const, energy: 3, alignment: 3 });

  const recent = getRecentDailyPulseEntries(3);
  assert.strictEqual(recent.length, 3);
  assert.strictEqual(recent[0].date, "2026-07-08");
  assert.strictEqual(recent[1].date, "2026-07-07");
  assert.strictEqual(recent[2].date, "2026-07-06");
});

test("summary calculates average energy and alignment", () => {
  mockStorage.clear();

  saveDailyPulseEntry({ date: "2026-07-06", mood: "low" as const, energy: 1, alignment: 1 });
  saveDailyPulseEntry({ date: "2026-07-07", mood: "steady" as const, energy: 3, alignment: 3 });
  saveDailyPulseEntry({ date: "2026-07-08", mood: "charged" as const, energy: 5, alignment: 5 });

  const summary = getDailyPulseSummary(7);
  assert.strictEqual(summary.entriesCount, 3);
  assert.strictEqual(summary.avgEnergy, 3);
  assert.strictEqual(summary.avgAlignment, 3);
  assert.ok(summary.dateRange);
  assert.strictEqual(summary.dateRange.start, "2026-07-06");
  assert.strictEqual(summary.dateRange.end, "2026-07-08");
});

test("summary identifies most common mood", () => {
  mockStorage.clear();

  saveDailyPulseEntry({ date: "2026-07-05", mood: "charged" as const, energy: 4, alignment: 4 });
  saveDailyPulseEntry({ date: "2026-07-06", mood: "charged" as const, energy: 4, alignment: 4 });
  saveDailyPulseEntry({ date: "2026-07-07", mood: "steady" as const, energy: 3, alignment: 3 });
  saveDailyPulseEntry({ date: "2026-07-08", mood: "low" as const, energy: 2, alignment: 2 });

  const summary = getDailyPulseSummary(7);
  assert.strictEqual(summary.mostCommonMood, "charged");
});

test("clear removes all entries", () => {
  mockStorage.clear();

  saveDailyPulseEntry({ date: "2026-07-06", mood: "low" as const, energy: 2, alignment: 2 });
  saveDailyPulseEntry({ date: "2026-07-07", mood: "steady" as const, energy: 3, alignment: 3 });

  let entries = loadDailyPulseEntries();
  assert.strictEqual(entries.length, 2);

  clearDailyPulseEntries();
  entries = loadDailyPulseEntries();
  assert.strictEqual(entries.length, 0);
});

test("empty storage returns safe defaults", () => {
  mockStorage.clear();

  const entries = loadDailyPulseEntries();
  assert.strictEqual(entries.length, 0);

  const entry = getDailyPulseForDate("2026-07-08");
  assert.strictEqual(entry, null);

  const recent = getRecentDailyPulseEntries(7);
  assert.strictEqual(recent.length, 0);

  const summary = getDailyPulseSummary(7);
  assert.strictEqual(summary.entriesCount, 0);
  assert.strictEqual(summary.avgEnergy, 0);
  assert.strictEqual(summary.avgAlignment, 0);
  assert.strictEqual(summary.dateRange, null);
});

test("malformed storage returns safe empty array", () => {
  mockStorage.clear();
  mockStorage.set("soulcodex.dailyPulse.v1", "invalid json");

  const entries = loadDailyPulseEntries();
  assert.strictEqual(entries.length, 0);

  mockStorage.set("soulcodex.dailyPulse.v1", '{"not": "array"}');
  const entries2 = loadDailyPulseEntries();
  assert.strictEqual(entries2.length, 0);
});
