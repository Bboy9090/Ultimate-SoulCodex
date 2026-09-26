/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - TRANSITS REFLECTION CALENDAR
 * Visual calendar of measured transit geometry with symbolic reflection prompts
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { calculateActiveTransits, extractNatalPositions, type Transit } from './transits';
import type { Profile } from '../shared/schema';
import { getMoonPhase as getCanonicalMoonPhase, getMoonSign as getCanonicalMoonSign } from './daily-context';
import { parseDateOnly, resolveCivilTimeStrict } from '@soulcodex/core';
import { formatInTimeZone } from 'date-fns-tz';

export interface CalendarDay {
  date: Date;
  transits: Transit[];
  dominantTheme: string;
  overallIntensity: number;
  significantTransits: Transit[]; // Legacy high-priority model bucket; not measured intensity
  recommendations: string[];
  moonPhase?: string;
  moonSign?: string;
}

export interface TransitsCalendar {
  startDate: Date;
  endDate: Date;
  days: CalendarDay[];
  summary: {
    totalTransits: number;
    /** @deprecated Legacy model-priority count; not measured event intensity. */
    highIntensityDays: number;
    dominantThemes: string[];
    /** @deprecated Legacy model-score threshold dates; not predicted peak events. */
    peakDates: Date[];
  };
}

const MAX_TRANSIT_CALENDAR_DAYS = 366;

function validTimezone(value: unknown): string {
  const timezone =
    typeof value === 'string' && value.trim()
      ? value.trim()
      : 'UTC';

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date(0));
  } catch {
    throw new RangeError(`Invalid transit calendar timezone: ${timezone}`);
  }

  return timezone;
}

function dateOnlyOrdinal(dateISO: string): number {
  const { year, month, day } = parseDateOnly(dateISO);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function dateOnlyFromOrdinal(ordinal: number): string {
  return new Date(ordinal * 86_400_000).toISOString().slice(0, 10);
}

function calendarDateKey(
  value: Date | string,
  timezone: string,
): string {
  if (typeof value === 'string') {
    parseDateOnly(value);
    return value;
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new RangeError('Transit calendar date must be valid');
  }

  return formatInTimeZone(value, timezone, 'yyyy-MM-dd');
}

function localNoonInstant(dateISO: string, timezone: string): Date {
  const resolution = resolveCivilTimeStrict(dateISO, '12:00', timezone);
  if (resolution.status !== 'valid' || !resolution.utc) {
    throw new RangeError(
      `Transit calendar local noon is ${resolution.status}: ${resolution.reason ?? 'unresolved'}`,
    );
  }
  return resolution.utc;
}

/**
 * Generate a transits calendar for a date range
 */
export function generateTransitsCalendar(
  profile: Profile,
  startDate: Date | string,
  endDate: Date | string
): TransitsCalendar {
  const days: CalendarDay[] = [];
  const allThemes: string[] = [];
  const peakDates: Date[] = [];
  let totalTransits = 0;
  let highIntensityDays = 0;

  const timezone = validTimezone((profile as any).timezone);
  const startDateISO = calendarDateKey(startDate, timezone);
  const endDateISO = calendarDateKey(endDate, timezone);
  const startOrdinal = dateOnlyOrdinal(startDateISO);
  const endOrdinal = dateOnlyOrdinal(endDateISO);
  const spanDays = endOrdinal - startOrdinal + 1;

  if (spanDays < 1) {
    throw new RangeError('Transit calendar end date must be on or after start date');
  }
  if (spanDays > MAX_TRANSIT_CALENDAR_DAYS) {
    throw new RangeError(`Transit calendar range exceeds ${MAX_TRANSIT_CALENDAR_DAYS} days`);
  }

  // Extract only governed natal positions.
  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);

  for (let ordinal = startOrdinal; ordinal <= endOrdinal; ordinal += 1) {
    const dateISO = dateOnlyFromOrdinal(ordinal);
    const currentDate = localNoonInstant(dateISO, timezone);
    const activeTransits = calculateActiveTransits(natalPlanets, currentDate);
    
    const significantTransits = activeTransits.transits.filter(t => t.intensity === 'high');
    const recommendations = generateRecommendations(activeTransits.transits, activeTransits.dominantTheme);

    // Preserve legacy summary fields using explicit model-priority semantics.
    // These are not physical or predictive intensity thresholds.
    if (significantTransits.length > 0) {
      highIntensityDays++;
    }

    if (significantTransits.length >= 2) {
      peakDates.push(currentDate);
    }

    allThemes.push(activeTransits.dominantTheme);
    totalTransits += activeTransits.transits.length;

    days.push({
      date: currentDate,
      transits: activeTransits.transits,
      dominantTheme: activeTransits.dominantTheme,
      overallIntensity: activeTransits.overallIntensity,
      significantTransits,
      recommendations,
      moonPhase: getCanonicalMoonPhase(currentDate).phase,
      moonSign: getCanonicalMoonSign(currentDate)
    });
  }

  // Calculate summary
  const themeCounts: Record<string, number> = {};
  allThemes.forEach(theme => {
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  });

  const dominantThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  return {
    startDate: localNoonInstant(startDateISO, timezone),
    endDate: localNoonInstant(endDateISO, timezone),
    days,
    summary: {
      totalTransits,
      highIntensityDays,
      dominantThemes,
      peakDates
    }
  };
}


/**
 * Generate recommendations based on transits
 */
function generateRecommendations(transits: Transit[], dominantTheme: string): string[] {
  void dominantTheme;
  const recommendations: string[] = [];

  // These are reflection experiments keyed to symbolic transit themes. They do
  // not assert that an event, feeling, opportunity, or psychological state is active.
  const modelPriorityTransits = transits.filter(t => t.intensity === 'high');

  for (const transit of modelPriorityTransits) {
    if (transit.planet === 'Pluto') {
      recommendations.push('Reflection experiment: identify one change already supported by observable facts');
      recommendations.push('Check whether anything actually needs release before acting on transformation symbolism');
    } else if (transit.planet === 'Saturn') {
      recommendations.push('Reflection experiment: review one real constraint, responsibility, or structure');
      recommendations.push('Test whether a small increase in structure improves the situation');
    } else if (transit.planet === 'Uranus') {
      recommendations.push('Reflection experiment: test one low-cost change instead of assuming disruption is required');
      recommendations.push('Separate real constraints from a symbolic desire for novelty');
    } else if (transit.planet === 'Neptune') {
      recommendations.push('Reflection experiment: separate imagination and intuition from facts you can verify');
      recommendations.push('Write down assumptions before treating uncertainty as meaningful');
    } else if (transit.planet === 'Jupiter') {
      recommendations.push('Reflection experiment: evaluate one real opportunity for upside, cost, and overextension');
      recommendations.push('Do not expand a commitment solely because the transit symbolism emphasizes growth');
    }
  }

  if (recommendations.length === 0 && transits.length > 0) {
    recommendations.push('Use the measured aspect as a reflection prompt and verify any personal meaning against real circumstances');
  }

  return [...new Set(recommendations)].slice(0, 5);
}

/**
 * Get upcoming significant transits (next 30 days)
 */
export function getUpcomingSignificantTransits(
  profile: Profile,
  days: number = 30
): Transit[] {
  if (!Number.isInteger(days) || days < 1 || days > MAX_TRANSIT_CALENDAR_DAYS) {
    throw new RangeError(`Transit upcoming days must be 1-${MAX_TRANSIT_CALENDAR_DAYS}`);
  }

  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);
  const timezone = validTimezone((profile as any).timezone);
  const todayISO = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
  const startOrdinal = dateOnlyOrdinal(todayISO);

  const allTransits: Transit[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const dateISO = dateOnlyFromOrdinal(startOrdinal + offset);
    const checkDate = localNoonInstant(dateISO, timezone);
    const activeTransits = calculateActiveTransits(natalPlanets, checkDate);
    const significant = activeTransits.transits.filter(t => t.intensity === 'high');
    allTransits.push(...significant);
  }

  const uniqueTransits = Array.from(
    new Map(allTransits.map(t => [`${t.planet}-${t.natalPlanet}-${t.aspect}`, t])).values()
  );

  return uniqueTransits.slice(0, 10);
}

export default {
  generateTransitsCalendar,
  getUpcomingSignificantTransits
};
