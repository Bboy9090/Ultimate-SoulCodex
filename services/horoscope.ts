import * as Astronomy from 'astronomy-engine';
const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { generateText, isGeminiAvailable } from '../gemini';
import { calculatePersonalDayNumber, getMoonPhase, getMoonSign } from './daily-context';
import { calculateActiveTransits } from '../transits';
import { extractVerifiedAstrology } from '../server/lib/verified-astrology';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const ALL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

const ASPECTS: Record<string, { degrees: number; orb: number; name: string }> = {
  conjunction: { degrees: 0, orb: 8, name: 'Conjunction' },
  opposition: { degrees: 180, orb: 8, name: 'Opposition' },
  square: { degrees: 90, orb: 7, name: 'Square' },
  trine: { degrees: 120, orb: 7, name: 'Trine' },
  sextile: { degrees: 60, orb: 6, name: 'Sextile' },
};

const ASPECT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  'Sun-Moon': {
    Conjunction: 'My conscious will and emotional instincts merge — I act from a unified place today.',
    Opposition: 'I feel pulled between what I want and what I need. Tension between head and heart.',
    Square: 'Inner friction pushes me to reconcile conflicting drives. Growth through discomfort.',
    Trine: 'My energy and emotions flow together naturally. I feel aligned and confident.',
    Sextile: 'Small openings to harmonize my identity with my emotional needs.',
  },
  'Venus-Jupiter': {
    Conjunction: 'Generosity and warmth expand — I attract good things when I stay open.',
    Opposition: 'I may overindulge or over-promise. Balance pleasure with responsibility.',
    Square: 'Desires clash with reality. I want more than what is practical right now.',
    Trine: 'Love, beauty, and opportunity flow effortlessly. A genuinely good day for connection.',
    Sextile: 'Pleasant social openings. Small gestures of kindness create ripple effects.',
  },
  'Mars-Saturn': {
    Conjunction: 'Disciplined energy — I can accomplish hard things if I stay patient.',
    Opposition: 'Frustration builds when effort meets resistance. Channel anger into structure.',
    Square: 'I feel blocked or restricted. The obstacle is showing me where I need to build strength.',
    Trine: 'Steady, productive energy. I can work hard without burning out.',
    Sextile: 'Practical effort pays off. Small disciplined actions compound.',
  },
  'Mercury-Uranus': {
    Conjunction: 'My mind buzzes with original ideas. Breakthroughs in thinking are possible.',
    Opposition: 'Nervous mental energy. I may say something unexpected or hear surprising news.',
    Square: 'Restless thoughts disrupt focus. Let unusual ideas land before reacting.',
    Trine: 'Inventive thinking comes naturally. I see solutions others miss.',
    Sextile: 'Flashes of insight arrive through conversation or reading.',
  },
  'Venus-Saturn': {
    Conjunction: 'Love feels serious today. I value what is real over what is exciting.',
    Opposition: 'Loneliness or emotional distance surfaces. I need to reach out, not withdraw.',
    Square: 'Relationships feel heavy or limiting. What am I tolerating that I should not be?',
    Trine: 'Commitment and loyalty feel stabilizing. Mature love is quiet but strong.',
    Sextile: 'Opportunities to deepen bonds through honesty and responsibility.',
  },
  'Mars-Pluto': {
    Conjunction: 'Intense willpower. I can transform something fundamental if I stay conscious.',
    Opposition: 'Power struggles surface. Someone pushes my buttons — the reaction reveals my shadow.',
    Square: 'Compulsive energy that demands an outlet. Physical activity channels it productively.',
    Trine: 'Deep reserves of strength are available. I can push through barriers.',
    Sextile: 'Subtle power shifts in my favor. Strategic action works better than force.',
  },
};

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  longitude: number;
}

export interface Alignment {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

export interface PersonalTransit {
  transitingPlanet: string;
  transitingSign: string;
  transitingDegree: number;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  aspect: string;
  orb: number;
  interpretation: string;
  intensity: 'high' | 'medium' | 'low';
}

export interface DailyHoroscope {
  date: string;
  horoscope: string;
  planets: PlanetPosition[];
  alignments: Alignment[];
  personalTransits: PersonalTransit[];
  moonPhase: { phase: string; percentage: number };
  personalDayNumber: number;
}

function calculatePlanetLongitude(planet: string, date: Date): number {
  if (planet === 'Moon') {
    return Astro.EclipticGeoMoon(date).lon;
  }
  const body = Astro.Body[planet as keyof typeof Astro.Body];
  const geoVector = Astro.GeoVector(body, date, false);
  const ecliptic = Astro.Ecliptic(geoVector);
  let lon = ecliptic.elon;
  while (lon < 0) lon += 360;
  while (lon >= 360) lon -= 360;
  return lon;
}

function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const idx = Math.floor(longitude / 30) % 12;
  return { sign: SIGNS[idx], degree: longitude % 30 };
}

export function calculateCurrentPlanets(date: Date = new Date()): PlanetPosition[] {
  const planets: PlanetPosition[] = [];
  for (const name of ALL_PLANETS) {
    try {
      const longitude = calculatePlanetLongitude(name, date);
      const { sign, degree } = longitudeToSign(longitude);
      planets.push({ name, sign, degree: Math.round(degree * 100) / 100, longitude: Math.round(longitude * 100) / 100 });
    } catch (err) {
      console.error(`[Horoscope] Failed to calculate ${name}:`, err);
    }
  }
  return planets;
}

function findAspect(lon1: number, lon2: number): { aspect: string; orb: number } | null {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  for (const [, data] of Object.entries(ASPECTS)) {
    const orbDiff = Math.abs(diff - data.degrees);
    if (orbDiff <= data.orb) {
      return { aspect: data.name, orb: Math.round(orbDiff * 100) / 100 };
    }
  }
  return null;
}

function getAlignmentInterpretation(p1: string, p2: string, aspect: string): string {
  const key1 = `${p1}-${p2}`;
  const key2 = `${p2}-${p1}`;
  const entry = ASPECT_INTERPRETATIONS[key1] || ASPECT_INTERPRETATIONS[key2];
  if (entry && entry[aspect]) return entry[aspect];

  const defaults: Record<string, string> = {
    Conjunction: `${p1} and ${p2} merge their energies — I feel this combination amplified today.`,
    Opposition: `${p1} and ${p2} pull in opposite directions — I notice tension asking for balance.`,
    Square: `${p1} and ${p2} create friction — pressure that forces me to adapt and grow.`,
    Trine: `${p1} and ${p2} flow together — things in this area come easier today.`,
    Sextile: `${p1} and ${p2} open a small door — opportunity if I choose to walk through it.`,
  };
  return defaults[aspect] || `${p1} ${aspect.toLowerCase()} ${p2} — pay attention to how these energies interact in my day.`;
}

export function calculateAlignments(planets: PlanetPosition[]): Alignment[] {
  const alignments: Alignment[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const result = findAspect(planets[i].longitude, planets[j].longitude);
      if (result) {
        alignments.push({
          planet1: planets[i].name,
          planet2: planets[j].name,
          aspect: result.aspect,
          orb: result.orb,
          interpretation: getAlignmentInterpretation(planets[i].name, planets[j].name, result.aspect),
        });
      }
    }
  }
  alignments.sort((a, b) => a.orb - b.orb);
  return alignments;
}

function hasVerificationEvidence(value: any): boolean {
  const evidence = value?.evidence ?? value?.provenance;
  return Boolean(
    value?.verificationStatus === 'verified' &&
    evidence?.source &&
    evidence?.engine &&
    evidence?.calculatedAt
  );
}

function placementLongitude(value: any): number | null {
  const candidate = value?.internalCandidate?.longitude ?? value?.longitude;
  if (typeof candidate !== 'number' || !Number.isFinite(candidate)) return null;

  // Modulo normalization can introduce IEEE-754 noise (for example
  // 174.2 -> 174.20000000000005). Keep the verified source longitude
  // numerically stable without reducing meaningful ephemeris precision.
  const normalized = ((candidate % 360) + 360) % 360;
  return Math.round(normalized * 1e12) / 1e12;
}

export function extractVerifiedNatalPositions(profile: any): Record<string, { longitude: number; sign: string }> {
  const astrology = profile?.astrologyData ?? {};
  const positions: Record<string, { longitude: number; sign: string }> = {};
  const sourcePlanets = astrology?.planets ?? {};

  for (const [key, value] of Object.entries(sourcePlanets)) {
    const placement = value as any;
    const longitude = placementLongitude(placement);
    if (!hasVerificationEvidence(placement) || longitude === null || typeof placement.sign !== 'string') continue;
    positions[key.charAt(0).toUpperCase() + key.slice(1)] = { longitude, sign: placement.sign };
  }

  for (const [label, key] of [['Sun', 'sun'], ['Moon', 'moon']] as const) {
    if (positions[label]) continue;
    const placement = astrology?.[key];
    const longitude = placementLongitude(placement);
    if (hasVerificationEvidence(placement) && longitude !== null && typeof placement.sign === 'string') {
      positions[label] = { longitude, sign: placement.sign };
    }
  }

  const rising = astrology?.rising ?? astrology?.ascendant;
  const risingLongitude = placementLongitude(rising);
  if (hasVerificationEvidence(rising) && risingLongitude !== null && typeof rising.sign === 'string') {
    positions.Ascendant = { longitude: risingLongitude, sign: rising.sign };
  }

  const midheaven = astrology?.midheaven;
  const midheavenLongitude = placementLongitude(midheaven);
  if (hasVerificationEvidence(midheaven) && midheavenLongitude !== null && typeof midheaven.sign === 'string') {
    positions.Midheaven = { longitude: midheavenLongitude, sign: midheaven.sign };
  }

  return positions;
}

export function calculatePersonalTransitsFromProfile(profile: any, date: Date = new Date()): PersonalTransit[] {
  const natalPositions = extractVerifiedNatalPositions(profile);
  if (Object.keys(natalPositions).length === 0) return [];
  const activeTransits = calculateActiveTransits(natalPositions, date);
  return activeTransits.transits.map(t => ({
    transitingPlanet: t.planet,
    transitingSign: t.transitingSign,
    transitingDegree: t.transitingDegree,
    natalPlanet: t.natalPlanet,
    natalSign: t.natalSign,
    natalDegree: t.natalDegree,
    aspect: t.aspect,
    orb: t.orb,
    interpretation: t.interpretation,
    intensity: t.intensity,
  }));
}

async function generateAIHoroscope(
  profile: any,
  planets: PlanetPosition[],
  alignments: Alignment[],
  personalTransits: PersonalTransit[],
  moonPhase: { phase: string; percentage: number },
  personalDayNumber: number,
): Promise<string> {
  const name = profile.name || 'you';
  const verifiedAstrology = extractVerifiedAstrology(profile);
  const sunSign = verifiedAstrology.sun || 'Unresolved';
  const moonSign = verifiedAstrology.moon || 'Unresolved';
  const currentMoonSign = planets.find((planet) => planet.name === 'Moon')?.sign || 'Unresolved';

  const topAlignments = alignments.slice(0, 3).map(a => `${a.planet1} ${a.aspect} ${a.planet2} (orb ${a.orb}°)`).join(', ');
  const topTransits = personalTransits.slice(0, 3).map(t => `${t.transitingPlanet} ${t.aspect} natal ${t.natalPlanet}`).join(', ');

  const prompt = `
You are the final synthesis layer of Soul Codex.
Your job is to expose ${name}'s behavioral pattern today with surgical accuracy, grounded realism, and zero system leakage.

Evidence layers:
- Verified natal Sun: ${sunSign}
- Verified natal Moon: ${moonSign}
- Current Moon sign: ${currentMoonSign}
- Calculated current-sky alignments: ${topAlignments || 'no major alignments'}
- Personal transits: ${topTransits || 'none exact today'}
- Moon phase: ${moonPhase.phase}
- Personal day number: ${personalDayNumber}

CORE DIRECTIVE:
- Write in FIRST PERSON (I/my/me) as if ${name} is reading their own inner voice.
- Write a reflection hypothesis, not a diagnosis or prediction. Focus on an observable behavior the user can confirm or reject.
- Verified natal placements may explain a symbolic lens; current sky may supply context; neither proves a mood, event, or personality trait.
- One sentence for the possible loop, one for the observable tension, one for a practical experiment.

🚫 HARD BLOCKS:
- No "cosmic signature", "sacred blueprint", "divine timing", "vibrational frequency".
- No advice or suggestions.
- If a natal field is Unresolved, do not infer it or use it as personality evidence.
- Do not claim astrology or numerology caused an event, feeling, or decision.
- No poetic filler.

Return ONLY the behavioral synthesis text (2-3 sentences).
`;

  if (!isGeminiAvailable()) {
    return generateFallbackHoroscope(currentMoonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  }

  try {
    const result = await generateText({ model: 'gemini-2.5-flash', temperature: 0.8, prompt });
    if (result && result.trim().length > 20) return result.trim();
    return generateFallbackHoroscope(currentMoonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  } catch (err) {
    console.error('[Horoscope] AI generation failed, using fallback:', err);
    return generateFallbackHoroscope(currentMoonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  }
}

function generateFallbackHoroscope(
  currentMoonSign: string,
  moonPhase: { phase: string; percentage: number },
  personalDayNumber: number,
  alignments: Alignment[],
  personalTransits: PersonalTransit[],
): string {
  const dayThemes: Record<number, string> = {
    1: 'Personal Day 1 lens: choose one concrete beginning and define the first visible step.',
    2: 'Personal Day 2 lens: test whether listening, coordination, or patience improves the next interaction.',
    3: 'Personal Day 3 lens: put one idea into words or a creative form and see what becomes clearer.',
    4: 'Personal Day 4 lens: create one small piece of structure that makes the rest of the day easier to navigate.',
    5: 'Personal Day 5 lens: introduce one deliberate change instead of treating restlessness as a command.',
    6: 'Personal Day 6 lens: choose one responsibility worth caring for and set a boundary around the rest.',
    7: 'Personal Day 7 lens: make room for reflection, then separate what you observed from what you assumed.',
    8: 'Personal Day 8 lens: review one decision involving resources, authority, or execution and make the next criterion explicit.',
    9: 'Personal Day 9 lens: close one open loop that no longer needs more analysis.',
    11: 'Personal Day 11 lens: record the first impression, then verify it before treating intuition as fact.',
    22: 'Personal Day 22 lens: turn one ambitious idea into a load-bearing step you can actually complete.',
    33: 'Personal Day 33 lens: choose one act of care that is sustainable rather than overextending yourself.',
  };

  const dayMessage = dayThemes[personalDayNumber] || dayThemes[personalDayNumber % 10] || dayThemes[1]!;

  let transitNote = '';
  if (personalTransits.length > 0) {
    const top = personalTransits[0];
    transitNote = ` Verified personal transit: ${top.transitingPlanet} ${top.aspect.toLowerCase()} natal ${top.natalPlanet}. Symbolic transit lens: ${top.interpretation.split('.')[0]}.`;
  }

  let alignmentNote = '';
  if (alignments.length > 0) {
    const top = alignments[0];
    alignmentNote = ` Current-sky aspect lens: ${top.interpretation.split('.')[0]}.`;
  }

  const phaseLens = moonPhase.phase.includes('Waxing')
    ? 'building momentum'
    : moonPhase.phase.includes('Waning')
      ? 'reviewing what can be released'
      : moonPhase.phase.includes('Full')
        ? 'reviewing what has become visible'
        : 'choosing one new intention';

  return `${dayMessage}${transitNote}${alignmentNote} Current Moon: ${currentMoonSign}, ${moonPhase.phase}. I use that calculated sky state as a symbolic prompt for ${phaseLens}, not as proof of a mood or event.`;
}

const horoscopeCache = new Map<string, DailyHoroscope>();

/** Get date string in user's timezone for cache key (production checklist: timezone + date) */
function getDateKeyInTimezone(now: Date, timezone: string | null | undefined): string {
  if (!timezone) return now.toISOString().split('T')[0];
  try {
    const zoned = toZonedTime(now, timezone);
    return format(zoned, 'yyyy-MM-dd');
  } catch {
    return now.toISOString().split('T')[0];
  }
}

export async function generateDailyHoroscope(profile: any): Promise<DailyHoroscope> {
  const now = new Date();
  const tz = profile.timezone || 'UTC';
  const dateKey = getDateKeyInTimezone(now, tz);
  const profileUpdatedAt = profile.updatedAt ? String(profile.updatedAt) : '';
  const cacheKey = `${profile.id}+${dateKey}+${tz}+${profileUpdatedAt}`;

  const cached = horoscopeCache.get(cacheKey);
  if (cached) return cached;

  const planets = calculateCurrentPlanets(now);
  const alignments = calculateAlignments(planets);
  const personalTransits = calculatePersonalTransitsFromProfile(profile, now);
  const moonPhase = getMoonPhase(now);
  const personalDayNumber = calculatePersonalDayNumber(profile.birthDate, now);

  const horoscope = await generateAIHoroscope(profile, planets, alignments, personalTransits, moonPhase, personalDayNumber);

  const result: DailyHoroscope = {
    date: dateKey,
    horoscope,
    planets,
    alignments,
    personalTransits,
    moonPhase,
    personalDayNumber,
  };

  horoscopeCache.set(cacheKey, result);
  return result;
}
