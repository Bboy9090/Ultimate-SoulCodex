// Mayan Astrology - Tzolkin Calendar, Day Signs (Kin), Galactic Signature

const DAY_SIGNS = [
  { name: "Imix", glyph: "🐊", meaning: "Dragon/Crocodile", element: "Water", power: "Nurtures", action: "Being", essence: "Birth", keywords: ["Primal", "Nurturing", "Trust"] },
  { name: "Ik", glyph: "🌬️", meaning: "Wind", element: "Air", power: "Communicates", action: "Spirit", essence: "Breath", keywords: ["Communication", "Spirit", "Inspiration"] },
  { name: "Akbal", glyph: "🌙", meaning: "Night", element: "Earth", power: "Dreams", action: "Intuition", essence: "Abundance", keywords: ["Dreaming", "Mystery", "Abundance"] },
  { name: "Kan", glyph: "🌾", meaning: "Seed", element: "Fire", power: "Targets", action: "Awareness", essence: "Flowering", keywords: ["Growth", "Potential", "Awareness"] },
  { name: "Chicchan", glyph: "🐍", meaning: "Serpent", element: "Earth", power: "Survives", action: "Instinct", essence: "Life Force", keywords: ["Kundalini", "Vitality", "Passion"] },
  { name: "Cimi", glyph: "💀", meaning: "Transformer", element: "Water", power: "Releases", action: "Surrender", essence: "Death/Rebirth", keywords: ["Transformation", "Release", "Transcendence"] },
  { name: "Manik", glyph: "🦌", meaning: "Deer", element: "Air", power: "Knows", action: "Accomplishment", essence: "Healing", keywords: ["Healing", "Tools", "Completion"] },
  { name: "Lamat", glyph: "⭐", meaning: "Star/Rabbit", element: "Fire", power: "Harmonizes", action: "Elegance", essence: "Art", keywords: ["Beauty", "Harmony", "Venus"] },
  { name: "Muluc", glyph: "💧", meaning: "Moon/Water", element: "Water", power: "Purifies", action: "Universal Water", essence: "Offering", keywords: ["Purification", "Emotion", "Flow"] },
  { name: "Oc", glyph: "🐕", meaning: "Dog", element: "Earth", power: "Loves", action: "Loyalty", essence: "Heart", keywords: ["Love", "Loyalty", "Guidance"] },
  { name: "Chuen", glyph: "🐒", meaning: "Monkey", element: "Air", power: "Plays", action: "Illusion", essence: "Magic", keywords: ["Play", "Creativity", "Magic"] },
  { name: "Eb", glyph: "🛤️", meaning: "Road", element: "Fire", power: "Organizes", action: "Space", essence: "Abundance", keywords: ["Path", "Destiny", "Human"] },
  { name: "Ben", glyph: "🌱", meaning: "Reed/Corn", element: "Earth", power: "Channels", action: "Navigation", essence: "Pillar", keywords: ["Authority", "Growth", "Pillar"] },
  { name: "Ix", glyph: "🐆", meaning: "Jaguar", element: "Water", power: "Intuits", action: "Heart Intelligence", essence: "Magic", keywords: ["Shamanc", "Mysticism", "Feminine Power"] },
  { name: "Men", glyph: "🦅", meaning: "Eagle", element: "Air", power: "Creates", action: "Vision", essence: "Mind", keywords: ["Vision", "Mind", "Creation"] },
  { name: "Cib", glyph: "🕊️", meaning: "Owl/Vulture", element: "Fire", power: "Questions", action: "Fearlessness", essence: "Wisdom", keywords: ["Wisdom", "Ancient Knowledge", "Forgiveness"] },
  { name: "Caban", glyph: "🌍", meaning: "Earth", element: "Earth", power: "Evolves", action: "Synchronicity", essence: "Navigation", keywords: ["Earth", "Movement", "Synchronicity"] },
  { name: "Etznab", glyph: "🔮", meaning: "Mirror/Flint", element: "Water", power: "Reflects", action: "Endlessness", essence: "Reflection", keywords: ["Mirror", "Truth", "Reflection"] },
  { name: "Cauac", glyph: "⚡", meaning: "Storm", element: "Air", power: "Catalyzes", action: "Self-Generation", essence: "Transformation", keywords: ["Storm", "Transformation", "Energy"] },
  { name: "Ahau", glyph: "☀️", meaning: "Sun/Lord", element: "Fire", power: "Enlightens", action: "Universal Fire", essence: "Ascension", keywords: ["Enlightenment", "Mastery", "Sun"] }
];

const TONES = [
  { number: 1, name: "Magnetic", purpose: "Unify", action: "Attract", essence: "Purpose" },
  { number: 2, name: "Lunar", purpose: "Polarize", action: "Challenge", essence: "Duality" },
  { number: 3, name: "Electric", purpose: "Activate", action: "Bond", essence: "Service" },
  { number: 4, name: "Self-Existing", purpose: "Define", action: "Measure", essence: "Form" },
  { number: 5, name: "Overtone", purpose: "Empower", action: "Command", essence: "Radiance" },
  { number: 6, name: "Rhythmic", purpose: "Organize", action: "Balance", essence: "Equality" },
  { number: 7, name: "Resonant", purpose: "Channel", action: "Inspire", essence: "Attunement" },
  { number: 8, name: "Galactic", purpose: "Harmonize", action: "Model", essence: "Integrity" },
  { number: 9, name: "Solar", purpose: "Pulse", action: "Realize", essence: "Intention" },
  { number: 10, name: "Planetary", purpose: "Perfect", action: "Produce", essence: "Manifestation" },
  { number: 11, name: "Spectral", purpose: "Dissolve", action: "Release", essence: "Liberation" },
  { number: 12, name: "Crystal", purpose: "Dedicate", action: "Universalize", essence: "Cooperation" },
  { number: 13, name: "Cosmic", purpose: "Endure", action: "Transcend", essence: "Presence" }
];

interface MayanAstrologyData {
  kin: number; // 1-260
  daySign: typeof DAY_SIGNS[0];
  galacticTone: typeof TONES[0];
  wavespell: {
    sign: typeof DAY_SIGNS[0];
    theme: string;
  };
  oracle: {
    guide: typeof DAY_SIGNS[0];
    challenge: typeof DAY_SIGNS[0];
    occult: typeof DAY_SIGNS[0];
    analog: typeof DAY_SIGNS[0];
  };
  interpretation: {
    galacticSignature: string;
    lifePurpose: string;
    spiritualGifts: string[];
    destiny: string;
  };
}

function calculateKin(birthDate: string): number {
  const startDate = new Date('1987-07-26'); // Harmonic Convergence
  const birth = new Date(birthDate);
  const daysDiff = Math.floor((birth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return ((daysDiff % 260) + 260) % 260 || 260; // Kin 1-260
}

export function calculateMayanAstrology(birthDate: string): MayanAstrologyData {
  const kin = calculateKin(birthDate);
  
  // Calculate Day Sign and Tone from Kin
  const toneNumber = ((kin - 1) % 13) + 1;
  const daySignIndex = (kin - 1) % 20;
  
  const daySign = DAY_SIGNS[daySignIndex];
  const galacticTone = TONES[toneNumber - 1];
  
  // Calculate Wavespell (13-day period)
  const wavespellIndex = Math.floor((kin - 1) / 13) % 20;
  const wavespell = {
    sign: DAY_SIGNS[wavespellIndex],
    theme: `Journey of ${DAY_SIGNS[wavespellIndex].name}`
  };
  
  // Calculate Oracle (directional kin)
  const guide = DAY_SIGNS[(daySignIndex + toneNumber - 1) % 20];
  const challenge = DAY_SIGNS[(daySignIndex + 10) % 20]; // Opposite
  const occult = DAY_SIGNS[(19 - daySignIndex) % 20]; // Mirror
  const analog = DAY_SIGNS[(daySignIndex + 10) % 20]; // Analog partner
  
  return {
    kin,
    daySign,
    galacticTone,
    wavespell,
    oracle: {
      guide,
      challenge,
      occult,
      analog
    },
    interpretation: {
      galacticSignature: `${galacticTone.name} ${daySign.name} - Kin ${kin}. Your galactic signature combines ${galacticTone.purpose.toLowerCase()} (${galacticTone.name} tone) with ${daySign.power.toLowerCase()} (${daySign.name} energy).`,
      lifePurpose: `Your purpose is to ${galacticTone.purpose.toLowerCase()} through ${daySign.action.toLowerCase()}. This manifests as ${daySign.essence.toLowerCase()} energy in the world.`,
      spiritualGifts: daySign.keywords,
      destiny: `Born in the ${wavespell.sign.name} wavespell, you are learning ${wavespell.sign.keywords[0].toLowerCase()} and ${wavespell.sign.keywords[1].toLowerCase()}. Your ${daySign.element} nature guides you to ${daySign.power.toLowerCase()}.`
    }
  };
}
