// Comprehensive Zodiac Compatibility System
// Based on elements, modalities, and specific sign pairings

export interface ZodiacCompatResult {
  score: number;
  explanation: string;
  strengths: string[];
  challenges: string[];
}

const ELEMENTS = {
  Fire: ["Aries", "Leo", "Sagittarius"],
  Earth: ["Taurus", "Virgo", "Capricorn"],
  Air: ["Gemini", "Libra", "Aquarius"],
  Water: ["Cancer", "Scorpio", "Pisces"]
};

const MODALITIES = {
  Cardinal: ["Aries", "Cancer", "Libra", "Capricorn"],
  Fixed: ["Taurus", "Leo", "Scorpio", "Aquarius"],
  Mutable: ["Gemini", "Virgo", "Sagittarius", "Pisces"]
};

function getElement(sign: string): string {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return "";
}

function getModality(sign: string): string {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return "";
}

// Specific high-compatibility pairings
const EXCELLENT_PAIRS: { [key: string]: string[] } = {
  Aries: ["Leo", "Sagittarius", "Gemini", "Aquarius"],
  Taurus: ["Virgo", "Capricorn", "Cancer", "Pisces"],
  Gemini: ["Libra", "Aquarius", "Aries", "Leo"],
  Cancer: ["Scorpio", "Pisces", "Taurus", "Virgo"],
  Leo: ["Aries", "Sagittarius", "Gemini", "Libra"],
  Virgo: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
  Libra: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
  Scorpio: ["Cancer", "Pisces", "Virgo", "Capricorn"],
  Sagittarius: ["Aries", "Leo", "Libra", "Aquarius"],
  Capricorn: ["Taurus", "Virgo", "Scorpio", "Pisces"],
  Aquarius: ["Gemini", "Libra", "Aries", "Sagittarius"],
  Pisces: ["Cancer", "Scorpio", "Taurus", "Capricorn"]
};

// Challenging but growth-oriented pairings
const CHALLENGING_PAIRS: { [key: string]: string[] } = {
  Aries: ["Cancer", "Capricorn"],
  Taurus: ["Leo", "Aquarius"],
  Gemini: ["Virgo", "Pisces"],
  Cancer: ["Aries", "Libra"],
  Leo: ["Taurus", "Scorpio"],
  Virgo: ["Gemini", "Sagittarius"],
  Libra: ["Cancer", "Capricorn"],
  Scorpio: ["Leo", "Aquarius"],
  Sagittarius: ["Virgo", "Pisces"],
  Capricorn: ["Aries", "Libra"],
  Aquarius: ["Taurus", "Scorpio"],
  Pisces: ["Gemini", "Sagittarius"]
};

// Opposite signs (high tension but magnetic attraction)
const OPPOSITES: { [key: string]: string } = {
  Aries: "Libra",
  Taurus: "Scorpio",
  Gemini: "Sagittarius",
  Cancer: "Capricorn",
  Leo: "Aquarius",
  Virgo: "Pisces",
  Libra: "Aries",
  Scorpio: "Taurus",
  Sagittarius: "Gemini",
  Capricorn: "Cancer",
  Aquarius: "Leo",
  Pisces: "Virgo"
};

export function calculateZodiacCompatibility(sign1: string, sign2: string): ZodiacCompatResult {
  const element1 = getElement(sign1);
  const element2 = getElement(sign2);
  const modality1 = getModality(sign1);
  const modality2 = getModality(sign2);

  let score = 50; // Base score
  let explanation = "";
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Same sign
  if (sign1 === sign2) {
    score = 75;
    explanation = `Two ${sign1} individuals understand each other deeply but may mirror each other's flaws.`;
    strengths.push("Deep mutual understanding", "Shared values and approach to life", "Natural rhythm together");
    challenges.push("May enable each other's weaknesses", "Risk of stagnation", "Need outside perspectives");
    return { score, explanation, strengths, challenges };
  }

  // Opposite signs (tension and attraction)
  if (OPPOSITES[sign1] === sign2) {
    score = 72;
    explanation = `${sign1} and ${sign2} are opposite signs, creating magnetic attraction and dynamic tension that promotes growth.`;
    strengths.push("Powerful attraction", "Learn from differences", "Balance each other's extremes");
    challenges.push("Can clash on fundamental approaches", "Requires compromise", "May feel too different at times");
    return { score, explanation, strengths, challenges };
  }

  // Same element (natural harmony)
  if (element1 === element2) {
    score = 88;
    explanation = `Both ${element1} signs, ${sign1} and ${sign2} share a natural rhythm and understanding.`;
    
    if (element1 === "Fire") {
      strengths.push("Passionate connection", "Shared enthusiasm and energy", "Mutual encouragement");
      challenges.push("May burn too hot", "Competition for attention", "Impulsive decisions together");
    } else if (element1 === "Earth") {
      strengths.push("Stable foundation", "Shared practical goals", "Reliable partnership");
      challenges.push("May be too cautious", "Risk of routine", "Resistance to change");
    } else if (element1 === "Air") {
      strengths.push("Intellectual stimulation", "Great communication", "Freedom and space");
      challenges.push("Emotional distance possible", "Overthinking issues", "May avoid conflict");
    } else if (element1 === "Water") {
      strengths.push("Deep emotional bond", "Intuitive understanding", "Nurturing connection");
      challenges.push("Mood sensitivity", "May be too emotional", "Boundary issues");
    }
    return { score, explanation, strengths, challenges };
  }

  // Excellent compatibility pairs
  if (EXCELLENT_PAIRS[sign1]?.includes(sign2)) {
    score = 85;
    
    // Determine relationship type
    if ((element1 === "Fire" && element2 === "Air") || (element1 === "Air" && element2 === "Fire")) {
      explanation = `${sign1} (${element1}) and ${sign2} (${element2}) create an exciting, dynamic partnership. Air feeds Fire, Fire inspires Air.`;
      strengths.push("Stimulating connection", "Shared love of adventure", "Growth-oriented");
      challenges.push("May lack emotional depth", "Can be inconsistent", "Need grounding");
    } else if ((element1 === "Earth" && element2 === "Water") || (element1 === "Water" && element2 === "Earth")) {
      explanation = `${sign1} (${element1}) and ${sign2} (${element2}) form a nurturing, stable bond. Earth provides structure, Water brings emotional depth.`;
      strengths.push("Emotionally secure", "Build together effectively", "Mutual support");
      challenges.push("May resist change", "Can be too serious", "Need spontaneity");
    } else {
      explanation = `${sign1} and ${sign2} have natural compatibility with complementary strengths.`;
      strengths.push("Compatible energies", "Mutual respect", "Balanced dynamic");
      challenges.push("Occasional misunderstandings", "Different pacing", "Growth requires effort");
    }
    return { score, explanation, strengths, challenges };
  }

  // Challenging pairs (squares - same modality, different elements)
  if (CHALLENGING_PAIRS[sign1]?.includes(sign2)) {
    score = 55;
    explanation = `${sign1} and ${sign2} form a challenging square aspect, creating friction that can lead to growth if worked through.`;
    strengths.push("Growth through challenge", "Learn new perspectives", "Dynamic interaction");
    challenges.push("Different fundamental approaches", "Frequent misunderstandings", "Requires patience and compromise");
    return { score, explanation, strengths, challenges };
  }

  // Compatible elements (Fire/Air or Earth/Water)
  if ((element1 === "Fire" && element2 === "Air") || (element1 === "Air" && element2 === "Fire")) {
    score = 78;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have complementary energies - Air fuels Fire, Fire warms Air.`;
    strengths.push("Exciting partnership", "Intellectual and passionate", "Inspire each other");
    challenges.push("May lack depth", "Can be restless", "Need emotional grounding");
  } else if ((element1 === "Earth" && element2 === "Water") || (element1 === "Water" && element2 === "Earth")) {
    score = 78;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) complement each other - Water nourishes Earth, Earth contains Water.`;
    strengths.push("Stable and nurturing", "Emotional security", "Build lasting foundations");
    challenges.push("May avoid risks", "Can be too cautious", "Need adventure");
  }

  // Incompatible elements (Fire/Water or Earth/Air or Fire/Earth)
  else if ((element1 === "Fire" && element2 === "Water") || (element1 === "Water" && element2 === "Fire")) {
    score = 58;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have conflicting energies - Fire and Water can create steam or extinguish each other.`;
    strengths.push("Intense connection", "Learn balance", "Passionate but volatile");
    challenges.push("Emotional vs. action-oriented", "Different needs", "Requires understanding");
  } else if ((element1 === "Earth" && element2 === "Air") || (element1 === "Air" && element2 === "Earth")) {
    score = 62;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) approach life differently - Earth seeks security, Air seeks freedom.`;
    strengths.push("Balance practical and intellectual", "Broaden perspectives", "Complementary skills");
    challenges.push("Different priorities", "Communication gaps", "Requires compromise");
  } else if ((element1 === "Fire" && element2 === "Earth") || (element1 === "Earth" && element2 === "Fire")) {
    score = 55;
    explanation = `${sign1} (${element1}) and ${sign2} (${element2}) have very different approaches - Fire is impulsive and passionate while Earth is steady and practical.`;
    strengths.push("Can balance each other out", "Learn different perspectives", "Create through action + planning");
    challenges.push("Different paces of life", "Fire may feel restricted, Earth may feel rushed", "Requires patience and understanding");
  }

  // Same modality (different elements)
  if (modality1 === modality2 && element1 !== element2) {
    if (score < 65) {
      score += 8;
      if (strengths.length > 0) {
        strengths.push("Shared pace and initiative");
      }
    }
  }

  // Fallback for any uncaught combinations
  if (!explanation) {
    score = 60;
    explanation = `${sign1} and ${sign2} have moderate compatibility, requiring effort and understanding to make the relationship work.`;
    strengths.push("Opportunity for growth", "Learn from differences", "Can build with effort");
    challenges.push("Different natural approaches", "Requires conscious effort", "May need to work harder on understanding");
  }

  return { score, explanation, strengths, challenges };
}
