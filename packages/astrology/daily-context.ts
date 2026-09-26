import * as Astronomy from 'astronomy-engine';
import { calcPersonalDay, calcUniversalDay, dateOnlyFromLocalDate } from '@soulcodex/core';
import { degreeToGateAndLine } from './human-design';

const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;

export interface DailyContext {
  date: string;
  personalDayNumber: number;
  universalDayNumber: number;
  moonSign: string;
  moonPhase: string;
  moonPhasePercentage: number;
  currentHDGate: number;
  currentHDLine: number;
  planetaryHour: string | null;
}

/**
 * Calculates Personal Day Number using the shared core module.
 * This ensures consistency across all surfaces (Today, Timeline, Codex, Profile).
 */
export function calculatePersonalDayNumber(birthDate: string, currentDate: Date | string = new Date()): number {
  return calcPersonalDay(birthDate, currentDate);
}

export function calculateUniversalDayNumber(currentDate: Date | string = new Date()): number {
  return calcUniversalDay(currentDate);
}

export function getMoonSign(date: Date): string {
  const moonPos = Astro.EclipticGeoMoon(date);
  const eclipticLongitude = moonPos.lon;
  
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(eclipticLongitude / 30);
  return signs[signIndex % 12];
}

export function getMoonPhase(date: Date): { phase: string; percentage: number } {
  const illumination = Astro.Illumination(Astro.Body.Moon, date);
  const phaseAngle = Astro.MoonPhase(date);
  const percentage = Math.round(illumination.phase_fraction * 100);
  
  let phase: string;
  if (phaseAngle < 22.5 || phaseAngle >= 337.5) {
    phase = 'New Moon';
  } else if (phaseAngle >= 22.5 && phaseAngle < 67.5) {
    phase = 'Waxing Crescent';
  } else if (phaseAngle >= 67.5 && phaseAngle < 112.5) {
    phase = 'First Quarter';
  } else if (phaseAngle >= 112.5 && phaseAngle < 157.5) {
    phase = 'Waxing Gibbous';
  } else if (phaseAngle >= 157.5 && phaseAngle < 202.5) {
    phase = 'Full Moon';
  } else if (phaseAngle >= 202.5 && phaseAngle < 247.5) {
    phase = 'Waning Gibbous';
  } else if (phaseAngle >= 247.5 && phaseAngle < 292.5) {
    phase = 'Last Quarter';
  } else {
    phase = 'Waning Crescent';
  }
  
  return { phase, percentage };
}

export function getCurrentHDGate(date: Date): { gate: number; line: number } {
  const sunPos = Astro.Ecliptic(Astro.GeoVector(Astro.Body.Sun, date, false));
  return degreeToGateAndLine(sunPos.elon);
}

export function getDailyContext(
  birthDate: string,
  currentDate: Date = new Date(),
  calendarDateISO?: string,
): DailyContext {
  if (!(currentDate instanceof Date) || Number.isNaN(currentDate.getTime())) {
    throw new RangeError('Daily Context requires a valid astronomical instant');
  }

  const date = calendarDateISO ?? dateOnlyFromLocalDate(currentDate);
  const moonPhaseData = getMoonPhase(currentDate);
  const hdGateData = getCurrentHDGate(currentDate);
  
  return {
    date,
    personalDayNumber: calculatePersonalDayNumber(birthDate, date),
    universalDayNumber: calculateUniversalDayNumber(date),
    moonSign: getMoonSign(currentDate),
    moonPhase: moonPhaseData.phase,
    moonPhasePercentage: moonPhaseData.percentage,
    currentHDGate: hdGateData.gate,
    currentHDLine: hdGateData.line,
    planetaryHour: null,
  };
}
