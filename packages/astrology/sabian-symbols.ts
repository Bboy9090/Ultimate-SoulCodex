// Sabian Symbols - 360 Degree Symbols for Zodiac
// Each degree of the zodiac has a unique symbolic image

import { generateText, isGeminiAvailable } from "./gemini";
import memoize from "memoizee";

interface SabianSymbol {
  degree: number; // 0-359
  sign: string;
  degreeInSign: number; // 1-30
  symbol: string;
  interpretation: string;
  keywords: string[];
}

// First few symbols for each sign (abbreviated - full system has all 360)
const SABIAN_SYMBOLS_SAMPLE = [
  { degree: 0, sign: "Aries", degreeInSign: 1, symbol: "A woman has risen out of the ocean, a seal is embracing her", interpretation: "Emergence of new consciousness from the unconscious", keywords: ["Emergence", "New beginnings", "Instinct"] },
  { degree: 30, sign: "Taurus", degreeInSign: 1, symbol: "A clear mountain stream", interpretation: "Purity and natural flow of emotions", keywords: ["Purity", "Flow", "Clarity"] },
  { degree: 60, sign: "Gemini", degreeInSign: 1, symbol: "A glass-bottomed boat reveals undersea wonders", interpretation: "Intellectual clarity revealing hidden depths", keywords: ["Discovery", "Mental clarity", "Hidden knowledge"] },
  { degree: 90, sign: "Cancer", degreeInSign: 1, symbol: "On a ship, sailors lower an old flag and raise a new one", interpretation: "Transition of loyalty and allegiance", keywords: ["Transition", "New beginning", "Transformation"] },
  { degree: 120, sign: "Leo", degreeInSign: 1, symbol: "Blood rushes to a man's head as his vital energies are mobilized under the spur of ambition", interpretation: "Vitality directed toward achievement", keywords: ["Ambition", "Energy", "Drive"] },
  { degree: 150, sign: "Virgo", degreeInSign: 1, symbol: "A man's head", interpretation: "Pure intellectual analysis and discernment", keywords: ["Analysis", "Mind", "Discernment"] },
  { degree: 180, sign: "Libra", degreeInSign: 1, symbol: "A butterfly made perfect by a dart through it", interpretation: "Beauty preserved through transformation", keywords: ["Perfection", "Beauty", "Sacrifice"] },
  { degree: 210, sign: "Scorpio", degreeInSign: 1, symbol: "A crowded sightseeing bus", interpretation: "Collective experience and shared journey", keywords: ["Collective", "Experience", "Journey"] },
  { degree: 240, sign: "Sagittarius", degreeInSign: 1, symbol: "Retired army veterans gather to reawaken old memories", interpretation: "Honoring past experiences and wisdom", keywords: ["Wisdom", "Memory", "Honor"] },
  { degree: 270, sign: "Capricorn", degreeInSign: 1, symbol: "An Indian chief claims recognition and power from the assembled tribe", interpretation: "Recognition of authority and leadership", keywords: ["Authority", "Recognition", "Power"] },
  { degree: 300, sign: "Aquarius", degreeInSign: 1, symbol: "An old adobe mission", interpretation: "Enduring spiritual structures and traditions", keywords: ["Tradition", "Spirituality", "Endurance"] },
  { degree: 330, sign: "Pisces", degreeInSign: 1, symbol: "A crowded public marketplace", interpretation: "Exchange of ideas and social commerce", keywords: ["Exchange", "Community", "Diversity"] }
];

interface SabianProfile {
  sun: SabianSymbol;
  moon: SabianSymbol;
  ascendant: SabianSymbol;
  interpretation: {
    solarSymbol: string;
    lunarSymbol: string;
    risingSymbol: string;
    synthesis: string;
  };
}

async function generateSabianSymbolWithAI(sign: string, degreeInSign: number): Promise<{ symbol: string; interpretation: string; keywords: string[] }> {
  if (!isGeminiAvailable()) {
    return {
      symbol: `The essence of ${degreeInSign}° ${sign}`,
      interpretation: `A unique degree combining the qualities of ${sign} with the specific vibration of the ${degreeInSign}th degree`,
      keywords: [sign, "Development", "Expression"]
    };
  }

  try {
    const prompt = `You are an expert in Sabian Symbols, the 360 symbolic images that represent each degree of the zodiac. Generate authentic Sabian Symbol interpretations in the style of Marc Edmund Jones and Dane Rudhyar.

Generate a Sabian Symbol for ${degreeInSign}° ${sign}. 

The Sabian Symbol should be:
1. A vivid, poetic image (usually a single sentence describing a scene or moment)
2. Capturing the essence of ${sign} energy at this specific degree
3. In the traditional style of Sabian Symbols (concrete images with metaphysical meaning)

Respond in JSON format:
{
  "symbol": "The symbolic image (one sentence)",
  "interpretation": "A one-sentence interpretation of what this symbol represents",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const response = await generateText({
      model: "gemini-2.5-flash",
      temperature: 0.7,
      prompt
    });

    // Strip markdown code fences if present (Gemini sometimes wraps JSON in ```json ... ```)
    let cleanResponse = (response || "{}").trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const result = JSON.parse(cleanResponse);
    return {
      symbol: result.symbol || `The essence of ${degreeInSign}° ${sign}`,
      interpretation: result.interpretation || `A unique expression of ${sign} energy`,
      keywords: result.keywords || [sign, "Growth", "Expression"]
    };
  } catch (error) {
    console.error("[SabianSymbol] AI generation error:", error);
    return {
      symbol: `The essence of ${degreeInSign}° ${sign}`,
      interpretation: `A unique degree combining the qualities of ${sign} with the specific vibration of the ${degreeInSign}th degree`,
      keywords: [sign, "Development", "Expression"]
    };
  }
}

const memoizedGenerateSabianSymbol = memoize(
  generateSabianSymbolWithAI,
  { 
    primitive: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // Cache for 7 days
    promise: true
  }
);

async function getSabianSymbol(longitude: number): Promise<SabianSymbol> {
  const degree = Math.floor(longitude);
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const signIndex = Math.floor(degree / 30);
  const degreeInSign = (degree % 30) + 1;
  const sign = signs[signIndex];
  
  // Check if we have this exact degree in our sample
  const exactMatch = SABIAN_SYMBOLS_SAMPLE.find(s => s.degree === degree);
  
  if (exactMatch) {
    return {
      degree,
      sign,
      degreeInSign,
      symbol: exactMatch.symbol,
      interpretation: exactMatch.interpretation,
      keywords: exactMatch.keywords
    };
  }
  
  // Generate using AI for missing degrees
  const generated = await memoizedGenerateSabianSymbol(sign, degreeInSign);
  
  return {
    degree,
    sign,
    degreeInSign,
    symbol: generated.symbol,
    interpretation: generated.interpretation,
    keywords: generated.keywords
  };
}

export async function calculateSabianSymbols(
  sunLongitude: number,
  moonLongitude: number,
  ascendantLongitude: number
): Promise<SabianProfile> {
  const sun = await getSabianSymbol(sunLongitude);
  const moon = await getSabianSymbol(moonLongitude);
  const ascendant = await getSabianSymbol(ascendantLongitude);
  
  return {
    sun,
    moon,
    ascendant,
    interpretation: {
      solarSymbol: `Your Sun at ${sun.degreeInSign}° ${sun.sign} carries the Sabian symbol: "${sun.symbol}". This represents ${sun.interpretation.toLowerCase()}.`,
      lunarSymbol: `Your Moon at ${moon.degreeInSign}° ${moon.sign} holds the symbol: "${moon.symbol}". Your emotional nature ${moon.interpretation.toLowerCase()}.`,
      risingSymbol: `Your Ascendant at ${ascendant.degreeInSign}° ${ascendant.sign} projects: "${ascendant.symbol}". You present to the world through ${ascendant.interpretation.toLowerCase()}.`,
      synthesis: `The trinity of your Sabian symbols weaves a unique story: ${sun.keywords[0]} (Sun), ${moon.keywords[0]} (Moon), and ${ascendant.keywords[0]} (Rising) create your soul's signature.`
    }
  };
}
