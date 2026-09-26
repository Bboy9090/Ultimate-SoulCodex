import {
  parseDateOnly,
  type BirthData,
  type VerificationState,
  type PlacementEvidence,
  type PlacementLike
} from "@soulcodex/core";
import {
  getPlanetSignInterpretation,
  getHouseInterpretation,
  getPlanetMeaning,
  getKarmicInterpretation,
  getAspectInterpretation
} from "./interpretations";
import * as Astronomy from 'astronomy-engine';
const Astro: typeof Astronomy = Astronomy;
import { fromZonedTime } from 'date-fns-tz';
import * as geoTz from 'geo-tz';

interface PlanetData {
  sign: string;
  house: number;
  degree: number;
  longitude: number;
  interpretation: {
    title: string;
    description: string;
    keywords: string[];
    spiritualMeaning: string;
  };
  houseInterpretation: {
    title: string;
    description: string;
    themes: string[];
    spiritualFocus: string;
  };
}

interface AstrologyData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: PlanetData;
    moon: PlanetData;
    mercury: PlanetData;
    venus: PlanetData;
    mars: PlanetData;
    jupiter: PlanetData;
    saturn: PlanetData;
    uranus: PlanetData;
    neptune: PlanetData;
    pluto: PlanetData;
  };
  houses: Array<{
    sign: string;
    degree: number;
    interpretation: {
      title: string;
      description: string;
      themes: string[];
      spiritualFocus: string;
    };
  }>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode: null;
  southNode: null;
  chiron: null;
  interpretations: {
    bigThree: {
      sun: string;
      moon: string;
      rising: string;
    };
    summary: string;
  };
  placements?: {
    sun?: PlacementLike;
    moon?: PlacementLike;
    rising?: PlacementLike;
  };
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function eclipticToZodiacSign(longitude: number): string {
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  const signIndex = Math.floor(longitude / 30);
  return ZODIAC_SIGNS[signIndex];
}

function getDegreesInSign(longitude: number): number {
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  return longitude % 30;
}

function createBirthTime(birthData: BirthData): Date {
  try {
    const [year, month, day] = birthData.birthDate.split('-').map(Number);
    const time = birthData.birthTime || "12:00";
    const [hours, minutes] = time.split(':').map(Number);
    
    const localTimeString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    
    const resolvedTimezone = resolveTimezone(
      birthData.timezone || "UTC",
      parseFloat(String(birthData.latitude ?? 0)),
      parseFloat(String(birthData.longitude ?? 0))
    );
    
    return fromZonedTime(new Date(localTimeString), resolvedTimezone);
  } catch (error) {
    console.error('Error creating precise birth time:', error);
    throw error;
  }
}

function resolveTimezone(inputTimezone: string, latitude: number, longitude: number): string {
  if (inputTimezone.includes('/')) {
    return inputTimezone;
  }
  
  try {
    const timezones = geoTz.find(latitude, longitude);
    if (timezones && timezones.length > 0) {
      return timezones[0];
    }
  } catch (error) {
    console.warn('Geo-tz lookup failed, falling back to coordinate calculation:', error);
  }
  
  const timezoneMap: { [key: string]: string } = {
    'EST': 'America/New_York',
    'EDT': 'America/New_York', 
    'CST': 'America/Chicago',
    'CDT': 'America/Chicago',
    'MST': 'America/Denver',
    'MDT': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'PDT': 'America/Los_Angeles',
    'GMT': 'Europe/London',
    'BST': 'Europe/London',
    'CET': 'Europe/Paris',
    'CEST': 'Europe/Paris'
  };
  
  const mapped = timezoneMap[inputTimezone.toUpperCase()];
  if (mapped) {
    return mapped;
  }
  
  return estimateTimezoneFromCoordinates(latitude, longitude);
}

function estimateTimezoneFromCoordinates(latitude: number, longitude: number): string {
  if (longitude >= -180 && longitude < -30) {
    if (longitude >= -75) return 'America/New_York';
    if (longitude >= -90) return 'America/Chicago';
    if (longitude >= -105) return 'America/Denver';
    if (longitude >= -125) return 'America/Los_Angeles';
    return 'America/Anchorage';
  }
  
  if (longitude >= -30 && longitude < 60) {
    if (latitude > 35) {
      if (longitude < 15) return 'Europe/London';
      if (longitude < 30) return 'Europe/Paris';
      return 'Europe/Moscow';
    }
    return 'Africa/Cairo';
  }
  
  if (longitude >= 60 && longitude <= 180) {
    if (longitude < 90) return 'Asia/Kolkata';
    if (longitude < 120) return 'Asia/Shanghai';
    if (longitude < 150) return 'Asia/Tokyo';
    return 'Pacific/Auckland';
  }
  
  return 'UTC';
}

function calculateCelestialPosition(body: Astronomy.Body, birthTime: Date): { longitude: number; sign: string; degree: number } {
  // Natal zodiac longitudes are geocentric. Observer coordinates belong to
  // horizon/angle calculations (Ascendant, houses), not planetary longitude.
  const vector = Astro.GeoVector(body, birthTime, true);
  const ecliptic = Astro.Ecliptic(vector);
  const longitude = ecliptic.elon;
  
  return {
    longitude,
    sign: eclipticToZodiacSign(longitude),
    degree: getDegreesInSign(longitude)
  };
}

function calculateLocalSiderealTime(birthTime: Date, longitude: number): number {
  const gmst = Astro.SiderealTime(birthTime);
  const lst = gmst + (longitude / 15.0);
  return (lst % 24 + 24) % 24;
}

function calculateAscendant(birthTime: Date, latitude: number, longitude: number): { longitude: number; sign: string; degree: number } {
  const lst = calculateLocalSiderealTime(birthTime, longitude);
  const lstDegrees = lst * 15;
  
  const latRad = latitude * Math.PI / 180;
  const obliquity = 23.4397;
  const oblRad = obliquity * Math.PI / 180;
  
  const lstRad = lstDegrees * Math.PI / 180;
  
  const numerator = Math.cos(lstRad);
  const denominator = -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));
  
  let ascendantLongitude = Math.atan2(numerator, denominator) * 180 / Math.PI;
  ascendantLongitude = (ascendantLongitude + 360) % 360;
  
  return {
    longitude: ascendantLongitude,
    sign: eclipticToZodiacSign(ascendantLongitude),
    degree: getDegreesInSign(ascendantLongitude)
  };
}

function calculateMidheaven(birthTime: Date, longitude: number): number {
  const lst = calculateLocalSiderealTime(birthTime, longitude);
  const lstDegrees = lst * 15;
  
  const obliquity = 23.4397;
  const oblRad = obliquity * Math.PI / 180;
  const ramcRad = lstDegrees * Math.PI / 180;
  
  const y = Math.sin(ramcRad);
  const x = Math.cos(ramcRad);
  
  let mcLongitude = Math.atan2(y, x * Math.cos(oblRad)) * 180 / Math.PI;
  mcLongitude = (mcLongitude + 360) % 360;
  
  return mcLongitude;
}

function calculateEqualHouseCusps(ascendantLongitude: number): number[] {
  const cusps = new Array(12);
  
  for (let i = 0; i < 12; i++) {
    cusps[i] = (ascendantLongitude + (i * 30)) % 360;
  }
  
  return cusps;
}

function calculateHousePosition(planetLongitude: number, houseCusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    
    if (nextCusp > currentCusp) {
      if (planetLongitude >= currentCusp && planetLongitude < nextCusp) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= currentCusp || planetLongitude < nextCusp) {
        return i + 1;
      }
    }
  }
  
  return 1;
}

function calculateAspects(planetPositions: { [key: string]: number }): Array<{ planet1: string; planet2: string; aspect: string; orb: number }> {
  const aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }> = [];
  
  const aspectDefinitions = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'sextile', angle: 60, orb: 6 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'opposition', angle: 180, orb: 10 }
  ];
  
  const planetNames = Object.keys(planetPositions);
  
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planet1 = planetNames[i];
      const planet2 = planetNames[j];
      let diff = Math.abs(planetPositions[planet1] - planetPositions[planet2]);
      
      if (diff > 180) {
        diff = 360 - diff;
      }
      
      for (const aspectDef of aspectDefinitions) {
        const orbDiff = Math.abs(diff - aspectDef.angle);
        
        if (orbDiff <= aspectDef.orb) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectDef.name,
            orb: parseFloat(orbDiff.toFixed(2))
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Authority Split for Placement Verification:
 *
 * VerificationState = placement lifecycle (unresolved → calculated → verified)
 * PlacementEvidence = source + engine + timestamps + comparison metadata
 *
 * Sun placement:
 * - Never requires birth time for sign (moves ~1°/day)
 * - Missing time → do NOT set unresolvedReason
 * - State: 'calculated' (repeatable but not yet independently verified)
 *
 * Moon placement:
 * - Requires exact birth time (moves ~12°/day)
 * - Missing time → verificationStatus: 'requires_verified_birth_time'
 * - State: 'calculated' if time available
 *
 * Rising (Ascendant) placement:
 * - Requires exact birth time (changes ~1°/4 minutes)
 * - Also requires birth location (local horizon depends on observer position)
 * - Missing time → 'requires_verified_birth_time'
 * - Missing location → 'requires_location'
 * - Has time + location → 'calculated'
 */
function determinePlacementStatus(
  birthData: BirthData,
  placement: 'sun' | 'moon' | 'rising'
): VerificationState {
  const hasExactTime = Boolean(birthData.birthTime?.trim());
  const hasTimezone = Boolean(birthData.timezone?.trim());
  const hasLocation = birthData.latitude != null && birthData.longitude != null;

  // Sun remains a date-only candidate.
  if (placement === 'sun') {
    return 'calculated';
  }

  // Moon/Rising require a resolvable civil timestamp: clock time + timezone.
  if (!hasExactTime || !hasTimezone) {
    return 'requires_verified_birth_time';
  }

  // Rising additionally requires a geographic horizon.
  if (placement === 'rising' && !hasLocation) {
    return 'requires_location';
  }

  return 'calculated';  // Repeatable but not yet verified
}

function buildPlacementEvidence(
  birthData: BirthData,
  placement: 'sun' | 'moon' | 'rising',
  calculatedAt: string
): PlacementEvidence {
  return {
    source: 'user-provided-birth-data',
    engine: 'astronomy-engine',
    calculatedAt,
    // confidence is optional per canonical type
    // Do not set categorical confidence at placement level
  };
}

function buildPlacement(
  sign: string,
  birthData: BirthData,
  placement: 'sun' | 'moon' | 'rising',
  calculatedAt: string
): PlacementLike {
  const verificationStatus = determinePlacementStatus(birthData, placement);
  const evidence = buildPlacementEvidence(birthData, placement, calculatedAt);

  return {
    sign,
    verificationStatus,
    evidence,
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const birthTime = createBirthTime(birthData);
  const latitude = parseFloat(String(birthData.latitude ?? 0));
  const longitude = parseFloat(String(birthData.longitude ?? 0));
  const hasExactTime = Boolean(birthData.birthTime?.trim());
  const hasTimezone = Boolean(birthData.timezone?.trim());
  const hasLocation = birthData.latitude != null && birthData.longitude != null;
  const moonResolved = hasExactTime && hasTimezone;
  const risingResolved = moonResolved && hasLocation;
  
  const sunPos = calculateCelestialPosition(Astro.Body.Sun, birthTime);
  const moonPos = calculateCelestialPosition(Astro.Body.Moon, birthTime);
  const mercuryPos = calculateCelestialPosition(Astro.Body.Mercury, birthTime);
  const venusPos = calculateCelestialPosition(Astro.Body.Venus, birthTime);
  const marsPos = calculateCelestialPosition(Astro.Body.Mars, birthTime);
  const jupiterPos = calculateCelestialPosition(Astro.Body.Jupiter, birthTime);
  const saturnPos = calculateCelestialPosition(Astro.Body.Saturn, birthTime);
  const uranusPos = calculateCelestialPosition(Astro.Body.Uranus, birthTime);
  const neptunePos = calculateCelestialPosition(Astro.Body.Neptune, birthTime);
  const plutoPos = calculateCelestialPosition(Astro.Body.Pluto, birthTime);
  
  const ascendantData = calculateAscendant(birthTime, latitude, longitude);
  
  const houseCusps = calculateEqualHouseCusps(ascendantData.longitude);
  
  const sunSign = sunPos.sign;
  const moonSign = moonResolved ? moonPos.sign : "Unknown";
  const risingSign = risingResolved ? ascendantData.sign : "Unknown";
  
  function createPlanetData(planetName: string, pos: { longitude: number; sign: string; degree: number }): PlanetData {
    const house = calculateHousePosition(pos.longitude, houseCusps);
    return {
      sign: pos.sign,
      house,
      degree: pos.degree,
      longitude: pos.longitude,
      interpretation: getPlanetSignInterpretation(planetName, pos.sign),
      houseInterpretation: getHouseInterpretation(house)
    };
  }
  
  const planets = {
    sun: createPlanetData('sun', sunPos),
    moon: createPlanetData('moon', moonPos),
    mercury: createPlanetData('mercury', mercuryPos),
    venus: createPlanetData('venus', venusPos),
    mars: createPlanetData('mars', marsPos),
    jupiter: createPlanetData('jupiter', jupiterPos),
    saturn: createPlanetData('saturn', saturnPos),
    uranus: createPlanetData('uranus', uranusPos),
    neptune: createPlanetData('neptune', neptunePos),
    pluto: createPlanetData('pluto', plutoPos)
  };
  
  const houses = risingResolved
    ? houseCusps.map((cuspLongitude, index) => ({
        sign: eclipticToZodiacSign(cuspLongitude),
        degree: cuspLongitude,
        interpretation: getHouseInterpretation(index + 1)
      }))
    : [];
  
  const planetPositions = {
    sun: sunPos.longitude,
    moon: moonPos.longitude,
    mercury: mercuryPos.longitude,
    venus: venusPos.longitude,
    mars: marsPos.longitude,
    jupiter: jupiterPos.longitude,
    saturn: saturnPos.longitude,
    uranus: uranusPos.longitude,
    neptune: neptunePos.longitude,
    pluto: plutoPos.longitude
  };
  
  const aspects = moonResolved ? calculateAspects(planetPositions) : [];
  
  // Legacy/package astrology does not emit Lunar Nodes or Chiron.
  // Production supplies them only through independently governed verification.
  const northNode = null;
  const southNode = null;
  const chiron = null;
  
  const sunInterpretation = getPlanetSignInterpretation('sun', sunSign);
  const moonInterpretation = moonResolved
    ? getPlanetSignInterpretation('moon', moonSign)
    : null;
  const risingInterpretation = risingResolved
    ? getPlanetSignInterpretation('sun', risingSign)
    : null;

  const calculatedAt = new Date().toISOString();
  const sunPlacement = buildPlacement(sunSign, birthData, 'sun', calculatedAt);
  const moonPlacement = buildPlacement(moonSign, birthData, 'moon', calculatedAt);
  const risingPlacement = buildPlacement(risingSign, birthData, 'rising', calculatedAt);

  return {
    sunSign,
    moonSign,
    risingSign,
    planets,
    houses,
    aspects,
    northNode,
    southNode,
    chiron,
    interpretations: {
      bigThree: {
        sun: `Your ${sunInterpretation.title} essence drives you to ${sunInterpretation.spiritualMeaning.toLowerCase()}`,
        moon: moonInterpretation
          ? `Your ${moonInterpretation.title} emotional nature ${moonInterpretation.spiritualMeaning.toLowerCase()}`
          : "Moon placement withheld until exact birth time and timezone are available.",
        rising: risingInterpretation
          ? `You present to the world as ${risingSign}, projecting ${risingInterpretation.keywords.join(', ')} energy`
          : "Rising sign withheld until exact birth time, timezone, and location are available."
      },
      summary: moonInterpretation && risingInterpretation
        ? `As a ${sunSign} Sun with ${moonSign} Moon and ${risingSign} Rising, you embody a unique blend of ${sunInterpretation.keywords[0]}, ${moonInterpretation.keywords[0]}, and ${risingInterpretation.keywords[0]} energies.`
        : `Sun candidate: ${sunSign}. Time-dependent Moon/Rising interpretation is withheld until required birth evidence is present.`
    },
    placements: {
      sun: sunPlacement,
      moon: moonPlacement,
      rising: risingPlacement,
    }
  };
}

export function getTarotBirthCards(birthDate: string): { card1: string; card2: string; interpretation: string } {
  // Correct tarot birth card calculation: sum all digits and reduce to 1-22
  const { day, month, year } = parseDateOnly(birthDate);
  
  // Sum all individual digits (e.g., 15/03/1990 = 1+5+0+3+1+9+9+0 = 28)
  const sumAllDigits = (num: number) => {
    return num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  };
  
  let total = sumAllDigits(day) + sumAllDigits(month) + sumAllDigits(year);
  
  // Reduce to single or double digit (1-22 for Major Arcana)
  while (total > 22) {
    total = sumAllDigits(total);
  }
  
  // If we get 0, map to 22 (The Fool/The World)
  if (total === 0) total = 22;

  // Map numbers 1-22 to tarot pairs
  const tarotCards = [
    { card1: "The Magician", card2: "The Magician", interpretation: "Raw power of manifestation and conscious will" }, // 1
    { card1: "The High Priestess", card2: "Justice", interpretation: "Intuitive wisdom balanced with divine justice" }, // 2 (reduces to 11)
    { card1: "The Empress", card2: "The Hanged Man", interpretation: "Creative abundance through surrender and new perspective" }, // 3 (reduces to 12)
    { card1: "The Emperor", card2: "Death", interpretation: "Structured authority transformed through rebirth" }, // 4 (reduces to 13)
    { card1: "The Hierophant", card2: "Temperance", interpretation: "Sacred wisdom flowing through divine alchemy" }, // 5 (reduces to 14)
    { card1: "The Lovers", card2: "The Devil", interpretation: "Heart-centered choice illuminating shadow and attachment" }, // 6 (reduces to 15)
    { card1: "The Chariot", card2: "The Tower", interpretation: "Directed willpower breaking through limitation" }, // 7 (reduces to 16)
    { card1: "Strength", card2: "The Star", interpretation: "Inner courage birthing hope and divine inspiration" }, // 8 (reduces to 17)
    { card1: "The Hermit", card2: "The Moon", interpretation: "Inner guidance navigating the subconscious depths" }, // 9 (reduces to 18)
    { card1: "Wheel of Fortune", card2: "The Sun", interpretation: "Life's cycles illuminated by radiant consciousness" }, // 10 (reduces to 19)
    { card1: "Justice", card2: "Justice", interpretation: "Divine balance and karmic truth" }, // 11
    { card1: "The Hanged Man", card2: "The Hanged Man", interpretation: "Suspension and surrender to higher wisdom" }, // 12
    { card1: "Death", card2: "Death", interpretation: "Transformation and profound rebirth" }, // 13
    { card1: "Temperance", card2: "Temperance", interpretation: "Alchemical balance and divine moderation" }, // 14
    { card1: "The Devil", card2: "The Devil", interpretation: "Confronting shadow, reclaiming power from bondage" }, // 15
    { card1: "The Tower", card2: "The Tower", interpretation: "Liberation through destruction of false structures" }, // 16
    { card1: "The Star", card2: "The Star", interpretation: "Hope, healing, and connection to cosmic guidance" }, // 17
    { card1: "The Moon", card2: "The Moon", interpretation: "Navigating illusion to access deep intuition" }, // 18
    { card1: "The Sun", card2: "The Sun", interpretation: "Radiant vitality, clarity, and authentic self-expression" }, // 19
    { card1: "Judgement", card2: "Judgement", interpretation: "Awakening, rebirth, and answering your higher calling" }, // 20
    { card1: "The World", card2: "The World", interpretation: "Completion, integration, and cosmic wholeness" }, // 21
    { card1: "The Fool", card2: "The World", interpretation: "Infinite potential dancing with divine completion" } // 22/0
  ];

  return tarotCards[total - 1];
}
