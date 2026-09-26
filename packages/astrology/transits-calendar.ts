/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - ADVANCED TRANSITS CALENDAR
 * Visual calendar with transit predictions and insights
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
  significantTransits: Transit[]; // High intensity transits
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
    highIntensityDays: number;
    dominantThemes: string[];
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

    if (activeTransits.overallIntensity >= 7) {
      highIntensityDays++;
    }

    if (activeTransits.overallIntensity >= 8) {
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
  const recommendations: string[] = [];

  // High intensity transits get specific recommendations
  const highIntensityTransits = transits.filter(t => t.intensity === 'high');
  
  for (const transit of highIntensityTransits) {
    if (transit.planet === 'Pluto') {
      recommendations.push('Focus on deep transformation and shadow work');
      recommendations.push('Release what no longer serves you');
    } else if (transit.planet === 'Saturn') {
      recommendations.push('Take responsibility and build structure');
      recommendations.push('Practice discipline and patience');
    } else if (transit.planet === 'Uranus') {
      recommendations.push('Embrace change and innovation');
      recommendations.push('Release control and allow breakthroughs');
    } else if (transit.planet === 'Neptune') {
      recommendations.push('Connect with spirituality and intuition');
      recommendations.push('Practice surrender and compassion');
    } else if (transit.planet === 'Jupiter') {
      recommendations.push('Expand your horizons and take opportunities');
      recommendations.push('Practice gratitude and optimism');
    }
  }

  // Add general recommendations based on theme
  if (dominantTheme.includes('Transformation')) {
    recommendations.push('This is a powerful time for deep inner work');
  } else if (dominantTheme.includes('Structure')) {
    recommendations.push('Focus on building solid foundations');
  } else if (dominantTheme.includes('Expansion')) {
    recommendations.push('Say yes to new opportunities');
  }

  // Remove duplicates and limit to 5
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
