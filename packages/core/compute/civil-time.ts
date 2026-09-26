import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export type CivilTimeStatus = 'valid' | 'nonexistent' | 'ambiguous' | 'invalid';

export type CivilTimeResolution = {
  status: CivilTimeStatus;
  utc: Date | null;
  localTimestamp: string;
  timezone: string;
  candidates: string[];
  candidateUtcOffsetsMinutes: number[];
  conversionMethod: 'standard-iana-tzdb';
  runtimeTzdbVersion: string | null;
  reason: string | null;
};

const LOCAL_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";

function runtimeTzdbVersion(): string | null {
  const version = (globalThis as any)?.process?.versions?.tz;
  return typeof version === 'string' && version.trim() ? version : null;
}

function timezoneOffsetMillisecondsAtInstant(timezone: string, instant: Date): number {
  const local = formatInTimeZone(instant, timezone, LOCAL_PATTERN);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/.exec(local);
  if (!match) {
    throw new Error('timezone_offset_format_failed');
  }

  const [, year, month, day, hour, minute, second] = match;
  const localAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return localAsUtc - instant.getTime();
}

function candidateOffsetsMinutes(timezone: string, candidates: Date[]): number[] {
  return candidates.map(
    (candidate) => timezoneOffsetMillisecondsAtInstant(timezone, candidate) / 60_000,
  );
}

function baseResolutionMetadata(timezone: string) {
  return {
    timezone,
    conversionMethod: 'standard-iana-tzdb' as const,
    runtimeTzdbVersion: runtimeTzdbVersion(),
  };
}

function normalizeLocalTimestamp(date: string, time: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim());
  if (!dateMatch || !timeMatch) return null;

  const [, year, month, day] = dateMatch;
  const [, hour, minute, second = '00'] = timeMatch;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const h = Number(hour);
  const min = Number(minute);
  const sec = Number(second);
  if (
    m < 1 || m > 12 ||
    d < 1 || d > 31 ||
    h < 0 || h > 23 ||
    min < 0 || min > 59 ||
    sec < 0 || sec > 59
  ) {
    return null;
  }

  const calendarCheck = new Date(Date.UTC(y, m - 1, d, h, min, sec));
  if (
    calendarCheck.getUTCFullYear() !== y ||
    calendarCheck.getUTCMonth() !== m - 1 ||
    calendarCheck.getUTCDate() !== d
  ) {
    return null;
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function sameWallClock(utc: Date, timezone: string, localTimestamp: string): boolean {
  return formatInTimeZone(utc, timezone, LOCAL_PATTERN) === localTimestamp;
}

/**
 * Resolve a local civil birth time without silently normalizing DST gaps or
 * repeated-hour ambiguity.
 *
 * date-fns-tz intentionally chooses a deterministic instant for ambiguous
 * local times. That behavior is useful for software, but insufficient for a
 * birth-time-sensitive chart unless the local wall clock maps to exactly one
 * UTC instant.
 */
export function resolveCivilTimeStrict(
  birthDate: string,
  birthTime: string,
  timezone: string,
): CivilTimeResolution {
  const localTimestamp = normalizeLocalTimestamp(birthDate, birthTime);
  if (!localTimestamp || !timezone.trim()) {
    return {
      status: 'invalid',
      utc: null,
      localTimestamp: localTimestamp ?? `${birthDate}T${birthTime}`,
      ...baseResolutionMetadata(timezone),
      candidates: [],
      candidateUtcOffsetsMinutes: [],
      reason: 'invalid_local_date_time_or_timezone',
    };
  }

  let primary: Date;
  try {
    primary = fromZonedTime(localTimestamp, timezone);
    if (Number.isNaN(primary.getTime())) throw new Error('invalid_date');
  } catch {
    return {
      status: 'invalid',
      utc: null,
      localTimestamp,
      ...baseResolutionMetadata(timezone),
      candidates: [],
      candidateUtcOffsetsMinutes: [],
      reason: 'timezone_resolution_failed',
    };
  }

  // A DST spring-forward gap round-trips to a different wall clock.
  if (!sameWallClock(primary, timezone, localTimestamp)) {
    return {
      status: 'nonexistent',
      utc: null,
      localTimestamp,
      ...baseResolutionMetadata(timezone),
      candidates: [primary.toISOString()],
      candidateUtcOffsetsMinutes: candidateOffsetsMinutes(timezone, [primary]),
      reason: 'local_time_does_not_exist_in_timezone',
    };
  }

  // Detect repeated wall-clock times without assuming a modern one-hour DST
  // transition. Historical tzdb contains 30-minute, multi-hour, and date-line
  // changes. Sample a bounded neighborhood, derive every observed offset
  // difference, and accept an alternate only when it round-trips to the exact
  // same local wall clock.
  const HOUR_MS = 60 * 60 * 1000;
  const neighborhoodHours = [-72, -36, -24, -12, -6, 0, 6, 12, 24, 36, 72];
  const observedOffsets = [
    ...new Set(
      neighborhoodHours.map((hours) =>
        timezoneOffsetMillisecondsAtInstant(
          timezone,
          new Date(primary.getTime() + hours * HOUR_MS),
        ),
      ),
    ),
  ];
  const transitionDeltas = new Set<number>();
  for (let left = 0; left < observedOffsets.length; left += 1) {
    for (let right = left + 1; right < observedOffsets.length; right += 1) {
      const delta = Math.abs(observedOffsets[left] - observedOffsets[right]);
      if (delta > 0) transitionDeltas.add(delta);
    }
  }

  const matches = new Map<number, Date>();
  matches.set(primary.getTime(), primary);

  for (const transitionDelta of transitionDeltas) {
    for (const direction of [-1, 1] as const) {
      const alternate = new Date(primary.getTime() + direction * transitionDelta);
      if (sameWallClock(alternate, timezone, localTimestamp)) {
        matches.set(alternate.getTime(), alternate);
      }
    }
  }

  const candidates = [...matches.values()]
    .sort((left, right) => left.getTime() - right.getTime())
    .map((value) => value.toISOString());

  if (candidates.length > 1) {
    return {
      status: 'ambiguous',
      utc: null,
      localTimestamp,
      ...baseResolutionMetadata(timezone),
      candidates,
      candidateUtcOffsetsMinutes: candidateOffsetsMinutes(
        timezone,
        [...matches.values()].sort((left, right) => left.getTime() - right.getTime()),
      ),
      reason: 'local_time_occurs_more_than_once_in_timezone',
    };
  }

  return {
    status: 'valid',
    utc: primary,
    localTimestamp,
    ...baseResolutionMetadata(timezone),
    candidates,
    candidateUtcOffsetsMinutes: candidateOffsetsMinutes(timezone, [primary]),
    reason: null,
  };
}
