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

function canonicalSignFromLongitude(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
}

function validateNatalPlanets(
  natalPlanets: Record<string, { longitude: number; sign: string }>,
): void {
  const entries = Object.entries(natalPlanets);
  if (entries.length === 0) {
    throw new Error('transit_verified_natal_positions_required');
  }

  for (const [name, position] of entries) {
    if (!Number.isFinite(position?.longitude)) {
      throw new Error(`transit_natal_longitude_invalid:${name}`);
    }
    const normalized = ((position.longitude % 360) + 360) % 360;
    const expectedSign = canonicalSignFromLongitude(normalized);
    if (position.sign !== expectedSign) {
      throw new Error(`transit_natal_sign_longitude_mismatch:${name}`);
    }
  }
}


// "intensity" is a legacy model-priority bucket used for sorting/display. It is
// not a measured physical, psychological, or predictive intensity.
const TRANSIT_THEMES: Record<string, { theme: string, intensity: 'high' | 'medium' | 'low' }> = {
  'Pluto': { theme: 'Symbolic themes: transformation, endings, renewal', intensity: 'high' },
  'Neptune': { theme: 'Symbolic themes: imagination, uncertainty, ideals', intensity: 'high' },
  'Uranus': { theme: 'Symbolic themes: change, disruption, experimentation', intensity: 'high' },
  'Saturn': { theme: 'Symbolic themes: structure, limits, responsibility', intensity: 'medium' },
  'Jupiter': { theme: 'Symbolic themes: expansion, opportunity, excess', intensity: 'medium' }
};

const TRANSIT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  Pluto: {
    Conjunction: 'Reflection prompt: examine where themes of transformation, endings, or renewal are useful to consider. The transit does not prove that a life event or psychological change is occurring.',
    Opposition: 'Reflection prompt: compare competing priorities or power dynamics you can actually observe. Do not treat the aspect as evidence that external conflict must occur.',
    Square: 'Reflection prompt: review where control, attachment, or resistance may be worth questioning if those themes fit the real situation.',
    Trine: 'Reflection prompt: look for changes that are already occurring with relatively little friction; the aspect itself does not guarantee ease or healing.',
    Sextile: 'Reflection prompt: notice optional openings for change if they are present in real circumstances; no opportunity is guaranteed.'
  },
  Saturn: {
    Conjunction: 'Reflection prompt: review structure, responsibility, limits, and commitments where those themes are relevant. The transit does not establish a season of hardship or maturity.',
    Opposition: 'Reflection prompt: stress-test an existing plan or commitment using observable evidence rather than assuming the transit is testing it for you.',
    Square: 'Reflection prompt: identify constraints that are actually present and decide what needs reinforcement. Do not infer obstacles from the aspect alone.',
    Trine: 'Reflection prompt: notice where existing structure is already helping. The aspect does not prove that effort will be rewarded or mastery will come easily.',
    Sextile: 'Reflection prompt: test whether disciplined action creates a useful opening in the real situation; opportunity is not promised.'
  },
  Uranus: {
    Conjunction: 'Reflection prompt: consider where experimentation or change could be useful if circumstances already support it. The transit does not predict a sudden shift.',
    Opposition: 'Reflection prompt: compare stability and change as competing values where that tension is actually observable; no disruption is implied.',
    Square: 'Reflection prompt: identify where adaptation may help with a real constraint. The aspect itself does not force restlessness or disruption.',
    Trine: 'Reflection prompt: notice where experimentation already feels workable; the aspect does not guarantee liberation, authenticity, or easy change.',
    Sextile: 'Reflection prompt: test one low-cost change where it makes sense; no awakening or freedom event is predicted.'
  },
  Neptune: {
    Conjunction: 'Reflection prompt: separate imagination, uncertainty, and evidence where those themes matter. The transit does not prove heightened intuition or softened boundaries.',
    Opposition: 'Reflection prompt: check assumptions against observable facts where clarity is limited. The aspect does not establish confusion or recalibration.',
    Square: 'Reflection prompt: compare ideals with current evidence and revise plans only when the evidence supports it.',
    Trine: 'Reflection prompt: use imagination or compassion deliberately if they are useful. The aspect does not prove spiritual connection, intuition, grace, or ease.',
    Sextile: 'Reflection prompt: explore a creative or compassionate option if it fits the situation; no spiritual opening is guaranteed.'
  },
  Jupiter: {
    Conjunction: 'Reflection prompt: review where expansion, opportunity, or excess are relevant to current facts. The transit does not mean abundance will arrive or growth will accelerate.',
    Opposition: 'Reflection prompt: check for overextension or imbalance using actual commitments and resources rather than assuming excess from the aspect.',
    Square: 'Reflection prompt: examine whether a growth goal is creating useful tension or simply unnecessary strain. Expansion is not guaranteed.',
    Trine: 'Reflection prompt: notice where conditions already support growth; the aspect does not promise abundance, optimism, or effortless results.',
    Sextile: 'Reflection prompt: test a small opportunity where evidence supports it. Do not say yes solely because of the transit.'
  }
};

function calculatePlanetaryPosition(planet: string, date: Date): { longitude: number, sign: string, degree: number } {
  const body = Astro.Body[planet as keyof typeof Astro.Body];
  const ecliptic = Astro.EclipticGeoMoon(date);
  
  // Use geocentric ecliptic longitude for natal/transit aspect geometry.
  let longitude = 0;
  
  if (planet === 'Moon') {
    longitude = ecliptic.lon;
  } else {
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
  if (Number.isNaN(date.getTime())) {
    throw new Error('transit_date_invalid');
  }
  validateNatalPlanets(natalPlanets);
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
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`transit_planet_calculation_failed:${transitPlanet}:${detail}`);
    }
  }
  
  // Sort by legacy model-priority bucket, then geometric exactness (orb).
  transits.sort((a, b) => {
    const intensityOrder = { high: 3, medium: 2, low: 1 };
    const intensityDiff = intensityOrder[b.intensity] - intensityOrder[a.intensity];
    if (intensityDiff !== 0) return intensityDiff;
    return a.orb - b.orb; // Tighter orb first
  });
  
  // Calculate dominant theme (most intense planet currently transiting)
  const dominantTransit = transits.find(t => t.intensity === 'high') || transits[0];
  const dominantTheme = dominantTransit ? dominantTransit.theme : 'No active governed major transit';
  
  // Calculate overall intensity (0-100 scale)
  const overallIntensity = transits.length > 0
    ? Math.min(100, transits.reduce((sum, t) => {
        const intensityValue = { high: 30, medium: 15, low: 5 }[t.intensity];
        const exactnessBonus = (8 - t.orb) * 2; // Legacy model score; tighter geometry ranks higher
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

// Helper to extract only independently verified natal positions.
function verifiedNatalLongitude(placement: any): number | null {
  if (!placement || placement.verificationStatus !== 'verified') return null;
  const candidate = Number(
    placement.longitude ??
    placement.internalCandidate?.longitude ??
    placement.evidence?.longitude,
  );
  return Number.isFinite(candidate) ? ((candidate % 360) + 360) % 360 : null;
}

function addVerifiedNatalPosition(
  positions: Record<string, { longitude: number, sign: string }>,
  name: string,
  placement: any,
): void {
  const longitude = verifiedNatalLongitude(placement);
  const sign = typeof placement?.sign === 'string' ? placement.sign : null;
  if (longitude === null || !sign) return;
  positions[name] = { longitude, sign };
}

export function extractNatalPositions(astrologyData: any): Record<string, { longitude: number, sign: string }> {
  const positions: Record<string, { longitude: number, sign: string }> = {};

  if (astrologyData?.planets) {
    for (const [planet, placement] of Object.entries(astrologyData.planets)) {
      addVerifiedNatalPosition(
        positions,
        planet.charAt(0).toUpperCase() + planet.slice(1),
        placement,
      );
    }
  }

  // Canonical production astrology names the angle "rising"; legacy verified
  // snapshots may expose "ascendant". Both remain evidence-gated here.
  addVerifiedNatalPosition(
    positions,
    'Ascendant',
    astrologyData?.rising ?? astrologyData?.ascendant,
  );
  addVerifiedNatalPosition(positions, 'Midheaven', astrologyData?.midheaven);

  return positions;
}
