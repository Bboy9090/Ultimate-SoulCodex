import { formatInTimeZone, fromZonedTime, getTimezoneOffset } from 'date-fns-tz';

export type CivilTimeStatus = 'valid' | 'nonexistent' | 'ambiguous' | 'invalid';
export type CivilTimeProvenanceStatus = 'modern_tzdb' | 'historical_tzdb_unverified';

export type CivilTimeResolution = {
  status: CivilTimeStatus;
  utc: Date | null;
  localTimestamp: string;
  timezone: string;
  candidates: string[];
  candidateUtcOffsetsMinutes: number[];
  conversionMethod: 'standard-iana-tzdb';
  runtimeTzdbVersion: string | null;
  provenanceStatus: CivilTimeProvenanceStatus;
  historicalTimeRequiresIndependentSource: boolean;
  reason: string | null;
};

const LOCAL_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";

function runtimeTzdbVersion(): string | null {
  const version = (globalThis as any)?.process?.versions?.tz;
  return typeof version === 'string' && version.trim() ? version : null;
}

function candidateOffsetsMinutes(timezone: string, candidates: Date[]): number[] {
  return candidates.map((candidate) => getTimezoneOffset(timezone, candidate) / 60_000);
}

function civilTimeProvenanceStatus(birthDate: string): CivilTimeProvenanceStatus {
  const year = Number.parseInt(birthDate.slice(0, 4), 10);
  return Number.isInteger(year) && year < 1970
    ? 'historical_tzdb_unverified'
    : 'modern_tzdb';
}

function baseResolutionMetadata(timezone: string, birthDate: string) {
  const provenanceStatus = civilTimeProvenanceStatus(birthDate);
  return {
    timezone,
    conversionMethod: 'standard-iana-tzdb' as const,
    runtimeTzdbVersion: runtimeTzdbVersion(),
    provenanceStatus,
    historicalTimeRequiresIndependentSource: provenanceStatus === 'historical_tzdb_unverified',
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
      ...baseResolutionMetadata(timezone, birthDate),
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
      ...baseResolutionMetadata(timezone, birthDate),
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
      ...baseResolutionMetadata(timezone, birthDate),
      candidates: [primary.toISOString()],
      candidateUtcOffsetsMinutes: candidateOffsetsMinutes(timezone, [primary]),
      reason: 'local_time_does_not_exist_in_timezone',
    };
  }

  // Detect a repeated wall-clock time by using the transition's actual offset
  // delta rather than assuming DST always changes by exactly one hour.
  const beforeOffset = getTimezoneOffset(timezone, new Date(primary.getTime() - 12 * 60 * 60 * 1000));
  const afterOffset = getTimezoneOffset(timezone, new Date(primary.getTime() + 12 * 60 * 60 * 1000));
  const transitionDelta = Math.abs(afterOffset - beforeOffset);

  const matches = new Map<number, Date>();
  matches.set(primary.getTime(), primary);

  if (transitionDelta > 0) {
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
      ...baseResolutionMetadata(timezone, birthDate),
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
    ...baseResolutionMetadata(timezone, birthDate),
    candidates,
    candidateUtcOffsetsMinutes: candidateOffsetsMinutes(timezone, [primary]),
    reason: null,
  };
}
