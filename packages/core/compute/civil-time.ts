import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export type CivilTimeFailureReason =
  | 'invalid_local_datetime'
  | 'invalid_timezone'
  | 'nonexistent_local_time'
  | 'ambiguous_local_time';

export type CivilTimeResolution =
  | {
      status: 'resolved';
      instant: Date;
      localTimestamp: string;
      timezone: string;
      utcOffset: string;
    }
  | {
      status: 'unresolved';
      reason: CivilTimeFailureReason;
      localTimestamp: string;
      timezone: string;
      candidateInstants?: string[];
    };

const LOCAL_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
const OFFSET_PATTERN = 'XXX';

function validCalendarParts(dateISO: string, timeHHMM: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeHHMM);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day ||
    probe.getUTCHours() !== hour ||
    probe.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function parseOffsetMinutes(offset: string): number | null {
  if (offset === 'Z') return 0;
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) return null;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '-' ? -minutes : minutes;
}

/**
 * Resolve an exact local civil time to UTC without silently accepting DST gaps
 * or repeated-hour ambiguity.
 *
 * A birth time is only considered exact when the supplied wall-clock value maps
 * to one and only one UTC instant in the supplied IANA timezone.
 */
export function resolveExactCivilTime(
  dateISO: string,
  timeHHMM: string,
  timezone: string,
): CivilTimeResolution {
  const parts = validCalendarParts(dateISO, timeHHMM);
  const localTimestamp = `${dateISO}T${timeHHMM}:00`;

  if (!parts) {
    return {
      status: 'unresolved',
      reason: 'invalid_local_datetime',
      localTimestamp,
      timezone,
    };
  }

  let candidate: Date;
  try {
    candidate = fromZonedTime(localTimestamp, timezone);
    if (Number.isNaN(candidate.getTime())) throw new Error('invalid zoned time');

    const roundTrip = formatInTimeZone(candidate, timezone, LOCAL_PATTERN);
    if (roundTrip !== localTimestamp) {
      return {
        status: 'unresolved',
        reason: 'nonexistent_local_time',
        localTimestamp,
        timezone,
      };
    }
  } catch {
    return {
      status: 'unresolved',
      reason: 'invalid_timezone',
      localTimestamp,
      timezone,
    };
  }

  try {
    const offsets = new Set<string>();
    for (const hours of [-36, -12, 0, 12, 36]) {
      offsets.add(
        formatInTimeZone(
          new Date(candidate.getTime() + hours * 60 * 60 * 1000),
          timezone,
          OFFSET_PATTERN,
        ),
      );
    }

    const localAsUtcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0,
    );

    const candidates = new Set<number>();
    for (const offset of offsets) {
      const offsetMinutes = parseOffsetMinutes(offset);
      if (offsetMinutes === null) continue;
      const instantMs = localAsUtcMs - offsetMinutes * 60_000;
      const instant = new Date(instantMs);
      if (formatInTimeZone(instant, timezone, LOCAL_PATTERN) === localTimestamp) {
        candidates.add(instantMs);
      }
    }

    if (candidates.size > 1) {
      return {
        status: 'unresolved',
        reason: 'ambiguous_local_time',
        localTimestamp,
        timezone,
        candidateInstants: [...candidates]
          .sort((a, b) => a - b)
          .map((value) => new Date(value).toISOString()),
      };
    }

    const utcOffset = formatInTimeZone(candidate, timezone, OFFSET_PATTERN);
    return {
      status: 'resolved',
      instant: candidate,
      localTimestamp,
      timezone,
      utcOffset,
    };
  } catch {
    return {
      status: 'unresolved',
      reason: 'invalid_timezone',
      localTimestamp,
      timezone,
    };
  }
}
