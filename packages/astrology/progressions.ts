/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - PROGRESSIONS & RETURN CHARTS
 * Solar Return, Lunar Return, Secondary Progressions, etc.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as Astronomy from 'astronomy-engine';
import type { Profile } from '../shared/schema';

export interface ReturnChart {
  type: 'solar' | 'lunar' | 'venus' | 'mars' | 'jupiter' | 'saturn';
  date: Date;
  chart: {
    sun: { sign: string; degree: number; house: number };
    moon: { sign: string; degree: number; house: number };
    ascendant: { sign: string; degree: number };
    midheaven: { sign: string; degree: number };
    planets: Record<string, { sign: string; degree: number; house: number }>;
    houses: Array<{ sign: string; degree: number }>;
  };
  themes: string[];
  interpretation: string;
  yearAhead?: string; // For solar return
}

export interface Progression {
  type: 'secondary' | 'tertiary' | 'solar-arc';
  date: Date;
  progressedPlanets: Record<string, { sign: string; degree: number }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    interpretation: string;
  }>;
  themes: string[];
  interpretation: string;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/**
 * Calculate Solar Return chart
 */
export function calculateSolarReturn(
  profile: Profile,
  returnYear: number
): ReturnChart {
  const birthDate = new Date(profile.birthDate);
  const birthYear = birthDate.getFullYear();
  const returnDate = new Date(birthDate);
  returnDate.setFullYear(returnYear);

  // Find exact time when Sun returns to natal position
  // Simplified - in production use precise calculation
  const chart = calculateChart(returnDate, profile);

  const themes = generateSolarReturnThemes(chart, returnYear - birthYear);
  const interpretation = generateSolarReturnInterpretation(chart, returnYear - birthYear);
  const yearAhead = generateYearAheadForecast(chart);

  return {
    type: 'solar',
    date: returnDate,
    chart,
    themes,
    interpretation,
    yearAhead
  };
}

/**
 * Calculate Lunar Return chart
 */
export function calculateLunarReturn(
  profile: Profile,
  returnDate: Date
): ReturnChart {
  const chart = calculateChart(returnDate, profile);
  const themes = generateLunarReturnThemes(chart);
  const interpretation = generateLunarReturnInterpretation(chart);

  return {
    type: 'lunar',
    date: returnDate,
    chart,
    themes,
    interpretation
  };
}

/**
 * Calculate Secondary Progressions
 */
export function calculateSecondaryProgressions(
  profile: Profile,
  currentDate: Date
): Progression {
  const birthDate = new Date(profile.birthDate);
  const daysSinceBirth = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Secondary progression: 1 day = 1 year
  const progressedDate = new Date(birthDate);
  progressedDate.setDate(progressedDate.getDate() + daysSinceBirth);

  const progressedPlanets = calculateProgressedPlanets(progressedDate, profile);
  const aspects = calculateProgressedAspects(progressedPlanets);
  const themes = generateProgressionThemes(aspects);
  const interpretation = generateProgressionInterpretation(aspects, daysSinceBirth);

  return {
    type: 'secondary',
    date: currentDate,
    progressedPlanets,
    aspects,
    themes,
    interpretation
  };
}

/**
 * Calculate chart for a specific date
 */
function calculateChart(date: Date, profile: Profile): ReturnChart['chart'] {
  // Simplified chart calculation
  // In production, use proper astronomy calculations
  
  const astrologyData = profile.astrologyData as any;
  const birthLocation = {
    latitude: parseFloat(profile.latitude || '0'),
    longitude: parseFloat(profile.longitude || '0')
  };

  // Calculate planetary positions
  const planets: Record<string, { sign: string; degree: number; house: number }> = {};
  
  // Simplified - would use proper calculations in production
  const sunPos = calculatePlanetPosition('Sun', date);
  const moonPos = calculatePlanetPosition('Moon', date);
  
  planets.Sun = { ...sunPos, house: 1 };
  planets.Moon = { ...moonPos, house: 2 };
  
  // Calculate houses (simplified)
  const houses: Array<{ sign: string; degree: number }> = [];
  for (let i = 0; i < 12; i++) {
    houses.push({ sign: SIGNS[i], degree: 0 });
  }

  return {
    sun: sunPos,
    moon: moonPos,
    ascendant: { sign: SIGNS[0], degree: 0 },
    midheaven: { sign: SIGNS[9], degree: 0 },
    planets,
    houses
  };
}

/**
 * Calculate planet position (simplified)
 */
function calculatePlanetPosition(planet: string, date: Date): { sign: string; degree: number } {
  // Simplified calculation
  // In production, use astronomy-engine properly
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const signIndex = Math.floor((dayOfYear / 30.4) % 12);
  const degree = (dayOfYear % 30.4);
  
  return {
    sign: SIGNS[signIndex],
    degree: Math.floor(degree)
  };
}

/**
 * Calculate progressed planets
 */
function calculateProgressedPlanets(progressedDate: Date, profile: Profile): Record<string, { sign: string; degree: number }> {
  const progressed: Record<string, { sign: string; degree: number }> = {};
  
  // Calculate progressed positions for key planets
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  for (const planet of planets) {
    progressed[planet] = calculatePlanetPosition(planet, progressedDate);
  }
  
  return progressed;
}

/**
 * Calculate aspects between progressed planets
 */
function calculateProgressedAspects(progressedPlanets: Record<string, { sign: string; degree: number }>): Progression['aspects'] {
  const aspects: Progression['aspects'] = [];
  const planets = Object.keys(progressedPlanets);
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      const pos1 = getAbsoluteDegree(progressedPlanets[planet1]);
      const pos2 = getAbsoluteDegree(progressedPlanets[planet2]);
      
      const aspect = calculateAspect(pos1, pos2);
      if (aspect) {
        aspects.push({
          planet1,
          planet2,
          aspect: aspect.name,
          orb: aspect.orb,
          interpretation: generateAspectInterpretation(planet1, planet2, aspect.name)
        });
      }
    }
  }
  
  return aspects;
}

/**
 * Get absolute degree from sign and degree
 */
function getAbsoluteDegree(position: { sign: string; degree: number }): number {
  const signIndex = SIGNS.indexOf(position.sign);
  return signIndex * 30 + position.degree;
}

/**
 * Calculate aspect between two positions
 */
function calculateAspect(pos1: number, pos2: number): { name: string; orb: number } | null {
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { name: 'Conjunction', degrees: 0, orb: 8 },
    { name: 'Opposition', degrees: 180, orb: 8 },
    { name: 'Square', degrees: 90, orb: 7 },
    { name: 'Trine', degrees: 120, orb: 7 },
    { name: 'Sextile', degrees: 60, orb: 6 }
  ];
  
  for (const aspect of aspects) {
    const orbDiff = Math.abs(diff - aspect.degrees);
    if (orbDiff <= aspect.orb) {
      return { name: aspect.name, orb: orbDiff };
    }
  }
  
  return null;
}

/**
 * Generate aspect interpretation
 */
function generateAspectInterpretation(planet1: string, planet2: string, aspect: string): string {
  const interpretations: Record<string, string> = {
    'Sun-Moon-Conjunction': 'Emotional and identity alignment. Inner harmony.',
    'Sun-Moon-Opposition': 'Tension between identity and emotions. Integration needed.',
    'Sun-Moon-Trine': 'Natural flow between identity and emotions.',
    'Venus-Mars-Conjunction': 'Passion and attraction are aligned.',
    'Venus-Mars-Opposition': 'Tension between love and desire. Balance needed.'
  };
  
  const key = `${planet1}-${planet2}-${aspect}`;
  const reverseKey = `${planet2}-${planet1}-${aspect}`;
  
  return interpretations[key] || interpretations[reverseKey] || `${planet1} and ${planet2} in ${aspect} aspect.`;
}

/**
 * Generate Solar Return themes
 */
function generateSolarReturnThemes(chart: ReturnChart['chart'], age: number): string[] {
  const themes: string[] = [];
  
  // Themes based on Sun sign and house
  themes.push(`Solar Return in ${chart.sun.sign}`);
  themes.push(`Sun in ${chart.sun.house} house`);
  
  // Age-specific themes
  if (age % 7 === 0) {
    themes.push('7-year cycle completion');
  }
  if (age % 12 === 0) {
    themes.push('Jupiter return year - expansion');
  }
  if (age === 29 || age === 58) {
    themes.push('Saturn return - major life restructuring');
  }
  
  return themes;
}

/**
 * Generate Solar Return interpretation
 */
function generateSolarReturnInterpretation(chart: ReturnChart['chart'], age: number): string {
  return `Your Solar Return in ${chart.sun.sign} with the Sun in the ${chart.sun.house} house indicates a year focused on ${getHouseTheme(chart.sun.house)}. This is a powerful time for ${chart.sun.sign.toLowerCase()} energy to express itself in your life.`;
}

/**
 * Generate year ahead forecast
 */
function generateYearAheadForecast(chart: ReturnChart['chart']): string {
  const houseThemes: Record<number, string> = {
    1: 'personal identity and new beginnings',
    2: 'values, resources, and self-worth',
    3: 'communication, learning, and siblings',
    4: 'home, family, and foundations',
    5: 'creativity, romance, and self-expression',
    6: 'health, service, and daily routines',
    7: 'partnerships and relationships',
    8: 'transformation, shared resources, and intimacy',
    9: 'philosophy, travel, and higher learning',
    10: 'career, public image, and life direction',
    11: 'friendships, community, and hopes',
    12: 'spirituality, subconscious, and completion'
  };
  
  const theme = houseThemes[chart.sun.house] || 'personal growth';
  return `This year ahead focuses on ${theme}. The ${chart.sun.sign} energy brings ${getSignEnergy(chart.sun.sign)} to this area of your life.`;
}

/**
 * Generate Lunar Return themes
 */
function generateLunarReturnThemes(chart: ReturnChart['chart']): string[] {
  return [
    `Lunar Return in ${chart.moon.sign}`,
    `Moon in ${chart.moon.house} house`,
    'Emotional cycle renewal',
    'Monthly emotional focus'
  ];
}

/**
 * Generate Lunar Return interpretation
 */
function generateLunarReturnInterpretation(chart: ReturnChart['chart']): string {
  return `Your Lunar Return in ${chart.moon.sign} with the Moon in the ${chart.moon.house} house indicates this month's emotional focus will be on ${getHouseTheme(chart.moon.house)}.`;
}

/**
 * Generate progression themes
 */
function generateProgressionThemes(aspects: Progression['aspects']): string[] {
  const themes: string[] = [];
  
  for (const aspect of aspects.slice(0, 3)) {
    themes.push(`${aspect.planet1}-${aspect.planet2} ${aspect.aspect}`);
  }
  
  return themes;
}

/**
 * Generate progression interpretation
 */
function generateProgressionInterpretation(aspects: Progression['aspects'], daysSinceBirth: number): string {
  const years = Math.floor(daysSinceBirth / 365.25);
  return `At ${years} years old, your progressed chart shows ${aspects.length} significant aspects. These represent the inner evolution and psychological development you're experiencing.`;
}

/**
 * Helper functions
 */
function getHouseTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'personal identity',
    2: 'values and resources',
    3: 'communication',
    4: 'home and family',
    5: 'creativity',
    6: 'health and service',
    7: 'partnerships',
    8: 'transformation',
    9: 'philosophy and expansion',
    10: 'career',
    11: 'community',
    12: 'spirituality'
  };
  return themes[house] || 'personal growth';
}

function getSignEnergy(sign: string): string {
  const energies: Record<string, string> = {
    Aries: 'initiative and courage',
    Taurus: 'stability and sensuality',
    Gemini: 'curiosity and communication',
    Cancer: 'nurturing and emotional depth',
    Leo: 'creativity and self-expression',
    Virgo: 'precision and service',
    Libra: 'harmony and partnership',
    Scorpio: 'transformation and depth',
    Sagittarius: 'expansion and philosophy',
    Capricorn: 'structure and ambition',
    Aquarius: 'innovation and community',
    Pisces: 'intuition and compassion'
  };
  return energies[sign] || 'unique energy';
}

export default {
  calculateSolarReturn,
  calculateLunarReturn,
  calculateSecondaryProgressions
};
