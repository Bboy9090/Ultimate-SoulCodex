import * as Astronomy from 'astronomy-engine';
import { fromZonedTime } from 'date-fns-tz';

// Lahiri Ayanamsa for sidereal zodiac conversion (approximate for current era)
// This is the difference between tropical and sidereal zodiac
const AYANAMSA_2025 = 24.2; // degrees

// 27 Nakshatras (Lunar Mansions)
const NAKSHATRAS = [
  { name: "Ashwini", deity: "Ashwini Kumaras", symbol: "Horse's head", element: "Earth", quality: "Light", ruler: "Ketu", keywords: ["Healing", "Speed", "Initiative"] },
  { name: "Bharani", deity: "Yama", symbol: "Yoni", element: "Earth", quality: "Fierce", ruler: "Venus", keywords: ["Transformation", "Restraint", "Nurturing"] },
  { name: "Krittika", deity: "Agni", symbol: "Razor", element: "Fire", quality: "Mixed", ruler: "Sun", keywords: ["Cutting through", "Purification", "Determination"] },
  { name: "Rohini", deity: "Brahma", symbol: "Ox cart", element: "Earth", quality: "Fixed", ruler: "Moon", keywords: ["Growth", "Fertility", "Beauty"] },
  { name: "Mrigashira", deity: "Soma", symbol: "Deer's head", element: "Earth", quality: "Soft", ruler: "Mars", keywords: ["Seeking", "Gentleness", "Curiosity"] },
  { name: "Ardra", deity: "Rudra", symbol: "Teardrop", element: "Water", quality: "Sharp", ruler: "Rahu", keywords: ["Storm", "Transformation", "Clarity"] },
  { name: "Punarvasu", deity: "Aditi", symbol: "Bow and quiver", element: "Water", quality: "Movable", ruler: "Jupiter", keywords: ["Renewal", "Return", "Abundance"] },
  { name: "Pushya", deity: "Brihaspati", symbol: "Udder of cow", element: "Water", quality: "Light", ruler: "Saturn", keywords: ["Nourishment", "Spirituality", "Protection"] },
  { name: "Ashlesha", deity: "Nagas", symbol: "Serpent", element: "Water", quality: "Sharp", ruler: "Mercury", keywords: ["Kundalini", "Wisdom", "Penetration"] },
  { name: "Magha", deity: "Pitris", symbol: "Throne", element: "Water", quality: "Fierce", ruler: "Ketu", keywords: ["Ancestry", "Authority", "Tradition"] },
  { name: "Purva Phalguni", deity: "Bhaga", symbol: "Front legs of bed", element: "Water", quality: "Fierce", ruler: "Venus", keywords: ["Pleasure", "Creativity", "Relaxation"] },
  { name: "Uttara Phalguni", deity: "Aryaman", symbol: "Back legs of bed", element: "Fire", quality: "Fixed", ruler: "Sun", keywords: ["Partnership", "Generosity", "Patronage"] },
  { name: "Hasta", deity: "Savitar", symbol: "Hand", element: "Fire", quality: "Light", ruler: "Moon", keywords: ["Skill", "Craft", "Manifestation"] },
  { name: "Chitra", deity: "Vishvakarma", symbol: "Bright jewel", element: "Fire", quality: "Soft", ruler: "Mars", keywords: ["Beauty", "Artistry", "Illusion"] },
  { name: "Swati", deity: "Vayu", symbol: "Young plant", element: "Fire", quality: "Movable", ruler: "Rahu", keywords: ["Independence", "Flexibility", "Commerce"] },
  { name: "Vishakha", deity: "Indra-Agni", symbol: "Triumphal arch", element: "Fire", quality: "Mixed", ruler: "Jupiter", keywords: ["Purpose", "Determination", "Achievement"] },
  { name: "Anuradha", deity: "Mitra", symbol: "Lotus", element: "Water", quality: "Soft", ruler: "Saturn", keywords: ["Friendship", "Devotion", "Success"] },
  { name: "Jyeshtha", deity: "Indra", symbol: "Earring", element: "Air", quality: "Sharp", ruler: "Mercury", keywords: ["Seniority", "Protection", "Power"] },
  { name: "Mula", deity: "Nirriti", symbol: "Roots", element: "Air", quality: "Sharp", ruler: "Ketu", keywords: ["Foundation", "Investigation", "Destruction"] },
  { name: "Purva Ashadha", deity: "Apas", symbol: "Elephant tusk", element: "Air", quality: "Fierce", ruler: "Venus", keywords: ["Invincibility", "Purification", "Victory"] },
  { name: "Uttara Ashadha", deity: "Vishvadevas", symbol: "Planks of bed", element: "Air", quality: "Fixed", ruler: "Sun", keywords: ["Permanence", "Leadership", "Righteousness"] },
  { name: "Shravana", deity: "Vishnu", symbol: "Ear", element: "Air", quality: "Movable", ruler: "Moon", keywords: ["Listening", "Learning", "Connection"] },
  { name: "Dhanishta", deity: "Vasus", symbol: "Drum", element: "Ether", quality: "Movable", ruler: "Mars", keywords: ["Abundance", "Music", "Adaptability"] },
  { name: "Shatabhisha", deity: "Varuna", symbol: "Empty circle", element: "Ether", quality: "Movable", ruler: "Rahu", keywords: ["Healing", "Mystery", "Independence"] },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", symbol: "Front of funeral cot", element: "Ether", quality: "Fierce", ruler: "Jupiter", keywords: ["Intensity", "Renunciation", "Transformation"] },
  { name: "Uttara Bhadrapada", deity: "Ahir Budhnya", symbol: "Back of funeral cot", element: "Ether", quality: "Fixed", ruler: "Saturn", keywords: ["Depth", "Wisdom", "Liberation"] },
  { name: "Revati", deity: "Pushan", symbol: "Drum for keeping time", element: "Ether", quality: "Soft", ruler: "Mercury", keywords: ["Nourishment", "Journey's end", "Prosperity"] }
];

// Vimshottari Dasha System - 120 year cycle
const DASHA_PERIODS = [
  { planet: "Ketu", years: 7 },
  { planet: "Venus", years: 20 },
  { planet: "Sun", years: 6 },
  { planet: "Moon", years: 10 },
  { planet: "Mars", years: 7 },
  { planet: "Rahu", years: 18 },
  { planet: "Jupiter", years: 16 },
  { planet: "Saturn", years: 19 },
  { planet: "Mercury", years: 17 }
];

interface VedicPlanet {
  tropicalLongitude: number;
  siderealLongitude: number;
  sign: string;
  degree: number;
  nakshatra: {
    name: string;
    pada: number;
    deity: string;
    symbol: string;
    ruler: string;
    keywords: string[];
  };
  interpretation: {
    title: string;
    description: string;
    spiritualMeaning: string;
    karmaLessons: string[];
  };
}

interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
}

interface VedicAstrologyData {
  moonNakshatra: {
    name: string;
    pada: number;
    deity: string;
    symbol: string;
    ruler: string;
    interpretation: string;
  };
  ascendantNakshatra: {
    name: string;
    pada: number;
    deity: string;
    symbol: string;
    ruler: string;
  };
  planets: {
    sun: VedicPlanet;
    moon: VedicPlanet;
    mercury: VedicPlanet;
    venus: VedicPlanet;
    mars: VedicPlanet;
    jupiter: VedicPlanet;
    saturn: VedicPlanet;
    rahu: VedicPlanet;
    ketu: VedicPlanet;
  };
  currentDasha: DashaPeriod;
  allDashas: DashaPeriod[];
  rashiChart: {
    ascendant: string;
    houses: string[];
  };
  interpretation: {
    summary: string;
    dharma: string; // Life purpose
    karma: string; // Karmic patterns
    artha: string; // Wealth & resources
    moksha: string; // Spiritual liberation
  };
}

// Convert tropical longitude to sidereal (Vedic)
function tropicalToSidereal(tropicalLongitude: number): number {
  let sidereal = tropicalLongitude - AYANAMSA_2025;
  if (sidereal < 0) sidereal += 360;
  return sidereal % 360;
}

// Get Vedic sign from sidereal longitude
function getVedicSign(siderealLongitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(siderealLongitude / 30);
  return signs[signIndex % 12];
}

// Calculate Nakshatra from sidereal Moon position
function calculateNakshatra(siderealLongitude: number): { index: number; pada: number; data: typeof NAKSHATRAS[0] } {
  // Each nakshatra is 13°20' (13.333°)
  const nakshatraSize = 13.333333;
  const nakshatraIndex = Math.floor(siderealLongitude / nakshatraSize);
  
  // Pada is 1/4 of nakshatra (3°20')
  const positionInNakshatra = siderealLongitude % nakshatraSize;
  const pada = Math.floor(positionInNakshatra / (nakshatraSize / 4)) + 1;
  
  return {
    index: nakshatraIndex,
    pada,
    data: NAKSHATRAS[nakshatraIndex]
  };
}

// Calculate Vimshottari Dasha periods from birth
function calculateDashas(birthDate: string, moonSiderealLongitude: number): { current: DashaPeriod; all: DashaPeriod[] } {
  const birth = new Date(birthDate);
  const moonNakshatra = calculateNakshatra(moonSiderealLongitude);
  
  // Find starting dasha based on Moon's nakshatra ruler
  const nakshatraRuler = moonNakshatra.data.ruler;
  const startDashaIndex = DASHA_PERIODS.findIndex(d => d.planet === nakshatraRuler);
  
  // Calculate position within the nakshatra to determine how much of the dasha is left
  const nakshatraSize = 13.333333;
  const positionInNakshatra = moonSiderealLongitude % nakshatraSize;
  const proportionCompleted = positionInNakshatra / nakshatraSize;
  
  const allDashas: DashaPeriod[] = [];
  let currentDate = new Date(birth);
  
  // Calculate remaining portion of birth dasha
  const firstDasha = DASHA_PERIODS[startDashaIndex];
  const remainingYears = firstDasha.years * (1 - proportionCompleted);
  const firstEndDate = new Date(birth);
  firstEndDate.setFullYear(firstEndDate.getFullYear() + remainingYears);
  
  allDashas.push({
    planet: firstDasha.planet,
    startDate: new Date(birth),
    endDate: firstEndDate,
    years: remainingYears
  });
  
  currentDate = firstEndDate;
  
  // Calculate remaining dashas
  for (let i = 1; i < DASHA_PERIODS.length; i++) {
    const dashaIndex = (startDashaIndex + i) % DASHA_PERIODS.length;
    const dasha = DASHA_PERIODS[dashaIndex];
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + dasha.years);
    
    allDashas.push({
      planet: dasha.planet,
      startDate: new Date(currentDate),
      endDate,
      years: dasha.years
    });
    
    currentDate = endDate;
  }
  
  // Find current dasha
  const now = new Date();
  const currentDasha = allDashas.find(d => d.startDate <= now && d.endDate >= now) || allDashas[0];
  
  return { current: currentDasha, all: allDashas.slice(0, 5) }; // Return current + next 4
}

// Get planet interpretation in Vedic context
function getVedicPlanetInterpretation(planet: string, sign: string, nakshatra: typeof NAKSHATRAS[0]): {
  title: string;
  description: string;
  spiritualMeaning: string;
  karmaLessons: string[];
} {
  const interpretations: any = {
    sun: {
      title: `${sign} Sun in ${nakshatra.name}`,
      description: `Your soul's divine essence expresses through ${sign} energy, refined by the spiritual qualities of ${nakshatra.name}. This placement reveals your dharma (life purpose) and how you shine your light in the world.`,
      spiritualMeaning: `The Sun in ${nakshatra.name} nakshatra indicates a soul journey focused on ${nakshatra.keywords.join(', ')}. Your inner deity ${nakshatra.deity} guides your path.`,
      karmaLessons: [`Integrate ${sign} qualities with ${nakshatra.name} wisdom`, `Honor ${nakshatra.deity} through righteous action`, `Express ${nakshatra.keywords[0]} in your life purpose`]
    },
    moon: {
      title: `${sign} Moon in ${nakshatra.name}`,
      description: `Your emotional nature and mind are colored by ${nakshatra.name} nakshatra in ${sign}. This is your Janma Nakshatra (birth star), the most important placement in Vedic astrology.`,
      spiritualMeaning: `Born under ${nakshatra.name}, ruled by ${nakshatra.ruler}, your mind seeks ${nakshatra.keywords.join(' and ')}. The deity ${nakshatra.deity} blesses your emotional journey.`,
      karmaLessons: [`Cultivate ${nakshatra.keywords[0]} in daily life`, `Work with ${nakshatra.ruler} energy for mental peace`, `Honor the ${nakshatra.symbol} as your sacred symbol`]
    },
    mars: {
      title: `${sign} Mars in ${nakshatra.name}`,
      description: `Your courage, action, and warrior spirit manifest through ${sign} filtered through ${nakshatra.name}'s spiritual lens.`,
      spiritualMeaning: `Mars in ${nakshatra.name} shows how you take action aligned with ${nakshatra.keywords.join(', ')}.`,
      karmaLessons: [`Channel warrior energy through ${nakshatra.keywords[0]}`, `Balance action with ${nakshatra.deity}'s wisdom`, `Use ${sign} courage for dharmic purposes`]
    }
  };
  
  return interpretations[planet] || {
    title: `${sign} ${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${nakshatra.name}`,
    description: `This placement brings ${nakshatra.keywords.join(', ')} energy to your ${planet} expression.`,
    spiritualMeaning: `${nakshatra.deity} guides your ${planet} journey through ${nakshatra.name}.`,
    karmaLessons: [`Integrate ${nakshatra.keywords[0]} into ${planet} expression`]
  };
}

export function calculateVedicAstrology(params: {
  birthDate: string;
  birthTime: string;
  timezone: string;
  latitude: number;
  longitude: number;
}): VedicAstrologyData {
  const { birthDate, birthTime, timezone, latitude, longitude } = params;
  
  // Parse birth datetime
  const dateTimeParts = `${birthDate}T${birthTime}`;
  const zonedDate = fromZonedTime(new Date(dateTimeParts), timezone);
  
  // Calculate planetary positions (tropical)
  const sunEcl = Astronomy.Ecliptic(Astronomy.SunPosition(zonedDate));
  const moonEcl = Astronomy.EclipticGeoMoon(zonedDate);
  const mercuryVec = Astronomy.GeoVector(Astronomy.Body.Mercury, zonedDate, false);
  const mercuryEcl = Astronomy.Ecliptic(mercuryVec);
  const venusVec = Astronomy.GeoVector(Astronomy.Body.Venus, zonedDate, false);
  const venusEcl = Astronomy.Ecliptic(venusVec);
  const marsVec = Astronomy.GeoVector(Astronomy.Body.Mars, zonedDate, false);
  const marsEcl = Astronomy.Ecliptic(marsVec);
  const jupiterVec = Astronomy.GeoVector(Astronomy.Body.Jupiter, zonedDate, false);
  const jupiterEcl = Astronomy.Ecliptic(jupiterVec);
  const saturnVec = Astronomy.GeoVector(Astronomy.Body.Saturn, zonedDate, false);
  const saturnEcl = Astronomy.Ecliptic(saturnVec);
  
  // Calculate Rahu (North Node) and Ketu (South Node) - PROPER CALCULATION
  // Rahu = Moon's North Node (Ascending Node) in sidereal zodiac
  // Ketu = Moon's South Node (Descending Node) in sidereal zodiac
  // Uses proper lunar node calculation matching Western astrology standard
  const observer: Astronomy.Observer = { latitude, longitude, height: 0 };
  const nodeEvent = Astronomy.SearchMoonNode(zonedDate);
  const nodeTime = nodeEvent.time.date;
  const daysSinceNode = (zonedDate.getTime() - nodeTime.getTime()) / (1000 * 60 * 60 * 24);
  const nodeRetrogradeDegrees = daysSinceNode * 0.0529; // Moon nodes move ~0.0529° per day retrograde
  
  const currentMoonEq = Astronomy.Equator(Astronomy.Body.Moon, nodeTime, observer, true, true);
  const currentMoonEcl = Astronomy.Ecliptic(currentMoonEq.vec);
  const nodeAtEventLongitude = currentMoonEcl.elon;
  
  let northNodeLongitudeTropical = (nodeAtEventLongitude - nodeRetrogradeDegrees + 360) % 360;
  if (nodeEvent.kind !== Astronomy.NodeEventKind.Ascending) {
    northNodeLongitudeTropical = (northNodeLongitudeTropical + 180) % 360;
  }
  
  // Convert to sidereal zodiac (Rahu/Ketu are always calculated in sidereal)
  const rahuLongitude = tropicalToSidereal(northNodeLongitudeTropical);
  const ketuLongitude = (rahuLongitude + 180) % 360;
  
  // Calculate ascendant (sidereal) - simplified calculation
  const siderealTime = Astronomy.SiderealTime(zonedDate);
  const ascendantTropical = siderealTime * 15; // Convert hours to degrees
  const ascendantSidereal = tropicalToSidereal(ascendantTropical);
  
  // Process planets
  const processPlanet = (name: string, tropicalLon: number): VedicPlanet => {
    const siderealLon = tropicalToSidereal(tropicalLon);
    const sign = getVedicSign(siderealLon);
    const degree = siderealLon % 30;
    const nakshatra = calculateNakshatra(siderealLon);
    
    return {
      tropicalLongitude: tropicalLon,
      siderealLongitude: siderealLon,
      sign,
      degree,
      nakshatra: {
        name: nakshatra.data.name,
        pada: nakshatra.pada,
        deity: nakshatra.data.deity,
        symbol: nakshatra.data.symbol,
        ruler: nakshatra.data.ruler,
        keywords: nakshatra.data.keywords
      },
      interpretation: getVedicPlanetInterpretation(name, sign, nakshatra.data)
    };
  };
  
  const moonSidereal = tropicalToSidereal(moonEcl.lon);
  const moonNakshatra = calculateNakshatra(moonSidereal);
  const ascendantNakshatra = calculateNakshatra(ascendantSidereal);
  
  const dashas = calculateDashas(birthDate, moonSidereal);
  
  return {
    moonNakshatra: {
      name: moonNakshatra.data.name,
      pada: moonNakshatra.pada,
      deity: moonNakshatra.data.deity,
      symbol: moonNakshatra.data.symbol,
      ruler: moonNakshatra.data.ruler,
      interpretation: `Born under ${moonNakshatra.data.name} nakshatra, your mind and emotions are blessed by ${moonNakshatra.data.deity}. This lunar mansion brings ${moonNakshatra.data.keywords.join(', ')} to your spiritual journey.`
    },
    ascendantNakshatra: {
      name: ascendantNakshatra.data.name,
      pada: ascendantNakshatra.pada,
      deity: ascendantNakshatra.data.deity,
      symbol: ascendantNakshatra.data.symbol,
      ruler: ascendantNakshatra.data.ruler
    },
    planets: {
      sun: processPlanet('sun', sunEcl.lon),
      moon: processPlanet('moon', moonEcl.lon),
      mercury: processPlanet('mercury', mercuryEcl.lon),
      venus: processPlanet('venus', venusEcl.lon),
      mars: processPlanet('mars', marsEcl.lon),
      jupiter: processPlanet('jupiter', jupiterEcl.lon),
      saturn: processPlanet('saturn', saturnEcl.lon),
      rahu: processPlanet('rahu', rahuLongitude),
      ketu: processPlanet('ketu', ketuLongitude)
    },
    currentDasha: dashas.current,
    allDashas: dashas.all,
    rashiChart: {
      ascendant: getVedicSign(ascendantSidereal),
      houses: Array.from({ length: 12 }, (_, i) => getVedicSign((ascendantSidereal + i * 30) % 360))
    },
    interpretation: {
      summary: `In Vedic astrology, your ${moonNakshatra.data.name} Moon nakshatra reveals your deepest nature. Currently in ${dashas.current.planet} dasha, this planetary period shapes your life experiences.`,
      dharma: `Your life purpose (dharma) is illuminated by ${moonNakshatra.data.deity}, guiding you toward ${moonNakshatra.data.keywords[0]}.`,
      karma: `Karmic patterns from past lives manifest through ${moonNakshatra.data.name}, teaching lessons of ${moonNakshatra.data.keywords.join(' and ')}.`,
      artha: `Wealth and resources flow when you align with ${dashas.current.planet} dasha energies and honor ${moonNakshatra.data.ruler}.`,
      moksha: `Spiritual liberation comes through transcending ${moonNakshatra.data.name}'s lessons and embracing ${moonNakshatra.data.deity}'s grace.`
    }
  };
}
