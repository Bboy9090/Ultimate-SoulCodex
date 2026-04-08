import { calculateAstrology } from './astrology';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import * as geoTz from 'geo-tz';

// Human Design Gates mapped to their correct centers and meanings
const HD_GATES = {
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
const HD_CENTERS = {
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
  { gates: [35, 36], name: "Channel of Transitoriness", description: "A design of a 'jack of all trades'", connects: ["Throat", "Solar Plexus"] },
  { gates: [37, 40], name: "Channel of Community", description: "A design of part of the whole", connects: ["Solar Plexus", "Heart"] },
  { gates: [39, 55], name: "Channel of Emoting", description: "A design of moodiness", connects: ["Root", "Solar Plexus"] },
  { gates: [42, 53], name: "Channel of Maturation", description: "A design of balanced development", connects: ["Sacral", "Root"] },
  { gates: [47, 64], name: "Channel of Abstraction", description: "A design of mental activity mixed with clarity", connects: ["Ajna", "Head"] }
];

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
  activations: {
    conscious: {
      sun: { gate: number; line: number };
      earth: { gate: number; line: number };
      moon: { gate: number; line: number };
      northNode: { gate: number; line: number };
      southNode: { gate: number; line: number };
      mercury: { gate: number; line: number };
      venus: { gate: number; line: number };
      mars: { gate: number; line: number };
      jupiter: { gate: number; line: number };
      saturn: { gate: number; line: number };
      uranus: { gate: number; line: number };
      neptune: { gate: number; line: number };
      pluto: { gate: number; line: number };
    };
    unconscious: {
      sun: { gate: number; line: number };
      earth: { gate: number; line: number };
      moon: { gate: number; line: number };
      northNode: { gate: number; line: number };
      southNode: { gate: number; line: number };
      mercury: { gate: number; line: number };
      venus: { gate: number; line: number };
      mars: { gate: number; line: number };
      jupiter: { gate: number; line: number };
      saturn: { gate: number; line: number };
      uranus: { gate: number; line: number };
      neptune: { gate: number; line: number };
      pluto: { gate: number; line: number };
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
  // Normalize degree to 0-360 range
  degree = ((degree % 360) + 360) % 360;
  
  // Find the gate that contains this degree
  let gateInfo = GATE_ZODIAC_MAP[0]; // default to first gate
  
  for (let i = 0; i < GATE_ZODIAC_MAP.length; i++) {
    const current = GATE_ZODIAC_MAP[i];
    const next = GATE_ZODIAC_MAP[(i + 1) % GATE_ZODIAC_MAP.length];
    
    // Handle wrap-around at 360/0 degrees
    if (current.start > next.start) {
      // This is the wrap point (Gate 36 -> Gate 25)
      if (degree >= current.start || degree < next.start) {
        gateInfo = current;
        break;
      }
    } else {
      // Normal case
      if (degree >= current.start && degree < next.start) {
        gateInfo = current;
        break;
      }
    }
  }
  
  // Calculate line within the gate (each gate spans 5.625 degrees, each line 0.9375 degrees)
  let positionInGate = degree - gateInfo.start;
  if (positionInGate < 0) positionInGate += 360; // handle wrap-around
  
  const line = Math.floor(positionInGate / 0.9375) + 1;
  
  return { gate: gateInfo.gate, line: Math.min(line, 6) };
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
function hasMotorToThroatConnection(channels: any[], centers: any): boolean {
  if (!centers.Throat.defined) return false;
  
  const definedChannels = channels.filter(ch => ch.defined);
  
  for (const channel of definedChannels) {
    const connectsCenters = channel.connects;
    if (connectsCenters.includes("Throat") && 
        connectsCenters.some((c: string) => isMotorCenter(c) && centers[c]?.defined)) {
      return true;
    }
  }
  
  return false;
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
    // Check for direct sacral-throat connection for Manifesting Generator
    const hasSacralThroatConnection = channels.some(ch => 
      ch.defined && 
      ch.connects.includes("Sacral") && 
      ch.connects.includes("Throat")
    );
    
    if (hasSacralThroatConnection) {
      return "Manifesting Generator";
    }
    return "Generator";
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
function calculateAuthority(centers: any): string {
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
  if (centers.G.defined && centers.Throat.defined) {
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

function resolveHDTimezone(inputTimezone: string, latitude: number, longitude: number): string {
  if (inputTimezone.includes('/')) {
    return inputTimezone;
  }
  
  try {
    const timezones = geoTz.find(latitude, longitude);
    if (timezones && timezones.length > 0) {
      return timezones[0];
    }
  } catch (error) {
    console.warn('Geo-tz lookup failed, falling back to mapping:', error);
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
  
  return 'UTC';
}

export function calculateHumanDesign(birthData: {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: string;
  longitude: string;
  timezone: string;
}): HumanDesignData {
  // Get astrological data first (conscious/personality)
  const astroData = calculateAstrology(birthData);
  
  // Calculate 88° of solar arc before birth for unconscious/design data  
  // Human Design uses exactly 88° of solar arc, not a fixed number of days
  // Note: Empirically calibrated to match official calculators (Jovian Archive, mybodygraph, etc.)
  const DESIGN_SOLAR_ARC = 87.975;
  
  // Calculate birth Sun's absolute longitude
  const birthSunLongitude = calculateAbsoluteLongitude(astroData.planets.sun.sign, astroData.planets.sun.degree);
  
  // Calculate target longitude (88° before birth)
  let targetLongitude = birthSunLongitude - DESIGN_SOLAR_ARC;
  if (targetLongitude < 0) targetLongitude += 360;
  
  // Resolve timezone properly
  const resolvedTimezone = resolveHDTimezone(
    birthData.timezone,
    parseFloat(birthData.latitude),
    parseFloat(birthData.longitude)
  );
  
  // Create birth time in the correct timezone
  const [year, month, day] = birthData.birthDate.split('-').map(Number);
  const [hours, minutes] = birthData.birthTime.split(':').map(Number);
  const localTimeString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  
  const birthTimeUTC = fromZonedTime(new Date(localTimeString), resolvedTimezone);
  
  // Find the date when Sun was at target longitude using bisection
  // The Sun moves forward, so we search backwards from birth
  let minDays = 80;  // Minimum days to search (Sun at faster speed)
  let maxDays = 95;  // Maximum days to search (Sun at slower speed)
  let iteration = 0;
  const maxIterations = 20;
  let unconsciousTimeUTC = new Date(birthTimeUTC.getTime() - (88 * 24 * 60 * 60 * 1000));
  
  while (iteration < maxIterations && (maxDays - minDays) > 0.01) {
    const midDays = (minDays + maxDays) / 2;
    const testTimeUTC = new Date(birthTimeUTC.getTime() - (midDays * 24 * 60 * 60 * 1000));
    const testTimeLocal = toZonedTime(testTimeUTC, resolvedTimezone);
    
    const testYear = testTimeLocal.getFullYear();
    const testMonth = String(testTimeLocal.getMonth() + 1).padStart(2, '0');
    const testDay = String(testTimeLocal.getDate()).padStart(2, '0');
    const testHours = String(testTimeLocal.getHours()).padStart(2, '0');
    const testMinutes = String(testTimeLocal.getMinutes()).padStart(2, '0');
    
    const testAstro = calculateAstrology({
      ...birthData,
      birthDate: `${testYear}-${testMonth}-${testDay}`,
      birthTime: `${testHours}:${testMinutes}`
    });
    
    const testSunLongitude = calculateAbsoluteLongitude(testAstro.planets.sun.sign, testAstro.planets.sun.degree);
    
    // Calculate angular distance (accounting for 360° wrap)
    let diff = testSunLongitude - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    // If test Sun is ahead of target, we need to go back more days
    if (diff > 0) {
      minDays = midDays;
    } else {
      maxDays = midDays;
    }
    
    unconsciousTimeUTC = testTimeUTC;
    iteration++;
  }
  
  const unconsciousTimeLocal = toZonedTime(unconsciousTimeUTC, resolvedTimezone);
  const unconsciousYear = unconsciousTimeLocal.getFullYear();
  const unconsciousMonth = String(unconsciousTimeLocal.getMonth() + 1).padStart(2, '0');
  const unconsciousDay = String(unconsciousTimeLocal.getDate()).padStart(2, '0');
  const unconsciousHours = String(unconsciousTimeLocal.getHours()).padStart(2, '0');
  const unconsciousMinutes = String(unconsciousTimeLocal.getMinutes()).padStart(2, '0');
  
  const unconsciousAstroData = calculateAstrology({
    ...birthData,
    birthDate: `${unconsciousYear}-${unconsciousMonth}-${unconsciousDay}`,
    birthTime: `${unconsciousHours}:${unconsciousMinutes}`
  });
  
  const unconsciousSunLongitude = calculateAbsoluteLongitude(unconsciousAstroData.planets.sun.sign, unconsciousAstroData.planets.sun.degree);
  const actualArc = (birthSunLongitude - unconsciousSunLongitude + 360) % 360;

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

  // First, add ALL gates to their respective centers
  Object.entries(HD_GATES).forEach(([gateNum, gateInfo]) => {
    const gate = parseInt(gateNum);
    const centerName = gateInfo.center;
    if (centers[centerName]) {
      centers[centerName].gates.push(gate);
    }
  });

  // Sort gates numerically for each center
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
  const authority = calculateAuthority(centers);
  const profile = calculateProfile(activations.conscious.sun.line, activations.unconscious.sun.line);
  const definition = calculateDefinition(centers, channels);

  // Calculate incarnation cross
  const incarnationCross = `Right Angle Cross of ${HD_GATES[activations.conscious.sun.gate as keyof typeof HD_GATES].name}`;

  // Calculate variables based on line positions
  const variables = {
    cognition: activations.conscious.sun.line <= 3 ? "Focused" : "Peripheral",
    environment: activations.conscious.earth.line <= 3 ? "Markets" : "Caves",
    motivation: activations.unconscious.sun.line <= 3 ? "Fear" : "Hope",
    perspective: activations.unconscious.earth.line <= 3 ? "Personal" : "Transpersonal"
  };

  return {
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
  };
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
