type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const storageKeys = {
  profile: "soulProfile",
  confidence: "soulConfidence",
  onboardingData: "onboardingData",
  codexReading: "soulCodexReading",
  fullChart: "soulFullChart",
  userInputs: "soulUserInputs",
  todayCard: "soulTodayCard",
  timeline: "soulTimeline",
  streakDate: "soulStreakDate",
  streakCount: "soulStreakCount",
  myProfileId: "soulMyProfileId",
  persons: "soulPersons",
  justOnboarded: "soulJustOnboarded",
} as const;

export function getJson<T>(key: string): T | null {
  try {
    return safeJsonParse<T>(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function setJson(key: string, value: Json): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

