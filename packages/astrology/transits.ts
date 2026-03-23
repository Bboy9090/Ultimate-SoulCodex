import * as Astronomy from 'astronomy-engine';

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
    'Conjunction': 'Deep transformation is occurring. This transit forces you to confront your deepest fears and hidden shadows. Death of old patterns, rebirth into authenticity.',
    'Opposition': 'External forces mirror your internal shadow. Power struggles reveal what needs to be transformed. The universe is showing you what you refuse to see.',
    'Square': 'Crisis of power and control. You\'re being forced to release what you\'re clinging to. The friction is intentional - it\'s breaking you open.',
    'Trine': 'Natural transformation flowing with ease. Your shadow work is supported. Deep healing happens without force.',
    'Sextile': 'Opportunities for transformation present themselves. The work is available if you choose it.'
  },
  'Saturn': {
    'Conjunction': 'The Great Teacher arrives. Discipline, responsibility, and mastery are required. This is your initiation into maturity in this area of life.',
    'Opposition': 'The universe is testing your structure. What you\'ve built is being challenged. Only what\'s real will remain.',
    'Square': 'Limitation and pressure reveal what needs strengthening. The obstacle is the path. Build your discipline here.',
    'Trine': 'Your efforts are rewarded. Mastery flows naturally. The structure you\'ve built supports you.',
    'Sextile': 'Opportunities to demonstrate mastery. Discipline creates opportunity.'
  },
  'Uranus': {
    'Conjunction': 'Lightning strikes. Sudden awakening and liberation. The old structure is breaking apart to reveal your authentic truth.',
    'Opposition': 'Revolutionary energy confronts you externally. Freedom vs. security. The cage door is open - will you leave?',
    'Square': 'Chaos and disruption force change. You cannot control this. Surrender to the awakening.',
    'Trine': 'Natural innovation and liberation. Change flows with ease. Your authentic self emerges effortlessly.',
    'Sextile': 'Opportunities for freedom present themselves. Small awakenings lead to larger shifts.'
  },
  'Neptune': {
    'Conjunction': 'Ego dissolution. Spiritual awakening. Boundaries dissolve. You\'re being asked to surrender completely.',
    'Opposition': 'Confusion and illusion mirror back to you. What\'s real? What\'s fantasy? The veil is being lifted.',
    'Square': 'Disillusionment and confusion create crisis. The dream is collapsing. Reality check in progress.',
    'Trine': 'Spiritual connection flows naturally. Intuition is heightened. Grace and surrender come with ease.',
    'Sextile': 'Gentle spiritual openings. Opportunities for transcendence and compassion.'
  },
  'Jupiter': {
    'Conjunction': 'Expansion and abundance arrive. Growth is accelerated. Optimism and faith are rewarded.',
    'Opposition': 'Excess and overconfidence may create imbalance. Too much of a good thing. Find equilibrium.',
    'Square': 'Growth comes through tension. You\'re being pushed beyond your comfort zone. Expansion requires friction.',
    'Trine': 'Natural flow of abundance and opportunity. Your optimism manifests results. Growth is effortless.',
    'Sextile': 'Small opportunities for growth. Say yes to expansion.'
  }
};

function calculatePlanetaryPosition(planet: string, date: Date): { longitude: number, sign: string, degree: number } {
  const body = Astronomy.Body[planet as keyof typeof Astronomy.Body];
  const ecliptic = Astronomy.EclipticGeoMoon(date);
  
  // Get heliocentric position for outer planets
  let longitude = 0;
  
  if (planet === 'Moon') {
    longitude = ecliptic.lon;
  } else {
    const helioVector = Astronomy.HelioVector(body, date);
    const geoVector = Astronomy.GeoVector(body, date, false);
    const eclipticCoords = Astronomy.Ecliptic(geoVector);
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
