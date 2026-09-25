import * as Astronomy from 'astronomy-engine';
import { calcPersonalDay, dateOnlyFromLocalDate } from '@soulcodex/core';
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
  planetaryHour: string;
}

function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

/**
 * Calculates Personal Day Number using the shared core module.
 * This ensures consistency across all surfaces (Today, Timeline, Codex, Profile).
 */
export function calculatePersonalDayNumber(birthDate: string, currentDate: Date = new Date()): number {
  return calcPersonalDay(birthDate, currentDate);
}

export function calculateUniversalDayNumber(currentDate: Date = new Date()): number {
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(year);
  
  const sum = reducedDay + reducedMonth + reducedYear;
  return reduceToSingleDigit(sum);
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
  const phaseAngle = illumination.phase_angle;
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

function getPlanetaryHour(date: Date): string {
  const planets = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  
  const planetaryDayRulers = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
  ];
  
  const dayRuler = planetaryDayRulers[dayOfWeek];
  const dayRulerIndex = planets.indexOf(dayRuler);
  
  const hourIndex = (dayRulerIndex + hour) % 7;
  return planets[hourIndex];
}

export function getDailyContext(birthDate: string, currentDate: Date = new Date()): DailyContext {
  const moonPhaseData = getMoonPhase(currentDate);
  const hdGateData = getCurrentHDGate(currentDate);
  
  return {
    date: dateOnlyFromLocalDate(currentDate),
    personalDayNumber: calculatePersonalDayNumber(birthDate, currentDate),
    universalDayNumber: calculateUniversalDayNumber(currentDate),
    moonSign: getMoonSign(currentDate),
    moonPhase: moonPhaseData.phase,
    moonPhasePercentage: moonPhaseData.percentage,
    currentHDGate: hdGateData.gate,
    currentHDLine: hdGateData.line,
    planetaryHour: getPlanetaryHour(currentDate),
  };
}
