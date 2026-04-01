import * as Astronomy from 'astronomy-engine';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { generateText, isGeminiAvailable } from './gemini';
import { calculatePersonalDayNumber, getMoonPhase, getMoonSign } from './daily-context';
import { calculateActiveTransits, extractNatalPositions } from './transits';

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
    Square: 'Compulsive energy that demands an outlet. Physical activity prevents destructive patterns.',
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
    return Astronomy.EclipticGeoMoon(date).lon;
  }
  const body = Astronomy.Body[planet as keyof typeof Astronomy.Body];
  const geoVector = Astronomy.GeoVector(body, date, false);
  const ecliptic = Astronomy.Ecliptic(geoVector);
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

export function calculatePersonalTransitsFromProfile(profile: any, date: Date = new Date()): PersonalTransit[] {
  if (!profile.astrologyData) return [];
  const natalPositions = extractNatalPositions(profile.astrologyData);
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
  const sunSign = profile.astrologyData?.sunSign || 'Unknown';
  const moonSign = profile.astrologyData?.moonSign || 'Unknown';

  const topAlignments = alignments.slice(0, 3).map(a => `${a.planet1} ${a.aspect} ${a.planet2} (orb ${a.orb}°)`).join(', ');
  const topTransits = personalTransits.slice(0, 3).map(t => `${t.transitingPlanet} ${t.aspect} natal ${t.natalPlanet}`).join(', ');

  const prompt = `Write a daily horoscope for ${name} (Sun in ${sunSign}, Moon in ${moonSign}).

Today's sky: ${topAlignments || 'no major alignments'}.
Personal transits: ${topTransits || 'none exact today'}.
Moon phase: ${moonPhase.phase} (${moonPhase.percentage}% illuminated).
Personal day number: ${personalDayNumber}.

FORMAT — use this exact structure:

**Observation**
What I'm likely experiencing today — specific, behavioral (1-2 sentences)

**Meaning**
Why it matters — the pattern or tension driving it (1 sentence)

**Action**
What to do about it — concrete, immediate (1 sentence)

RULES:
- Write in FIRST PERSON (I/my/me) as if ${name} is reading their own inner voice.
- Use behavioral, concrete language. Describe what I might feel, do, or notice today.
- BANNED PHRASES (do NOT use): "cosmic signature", "sacred blueprint", "divine timing", "vibrational frequency", "holistic convergence", "incarnation", "celestial", "universe is telling you", "spiritual journey", "cosmic dance", "soul's evolution", "a shift is happening", "energy is present", "a door is opening".
- Every sentence must describe something real — a behavior, decision, conversation, or habit.
- No metaphors. No poetic padding. No vague encouragement.
- Direct and useful.

Return only the horoscope text in the format above.`;

  if (!isGeminiAvailable()) {
    return generateFallbackHoroscope(sunSign, moonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  }

  try {
    const result = await generateText({ model: 'gemini-2.5-flash', temperature: 0.8, prompt });
    if (result && result.trim().length > 20) return result.trim();
    return generateFallbackHoroscope(sunSign, moonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  } catch (err) {
    console.error('[Horoscope] AI generation failed, using fallback:', err);
    return generateFallbackHoroscope(sunSign, moonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  }
}

function generateFallbackHoroscope(
  sunSign: string,
  moonSign: string,
  moonPhase: { phase: string; percentage: number },
  personalDayNumber: number,
  alignments: Alignment[],
  personalTransits: PersonalTransit[],
): string {
  const dayThemes: Record<number, string> = {
    1: 'I feel a push to start something new — initiative comes naturally if I stop overthinking.',
    2: 'I do better today by listening more than talking. Cooperation over competition.',
    3: 'My words carry weight today. Expressing what I actually feel unlocks stuck energy.',
    4: 'Structure calms me down today. Making a list or organizing my space resets my focus.',
    5: 'Restlessness means I need variety. Break a routine — even a small one.',
    6: 'Responsibility pulls at me. I show up for someone today and it matters more than I think.',
    7: 'I need space to think. Solitude is not avoidance today — it is fuel.',
    8: 'Power dynamics surface. I notice where I give my authority away and I stop doing it.',
    9: 'Completion energy. I finish what I have been avoiding and feel lighter for it.',
    11: 'Heightened intuition. I trust the first instinct before my mind talks me out of it.',
    22: 'I can build something lasting today if I commit to the work instead of the idea.',
    33: 'My presence matters more than my performance. Just being steady helps others around me.',
  };

  const dayMessage = dayThemes[personalDayNumber] || dayThemes[personalDayNumber % 10] || dayThemes[1]!;

  let transitNote = '';
  if (personalTransits.length > 0) {
    const top = personalTransits[0];
    transitNote = ` ${top.transitingPlanet} ${top.aspect.toLowerCase()} my natal ${top.natalPlanet} — ${top.interpretation.split('.')[0]}.`;
  }

  let alignmentNote = '';
  if (alignments.length > 0) {
    const top = alignments[0];
    alignmentNote = ` ${top.interpretation.split('.')[0]}.`;
  }

  return `${dayMessage}${transitNote}${alignmentNote} The ${moonPhase.phase.toLowerCase()} in ${moonSign} reminds me to ${moonPhase.phase.includes('Waxing') ? 'build momentum' : moonPhase.phase.includes('Waning') ? 'release what is not working' : moonPhase.phase.includes('Full') ? 'see clearly what I have been avoiding' : 'plant a seed of intention'}.`;
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
