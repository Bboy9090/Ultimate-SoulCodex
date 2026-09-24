import * as Astronomy from 'astronomy-engine';
import { fromZonedTime } from 'date-fns-tz';
import * as geoTz from 'geo-tz';
import { createEvidenceEntry, type EvidenceEntry } from '@soulcodex/core';

// Human Design Gates mapped to their correct centers and meanings
export const HD_GATES = {
  1: { name: "The Creative", center: "G", keywords: ["Self-expression", "Creativity", "Leadership"] },
  2: { name: "The Receptive", center: "G", keywords: ["Direction", "Higher knowing", "Love of self"] },
  3: { name: "Ordering", center: "Sacral", keywords: ["Innovation", "Change", "New order"] },
  4: { name: "Youthful Folly", center: "Ajna", keywords: ["Answers", "Mental pressure", "Formulas"] },
  5: { name: "Waiting", center: "Sacral", keywords: ["Fixed rhythms", "Timing", "Patience"] },
  6: { name: "Conflict", center: "Solar Plexus", keywords: ["Friction", "Intimacy", "Emotions"] },
  7: { name: "The Army", center: "G", keywords: ["Leadership", "Role", "Interaction"] },
  8: { name: "Holding Together", center: "Throat", keywords: ["Contribution", "Style", "Uniqueness"] },
  9: { name: "The Taming Power of the Small", center: "Sacral", keywords: ["Focus", "Determination", "Details"] },
  10: { name: "Treading", center: "G", keywords: ["Behavior", "Love of self", "Higher principles"] },
  11: { name: "Peace", center: "Ajna", keywords: ["Ideas", "Peace", "Opinions"] },
  12: { name: "Standstill", center: "Throat", keywords: ["Caution", "Mood", "Articulation"] },
  13: { name: "Fellowship", center: "G", keywords: ["Listener", "Secrets", "Fellowship"] },
  14: { name: "Possession in Great Measure", center: "Sacral", keywords: ["Power skills", "Keys", "Prosperity"] },
  15: { name: "Modesty", center: "G", keywords: ["Extremes", "Rhythm", "Love of humanity"] },
  16: { name: "Enthusiasm", center: "Throat", keywords: ["Skills", "Enthusiasm", "Talent"] },
  17: { name: "Following", center: "Ajna", keywords: ["Opinions", "Following", "Service"] },
  18: { name: "Work on the Corrupted", center: "Spleen", keywords: ["Correction", "Challenge", "Patterns"] },
  19: { name: "Approach", center: "Root", keywords: ["Wanting", "Needs", "Approach"] },
  20: { name: "Contemplation", center: "Throat", keywords: ["The now", "Awareness", "Self-awareness"] },
  21: { name: "Biting Through", center: "Heart", keywords: ["Control", "Hunter", "Material"] },
  22: { name: "Grace", center: "Solar Plexus", keywords: ["Grace", "Openness", "Charm"] },
  23: { name: "Splitting Apart", center: "Throat", keywords: ["Assimilation", "Insight", "Knowing"] },
  24: { name: "Return", center: "Ajna", keywords: ["Rationalizing", "Return", "Blessing"] },
  25: { name: "Innocence", center: "G", keywords: ["Spirit", "Innocence", "Higher love"] },
  26: { name: "The Taming Power of the Great", center: "Heart", keywords: ["The egoist", "Great accumulator", "Pride"] },
  27: { name: "The Corners of the Mouth", center: "Sacral", keywords: ["Caring", "Nourishment", "Responsibility"] },
  28: { name: "The Great", center: "Spleen", keywords: ["The game player", "Struggle", "Purpose"] },
  29: { name: "The Abysmal", center: "Sacral", keywords: ["Saying yes", "Commitment", "Perseverance"] },
  30: { name: "The Clinging Fire", center: "Solar Plexus", keywords: ["Feelings", "Recognition", "Fatefulness"] },
  31: { name: "Influence", center: "Throat", keywords: ["Leading", "Influence", "Democracy"] },
  32: { name: "Duration", center: "Spleen", keywords: ["Continuity", "Endurance", "Transformation"] },
  33: { name: "Retreat", center: "Throat", keywords: ["Privacy", "Mindfulness", "Retreat"] },
  34: { name: "The Power of the Great", center: "Sacral", keywords: ["Power", "Strength", "Might"] },
  35: { name: "Progress", center: "Throat", keywords: ["Change", "Progress", "Experience"] },
  36: { name: "Darkening of the Light", center: "Solar Plexus", keywords: ["Crisis", "Exploration", "Adventure"] },
  37: { name: "The Family", center: "Solar Plexus", keywords: ["Friendship", "Community", "Equality"] },
  38: { name: "Opposition", center: "Root", keywords: ["The fighter", "Opposition", "Individuality"] },
  39: { name: "Obstruction", center: "Root", keywords: ["Provocation", "Challenge", "Spirit"] },
  40: { name: "Deliverance", center: "Heart", keywords: ["Aloneness", "Resolve", "Will"] },
  41: { name: "Decrease", center: "Root", keywords: ["Contraction", "Fantasy", "Imagination"] },
  42: { name: "Increase", center: "Sacral", keywords: ["Growth", "Finishing", "Completion"] },
  43: { name: "Breakthrough", center: "Ajna", keywords: ["Insight", "Breakthrough", "Individual knowing"] },
  44: { name: "Coming to Meet", center: "Spleen", keywords: ["Coming to meet", "Truth", "Intuition"] },
  45: { name: "Gathering Together", center: "Throat", keywords: ["The gatherer", "Education", "Materialism"] },
  46: { name: "Pushing Upward", center: "G", keywords: ["The determination of the self", "Serendipity", "Luck"] },
  47: { name: "Oppression", center: "Ajna", keywords: ["Realizing", "Oppression", "Abstract"] },
  48: { name: "The Well", center: "Spleen", keywords: ["The well", "Depth", "Wisdom"] },
  49: { name: "Revolution", center: "Solar Plexus", keywords: ["Revolution", "Principles", "Rejection"] },
  50: { name: "The Cauldron", center: "Spleen", keywords: ["Values", "Responsibility", "Law"] },
  51: { name: "The Arousing", center: "Heart", keywords: ["Shock", "Arousing", "Initiative"] },
  52: { name: "Keeping Still", center: "Root", keywords: ["Stillness", "Inaction", "Meditation"] },
  53: { name: "Development", center: "Root", keywords: ["Beginnings", "Development", "Maturity"] },
  54: { name: "The Marrying Maiden", center: "Root", keywords: ["Ambition", "Drive", "Transformation"] },
  55: { name: "Abundance", center: "Solar Plexus", keywords: ["Spirit", "Abundance", "Moodiness"] },
  56: { name: "The Wanderer", center: "Throat", keywords: ["Stimulation", "Wanderer", "Storytelling"] },
  57: { name: "The Gentle", center: "Spleen", keywords: ["Intuitive clarity", "Gentle penetrating", "Instinct"] },
  58: { name: "The Joyous", center: "Root", keywords: ["Joy", "Aliveness", "Vitality"] },
  59: { name: "Dispersion", center: "Sacral", keywords: ["Sexuality", "Dispersion", "Intimacy"] },
  60: { name: "Limitation", center: "Root", keywords: ["Acceptance", "Limitation", "Mutation"] },
  61: { name: "Inner Truth", center: "Head", keywords: ["Mystery", "Inner truth", "Wonder"] },
  62: { name: "Small Exceeding", center: "Throat", keywords: ["Details", "Organization", "Expression"] },
  63: { name: "After Completion", center: "Head", keywords: ["Doubt", "After completion", "Logic"] },
  64: { name: "Before Completion", center: "Head", keywords: ["Confusion", "Before completion", "Pressure"] }
};

// Human Design Centers
export const HD_CENTERS = {
  "Head": { color: "#FFE4B5", description: "Mental pressure and inspiration" },
  "Ajna": { color: "#90EE90", description: "Mental awareness and concepts" },
  "Throat": { color: "#DDA0DD", description: "Communication and manifestation" },
  "G": { color: "#FFD700", description: "Identity, direction, and love" },
  "Heart": { color: "#F0E68C", description: "Will, ego, and material world" },
  "Spleen": { color: "#DEB887", description: "Intuition, instinct, and timing" },
  "Solar Plexus": { color: "#FFA07A", description: "Emotions and feelings" },
  "Sacral": { color: "#FA8072", description: "Life force and response" },
  "Root": { color: "#D2691E", description: "Stress, pressure, and fuel" }
};

const HD_ICHING_MAP = [
  55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8,
  20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29,
  59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14,
  34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30,
] as const;

// Correct zodiac-to-gate mapping based on official Human Design standards
// Each gate has a start degree (absolute longitude) and spans 5.625 degrees
const GATE_ZODIAC_MAP = [
  { gate: 25, start: 358.25 },   // 28°15' Pisces
  { gate: 17, start: 3.875 },    // 03°52'30" Aries
  { gate: 21, start: 9.5 },      // 09°30' Aries
  { gate: 51, start: 15.125 },   // 15°07'30" Aries
  { gate: 42, start: 20.75 },    // 20°45' Aries
  { gate: 3, start: 26.375 },    // 26°22'30" Aries
  { gate: 27, start: 32 },       // 02°00' Taurus
  { gate: 24, start: 37.625 },   // 07°37'30" Taurus
  { gate: 2, start: 43.25 },     // 13°15' Taurus
  { gate: 23, start: 48.875 },   // 18°52'30" Taurus
  { gate: 8, start: 54.5 },      // 24°30' Taurus
  { gate: 20, start: 60.125 },   // 00°07'30" Gemini
  { gate: 16, start: 65.75 },    // 05°45' Gemini
  { gate: 35, start: 71.375 },   // 11°22'30" Gemini
  { gate: 45, start: 77 },       // 17°00' Gemini
  { gate: 12, start: 82.625 },   // 22°37'30" Gemini
  { gate: 15, start: 88.25 },    // 28°15' Gemini
  { gate: 52, start: 93.875 },   // 03°52'30" Cancer
  { gate: 39, start: 99.5 },     // 09°30' Cancer
  { gate: 53, start: 105.125 },  // 15°07'30" Cancer
  { gate: 62, start: 110.75 },   // 20°45' Cancer
  { gate: 56, start: 116.375 },  // 26°22'30" Cancer
  { gate: 31, start: 122 },      // 02°00' Leo
  { gate: 33, start: 127.625 },  // 07°37'30" Leo
  { gate: 7, start: 133.25 },    // 13°15' Leo
  { gate: 4, start: 138.875 },   // 18°52'30" Leo
  { gate: 29, start: 144.5 },    // 24°30' Leo
  { gate: 59, start: 150.125 },  // 00°07'30" Virgo
  { gate: 40, start: 155.75 },   // 05°45' Virgo
  { gate: 64, start: 161.375 },  // 11°22'30" Virgo
  { gate: 47, start: 167 },      // 17°00' Virgo
  { gate: 6, start: 172.625 },   // 22°37'30" Virgo
  { gate: 46, start: 178.25 },   // 28°15' Virgo
  { gate: 18, start: 183.875 },  // 03°52'30" Libra
  { gate: 48, start: 189.5 },    // 09°30' Libra
  { gate: 57, start: 195.125 },  // 15°07'30" Libra
  { gate: 32, start: 200.75 },   // 20°45' Libra
  { gate: 50, start: 206.375 },  // 26°22'30" Libra
  { gate: 28, start: 212 },      // 02°00' Scorpio
  { gate: 44, start: 217.625 },  // 07°37'30" Scorpio
  { gate: 1, start: 223.25 },    // 13°15' Scorpio
  { gate: 43, start: 228.875 },  // 18°52'30" Scorpio
  { gate: 14, start: 234.5 },    // 24°30' Scorpio
  { gate: 34, start: 240.125 },  // 00°07'30" Sagittarius
  { gate: 9, start: 245.75 },    // 05°45' Sagittarius
  { gate: 5, start: 251.375 },   // 11°22'30" Sagittarius
  { gate: 26, start: 257 },      // 17°00' Sagittarius
  { gate: 11, start: 262.625 },  // 22°37'30" Sagittarius
  { gate: 10, start: 268.25 },   // 28°15' Sagittarius
  { gate: 58, start: 273.875 },  // 03°52'30" Capricorn
  { gate: 38, start: 279.5 },    // 09°30' Capricorn
  { gate: 54, start: 285.125 },  // 15°07'30" Capricorn
  { gate: 61, start: 290.75 },   // 20°45' Capricorn
  { gate: 60, start: 296.375 },  // 26°22'30" Capricorn
  { gate: 41, start: 302 },      // 02°00' Aquarius
  { gate: 19, start: 307.625 },  // 07°37'30" Aquarius
  { gate: 13, start: 313.25 },   // 13°15' Aquarius
  { gate: 49, start: 318.875 },  // 18°52'30" Aquarius
  { gate: 30, start: 324.5 },    // 24°30' Aquarius
  { gate: 55, start: 330.125 },  // 00°07'30" Pisces
  { gate: 37, start: 335.75 },   // 05°45' Pisces
  { gate: 63, start: 341.375 },  // 11°22'30" Pisces
  { gate: 22, start: 347 },      // 17°00' Pisces
  { gate: 36, start: 352.625 }   // 22°37'30" Pisces
];

// Channel definitions (connecting gates)
const HD_CHANNELS = [
  { gates: [1, 8], name: "Channel of Inspiration", description: "A design of creative inspiration", connects: ["G", "Throat"] },
  { gates: [2, 14], name: "Channel of the Beat", description: "A design of being a keeper of the keys", connects: ["G", "Sacral"] },
  { gates: [3, 60], name: "Channel of Mutation", description: "A design of energy for change", connects: ["Sacral", "Root"] },
  { gates: [4, 63], name: "Channel of Logic", description: "A design of mental ease mixed with doubt", connects: ["Ajna", "Head"] },
  { gates: [5, 15], name: "Channel of Rhythm", description: "A design of being in the flow", connects: ["Sacral", "G"] },
  { gates: [6, 59], name: "Channel of Mating", description: "A design focused on reproduction", connects: ["Solar Plexus", "Sacral"] },
  { gates: [7, 31], name: "Channel of the Alpha", description: "A design of leadership for the good of all", connects: ["G", "Throat"] },
  { gates: [9, 52], name: "Channel of Concentration", description: "A design of determination", connects: ["Sacral", "Root"] },
  { gates: [10, 20], name: "Channel of Awakening", description: "A design of commitment to higher principles", connects: ["G", "Throat"] },
  { gates: [10, 34], name: "Channel of Exploration", description: "A design of following one's convictions", connects: ["G", "Sacral"] },
  { gates: [10, 57], name: "Channel of Perfected Form", description: "A design of survival", connects: ["G", "Spleen"] },
  { gates: [11, 56], name: "Channel of Curiosity", description: "A design of a searcher", connects: ["Ajna", "Throat"] },
  { gates: [12, 22], name: "Channel of Openness", description: "A design of a social being", connects: ["Throat", "Solar Plexus"] },
  { gates: [13, 33], name: "Channel of the Prodigal", description: "A design of a witness", connects: ["G", "Throat"] },
  { gates: [16, 48], name: "Channel of Wavelength", description: "A design of the talent", connects: ["Throat", "Spleen"] },
  { gates: [17, 62], name: "Channel of Acceptance", description: "A design of an organizational being", connects: ["Ajna", "Throat"] },
  { gates: [18, 58], name: "Channel of Judgment", description: "A design of insatiability", connects: ["Spleen", "Root"] },
  { gates: [19, 49], name: "Channel of Synthesis", description: "A design of being sensitive to needs", connects: ["Root", "Solar Plexus"] },
  { gates: [20, 34], name: "Channel of Charisma", description: "A design of being present", connects: ["Throat", "Sacral"] },
  { gates: [20, 57], name: "Channel of the Brainwave", description: "A design of intuitive awareness in the now", connects: ["Throat", "Spleen"] },
  { gates: [21, 45], name: "Channel of Money", description: "A design of a material being", connects: ["Heart", "Throat"] },
  { gates: [23, 43], name: "Channel of Structuring", description: "A design of individual knowing", connects: ["Throat", "Ajna"] },
  { gates: [24, 61], name: "Channel of Awareness", description: "A design of a thinker", connects: ["Ajna", "Head"] },
  { gates: [25, 51], name: "Channel of Initiation", description: "A design of needing to be first", connects: ["G", "Heart"] },
  { gates: [26, 44], name: "Channel of Surrender", description: "A design of a transgressor", connects: ["Heart", "Spleen"] },
  { gates: [27, 50], name: "Channel of Preservation", description: "A design of custodianship", connects: ["Sacral", "Spleen"] },
  { gates: [28, 38], name: "Channel of Struggle", description: "A design of stubbornness", connects: ["Spleen", "Root"] },
  { gates: [29, 46], name: "Channel of Discovery", description: "A design of succeeding where others fail", connects: ["Sacral", "G"] },
  { gates: [30, 41], name: "Channel of Recognition", description: "A design of focused energy", connects: ["Solar Plexus", "Root"] },
  { gates: [32, 54], name: "Channel of Transformation", description: "A design of being driven", connects: ["Spleen", "Root"] },
  { gates: [34, 57], name: "Channel of Power", description: "A design of archetypal power", connects: ["Sacral", "Spleen"] },
  { gates: [35, 36], name: "Channel of Transitoriness", description: "A design of a 'jack of all trades'", connects: ["Throat", "Solar Plexus"] },
  { gates: [37, 40], name: "Channel of Community", description: "A design of part of the whole", connects: ["Solar Plexus", "Heart"] },
  { gates: [39, 55], name: "Channel of Emoting", description: "A design of moodiness", connects: ["Root", "Solar Plexus"] },
  { gates: [42, 53], name: "Channel of Maturation", description: "A design of balanced development", connects: ["Sacral", "Root"] },
  { gates: [47, 64], name: "Channel of Abstraction", description: "A design of mental activity mixed with clarity", connects: ["Ajna", "Head"] }
];

type GateLine = { gate: number; line: number };

type ActivationPlanets = {
  sun: GateLine;
  earth: GateLine;
  moon: GateLine;
  northNode: GateLine;
  southNode: GateLine;
  mercury: GateLine;
  venus: GateLine;
  mars: GateLine;
  jupiter: GateLine;
  saturn: GateLine;
  uranus: GateLine;
  neptune: GateLine;
  pluto: GateLine;
};

type ActivationsStructure = {
  conscious: ActivationPlanets;
  unconscious: ActivationPlanets;
};

export interface HumanDesignData {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  centers: {
    [centerName: string]: {
      defined: boolean;
      gates: number[];
      description: string;
    };
  };
  channels: Array<{
    gates: number[];
    name: string;
    description: string;
    defined: boolean;
  }>;
  activations?: {
    conscious?: {
      sun?: { gate: number; line: number };
      earth?: { gate: number; line: number };
      moon?: { gate: number; line: number };
      northNode?: { gate: number; line: number };
      southNode?: { gate: number; line: number };
      mercury?: { gate: number; line: number };
      venus?: { gate: number; line: number };
      mars?: { gate: number; line: number };
      jupiter?: { gate: number; line: number };
      saturn?: { gate: number; line: number };
      uranus?: { gate: number; line: number };
      neptune?: { gate: number; line: number };
      pluto?: { gate: number; line: number };
    };
    unconscious?: {
      sun?: { gate: number; line: number };
      earth?: { gate: number; line: number };
      moon?: { gate: number; line: number };
      northNode?: { gate: number; line: number };
      southNode?: { gate: number; line: number };
      mercury?: { gate: number; line: number };
      venus?: { gate: number; line: number };
      mars?: { gate: number; line: number };
      jupiter?: { gate: number; line: number };
      saturn?: { gate: number; line: number };
      uranus?: { gate: number; line: number };
      neptune?: { gate: number; line: number };
      pluto?: { gate: number; line: number };
    };
  };
  activatedGates: number[];
  incarnationCross: string;
  variables: {
    cognition: string;
    environment: string;
    motivation: string;
    perspective: string;
  };
}

/**
 * Unresolved reasons for Human Design calculation failure.
 * Indicates why calculation cannot proceed with exact reasons.
 */
export type HumanDesignUnresolvedReason =
  | 'requires_exact_birth_time'
  | 'invalid_birth_date'
  | 'malformed_birth_time'
  | 'invalid_timezone'
  | 'timezone_resolution_failed'
  | 'invalid_coordinates'
  | 'missing_birth_date'
  | 'missing_birth_time'
  | 'missing_timezone'
  | 'missing_coordinates';

/**
 * Resolved Human Design chart with all calculated values guaranteed to be present.
 * Returned only when birth date, time, timezone, and coordinates are valid.
 * All fields are required (not optional) to guarantee completeness.
 */
export interface HumanDesignResolved {
  status: 'resolved';
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  centers: {
    [centerName: string]: {
      defined: boolean;
      gates: number[];
      description: string;
    };
  };
  channels: Array<{
    gates: number[];
    name: string;
    description: string;
    defined: boolean;
  }>;
  activations: ActivationsStructure;
  activatedGates: number[];
  incarnationCross: string;
  variables: {
    cognition: string;
    environment: string;
    motivation: string;
    perspective: string;
  };
}

/**
 * Unresolved Human Design result.
 * Returned when any required input is missing, invalid, or resolution fails.
 * All calculation fields are explicitly undefined to signal failure.
 */
export interface HumanDesignUnresolved {
  status: 'unresolved';
  reason: HumanDesignUnresolvedReason;
  type?: undefined;
  strategy?: undefined;
  authority?: undefined;
  profile?: undefined;
  definition?: undefined;
  centers?: undefined;
  channels?: undefined;
  activations?: undefined;
  activatedGates?: undefined;
  incarnationCross?: undefined;
  variables?: undefined;
}

/**
 * Discriminated union result type for Human Design calculation.
 * Always has status field to distinguish resolved vs. unresolved.
 * Never produces 0-valued gates, placeholder profiles, or guessed charts.
 */
export type HumanDesignResult = HumanDesignResolved | HumanDesignUnresolved;

/**
 * Timezone resolution with source tracking.
 * Indicates which of 3 paths was used to resolve the timezone.
 */
export interface TimezoneResolution {
  timezone: string;
  source: 'supplied_iana' | 'coordinate_lookup' | 'abbreviation_mapping';
}

/**
 * Forensic metadata for 88° solar arc calculation.
 * Captures structured provenance for reconstructing the calculation.
 */
export interface SolarArcForensics {
  configuredSolarArc: number;           // 87.975 constant
  actualSolarArc: number;               // computed from bisection
  iterationCount: number;               // bisection loop count
  finalSearchWindowDays: number;        // maxDays - minDays final value
  finalToleranceDays: number;           // tolerance achieved
  resolvedTimezone: string;             // final timezone used
  timezoneResolutionSource: 'supplied_iana' | 'coordinate_lookup' | 'abbreviation_mapping';
  algorithmId: string;                  // 'human-design.design-solar-arc'
  algorithmVersion: string;             // '1.0.0'
}

// Convert zodiac sign name to base degree offset
function signToOffset(sign: string): number {
  const signs: { [key: string]: number } = {
    'Aries': 0, 'Taurus': 30, 'Gemini': 60, 'Cancer': 90,
    'Leo': 120, 'Virgo': 150, 'Libra': 180, 'Scorpio': 210,
    'Sagittarius': 240, 'Capricorn': 270, 'Aquarius': 300, 'Pisces': 330
  };
  return signs[sign] || 0;
}

// Calculate absolute longitude from sign and degree within sign
function calculateAbsoluteLongitude(sign: string, degreeInSign: number): number {
  return signToOffset(sign) + degreeInSign;
}

// Convert zodiac degrees to Human Design gate and line
function degreeToGateAndLine(degree: number): { gate: number; line: number } {
  const normalized = ((degree % 360) + 360) % 360;
  const radiansPosition = normalized * Math.PI / 180;
  const circle = Math.PI * 2;
  const hexWidth = circle / 64;
  const lineWidth = hexWidth / 6;
  const colorWidth = lineWidth / 6;
  const toneWidth = colorWidth / 6;
  const baseWidth = toneWidth / 5;

  // Canonical Human Design / Gene Keys mandala offset. This replaces the
  // hand-authored absolute-degree boundary table, which drifted at line edges.
  const offset = 2 * lineWidth - colorWidth - toneWidth + 3 * baseWidth;
  const offsetCalc = (circle / 64) * 5 + offset;
  const fractal = (((radiansPosition + offsetCalc) / circle) * 64) % 64;
  const bin = Math.floor(fractal);
  const gate = HD_ICHING_MAP[bin];
  const remainder = fractal - bin;
  const line = Math.floor(remainder / (1 / 6)) + 1;

  return { gate, line };
}

// Calculate Earth position (180 degrees opposite)
function getEarthGateAndLine(sunDegree: number): { gate: number; line: number } {
  const earthDegree = (sunDegree + 180) % 360;
  return degreeToGateAndLine(earthDegree);
}

// Check if a center is a motor center
function isMotorCenter(centerName: string): boolean {
  return ["Sacral", "Solar Plexus", "Heart", "Root"].includes(centerName);
}

// Check if throat is connected to a motor through defined channels
function centersReach(
  startCenters: string[],
  targetCenter: string,
  channels: any[],
  centers: any,
): boolean {
  if (!centers[targetCenter]?.defined) return false;

  const definedChannels = channels.filter((channel) => channel.defined);
  const adjacency = new Map<string, Set<string>>();

  for (const [name, center] of Object.entries(centers)) {
    if ((center as any).defined) adjacency.set(name, new Set());
  }

  for (const channel of definedChannels) {
    const [left, right] = channel.connects;
    if (adjacency.has(left) && adjacency.has(right)) {
      adjacency.get(left)!.add(right);
      adjacency.get(right)!.add(left);
    }
  }

  const queue = startCenters.filter((name) => adjacency.has(name));
  const visited = new Set(queue);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetCenter) return true;
    for (const next of adjacency.get(current) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}

function hasMotorToThroatConnection(channels: any[], centers: any): boolean {
  const motors = ["Sacral", "Solar Plexus", "Heart", "Root"];
  return centersReach(motors, "Throat", channels, centers);
}

function hasGToThroatConnection(channels: any[], centers: any): boolean {
  return centersReach(["G"], "Throat", channels, centers);
}

// Determine Human Design type based on defined centers and channels
function calculateType(centers: any, channels: any[]): string {
  const sacralDefined = centers.Sacral.defined;
  const throatDefined = centers.Throat.defined;
  
  // Count defined centers
  const definedCount = Object.values(centers).filter((center: any) => center.defined).length;

  // Reflector - no centers defined
  if (definedCount === 0) {
    return "Reflector";
  }

  // Generator types - sacral defined
  if (sacralDefined) {
    return hasMotorToThroatConnection(channels, centers)
      ? "Manifesting Generator"
      : "Generator";
  }

  // Manifestor - throat connected to motor (but not sacral since we checked that above)
  if (hasMotorToThroatConnection(channels, centers)) {
    return "Manifestor";
  }

  // Projector - no sacral, no motor-to-throat connection
  return "Projector";
}

// Calculate strategy based on type
function getStrategy(type: string): string {
  switch (type) {
    case "Manifestor":
      return "To Inform";
    case "Generator":
      return "To Respond";
    case "Manifesting Generator":
      return "To Respond & Inform";
    case "Projector":
      return "To Wait for Invitation";
    case "Reflector":
      return "To Wait a Lunar Cycle";
    default:
      return "Unknown";
  }
}

// Calculate authority based on defined centers (hierarchical)
function calculateAuthority(centers: any, channelsForAuthority: any[]): string {
  // Solar Plexus authority has highest priority
  if (centers["Solar Plexus"].defined) {
    return "Emotional Authority";
  }
  // Sacral authority (for Generators and MGs)
  if (centers.Sacral.defined) {
    return "Sacral Authority";
  }
  // Splenic authority (in-the-moment)
  if (centers.Spleen.defined) {
    return "Splenic Authority";
  }
  // Ego/Heart authority
  if (centers.Heart.defined && centers.Heart.gates.length > 0) {
    // Check if connected to G or Throat for manifestation
    return "Ego Authority";
  }
  // Self-Projected (G center to Throat)
  if (
    centers.G.defined &&
    centers.Throat.defined &&
    hasGToThroatConnection(channelsForAuthority, centers)
  ) {
    return "Self-Projected Authority";
  }
  // Mental/Environmental authority (Projectors with defined Ajna)
  if (centers.Ajna.defined) {
    return "Mental Authority";
  }
  // Lunar authority (Reflectors - no centers defined)
  return "Lunar Authority";
}

// Calculate profile from conscious and unconscious sun lines
function calculateProfile(consciousSunLine: number, unconsciousSunLine: number): string {
  return `${consciousSunLine}/${unconsciousSunLine}`;
}

// Determine definition type based on how centers connect
function calculateDefinition(centers: any, channels: any[]): string {
  const definedChannels = channels.filter(channel => channel.defined);
  
  if (definedChannels.length === 0) {
    return "No Definition";
  }
  
  // Build a graph of connected centers
  const centerConnections: { [key: string]: Set<string> } = {};
  
  for (const channel of definedChannels) {
    const [center1, center2] = channel.connects;
    if (!centerConnections[center1]) centerConnections[center1] = new Set();
    if (!centerConnections[center2]) centerConnections[center2] = new Set();
    centerConnections[center1].add(center2);
    centerConnections[center2].add(center1);
  }
  
  // Find connected components using DFS
  const visited = new Set<string>();
  const components: string[][] = [];
  
  const dfs = (center: string, component: string[]) => {
    visited.add(center);
    component.push(center);
    if (centerConnections[center]) {
      for (const neighbor of Array.from(centerConnections[center])) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    }
  };
  
  for (const center of Object.keys(centerConnections)) {
    if (!visited.has(center)) {
      const component: string[] = [];
      dfs(center, component);
      components.push(component);
    }
  }
  
  // Determine definition type based on number of separate components
  if (components.length === 1) {
    return "Single Definition";
  } else if (components.length === 2) {
    return "Split Definition";
  } else if (components.length === 3) {
    return "Triple Split Definition";
  } else {
    return "Quadruple Split Definition";
  }
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Reject invalid month/day ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Round-trip validation: ensure JavaScript doesn't normalize the date
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(timeStr: string): boolean {
  if (!timeStr || typeof timeStr !== 'string') return false;
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;

  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Validate ranges
  if (hours < 0 || hours > 23) return false;
  if (minutes < 0 || minutes > 59) return false;

  return true;
}

function isValidCoordinates(latStr: string, lonStr: string): boolean {
  if (!latStr || typeof latStr !== 'string' || !lonStr || typeof lonStr !== 'string') {
    return false;
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  // Check if parsed successfully and are finite numbers
  if (!isFinite(lat) || !isFinite(lon)) return false;

  // Validate latitude range: -90 to +90
  if (lat < -90 || lat > 90) return false;

  // Validate longitude range: -180 to +180
  if (lon < -180 || lon > 180) return false;

  return true;
}

function isValidTimezone(tzStr: string): boolean {
  if (!tzStr || typeof tzStr !== 'string') return false;

  // Check if it's a mappable abbreviation
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

  if (tzStr.toUpperCase() in timezoneMap) {
    return true;
  }

  // Validate IANA format using Intl.DateTimeFormat (authoritative timezone database)
  // Invalid zones throw TypeError
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tzStr });
    return true;
  } catch {
    return false;
  }
}

type TimezoneResolutionResult =
  | TimezoneResolution
  | { error: 'invalid_timezone' }
  | { error: 'timezone_resolution_failed' };

function resolveHDTimezone(inputTimezone: string, latitude: number, longitude: number): TimezoneResolutionResult | null {
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

  // Case 1: Timezone supplied - validate and accept if real
  if (inputTimezone && inputTimezone.trim().length > 0) {
    // Check if it's a mappable abbreviation
    const mapped = timezoneMap[inputTimezone.toUpperCase()];
    if (mapped) {
      return { timezone: mapped, source: 'abbreviation_mapping' };
    }

    // Check if it's a valid IANA timezone (contains /)
    if (inputTimezone.includes('/')) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: inputTimezone });
        return { timezone: inputTimezone, source: 'supplied_iana' };
      } catch {
        // Supplied IANA format but not valid - fail closed with explicit error
        return { error: 'invalid_timezone' };
      }
    }

    // Timezone supplied but doesn't match abbreviation or valid IANA
    // This is an explicitly bogus timezone (e.g., "Mars/Olympus", "Foo/Bar", "XYZ")
    return { error: 'invalid_timezone' };
  }

  // Case 2: No timezone supplied - try coordinate-based lookup
  // This is semantically clean: no timezone hint + valid coordinates = infer from location
  try {
    const timezones = geoTz.find(latitude, longitude);
    if (timezones && timezones.length > 0) {
      return { timezone: timezones[0], source: 'coordinate_lookup' };
    }
  } catch (error) {
    console.warn('Geo-tz lookup failed:', error);
  }

  // FAIL-CLOSED: No timezone supplied and lookup failed
  return { error: 'timezone_resolution_failed' };
}

const HdAstro: typeof Astronomy = Astronomy;

type HdPosition = {
  longitude: number;
  sign: string;
  degree: number;
};

type HdAstroSnapshot = {
  planets: {
    sun: HdPosition;
    moon: HdPosition;
    mercury: HdPosition;
    venus: HdPosition;
    mars: HdPosition;
    jupiter: HdPosition;
    saturn: HdPosition;
    uranus: HdPosition;
    neptune: HdPosition;
    pluto: HdPosition;
  };
  northNode: HdPosition;
  southNode: HdPosition;
};

const HD_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

function normalizeHdLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

function hdPosition(longitude: number): HdPosition {
  const normalized = normalizeHdLongitude(longitude);
  return {
    longitude: normalized,
    sign: HD_SIGNS[Math.floor(normalized / 30)],
    degree: normalized % 30,
  };
}

function geocentricHdLongitude(body: Astronomy.Body, date: Date): number {
  if (body === HdAstro.Body.Moon) {
    return normalizeHdLongitude(HdAstro.EclipticGeoMoon(date).lon);
  }
  const vector = HdAstro.GeoVector(body, date, true);
  return normalizeHdLongitude(HdAstro.Ecliptic(vector).elon);
}

function julianDayUtc(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

function horner(t: number, ...coefficients: number[]): number {
  let result = coefficients[coefficients.length - 1];
  for (let index = coefficients.length - 2; index >= 0; index -= 1) {
    result = result * t + coefficients[index];
  }
  return result;
}

/**
 * Meeus true ascending lunar node (instantaneous lunar orbit).
 * The periodic correction is evaluated from the standard D, M, M', F
 * arguments. This replaces the previous finite-difference plane estimate.
 */
function trueLunarNodeLongitude(date: Date): number {
  // Astronomy Engine exposes TT on AstroTime; fall back to UTC JD only if the
  // runtime shape changes. TT matters at sub-line boundary precision.
  const astroTime = new (HdAstro as any).AstroTime(date);
  const jde =
    typeof astroTime.tt === 'number'
      ? 2_451_545.0 + astroTime.tt
      : julianDayUtc(date);
  const t = (jde - 2_451_545.0) / 36_525;
  const rad = Math.PI / 180;

  const D = horner(
    t,
    297.8501921,
    445267.1114034,
    -0.0018819,
    1 / 545868,
    -1 / 113065000,
  ) * rad;
  const M = horner(
    t,
    357.5291092,
    35999.0502909,
    -0.0001535,
    1 / 24490000,
  ) * rad;
  const Mp = horner(
    t,
    134.9633964,
    477198.8675055,
    0.0087414,
    1 / 69699,
    -1 / 14712000,
  ) * rad;
  const F = horner(
    t,
    93.272095,
    483202.0175233,
    -0.0036539,
    -1 / 3526000,
    1 / 863310000,
  ) * rad;

  const meanNode = horner(
    t,
    125.0445479,
    -1934.1362891,
    0.0020754,
    1 / 467441,
    -1 / 60616000,
  );

  const correction =
    -1.4979 * Math.sin(2 * (D - F)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mp - F));

  return normalizeHdLongitude(meanNode + correction);
}

function calculateHdAstroAtUtc(date: Date): HdAstroSnapshot {
  const sun = hdPosition(geocentricHdLongitude(HdAstro.Body.Sun, date));
  const moon = hdPosition(geocentricHdLongitude(HdAstro.Body.Moon, date));
  const mercury = hdPosition(geocentricHdLongitude(HdAstro.Body.Mercury, date));
  const venus = hdPosition(geocentricHdLongitude(HdAstro.Body.Venus, date));
  const mars = hdPosition(geocentricHdLongitude(HdAstro.Body.Mars, date));
  const jupiter = hdPosition(geocentricHdLongitude(HdAstro.Body.Jupiter, date));
  const saturn = hdPosition(geocentricHdLongitude(HdAstro.Body.Saturn, date));
  const uranus = hdPosition(geocentricHdLongitude(HdAstro.Body.Uranus, date));
  const neptune = hdPosition(geocentricHdLongitude(HdAstro.Body.Neptune, date));
  const pluto = hdPosition(geocentricHdLongitude(HdAstro.Body.Pluto, date));
  const northNode = hdPosition(trueLunarNodeLongitude(date));
  const southNode = hdPosition(northNode.longitude + 180);

  return {
    planets: { sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto },
    northNode,
    southNode,
  };
}

function calculateHumanDesignInternal(birthData: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: string;
  longitude: string;
  timezone: string;
}): { result: HumanDesignResult; forensics?: SolarArcForensics } {
  // FAIL-CLOSED: Validate all inputs BEFORE any astrology calculation

  // Validate birth date
  if (!birthData.birthDate) {
    return {
      result: {
        status: 'unresolved',
        reason: 'missing_birth_date',
      }
    };
  }

  if (!isValidDate(birthData.birthDate)) {
    return {
      result: {
        status: 'unresolved',
        reason: 'invalid_birth_date',
      }
    };
  }

  // Validate birth time
  if (!birthData.birthTime) {
    return {
      result: {
        status: 'unresolved',
        reason: 'missing_birth_time',
      }
    };
  }

  if (!isValidTime(birthData.birthTime)) {
    return {
      result: {
        status: 'unresolved',
        reason: 'malformed_birth_time',
      }
    };
  }

  // Validate coordinates first (always required)
  if (!birthData.latitude || !birthData.longitude) {
    return {
      result: {
        status: 'unresolved',
        reason: 'missing_coordinates',
      }
    };
  }

  if (!isValidCoordinates(birthData.latitude, birthData.longitude)) {
    return {
      result: {
        status: 'unresolved',
        reason: 'invalid_coordinates',
      }
    };
  }

  // Resolve timezone with coordinates. Timezone can be:
  // - Valid IANA (e.g., "America/New_York")
  // - Valid abbreviation (e.g., "EST")
  // - Empty/missing (will attempt coordinate lookup)
  // - Bogus (e.g., "Mars/Olympus") - will fail
  const timezoneResolution = resolveHDTimezone(
    birthData.timezone || '',
    parseFloat(birthData.latitude),
    parseFloat(birthData.longitude)
  );

  if (!timezoneResolution || 'error' in timezoneResolution) {
    return {
      result: {
        status: 'unresolved',
        reason: (timezoneResolution && 'error' in timezoneResolution)
          ? timezoneResolution.error
          : 'timezone_resolution_failed',
      }
    };
  }

  const resolvedTimezone = timezoneResolution.timezone;
  const timezoneResolutionSource = timezoneResolution.source;

  // Resolve the exact birth instant once and keep all activation astronomy in UTC.
  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hours, minutes] = birthData.birthTime.split(':').map(Number);
  const localTimeString =
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T` +
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  const birthTimeUTC = fromZonedTime(localTimeString, resolvedTimezone);
  if (Number.isNaN(birthTimeUTC.getTime())) {
    return { result: { status: 'unresolved', reason: 'timezone_resolution_failed' } };
  }

  const astroData = calculateHdAstroAtUtc(birthTimeUTC);
  const DESIGN_SOLAR_ARC = 87.975;
  const birthSunLongitude = astroData.planets.sun.longitude;
  const targetLongitude = normalizeHdLongitude(birthSunLongitude - DESIGN_SOLAR_ARC);

  // Bracket 80–95 days before birth, then solve the 88° solar-arc crossing
  // directly in UTC. No local-time minute round-trip is allowed here.
  let minDays = 80;
  let maxDays = 95;
  let iteration = 0;
  const maxIterations = 50;
  let unconsciousTimeUTC = new Date(birthTimeUTC.getTime() - 88 * 86_400_000);

  while (iteration < maxIterations && (maxDays - minDays) > 1e-4) {
    const midDays = (minDays + maxDays) / 2;
    const testTimeUTC = new Date(birthTimeUTC.getTime() - midDays * 86_400_000);
    const testSunLongitude = calculateHdAstroAtUtc(testTimeUTC).planets.sun.longitude;

    let diff = testSunLongitude - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (diff > 0) minDays = midDays;
    else maxDays = midDays;

    unconsciousTimeUTC = testTimeUTC;
    iteration += 1;
  }

  const finalSearchWindowDays = maxDays - minDays;
  const finalToleranceDays = finalSearchWindowDays / 2;
  const unconsciousAstroData = calculateHdAstroAtUtc(unconsciousTimeUTC);
  const unconsciousSunLongitude = unconsciousAstroData.planets.sun.longitude;
  const actualArc = normalizeHdLongitude(
    birthSunLongitude - unconsciousSunLongitude,
  );

  // Store solar arc forensics for evidence receipt
  const solarArcForensics = {
    configuredSolarArc: DESIGN_SOLAR_ARC,
    actualSolarArc: actualArc,
    iterationCount: iteration,
    finalSearchWindowDays,
    finalToleranceDays,
    resolvedTimezone,
    timezoneResolutionSource,
    algorithmId: 'human-design.design-solar-arc',
    algorithmVersion: '1.0.0'
  };

  // Helper to calculate gate and line from sign and degree
  const toGateAndLine = (sign: string, degree: number) => 
    degreeToGateAndLine(calculateAbsoluteLongitude(sign, degree));

  // Convert planetary positions to gates and lines
  const consciousSunLongitude = calculateAbsoluteLongitude(astroData.planets.sun.sign, astroData.planets.sun.degree);

  const activations = {
    conscious: {
      sun: degreeToGateAndLine(consciousSunLongitude),
      earth: getEarthGateAndLine(consciousSunLongitude),
      moon: toGateAndLine(astroData.planets.moon.sign, astroData.planets.moon.degree),
      northNode: toGateAndLine(astroData.northNode.sign, astroData.northNode.degree),
      southNode: toGateAndLine(astroData.southNode.sign, astroData.southNode.degree),
      mercury: toGateAndLine(astroData.planets.mercury.sign, astroData.planets.mercury.degree),
      venus: toGateAndLine(astroData.planets.venus.sign, astroData.planets.venus.degree),
      mars: toGateAndLine(astroData.planets.mars.sign, astroData.planets.mars.degree),
      jupiter: toGateAndLine(astroData.planets.jupiter.sign, astroData.planets.jupiter.degree),
      saturn: toGateAndLine(astroData.planets.saturn.sign, astroData.planets.saturn.degree),
      uranus: toGateAndLine(astroData.planets.uranus.sign, astroData.planets.uranus.degree),
      neptune: toGateAndLine(astroData.planets.neptune.sign, astroData.planets.neptune.degree),
      pluto: toGateAndLine(astroData.planets.pluto.sign, astroData.planets.pluto.degree)
    },
    unconscious: {
      sun: degreeToGateAndLine(unconsciousSunLongitude),
      earth: getEarthGateAndLine(unconsciousSunLongitude),
      moon: toGateAndLine(unconsciousAstroData.planets.moon.sign, unconsciousAstroData.planets.moon.degree),
      northNode: toGateAndLine(unconsciousAstroData.northNode.sign, unconsciousAstroData.northNode.degree),
      southNode: toGateAndLine(unconsciousAstroData.southNode.sign, unconsciousAstroData.southNode.degree),
      mercury: toGateAndLine(unconsciousAstroData.planets.mercury.sign, unconsciousAstroData.planets.mercury.degree),
      venus: toGateAndLine(unconsciousAstroData.planets.venus.sign, unconsciousAstroData.planets.venus.degree),
      mars: toGateAndLine(unconsciousAstroData.planets.mars.sign, unconsciousAstroData.planets.mars.degree),
      jupiter: toGateAndLine(unconsciousAstroData.planets.jupiter.sign, unconsciousAstroData.planets.jupiter.degree),
      saturn: toGateAndLine(unconsciousAstroData.planets.saturn.sign, unconsciousAstroData.planets.saturn.degree),
      uranus: toGateAndLine(unconsciousAstroData.planets.uranus.sign, unconsciousAstroData.planets.uranus.degree),
      neptune: toGateAndLine(unconsciousAstroData.planets.neptune.sign, unconsciousAstroData.planets.neptune.degree),
      pluto: toGateAndLine(unconsciousAstroData.planets.pluto.sign, unconsciousAstroData.planets.pluto.degree)
    }
  };

  // Collect all activated gates
  const allGates = [
    activations.conscious.sun.gate,
    activations.conscious.earth.gate,
    activations.conscious.moon.gate,
    activations.conscious.northNode.gate,
    activations.conscious.southNode.gate,
    activations.conscious.mercury.gate,
    activations.conscious.venus.gate,
    activations.conscious.mars.gate,
    activations.conscious.jupiter.gate,
    activations.conscious.saturn.gate,
    activations.conscious.uranus.gate,
    activations.conscious.neptune.gate,
    activations.conscious.pluto.gate,
    activations.unconscious.sun.gate,
    activations.unconscious.earth.gate,
    activations.unconscious.moon.gate,
    activations.unconscious.northNode.gate,
    activations.unconscious.southNode.gate,
    activations.unconscious.mercury.gate,
    activations.unconscious.venus.gate,
    activations.unconscious.mars.gate,
    activations.unconscious.jupiter.gate,
    activations.unconscious.saturn.gate,
    activations.unconscious.uranus.gate,
    activations.unconscious.neptune.gate,
    activations.unconscious.pluto.gate
  ];

  // Initialize centers with ALL possible gates
  const centers: any = {};
  Object.keys(HD_CENTERS).forEach(centerName => {
    centers[centerName] = {
      defined: false,
      gates: [],
      description: HD_CENTERS[centerName as keyof typeof HD_CENTERS].description
    };
  });

  // A center's gate list represents this chart's activated gates, not every
  // gate that can theoretically belong to the center.
  for (const gate of Array.from(new Set(allGates))) {
    const gateInfo = HD_GATES[gate as keyof typeof HD_GATES];
    if (gateInfo && centers[gateInfo.center]) {
      centers[gateInfo.center].gates.push(gate);
    }
  }

  Object.keys(centers).forEach(centerName => {
    centers[centerName].gates.sort((a: number, b: number) => a - b);
  });

  // Calculate channels and mark centers as defined
  const channels = HD_CHANNELS.map(channel => {
    const gate1Activated = allGates.includes(channel.gates[0]);
    const gate2Activated = allGates.includes(channel.gates[1]);
    const defined = gate1Activated && gate2Activated;
    
    // If channel is defined, mark both connected centers as defined
    if (defined) {
      channel.connects.forEach(centerName => {
        if (centers[centerName]) {
          centers[centerName].defined = true;
        }
      });
    }
    
    return {
      ...channel,
      defined
    };
  });

  // Calculate type, strategy, authority, profile, definition
  const type = calculateType(centers, channels);
  const strategy = getStrategy(type);
  const authority = calculateAuthority(centers, channels);
  const profile = calculateProfile(activations.conscious.sun.line, activations.unconscious.sun.line);
  const definition = calculateDefinition(centers, channels);

  // The four gate positions are calculated, but official Incarnation Cross
  // naming requires a governed cross table and angle/profile rules that are not
  // implemented in this engine. Preserve the exact gate quartet without
  // inventing a traditional name.
  const incarnationCross =
    `Gate quartet ${activations.conscious.sun.gate}/${activations.conscious.earth.gate} | ` +
    `${activations.unconscious.sun.gate}/${activations.unconscious.earth.gate} (traditional name unresolved)`;

  // Variables require color/tone/base substructure. Line numbers alone are
  // insufficient, so these values remain explicitly unresolved.
  const variables = {
    cognition: "Unresolved — color/tone/base calculation not implemented",
    environment: "Unresolved — color/tone/base calculation not implemented",
    motivation: "Unresolved — color/tone/base calculation not implemented",
    perspective: "Unresolved — color/tone/base calculation not implemented"
  };

  return {
    result: {
      status: 'resolved',
      type,
      strategy,
      authority,
      profile,
      definition,
      centers,
      channels,
      activations,
      activatedGates: Array.from(new Set(allGates)),
      incarnationCross,
      variables
    },
    forensics: solarArcForensics
  };
}

export function calculateHumanDesign(birthData: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: string;
  longitude: string;
  timezone: string;
}): HumanDesignResult {
  const { result } = calculateHumanDesignInternal(birthData);
  return result;
}

export function getHumanDesignInterpretation(hdData: HumanDesignData): string {
  const { type, strategy, authority, profile } = hdData;

  const typeDescriptions = {
    "Manifestor": "You are here to initiate and impact others. Your aura is closed and repelling, designed to make things happen without waiting for others.",
    "Generator": "You are here to respond and build. Your life force energy is sustainable when you're doing what you love and responding to what comes to you.",
    "Manifesting Generator": "You are here to respond and then inform. You have the energy to manifest quickly but must wait to respond before acting.",
    "Projector": "You are here to guide and manage others. Your aura is focused and penetrating, designed to see deeply into others and systems.",
    "Reflector": "You are here to reflect the health of your community. Your completely open aura samples and reflects the energy around you."
  };

  return `As a ${type}, ${typeDescriptions[type as keyof typeof typeDescriptions] || typeDescriptions.Generator} Your strategy is "${strategy}" and your authority is "${authority}". Your profile ${profile} indicates your life theme and how you interact with the world. This combination creates your unique energetic blueprint for navigating life authentically.`;
}

export function calculateHumanDesignWithEvidence(birthData: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: string;
  longitude: string;
  timezone: string;
}): {
  result?: HumanDesignResult;
  evidence: EvidenceEntry[];
} {
  const entries: EvidenceEntry[] = [];
  const internalResult = calculateHumanDesignInternal(birthData);
  const result = internalResult.result;
  const forensics = internalResult.forensics;

  // Track input validation
  const dateValid = isValidDate(birthData.birthDate);
  const timeValid = isValidTime(birthData.birthTime);
  const tzValid = isValidTimezone(birthData.timezone);
  const coordsValid = isValidCoordinates(birthData.latitude, birthData.longitude);
  const allInputsValid = dateValid && timeValid && tzValid && coordsValid;

  if (result.status === 'unresolved') {
    // Create evidence for unresolved calculation
    entries.push(
      createEvidenceEntry(
        'human-design',
        `Human Design Chart`,
        `UNRESOLVED: ${result.reason}`,
        10,
        'unverified',
        {
          inputsUsed: [
            `birth_date_${birthData.birthDate || 'missing'}`,
            `birth_time_${birthData.birthTime || 'missing'}`,
            `timezone_${birthData.timezone || 'missing'}`,
            `location_${birthData.latitude || 'missing'},${birthData.longitude || 'missing'}`,
          ],
          reasoning: [
            `Input validation failed: ${result.reason}`,
            `Date valid: ${dateValid}, Time valid: ${timeValid}, Timezone valid: ${tzValid}, Coordinates valid: ${coordsValid}`,
          ],
          limitations: [
            'Chart calculation requires all inputs to be valid and properly formatted',
            'Birth time is absolute requirement; no noon fallback or guesses permitted',
          ],
          formulaId: 'human-design.calculation',
          formulaVersion: '1.0.0',
          calculationStatus: 'unresolved',
          inputState: allInputsValid ? 'valid' : 'invalid',
          calculatedAt: new Date().toISOString(),
        }
      )
    );

    return { evidence: entries };
  }

  // Type assertion: result is now definitely resolved
  const resolvedResult = result as HumanDesignResolved;

  // Create evidence entries for each HD component
  entries.push(
    createEvidenceEntry(
      'human-design',
      'Human Design Type',
      resolvedResult.type,
      95,
      'high',
      {
        inputsUsed: [
          'defined_centers_count',
          'motor_throat_connections',
          'sacral_definition',
        ],
        reasoning: [
          `Sacral defined: ${resolvedResult.centers.Sacral.defined}`,
          `Throat defined: ${resolvedResult.centers.Throat.defined}`,
          `Type determined by center definitions and connections`,
        ],
        limitations: [
          'Type accuracy depends on accurate birth time and location',
          '88° solar arc calculation affects design authority',
        ],
        formulaId: 'human-design.type',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Strategy',
      resolvedResult.strategy,
      95,
      'high',
      {
        inputsUsed: ['type'],
        reasoning: [
          `Strategy "${resolvedResult.strategy}" derived from type "${resolvedResult.type}"`,
          'Strategy determines how to make decisions and take action',
        ],
        limitations: [
          'Strategy is deterministic from type; no independent verification',
        ],
        formulaId: 'human-design.strategy',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Authority',
      resolvedResult.authority,
      95,
      'high',
      {
        inputsUsed: [
          `solar_plexus_defined_${resolvedResult.centers['Solar Plexus'].defined}`,
          `sacral_defined_${resolvedResult.centers.Sacral.defined}`,
          `spleen_defined_${resolvedResult.centers.Spleen.defined}`,
          `g_center_defined_${resolvedResult.centers.G.defined}`,
        ],
        reasoning: [
          'Authority determined by hierarchical priority of defined centers',
          `Solar Plexus defined: ${resolvedResult.centers['Solar Plexus'].defined}`,
          `Sacral defined: ${resolvedResult.centers.Sacral.defined}`,
          `Spleen defined: ${resolvedResult.centers.Spleen.defined}`,
        ],
        limitations: [
          'Authority accuracy depends on accurate center definitions',
        ],
        formulaId: 'human-design.authority',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Profile',
      resolvedResult.profile,
      90,
      'high',
      {
        inputsUsed: [
          `conscious_sun_line_${resolvedResult.activations!.conscious!.sun!.line}`,
          `unconscious_sun_line_${resolvedResult.activations!.unconscious!.sun!.line}`,
        ],
        reasoning: [
          `Profile ${resolvedResult.profile} determined by conscious and unconscious sun line positions`,
          `Conscious line: ${resolvedResult.activations!.conscious!.sun!.line}, Unconscious line: ${resolvedResult.activations!.unconscious!.sun!.line}`,
          '88° solar arc precisely calculated for unconscious line',
        ],
        limitations: [
          'Profile accuracy depends on precise birth time and 88° arc calculation',
          'Unconscious sun requires calculating position 88° before birth',
        ],
        formulaId: 'human-design.profile',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Definition',
      resolvedResult.definition,
      90,
      'high',
      {
        inputsUsed: [
          `defined_channels_count_${resolvedResult.channels.filter(ch => ch.defined).length}`,
          `connected_components_count`,
        ],
        reasoning: [
          `Definition type: ${resolvedResult.definition}`,
          `Determined by ${resolvedResult.channels.filter(ch => ch.defined).length} defined channels`,
          'Connected components analyzed for relationship pattern',
        ],
        limitations: [
          'Definition depends on accurate gate activations',
        ],
        formulaId: 'human-design.definition',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Gate Quartet (traditional cross name unresolved)',
      resolvedResult.incarnationCross,
      60,
      'moderate',
      {
        inputsUsed: [
          `conscious_sun_gate_${resolvedResult.activations!.conscious!.sun!.gate}`,
        ],
        reasoning: [
          `Conscious Sun/Earth gates: ${resolvedResult.activations!.conscious!.sun!.gate}/${resolvedResult.activations!.conscious!.earth!.gate}`,
          `Design Sun/Earth gates: ${resolvedResult.activations!.unconscious!.sun!.gate}/${resolvedResult.activations!.unconscious!.earth!.gate}`,
          'Traditional Incarnation Cross naming is intentionally withheld until a governed naming table is implemented',
        ],
        limitations: [
          'This records the calculated four-gate cross only; it does not claim an official traditional cross name',
        ],
        formulaId: 'human-design.incarnation-cross',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
      }
    ),

    createEvidenceEntry(
      'human-design',
      'Human Design Activations (88° Solar Arc)',
      {
        conscious_gates: resolvedResult.activations!.conscious,
        unconscious_gates: resolvedResult.activations!.unconscious,
        total_activated_gates: resolvedResult.activatedGates.length,
      },
      85,
      'high',
      {
        inputsUsed: [
          `birth_time_${birthData.birthTime}`,
          `birth_date_${birthData.birthDate}`,
          'astrology_planetary_positions',
          ...(forensics ? [
            `configured_solar_arc_${forensics.configuredSolarArc}`,
            `actual_solar_arc_${forensics.actualSolarArc.toFixed(3)}`,
            `iteration_count_${forensics.iterationCount}`,
            `timezone_resolution_source_${forensics.timezoneResolutionSource}`,
          ] : []),
        ],
        reasoning: [
          `88° solar arc (configured: ${forensics?.configuredSolarArc || 87.975}°, actual: ${forensics?.actualSolarArc.toFixed(3) || 'unknown'}°) precisely calculated for design authority`,
          `${resolvedResult.activatedGates.length} gates activated across conscious and unconscious`,
          'Activations determined by planetary positions at birth and 88° before birth',
          ...(forensics ? [
            `Bisection algorithm completed in ${forensics.iterationCount} iterations`,
            `Final search window: ${forensics.finalSearchWindowDays.toFixed(4)} days (±${forensics.finalToleranceDays.toFixed(4)} days tolerance)`,
            `Timezone resolved via ${forensics.timezoneResolutionSource}`,
          ] : []),
        ],
        limitations: [
          'Activation accuracy depends on precise birth time and timezone',
          '88° arc is empirically calibrated constant (87.975° target)',
          'Astrology ephemeris used for position calculations',
          ...(forensics ? [
            `Achieved arc within ${forensics.finalToleranceDays.toFixed(4)} days of tolerance`,
          ] : []),
        ],
        formulaId: 'human-design.activations',
        formulaVersion: '1.0.0',
        calculationStatus: 'resolved',
        inputState: 'valid',
        calculatedAt: new Date().toISOString(),
        metadata: forensics ? {
          solar_arc_receipt: {
            configuredSolarArc: forensics.configuredSolarArc,
            actualSolarArc: forensics.actualSolarArc,
            iterationCount: forensics.iterationCount,
            finalSearchWindowDays: forensics.finalSearchWindowDays,
            finalToleranceDays: forensics.finalToleranceDays,
            resolvedTimezone: forensics.resolvedTimezone,
            timezoneResolutionSource: forensics.timezoneResolutionSource,
            algorithmId: forensics.algorithmId,
            algorithmVersion: forensics.algorithmVersion,
          }
        } : undefined,
      }
    )
  );

  return { result: resolvedResult, evidence: entries };
}
