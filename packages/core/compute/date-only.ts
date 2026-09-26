export type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function parseDateOnly(dateISO: string): DateOnlyParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!match) throw new RangeError("Date must use YYYY-MM-DD");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new RangeError("Date must be a real calendar date");
  }

  return { year, month, day };
}


/**
 * Convert a storage-layer civil-date value back to YYYY-MM-DD without silently
 * reinterpreting timezone-bearing timestamps.
 *
 * Soul Codex currently persists profile birth dates in a timestamp column.
 * The canonical storage invariant is UTC midnight for the original civil date.
 * Non-midnight timestamps are rejected because the original civil date cannot
 * be recovered safely from them without additional provenance.
 */
export function dateOnlyFromStoredValue(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();

    try {
      parseDateOnly(trimmed);
      return trimmed;
    } catch {
      const canonicalTimestamp =
        /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.000)?Z$/.exec(trimmed);
      if (canonicalTimestamp) {
        parseDateOnly(canonicalTimestamp[1]);
        return canonicalTimestamp[1];
      }
      throw new RangeError(
        "Stored civil date must be YYYY-MM-DD or canonical UTC-midnight timestamp",
      );
    }
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new RangeError("Stored civil date must be valid");
    }

    if (
      value.getUTCHours() !== 0 ||
      value.getUTCMinutes() !== 0 ||
      value.getUTCSeconds() !== 0 ||
      value.getUTCMilliseconds() !== 0
    ) {
      throw new RangeError(
        "Stored civil date timestamp is non-canonical; original civil date is ambiguous",
      );
    }

    const dateISO = value.toISOString().slice(0, 10);
    parseDateOnly(dateISO);
    return dateISO;
  }

  throw new RangeError("Stored civil date has unsupported type");
}
