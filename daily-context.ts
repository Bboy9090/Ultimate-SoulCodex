import * as Astronomy from 'astronomy-engine';

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

export function calculatePersonalDayNumber(birthDate: string, currentDate: Date = new Date()): number {
  const birth = new Date(birthDate);
  const day = birth.getDate();
  const month = birth.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const reducedBirthDay = reduceToSingleDigit(day);
  const reducedBirthMonth = reduceToSingleDigit(month);
  const reducedCurrentDay = reduceToSingleDigit(currentDay);
  const reducedCurrentMonth = reduceToSingleDigit(currentMonth);
  const reducedCurrentYear = reduceToSingleDigit(currentYear);
  
  const sum = reducedBirthDay + reducedBirthMonth + reducedCurrentDay + reducedCurrentMonth + reducedCurrentYear;
  return reduceToSingleDigit(sum);
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
  const moonPos = Astronomy.EclipticGeoMoon(date);
  const eclipticLongitude = moonPos.lon;
  
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(eclipticLongitude / 30);
  return signs[signIndex % 12];
}

export function getMoonPhase(date: Date): { phase: string; percentage: number } {
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date);
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
  const sunPos = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, date, false));
  const eclipticLongitude = sunPos.elon;
  
  const normalizedLon = ((eclipticLongitude % 360) + 360) % 360;
  
  const gateOrder = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35,
    45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
  ];
  
  const degreesPerGate = 360 / 64;
  const startLon = 58;
  const adjustedLon = (normalizedLon - startLon + 360) % 360;
  
  const gateIndex = Math.floor(adjustedLon / degreesPerGate) % 64;
  const gate = gateOrder[gateIndex];
  
  const positionInGate = (adjustedLon % degreesPerGate) / degreesPerGate;
  const line = Math.floor(positionInGate * 6) + 1;
  
  return { gate, line };
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
    date: currentDate.toISOString().split('T')[0],
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
