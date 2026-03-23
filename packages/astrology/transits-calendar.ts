/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - ADVANCED TRANSITS CALENDAR
 * Visual calendar with transit predictions and insights
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { calculateActiveTransits, extractNatalPositions, type ActiveTransits, type Transit } from '../transits';
import type { Profile } from '../shared/schema';

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

/**
 * Generate a transits calendar for a date range
 */
export function generateTransitsCalendar(
  profile: Profile,
  startDate: Date,
  endDate: Date
): TransitsCalendar {
  const days: CalendarDay[] = [];
  const allThemes: string[] = [];
  const peakDates: Date[] = [];
  let totalTransits = 0;
  let highIntensityDays = 0;

  // Extract natal positions from profile
  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);

  // Generate calendar for each day
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const activeTransits = calculateActiveTransits(natalPlanets, new Date(currentDate));
    
    const significantTransits = activeTransits.transits.filter(t => t.intensity === 'high');
    const recommendations = generateRecommendations(activeTransits.transits, activeTransits.dominantTheme);

    if (activeTransits.overallIntensity >= 7) {
      highIntensityDays++;
    }

    if (activeTransits.overallIntensity >= 8) {
      peakDates.push(new Date(currentDate));
    }

    allThemes.push(activeTransits.dominantTheme);
    totalTransits += activeTransits.transits.length;

    days.push({
      date: new Date(currentDate),
      transits: activeTransits.transits,
      dominantTheme: activeTransits.dominantTheme,
      overallIntensity: activeTransits.overallIntensity,
      significantTransits,
      recommendations,
      moonPhase: getMoonPhase(currentDate),
      moonSign: getMoonSign(currentDate)
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
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
    startDate,
    endDate,
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
 * Get moon phase for a date (simplified)
 */
function getMoonPhase(date: Date): string {
  // Simplified moon phase calculation
  // In production, use a proper astronomy library
  const dayOfMonth = date.getDate();
  const phase = (dayOfMonth % 29.5) / 29.5;
  
  if (phase < 0.03 || phase > 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Get moon sign for a date (simplified)
 */
function getMoonSign(date: Date): string {
  // Simplified - in production use proper calculation
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  // Moon changes signs approximately every 2.5 days
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const signIndex = Math.floor((daysSinceEpoch / 2.5) % 12);
  return SIGNS[signIndex];
}

/**
 * Get upcoming significant transits (next 30 days)
 */
export function getUpcomingSignificantTransits(
  profile: Profile,
  days: number = 30
): Transit[] {
  const astrologyData = profile.astrologyData as any;
  const natalPlanets = extractNatalPositions(astrologyData);
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  const allTransits: Transit[] = [];
  const currentDate = new Date(today);

  while (currentDate <= endDate) {
    const activeTransits = calculateActiveTransits(natalPlanets, new Date(currentDate));
    const significant = activeTransits.transits.filter(t => t.intensity === 'high');
    allTransits.push(...significant);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Remove duplicates and sort by date
  const uniqueTransits = Array.from(
    new Map(allTransits.map(t => [`${t.planet}-${t.natalPlanet}-${t.aspect}`, t])).values()
  );

  return uniqueTransits.slice(0, 10); // Return top 10
}

export default {
  generateTransitsCalendar,
  getUpcomingSignificantTransits
};
