import * as Astronomy from 'astronomy-engine';
const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;

export interface Transit {
  planet: string;
  transitingDegree: number;
  transitingSign: string;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  aspect: string;
  aspectDegrees: number;
  orb: number;
  interpretation: string;
  intensity: 'high' | 'medium' | 'low';
  theme: string;
}

export interface ActiveTransits {
  timestamp: Date;
  transits: Transit[];
  dominantTheme: string;
  overallIntensity: number;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const MAJOR_ASPECTS = {
  conjunction: { degrees: 0, orb: 8, name: 'Conjunction' },
  opposition: { degrees: 180, orb: 8, name: 'Opposition' },
  square: { degrees: 90, orb: 7, name: 'Square' },
  trine: { degrees: 120, orb: 7, name: 'Trine' },
  sextile: { degrees: 60, orb: 6, name: 'Sextile' }
};

// Outer planets only - these create the most significant life transits
const OUTER_PLANETS = ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'];

const TRANSIT_THEMES: Record<string, { theme: string, intensity: 'high' | 'medium' | 'low' }> = {
  'Pluto': { theme: 'Transformation, Shadow Work, Death & Rebirth', intensity: 'high' },
  'Neptune': { theme: 'Dissolution, Spirituality, Surrender, Illusion', intensity: 'high' },
  'Uranus': { theme: 'Awakening, Revolution, Liberation, Chaos', intensity: 'high' },
  'Saturn': { theme: 'Discipline, Limitation, Mastery, Structure', intensity: 'medium' },
  'Jupiter': { theme: 'Expansion, Abundance, Growth, Optimism', intensity: 'medium' }
};

const TRANSIT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  'Pluto': {
    'Conjunction': 'Deep transformation is active. Old patterns are being replaced — not destroyed, but composted into something more honest. Stay present with the discomfort.',
    'Opposition': 'External friction is surfacing something internal. Power dynamics are showing you where your real leverage lives. Look at what keeps repeating.',
    'Square': 'Pressure is building around control and attachment. The tighter you grip, the more friction you create. Identify what you can release without losing ground.',
    'Trine': 'Natural transformation flowing with ease. Your shadow work is supported. Deep healing happens without force.',
    'Sextile': 'Opportunities for transformation present themselves. The work is available if you choose it.'
  },
  'Saturn': {
    'Conjunction': 'A season of discipline and accountability. This area of life is asking for maturity and structure. What you build now is load-bearing.',
    'Opposition': 'Your existing structure is being stress-tested. What holds up under pressure stays. What doesn\'t gets rebuilt — that\'s useful information.',
    'Square': 'Limitation and pressure reveal what needs strengthening. The obstacle is the path. Build your discipline here.',
    'Trine': 'Your efforts are rewarded. Mastery flows naturally. The structure you\'ve built supports you.',
    'Sextile': 'Opportunities to demonstrate mastery. Discipline creates opportunity.'
  },
  'Uranus': {
    'Conjunction': 'A sudden shift is reorganizing this area of life. The old structure is being updated — not destroyed, but outgrown. Let the new pattern emerge.',
    'Opposition': 'An external disruption is pushing you to choose between security and authenticity. Both matter — the question is which one is currently overweighted.',
    'Square': 'Restlessness and disruption are forcing adaptation. You can\'t control the timing, but you can control your response. Move with it rather than against it.',
    'Trine': 'Natural innovation and liberation. Change flows with ease. Your authentic self emerges effortlessly.',
    'Sextile': 'Opportunities for freedom present themselves. Small awakenings lead to larger shifts.'
  },
  'Neptune': {
    'Conjunction': 'Boundaries are softening. Spiritual and intuitive channels are wide open. Stay grounded while you explore — clarity returns once this transit settles.',
    'Opposition': 'What you thought was solid may be less clear than expected. This is recalibration, not failure. Separate what you feel from what you know.',
    'Square': 'Ideals are being tested against reality. Something you believed in is shifting form. This is a course correction, not a loss — update the map.',
    'Trine': 'Spiritual connection flows naturally. Intuition is heightened. Grace and ease are accessible.',
    'Sextile': 'Gentle spiritual openings. Opportunities for transcendence and compassion.'
  },
  'Jupiter': {
    'Conjunction': 'Expansion and abundance arrive. Growth is accelerated. Optimism and faith are rewarded.',
    'Opposition': 'Excess and overconfidence may create imbalance. Too much of a good thing. Find equilibrium.',
    'Square': 'Growth comes through tension. You\'re being stretched beyond your comfort zone. Expansion requires friction.',
    'Trine': 'Natural flow of abundance and opportunity. Your optimism manifests results. Growth is effortless.',
    'Sextile': 'Small opportunities for growth. Say yes to expansion.'
  }
};

function calculatePlanetaryPosition(planet: string, date: Date): { longitude: number, sign: string, degree: number } {
  const body = Astro.Body[planet as keyof typeof Astro.Body];
  const ecliptic = Astro.EclipticGeoMoon(date);
  
  // Get heliocentric position for outer planets
  let longitude = 0;
  
  if (planet === 'Moon') {
    longitude = ecliptic.lon;
  } else {
    const helioVector = Astro.HelioVector(body, date);
    const geoVector = Astro.GeoVector(body, date, false);
    const eclipticCoords = Astro.Ecliptic(geoVector);
    longitude = eclipticCoords.elon;
  }
  
  // Normalize to 0-360
  while (longitude < 0) longitude += 360;
  while (longitude >= 360) longitude -= 360;
  
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  
  return {
    longitude,
    sign: SIGNS[signIndex],
    degree
  };
}

function calculateAspect(pos1: number, pos2: number): { aspect: string | null, orb: number } {
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;
  
  for (const [aspectName, aspectData] of Object.entries(MAJOR_ASPECTS)) {
    const orbDiff = Math.abs(diff - aspectData.degrees);
    if (orbDiff <= aspectData.orb) {
      return {
        aspect: aspectData.name,
        orb: orbDiff
      };
    }
  }
  
  return { aspect: null, orb: 999 };
}

export function calculateActiveTransits(
  natalPlanets: Record<string, { longitude: number, sign: string }>,
  date: Date = new Date()
): ActiveTransits {
  const transits: Transit[] = [];
  
  // Calculate current positions of outer planets
  for (const transitPlanet of OUTER_PLANETS) {
    try {
      const transitPosition = calculatePlanetaryPosition(transitPlanet, date);
      
      // Check aspects to natal planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant, Midheaven)
      const natalPlanetsToCheck = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Midheaven'];
      
      for (const natalPlanet of natalPlanetsToCheck) {
        if (!natalPlanets[natalPlanet]) continue;
        
        const natalPosition = natalPlanets[natalPlanet];
        const { aspect, orb } = calculateAspect(transitPosition.longitude, natalPosition.longitude);
        
        if (aspect) {
          const interpretation = TRANSIT_INTERPRETATIONS[transitPlanet]?.[aspect] || 'Significant transit active.';
          const themeData = TRANSIT_THEMES[transitPlanet];
          
          transits.push({
            planet: transitPlanet,
            transitingDegree: Math.round(transitPosition.degree * 100) / 100,
            transitingSign: transitPosition.sign,
            natalPlanet,
            natalDegree: Math.round(natalPosition.longitude % 30 * 100) / 100,
            natalSign: natalPosition.sign,
            aspect,
            aspectDegrees: MAJOR_ASPECTS[aspect.toLowerCase() as keyof typeof MAJOR_ASPECTS].degrees,
            orb: Math.round(orb * 100) / 100,
            interpretation,
            intensity: themeData.intensity,
            theme: themeData.theme
          });
        }
      }
    } catch (error) {
      console.error(`Error calculating ${transitPlanet} transit:`, error);
    }
  }
  
  // Sort by intensity and orb (tighter orbs = more exact = more powerful)
  transits.sort((a, b) => {
    const intensityOrder = { high: 3, medium: 2, low: 1 };
    const intensityDiff = intensityOrder[b.intensity] - intensityOrder[a.intensity];
    if (intensityDiff !== 0) return intensityDiff;
    return a.orb - b.orb; // Tighter orb first
  });
  
  // Calculate dominant theme (most intense planet currently transiting)
  const dominantTransit = transits.find(t => t.intensity === 'high') || transits[0];
  const dominantTheme = dominantTransit ? dominantTransit.theme : 'Integration and Balance';
  
  // Calculate overall intensity (0-100 scale)
  const overallIntensity = transits.length > 0
    ? Math.min(100, transits.reduce((sum, t) => {
        const intensityValue = { high: 30, medium: 15, low: 5 }[t.intensity];
        const exactnessBonus = (8 - t.orb) * 2; // Tighter orbs add more intensity
        return sum + intensityValue + exactnessBonus;
      }, 0))
    : 0;
  
  return {
    timestamp: date,
    transits,
    dominantTheme,
    overallIntensity: Math.round(overallIntensity)
  };
}

// Helper to extract natal positions from astrology data
export function extractNatalPositions(astrologyData: any): Record<string, { longitude: number, sign: string }> {
  const positions: Record<string, { longitude: number, sign: string }> = {};
  
  if (astrologyData?.planets) {
    for (const [planet, data] of Object.entries(astrologyData.planets)) {
      if (typeof data === 'object' && data !== null && 'longitude' in data && 'sign' in data) {
        positions[planet.charAt(0).toUpperCase() + planet.slice(1)] = {
          longitude: (data as any).longitude,
          sign: (data as any).sign
        };
      }
    }
  }
  
  if (astrologyData?.ascendant) {
    positions['Ascendant'] = {
      longitude: astrologyData.ascendant.longitude,
      sign: astrologyData.ascendant.sign
    };
  }
  
  if (astrologyData?.midheaven) {
    positions['Midheaven'] = {
      longitude: astrologyData.midheaven.longitude,
      sign: astrologyData.midheaven.sign
    };
  }
  
  return positions;
}
