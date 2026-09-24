import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { parseDateOnly } from "./date-only.js";

export type ZonedBirthTimeFailureReason =
  | "invalid_date"
  | "invalid_time"
  | "invalid_timezone"
  | "nonexistent_local_time"
  | "ambiguous_local_time"
  | "timezone_resolution_failed";

export type ZonedBirthTimeResolution =
  | {
      status: "resolved";
      date: Date;
      iso: string;
      timezone: string;
      localTimestamp: string;
    }
  | {
      status: "unresolved";
      reason: ZonedBirthTimeFailureReason;
    };

export function isValidIanaTimezoneName(value: string): boolean {
  if (!value.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value.trim() }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function isValidClockTime24(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

/**
 * Converts a civil birth record into one and only one UTC instant.
 *
 * Nonexistent DST wall times fail closed. Repeated DST wall times also fail
 * closed because date + HH:MM + zone alone cannot identify which occurrence
 * the birth record intended.
 */
export function resolveUniqueZonedBirthTime(input: {
  birthDate: string;
  birthTime: string;
  timezone: string;
}): ZonedBirthTimeResolution {
  try {
    parseDateOnly(input.birthDate);
  } catch {
    return { status: "unresolved", reason: "invalid_date" };
  }

  const birthTime = input.birthTime.trim();
  if (!isValidClockTime24(birthTime)) {
    return { status: "unresolved", reason: "invalid_time" };
  }

  const timezone = input.timezone.trim();
  if (!isValidIanaTimezoneName(timezone)) {
    return { status: "unresolved", reason: "invalid_timezone" };
  }

  const localTimestamp = `${input.birthDate}T${birthTime}:00`;

  try {
    const candidate = fromZonedTime(localTimestamp, timezone);
    if (Number.isNaN(candidate.getTime())) {
      return { status: "unresolved", reason: "timezone_resolution_failed" };
    }

    const format = "yyyy-MM-dd'T'HH:mm:ss";
    if (formatInTimeZone(candidate, timezone, format) !== localTimestamp) {
      return { status: "unresolved", reason: "nonexistent_local_time" };
    }

    // Covers common and historical 30/60/90/120-minute civil-time overlaps.
    for (const minutes of [-120, -90, -60, -30, 30, 60, 90, 120]) {
      const alternate = new Date(candidate.getTime() + minutes * 60_000);
      if (formatInTimeZone(alternate, timezone, format) === localTimestamp) {
        return { status: "unresolved", reason: "ambiguous_local_time" };
      }
    }

    return {
      status: "resolved",
      date: candidate,
      iso: candidate.toISOString(),
      timezone,
      localTimestamp,
    };
  } catch {
    return { status: "unresolved", reason: "timezone_resolution_failed" };
  }
}
