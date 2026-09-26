import * as Astronomy from 'astronomy-engine';
const Astro: typeof Astronomy = (Astronomy as any).default ?? Astronomy;
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
    Conjunction: 'I can use this Sun-Moon conjunction as a prompt to compare what I intend with what I am actually feeling.',
    Opposition: 'I can look for places where stated goals and emotional needs are pulling in different directions.',
    Square: 'I can treat this square as a prompt to notice friction between intention and emotional response without assuming conflict is inevitable.',
    Trine: 'I can notice where intention and emotional response already support each other and where they do not.',
    Sextile: 'I can look for a practical way to coordinate identity goals with emotional needs.',
  },
  'Venus-Jupiter': {
    Conjunction: 'I can use this conjunction to review where generosity, pleasure, or optimism may be influencing my choices.',
    Opposition: 'I can check whether enthusiasm is outrunning practical limits or commitments.',
    Square: 'I can compare what feels desirable with what is actually affordable, sustainable, or appropriate.',
    Trine: 'I can notice where social ease or generosity is present without assuming opportunity is guaranteed.',
    Sextile: 'I can look for a low-risk opening to practice generosity or connection intentionally.',
  },
  'Mars-Saturn': {
    Conjunction: 'I can use this conjunction to review how effort, restraint, and patience are interacting in a current task.',
    Opposition: 'I can distinguish genuine external limits from frustration about slower progress.',
    Square: 'I can use the friction as a prompt to identify whether the plan, pace, or constraint needs adjustment.',
    Trine: 'I can notice where disciplined effort is already sustainable rather than assuming productivity will come automatically.',
    Sextile: 'I can choose one structured action and observe whether it actually improves progress.',
  },
  'Mercury-Uranus': {
    Conjunction: 'I can capture unusual ideas without treating novelty as proof that they are correct.',
    Opposition: 'I can slow down surprising information or reactions long enough to verify them before responding.',
    Square: 'I can separate useful originality from distraction before changing direction.',
    Trine: 'I can notice unconventional connections while still checking them against evidence.',
    Sextile: 'I can use conversation or reading to test a new idea rather than assuming insight has arrived fully formed.',
  },
  'Venus-Saturn': {
    Conjunction: 'I can review what commitment, care, and limits look like in a relationship or value decision.',
    Opposition: 'I can check for distance or unmet expectations without assuming rejection or loneliness is predetermined.',
    Square: 'I can ask whether a relationship limit is real, temporary, negotiated, or simply assumed.',
    Trine: 'I can notice where reliability supports connection without treating stability as guaranteed.',
    Sextile: 'I can choose one honest, responsible action that may strengthen trust if the other person is receptive.',
  },
  'Mars-Pluto': {
    Conjunction: 'I can notice where intensity is affecting my actions and choose a proportionate response.',
    Opposition: 'I can check for control struggles without assigning motives to other people.',
    Square: 'I can give strong impulses time and a safe outlet before deciding what action is warranted.',
    Trine: 'I can notice persistence without assuming I have unlimited energy or guaranteed leverage.',
    Sextile: 'I can use strategy rather than force and judge the result from what actually happens.',
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
    Conjunction: `${p1} and ${p2} are conjunct; I can use that geometry as a prompt to notice where their symbolic themes overlap.`,
    Opposition: `${p1} and ${p2} are opposed; I can use the polarity as a prompt to compare competing priorities.`,
    Square: `${p1} and ${p2} form a square; I can use the geometry as a prompt to notice friction without assuming an event will occur.`,
    Trine: `${p1} and ${p2} form a trine; I can notice where their symbolic themes seem easier to coordinate without assuming outcomes.`,
    Sextile: `${p1} and ${p2} form a sextile; I can look for a practical option to test rather than treating it as promised opportunity.`,
  };
  return defaults[aspect] || `${p1} ${aspect.toLowerCase()} ${p2} is a measured sky angle; any personal meaning remains a reflection prompt.`;
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
  currentMoonSign: string,
  personalDayNumber: number,
): Promise<string> {
  const name = profile.name || 'you';

  const topAlignments = alignments.slice(0, 3)
    .map(a => `${a.planet1} ${a.aspect} ${a.planet2} (orb ${a.orb}°)`)
    .join(', ');
  const topTransits = personalTransits.slice(0, 3)
    .map(t => `${t.transitingPlanet} ${t.aspect} natal ${t.natalPlanet}`)
    .join(', ');

  const prompt = `Write a daily reflection for ${name}.

Supported inputs:
- Natal Sun/Moon are not supplied here; do not infer them.
- Today's Moon: ${currentMoonSign} (${moonPhase.phase}, ${moonPhase.percentage}% illuminated)
- Today's governed sky alignments: ${topAlignments || 'none selected'}
- Verified-natal personal transits: ${topTransits || 'none available'}
- Personal Day number: ${personalDayNumber}

FORMAT — use this exact structure:

**Observation**
What I might notice today — specific and behavioral (1-2 sentences)

**Meaning**
What symbolic pattern the supported inputs suggest (1 sentence)

**Action**
One concrete reflection or action (1 sentence)

RULES:
- Write in FIRST PERSON (I/my/me).
- Use only supplied inputs.
- Do not invent unresolved natal placements, Human Design, personality types, elements, motives, trauma, or certainty.
- Treat numerology/astrology as reflective frameworks, not guaranteed events.
- No metaphors or mystical filler.
- Return only the reflection text.`;

  if (!isGeminiAvailable()) {
    return generateFallbackHoroscope(currentMoonSign, moonPhase, personalDayNumber, alignments, personalTransits);
  }

  try {
    const result = await generateText({ model: 'gemini-2.5-flash', temperature: 0.7, prompt });
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
    1: 'Personal Day 1 is a reflection prompt for beginnings; I can choose one low-risk first step and observe the result.',
    2: 'Personal Day 2 is a reflection prompt for cooperation; I can listen carefully without giving up my own position.',
    3: 'Personal Day 3 is a reflection prompt for expression; I can communicate one useful idea clearly and see how it lands.',
    4: 'Personal Day 4 is a reflection prompt for structure; I can improve one practical routine or unfinished task.',
    5: 'Personal Day 5 is a reflection prompt for change; I can test one reversible change instead of assuming restlessness means I must act.',
    6: 'Personal Day 6 is a reflection prompt for responsibility; I can choose one act of care that fits my actual capacity.',
    7: 'Personal Day 7 is a reflection prompt for review; I can reduce noise and check what the evidence supports before deciding.',
    8: 'Personal Day 8 is a reflection prompt for power and resources; I can review one consequential choice without treating boldness as automatically better.',
    9: 'Personal Day 9 is a reflection prompt for completion; I can identify what is genuinely finished without forcing an ending.',
    11: 'Personal Day 11 keeps its master-number identity; I can record intuitive impressions and test them against evidence before acting.',
    22: 'Personal Day 22 keeps its master-number identity; I can translate a large idea into one concrete, testable building step.',
    33: 'Personal Day 33 keeps its master-number identity; I can practice care or service without assuming responsibility for everyone around me.',
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

  return `${dayMessage}${transitNote}${alignmentNote} Today's ${moonPhase.phase.toLowerCase()} Moon is in ${currentMoonSign}; I can use that symbolism as a reflection prompt rather than a prediction.`;
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
  const currentMoonSign = getMoonSign(now);
  const personalDayNumber = calculatePersonalDayNumber(profile.birthDate, dateKey);

  const horoscope = await generateAIHoroscope(
    profile,
    planets,
    alignments,
    personalTransits,
    moonPhase,
    currentMoonSign,
    personalDayNumber,
  );

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
