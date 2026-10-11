export type TimelineTodayCard = {
  profileId: string;
  date: string;
  moonPhase?: string;
  personalDayNumber?: number;
};

export function localTimelineDate(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Legacy unscoped cards cannot establish whose daily signal is being displayed. */
export function readTimelineTodayCard(
  saved: string | null,
  profileId: string | null | undefined,
  now: Date,
): TimelineTodayCard | null {
  if (!saved || !profileId || !Number.isFinite(now.getTime())) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const card = parsed as Record<string, unknown>;
    const date = localTimelineDate(now);
    if (card.profileId !== profileId || card.date !== date) return null;
    const moonPhase = typeof card.moonPhase === "string" && card.moonPhase.trim().length > 0
      && card.moonPhase.length <= 80 ? card.moonPhase.trim() : undefined;
    const personalDayNumber = typeof card.personalDayNumber === "number"
      && Number.isInteger(card.personalDayNumber) && card.personalDayNumber >= 1
      && card.personalDayNumber <= 9 ? card.personalDayNumber : undefined;
    if (!moonPhase && !personalDayNumber) return null;
    return { profileId, date, ...(moonPhase ? { moonPhase } : {}),
      ...(personalDayNumber ? { personalDayNumber } : {}) };
  } catch {
    return null;
  }
}
