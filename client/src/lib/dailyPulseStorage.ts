const STORAGE_KEY = "soulcodex.dailyPulse.v1";

export type MoodType = "low" | "steady" | "charged" | "heavy" | "clear";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type AlignmentLevel = 1 | 2 | 3 | 4 | 5;

export interface DailyPulseEntry {
  version: 1;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  energy: EnergyLevel;
  alignment: AlignmentLevel;
  theme?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPulseSummary {
  avgEnergy: number;
  avgAlignment: number;
  mostCommonMood?: MoodType;
  entriesCount: number;
  dateRange: { start: string; end: string } | null;
}

function getAllEntries(): DailyPulseEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e: any) => e.version === 1 && e.date && e.mood && e.energy && e.alignment);
  } catch {
    return [];
  }
}

function saveAllEntries(entries: DailyPulseEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn("[dailyPulseStorage] Failed to save entries:", e);
  }
}

export function loadDailyPulseEntries(): DailyPulseEntry[] {
  return getAllEntries();
}

export function getDailyPulseForDate(date: string): DailyPulseEntry | null {
  const entries = getAllEntries();
  return entries.find((e) => e.date === date) || null;
}

export function saveDailyPulseEntry(entry: Omit<DailyPulseEntry, "version" | "createdAt" | "updatedAt">): DailyPulseEntry {
  const now = new Date().toISOString();
  const entries = getAllEntries();
  const existing = entries.findIndex((e) => e.date === entry.date);

  const fullEntry: DailyPulseEntry = {
    version: 1,
    ...entry,
    createdAt: existing >= 0 ? entries[existing].createdAt : now,
    updatedAt: now,
  };

  if (existing >= 0) {
    entries[existing] = fullEntry;
  } else {
    entries.push(fullEntry);
  }

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  saveAllEntries(entries);

  return fullEntry;
}

export function clearDailyPulseEntries(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[dailyPulseStorage] Failed to clear entries:", e);
  }
}

export function getRecentDailyPulseEntries(limit: number = 7): DailyPulseEntry[] {
  const entries = getAllEntries();
  return entries.slice(0, limit);
}

export function getDailyPulseSummary(days: number = 7): DailyPulseSummary {
  const entries = getRecentDailyPulseEntries(days);

  if (entries.length === 0) {
    return {
      avgEnergy: 0,
      avgAlignment: 0,
      mostCommonMood: undefined,
      entriesCount: 0,
      dateRange: null,
    };
  }

  const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
  const avgAlignment = entries.reduce((sum, e) => sum + e.alignment, 0) / entries.length;

  // Find most common mood
  const moodCounts: Record<MoodType, number> = { low: 0, steady: 0, charged: 0, heavy: 0, clear: 0 };
  entries.forEach((e) => {
    moodCounts[e.mood]++;
  });
  const mostCommonMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || undefined) as MoodType | undefined;

  return {
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgAlignment: Math.round(avgAlignment * 10) / 10,
    mostCommonMood,
    entriesCount: entries.length,
    dateRange: entries.length > 0 ? { start: entries[entries.length - 1].date, end: entries[0].date } : null,
  };
}
