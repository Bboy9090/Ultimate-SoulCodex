import type { DailyPulseEntry, Streak } from "./types.js";

export function findHighEnergyStreaks(entries: DailyPulseEntry[], threshold: number = 4): Streak[] {
  return findValueStreaks(entries, "energy", threshold, "high");
}

export function findLowEnergyStreaks(entries: DailyPulseEntry[], threshold: number = 2): Streak[] {
  return findValueStreaks(entries, "energy", threshold, "low");
}

export function findHighAlignmentStreaks(entries: DailyPulseEntry[], threshold: number = 4): Streak[] {
  return findValueStreaks(entries, "alignment", threshold, "high");
}

export function findLowAlignmentStreaks(entries: DailyPulseEntry[], threshold: number = 2): Streak[] {
  return findValueStreaks(entries, "alignment", threshold, "low");
}

function findValueStreaks(
  entries: DailyPulseEntry[],
  valueType: "energy" | "alignment",
  threshold: number,
  direction: "high" | "low"
): Streak[] {
  if (entries.length === 0) return [];

  const streaks: Streak[] = [];
  let currentStreak: DailyPulseEntry[] = [];

  entries.forEach((entry) => {
    const value = entry[valueType];
    const matches = direction === "high" ? value >= threshold : value <= threshold;

    if (matches) {
      currentStreak.push(entry);
    } else {
      if (currentStreak.length > 0) {
        streaks.push(createStreak(currentStreak, valueType, direction));
        currentStreak = [];
      }
    }
  });

  if (currentStreak.length > 0) {
    streaks.push(createStreak(currentStreak, valueType, direction));
  }

  return streaks.sort((a, b) => b.length - a.length);
}

function createStreak(
  entries: DailyPulseEntry[],
  valueType: "energy" | "alignment",
  direction: "high" | "low"
): Streak {
  const typeLabel = valueType === "energy" ? "energy" : "alignment";
  const directionLabel = direction === "high" ? "high" : "low";
  const firstEntry = entries[entries.length - 1];
  const lastEntry = entries[0];

  return {
    type: `${directionLabel}_${typeLabel}` as
      | "high_energy"
      | "low_energy"
      | "high_alignment"
      | "low_alignment"
      | "mood_pattern",
    value: direction === "high" ? ">= 4" : "<= 2",
    length: entries.length,
    startDate: firstEntry.date,
    endDate: lastEntry.date,
  };
}

export function findMoodStreaks(entries: DailyPulseEntry[], mood: string, minLength: number = 2): Streak[] {
  if (entries.length === 0) return [];

  const streaks: Streak[] = [];
  let currentStreak: DailyPulseEntry[] = [];

  entries.forEach((entry) => {
    if (entry.mood === mood) {
      currentStreak.push(entry);
    } else {
      if (currentStreak.length >= minLength) {
        const firstEntry = currentStreak[currentStreak.length - 1];
        const lastEntry = currentStreak[0];
        streaks.push({
          type: "mood_pattern",
          value: mood,
          length: currentStreak.length,
          startDate: firstEntry.date,
          endDate: lastEntry.date,
        });
      }
      currentStreak = [];
    }
  });

  if (currentStreak.length >= minLength) {
    const firstEntry = currentStreak[currentStreak.length - 1];
    const lastEntry = currentStreak[0];
    streaks.push({
      type: "mood_pattern",
      value: mood,
      length: currentStreak.length,
      startDate: firstEntry.date,
      endDate: lastEntry.date,
    });
  }

  return streaks.sort((a, b) => b.length - a.length);
}
