import { formatInTimeZone, fromZonedTime, getTimezoneOffset } from 'date-fns-tz';

export type CivilTimeStatus = 'valid' | 'nonexistent' | 'ambiguous' | 'invalid';

export interface CivilTimeResolution {
  status: CivilTimeStatus;
  utc: Date | null;
  localTimestamp: string;
  timezone: string;
  candidates: string[];
  candidateUtcOffsetsMinutes: number[];
  conversionMethod: 'standard-iana-tzdb';
  runtimeTzdbVersion: string | null;
  reason: string | null;
}

const LOCAL_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";

function runtimeTzdbVersion(): string | null {
  const version = (globalThis as any)?.process?.versions?.tz;
  return typeof version === 'string' && version.trim() ? version : null;
}

function metadata(timezone: string) {
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

  const check = new Date(Date.UTC(y, m - 1, d, h, min, sec));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function sameWallClock(utc: Date, timezone: string, localTimestamp: string): boolean {
  return formatInTimeZone(utc, timezone, LOCAL_PATTERN) === localTimestamp;
}

function offsetMinutes(timezone: string, instant: Date): number {
  return getTimezoneOffset(timezone, instant) / 60_000;
}

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
      ...metadata(timezone),
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
      ...metadata(timezone),
      candidates: [],
      candidateUtcOffsetsMinutes: [],
      reason: 'timezone_resolution_failed',
    };
  }

  try {
    if (!sameWallClock(primary, timezone, localTimestamp)) {
      return {
        status: 'nonexistent',
        utc: null,
        localTimestamp,
        ...metadata(timezone),
        candidates: [primary.toISOString()],
        candidateUtcOffsetsMinutes: [offsetMinutes(timezone, primary)],
        reason: 'local_time_does_not_exist_in_timezone',
      };
    }

    const probeHours = [-36, -12, 0, 12, 36];
    const observedOffsets = new Set<number>();
    for (const hours of probeHours) {
      observedOffsets.add(
        getTimezoneOffset(
          timezone,
          new Date(primary.getTime() + hours * 60 * 60 * 1000),
        ),
      );
    }

    const primaryOffset = getTimezoneOffset(timezone, primary);
    const matches = new Map<number, Date>();
    matches.set(primary.getTime(), primary);

    for (const observedOffset of observedOffsets) {
      const delta = primaryOffset - observedOffset;
      if (delta === 0) continue;
      const alternate = new Date(primary.getTime() + delta);
      if (sameWallClock(alternate, timezone, localTimestamp)) {
        matches.set(alternate.getTime(), alternate);
      }
    }

    const candidateDates = [...matches.values()]
      .sort((left, right) => left.getTime() - right.getTime());
    const candidates = candidateDates.map((value) => value.toISOString());
    const candidateUtcOffsetsMinutes = candidateDates.map((value) =>
      offsetMinutes(timezone, value),
    );

    if (candidateDates.length > 1) {
      return {
        status: 'ambiguous',
        utc: null,
        localTimestamp,
        ...metadata(timezone),
        candidates,
        candidateUtcOffsetsMinutes,
        reason: 'local_time_occurs_more_than_once_in_timezone',
      };
    }

    return {
      status: 'valid',
      utc: primary,
      localTimestamp,
      ...metadata(timezone),
      candidates,
      candidateUtcOffsetsMinutes,
      reason: null,
    };
  } catch {
    return {
      status: 'invalid',
      utc: null,
      localTimestamp,
      ...metadata(timezone),
      candidates: [],
      candidateUtcOffsetsMinutes: [],
      reason: 'timezone_resolution_failed',
    };
  }
}
