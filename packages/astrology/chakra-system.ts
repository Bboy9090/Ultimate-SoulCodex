// Chakra System - 7 Energy Centers + Birth Chart Activations

interface Chakra {
  name: string;
  sanskrit: string;
  location: string;
  color: string;
  element: string;
  frequency: number;
  themes: string[];
  crystals: string[];
  affirmation: string;
}

const CHAKRAS: Chakra[] = [
  {
    name: "Root",
    sanskrit: "Muladhara",
    location: "Base of spine",
    color: "Red",
    element: "Earth",
    frequency: 396,
    themes: ["Survival", "Security", "Grounding", "Foundation"],
    crystals: ["Red Jasper", "Black Tourmaline", "Hematite"],
    affirmation: "I am safe, secure, and grounded in my physical body."
  },
  {
    name: "Sacral",
    sanskrit: "Svadhisthana",
    location: "Below navel",
    color: "Orange",
    element: "Water",
    frequency: 417,
    themes: ["Creativity", "Sexuality", "Emotions", "Pleasure"],
    crystals: ["Carnelian", "Orange Calcite", "Sunstone"],
    affirmation: "I embrace my creativity and honor my emotions."
  },
  {
    name: "Solar Plexus",
    sanskrit: "Manipura",
    location: "Above navel",
    color: "Yellow",
    element: "Fire",
    frequency: 528,
    themes: ["Power", "Will", "Confidence", "Identity"],
    crystals: ["Citrine", "Tiger's Eye", "Yellow Jasper"],
    affirmation: "I am powerful, confident, and worthy."
  },
  {
    name: "Heart",
    sanskrit: "Anahata",
    location: "Center of chest",
    color: "Green",
    element: "Air",
    frequency: 639,
    themes: ["Love", "Compassion", "Connection", "Healing"],
    crystals: ["Rose Quartz", "Green Aventurine", "Emerald"],
    affirmation: "I give and receive love freely and unconditionally."
  },
  {
    name: "Throat",
    sanskrit: "Vishuddha",
    location: "Throat",
    color: "Blue",
    element: "Sound",
    frequency: 741,
    themes: ["Communication", "Expression", "Truth", "Voice"],
    crystals: ["Blue Lace Agate", "Aquamarine", "Lapis Lazuli"],
    affirmation: "I speak my truth clearly and authentically."
  },
  {
    name: "Third Eye",
    sanskrit: "Ajna",
    location: "Between eyebrows",
    color: "Indigo",
    element: "Light",
    frequency: 852,
    themes: ["Intuition", "Wisdom", "Vision", "Insight"],
    crystals: ["Amethyst", "Labradorite", "Fluorite"],
    affirmation: "I trust my intuition and inner wisdom."
  },
  {
    name: "Crown",
    sanskrit: "Sahasrara",
    location: "Top of head",
    color: "Violet/White",
    element: "Consciousness",
    frequency: 963,
    themes: ["Spirituality", "Unity", "Enlightenment", "Divine Connection"],
    crystals: ["Clear Quartz", "Selenite", "Amethyst"],
    affirmation: "I am connected to divine consciousness and infinite wisdom."
  }
];

interface ChakraActivation {
  chakra: Chakra;
  activationLevel: number; // 0-100
  status: "Blocked" | "Balanced" | "Overactive";
  planetaryInfluence: string[];
  recommendations: string[];
}

interface ChakraProfile {
  activations: ChakraActivation[];
  dominantChakra: ChakraActivation;
  blockedChakras: ChakraActivation[];
  interpretation: {
    summary: string;
    energyFlow: string;
    spiritualPath: string;
    healingGuidance: string[];
  };
}

function calculateChakraActivation(
  chakraIndex: number,
  astrology: any,
  numerology: any
): { level: number; status: "Blocked" | "Balanced" | "Overactive"; planets: string[] } {
  let level = 50; // Base level
  const planets: string[] = [];
  
  // Map chakras to astrological influences
  const chakraRulers: { [key: number]: string[] } = {
    0: ["Mars", "Saturn"], // Root - survival, structure
    1: ["Moon", "Venus"], // Sacral - emotions, pleasure
    2: ["Sun", "Mars"], // Solar Plexus - will, power
    3: ["Venus", "Moon"], // Heart - love, nurturing
    4: ["Mercury"], // Throat - communication
    5: ["Neptune", "Moon"], // Third Eye - intuition
    6: ["Uranus", "Neptune"] // Crown - spirituality
  };
  
  // Check planetary activations (simplified)
  if (astrology?.sunSign) {
    const fireSigns = ["Aries", "Leo", "Sagittarius"];
    const earthSigns = ["Taurus", "Virgo", "Capricorn"];
    const airSigns = ["Gemini", "Libra", "Aquarius"];
    const waterSigns = ["Cancer", "Scorpio", "Pisces"];
    
    if (chakraIndex === 0 && earthSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 1 && waterSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 2 && fireSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
    if (chakraIndex === 4 && airSigns.includes(astrology.sunSign)) {
      level += 20;
      planets.push("Sun");
    }
  }
  
  // Numerology influence
  if (numerology?.lifePath) {
    const lpMap: { [key: number]: number } = { 1: 2, 2: 3, 3: 4, 4: 0, 5: 1, 6: 3, 7: 5, 8: 2, 9: 6 };
    if (lpMap[numerology.lifePath] === chakraIndex) {
      level += 15;
    }
  }
  
  // Determine status
  let status: "Blocked" | "Balanced" | "Overactive";
  if (level < 40) status = "Blocked";
  else if (level > 75) status = "Overactive";
  else status = "Balanced";
  
  return { level: Math.min(100, level), status, planets };
}

export function calculateChakraSystem(
  astrologyData?: any,
  numerologyData?: any,
  personalityData?: any
): ChakraProfile {
  const activations: ChakraActivation[] = CHAKRAS.map((chakra, index) => {
    const activation = calculateChakraActivation(index, astrologyData, numerologyData);
    
    const recommendations: string[] = [];
    if (activation.status === "Blocked") {
      recommendations.push(`Meditate with ${chakra.crystals[0]} to open ${chakra.name} chakra`);
      recommendations.push(`Practice affirmation: "${chakra.affirmation}"`);
      recommendations.push(`Focus on ${chakra.themes[0].toLowerCase()} and ${chakra.themes[1].toLowerCase()}`);
    } else if (activation.status === "Overactive") {
      recommendations.push(`Ground ${chakra.name} chakra energy through ${CHAKRAS[0].element} practices`);
      recommendations.push(`Balance with opposite chakra meditation`);
    }
    
    return {
      chakra,
      activationLevel: activation.level,
      status: activation.status,
      planetaryInfluence: activation.planets,
      recommendations
    };
  });
  
  const dominantChakra = activations.reduce((max, curr) => 
    curr.activationLevel > max.activationLevel ? curr : max
  );
  
  const blockedChakras = activations.filter(a => a.status === "Blocked");
  
  return {
    activations,
    dominantChakra,
    blockedChakras,
    interpretation: {
      summary: `Your dominant chakra is ${dominantChakra.chakra.name} (${dominantChakra.chakra.sanskrit}), activated at ${dominantChakra.activationLevel}%. This reveals your primary energy focus on ${dominantChakra.chakra.themes.join(', ').toLowerCase()}.`,
      energyFlow: blockedChakras.length === 0 
        ? "Your chakras show balanced energy flow, allowing spiritual energy to move freely through all centers."
        : `${blockedChakras.length} chakra(s) need attention: ${blockedChakras.map(c => c.chakra.name).join(', ')}. Focus on clearing these blockages for optimal energy flow.`,
      spiritualPath: `Your ${dominantChakra.chakra.name} chakra dominance suggests a spiritual path centered on ${dominantChakra.chakra.themes[0].toLowerCase()}. The ${dominantChakra.chakra.element} element guides your practices.`,
      healingGuidance: [
        `Work with ${dominantChakra.chakra.color} light visualization`,
        `Chant the frequency ${dominantChakra.chakra.frequency} Hz for resonance`,
        ...dominantChakra.recommendations
      ]
    }
  };
}
