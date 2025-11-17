import type { Profile } from "@shared/schema";
import { calculateDetailedSynastry } from './synastry';

interface CompatibilityResult {
  overallScore: number;
  categoryScores: {
    emotional: number;
    intellectual: number;
    spiritual: number;
    communication: number;
    longTerm: number;
  };
  astrology: {
    score: number;
    sunCompatibility: { score: number; description: string };
    moonCompatibility: { score: number; description: string };
    risingCompatibility: { score: number; description: string };
    venusMarsChemistry: { score: number; description: string };
    aspects: Array<{ aspect: string; description: string; impact: 'positive' | 'challenging' | 'neutral' }>;
    karmicConnection: { hasConnection: boolean; description: string };
    synastry?: any;
  };
  numerology: {
    score: number;
    lifePathCompatibility: { score: number; description: string };
    expressionCompatibility: { score: number; description: string };
    personalityNumbers: { score: number; description: string };
  };
  humanDesign: {
    score: number;
    typeInteraction: { score: number; description: string };
    authorityAlignment: { score: number; description: string };
    channelConnections: { count: number; description: string };
    centerDynamics: { score: number; description: string };
  };
  personality: {
    score: number;
    enneagramCompatibility: { score: number; description: string };
    mbtiCompatibility: { score: number; description: string };
    cognitiveAlignment: { score: number; description: string };
  };
  synthesis: {
    strengths: string[];
    challenges: string[];
    growthOpportunities: string[];
    relationshipType: string;
    longTermPotential: string;
  };
}

// Astrology Compatibility Calculations with Professional Synastry
function calculateAstrologyCompatibility(profile1: any, profile2: any): CompatibilityResult['astrology'] {
  const astro1 = profile1.astrologyData;
  const astro2 = profile2.astrologyData;
  
  if (!astro1 || !astro2) {
    return { score: 0, sunCompatibility: { score: 0, description: 'Data unavailable' }, moonCompatibility: { score: 0, description: 'Data unavailable' }, risingCompatibility: { score: 0, description: 'Data unavailable' }, venusMarsChemistry: { score: 0, description: 'Data unavailable' }, aspects: [], karmicConnection: { hasConnection: false, description: 'Data unavailable' } };
  }

  // Run professional synastry analysis
  let synastryResult;
  try {
    synastryResult = calculateDetailedSynastry(astro1, astro2);
  } catch (error) {
    console.error('Synastry calculation failed, falling back to basic compatibility:', error);
    // Fallback to basic compatibility if synastry fails
    synastryResult = null;
  }

  // Sun Sign Compatibility (Core Identity)
  const sunScore = calculateSignCompatibility(astro1.sunSign, astro2.sunSign);
  const sunDescription = getSunCompatibilityDescription(astro1.sunSign, astro2.sunSign, sunScore);

  // Moon Sign Compatibility (Emotional Connection)
  const moonScore = calculateSignCompatibility(astro1.moonSign, astro2.moonSign);
  const moonDescription = getMoonCompatibilityDescription(astro1.moonSign, astro2.moonSign, moonScore);

  // Rising Sign Compatibility (First Impressions & Approach to Life)
  const risingScore = calculateSignCompatibility(astro1.risingSign, astro2.risingSign);
  const risingDescription = getRisingCompatibilityDescription(astro1.risingSign, astro2.risingSign, risingScore);

  // Venus-Mars Chemistry (Attraction & Passion)
  const venusSign1 = astro1.planets?.venus?.sign;
  const marsSign1 = astro1.planets?.mars?.sign;
  const venusSign2 = astro2.planets?.venus?.sign;
  const marsSign2 = astro2.planets?.mars?.sign;
  
  const venusMarsScore = calculateVenusMarsChemistry(venusSign1, marsSign1, venusSign2, marsSign2);
  const venusMarsDescription = getVenusMarsDescription(venusMarsScore);

  // Karmic Connection (North Node/South Node)
  const karmicConnection = checkKarmicConnection(
    astro1.northNode?.sign,
    astro1.southNode?.sign,
    astro2.northNode?.sign,
    astro2.southNode?.sign
  );

  // If we have synastry results, use them to enhance the score and aspects
  let astroScore = Math.round(
    sunScore * 0.25 +
    moonScore * 0.30 +
    risingScore * 0.15 +
    venusMarsScore * 0.20 +
    (karmicConnection.hasConnection ? 10 : 0)
  );

  const aspectsList: Array<{ aspect: string; description: string; impact: 'positive' | 'challenging' | 'neutral' }> = [];

  if (synastryResult) {
    // Use the synastry overall score (it's weighted by chemistry, commitment, growth)
    astroScore = synastryResult.overallScore;

    // Convert synastry aspects to compatibility aspects format
    for (const aspect of [...synastryResult.goldenAspects, ...synastryResult.diamondAspects, ...synastryResult.fatedAspects].slice(0, 10)) {
      aspectsList.push({
        aspect: `${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspect}`,
        description: aspect.description,
        impact: aspect.impact === 'harmony' ? 'positive' : aspect.impact === 'tension' ? 'challenging' : 'neutral'
      });
    }
  }

  return {
    score: Math.min(100, astroScore),
    sunCompatibility: { score: sunScore, description: sunDescription },
    moonCompatibility: { score: moonScore, description: moonDescription },
    risingCompatibility: { score: risingScore, description: risingDescription },
    venusMarsChemistry: { 
      score: synastryResult ? synastryResult.chemistry.score : venusMarsScore, 
      description: synastryResult ? synastryResult.chemistry.description : venusMarsDescription 
    },
    aspects: aspectsList,
    karmicConnection: synastryResult && synastryResult.fatedAspects.length > 0 
      ? { hasConnection: true, description: synastryResult.fatedAspects[0].description }
      : karmicConnection,
    synastry: synastryResult || undefined
  };
}

function calculateSignCompatibility(sign1: string, sign2: string): number {
  const elements: { [key: string]: string } = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };

  const modalities: { [key: string]: string } = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
  };

  if (sign1 === sign2) return 100; // Same sign - deep understanding

  const element1 = elements[sign1];
  const element2 = elements[sign2];
  const modality1 = modalities[sign1];
  const modality2 = modalities[sign2];

  // Same element (Trine) - 90% compatible
  if (element1 === element2) return 90;

  // Complementary elements
  if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 85;
  if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 85;

  // Opposite signs (tension but magnetic)
  const opposites: { [key: string]: string } = {
    'Aries': 'Libra', 'Taurus': 'Scorpio', 'Gemini': 'Sagittarius',
    'Cancer': 'Capricorn', 'Leo': 'Aquarius', 'Virgo': 'Pisces'
  };
  if (opposites[sign1] === sign2 || opposites[sign2] === sign1) return 70;

  // Same modality (square aspect - challenging)
  if (modality1 === modality2) return 55;

  return 60; // Neutral
}

function getSunCompatibilityDescription(sign1: string, sign2: string, score: number): string {
  if (score >= 90) return `${sign1} and ${sign2} share the same element, creating natural harmony in core values and life approach. You "get" each other instinctively.`;
  if (score >= 80) return `${sign1} and ${sign2} complement each other beautifully. Your different approaches to life actually enhance the relationship.`;
  if (score >= 70) return `${sign1} and ${sign2} create magnetic tension - opposite but deeply attracted. This pairing requires conscious effort but offers profound growth.`;
  if (score >= 55) return `${sign1} and ${sign2} have some friction in their core approaches, but this challenge can spark growth if both are willing to understand each other's perspective.`;
  return `${sign1} and ${sign2} have different life philosophies. Success requires embracing differences as opportunities to learn.`;
}

function getMoonCompatibilityDescription(sign1: string, sign2: string, score: number): string {
  if (score >= 90) return `Emotional languages align perfectly. You intuitively understand each other's feelings and needs without words.`;
  if (score >= 80) return `Your emotional natures complement each other. One provides what the other needs for emotional security.`;
  if (score >= 70) return `Emotional connection requires conscious effort, but the magnetic pull is strong. Different needs can actually balance each other.`;
  if (score >= 55) return `You express emotions differently, which can lead to misunderstandings. Communication about feelings is key.`;
  return `Emotional needs may clash. Success requires learning each other's emotional language with patience.`;
}

function getRisingCompatibilityDescription(sign1: string, sign2: string, score: number): string {
  if (score >= 90) return `You approach life in similar ways. First impressions were likely instant recognition and comfort.`;
  if (score >= 80) return `Your life approaches complement each other. You're attracted to how the other presents themselves to the world.`;
  if (score >= 70) return `Different styles create intrigue. You're fascinated by each other's unique approach to life.`;
  return `You move through the world differently. Appreciating these differences is important for harmony.`;
}

function calculateVenusMarsChemistry(venus1?: string, mars1?: string, venus2?: string, mars2?: string): number {
  if (!venus1 || !mars1 || !venus2 || !mars2) return 50;

  let chemistry = 0;

  // Venus-Mars cross connections (classic attraction)
  chemistry += calculateSignCompatibility(venus1, mars2) * 0.5;
  chemistry += calculateSignCompatibility(venus2, mars1) * 0.5;

  // Venus-Venus (shared values in love)
  chemistry += calculateSignCompatibility(venus1, venus2) * 0.3;

  // Mars-Mars (passion compatibility)
  chemistry += calculateSignCompatibility(mars1, mars2) * 0.2;

  return Math.round(Math.min(100, chemistry));
}

function getVenusMarsDescription(score: number): string {
  if (score >= 85) return `Intense magnetic attraction! The chemistry is palpable and the passion runs deep. This is a rare level of physical and romantic compatibility.`;
  if (score >= 70) return `Strong romantic chemistry with good balance between attraction and shared values in love.`;
  if (score >= 55) return `Moderate attraction with potential to grow. Initial spark may take time to develop into lasting passion.`;
  return `Chemistry requires conscious cultivation. Focus on emotional connection to build physical attraction over time.`;
}

function checkKarmicConnection(northNode1?: string, southNode1?: string, northNode2?: string, southNode2?: string): { hasConnection: boolean; description: string } {
  if (!northNode1 || !southNode1 || !northNode2 || !southNode2) {
    return { hasConnection: false, description: 'Karmic data incomplete' };
  }

  // Check if one person's North Node is the other's South Node (classic karmic connection)
  if (northNode1 === southNode2 || northNode2 === southNode1) {
    return {
      hasConnection: true,
      description: 'Powerful karmic connection detected! This relationship has deep soul-level significance. One of you represents what the other is learning to embody in this lifetime.'
    };
  }

  // Check if nodes are in the same signs (shared karmic journey)
  if (northNode1 === northNode2) {
    return {
      hasConnection: true,
      description: 'You share a karmic destiny path. This relationship supports both of you in evolving toward your highest potential together.'
    };
  }

  return {
    hasConnection: false,
    description: 'No major karmic indicators detected, but all relationships serve our soul\'s growth.'
  };
}

// Numerology Compatibility
function calculateNumerologyCompatibility(profile1: any, profile2: any): CompatibilityResult['numerology'] {
  const num1 = profile1.numerologyData;
  const num2 = profile2.numerologyData;

  if (!num1 || !num2) {
    return { score: 0, lifePathCompatibility: { score: 0, description: 'Data unavailable' }, expressionCompatibility: { score: 0, description: 'Data unavailable' }, personalityNumbers: { score: 0, description: 'Data unavailable' } };
  }

  // Life Path Compatibility (Life Purpose)
  const lifePathScore = calculateNumberCompatibility(num1.lifePath, num2.lifePath);
  const lifePathDesc = getLifePathCompatibilityDescription(num1.lifePath, num2.lifePath, lifePathScore);

  // Expression Number Compatibility (How you express yourself)
  const expressionScore = calculateNumberCompatibility(num1.expression || 0, num2.expression || 0);
  const expressionDesc = getExpressionCompatibilityDescription(expressionScore);

  // Personality Number Compatibility (Outer persona)
  const personalityScore = calculateNumberCompatibility(num1.personality || 0, num2.personality || 0);
  const personalityDesc = getPersonalityCompatibilityDescription(personalityScore);

  const numerologyScore = Math.round(
    lifePathScore * 0.50 +
    expressionScore * 0.30 +
    personalityScore * 0.20
  );

  return {
    score: numerologyScore,
    lifePathCompatibility: { score: lifePathScore, description: lifePathDesc },
    expressionCompatibility: { score: expressionScore, description: expressionDesc },
    personalityNumbers: { score: personalityScore, description: personalityDesc }
  };
}

function calculateNumberCompatibility(num1: number, num2: number): number {
  if (num1 === num2) return 100;

  const compatiblePairs: { [key: string]: number[] } = {
    '1': [1, 3, 5, 9],
    '2': [2, 4, 6, 8],
    '3': [1, 3, 5, 6, 9],
    '4': [2, 4, 6, 7, 8],
    '5': [1, 3, 5, 7, 9],
    '6': [2, 3, 4, 6, 8, 9],
    '7': [4, 5, 7, 9],
    '8': [2, 4, 6, 8],
    '9': [1, 3, 5, 6, 7, 9],
    '11': [2, 6, 11, 22],
    '22': [2, 4, 11, 22],
    '33': [3, 6, 9, 33]
  };

  if (compatiblePairs[num1.toString()]?.includes(num2)) return 85;
  if (compatiblePairs[num2.toString()]?.includes(num1)) return 85;

  return 60;
}

function getLifePathCompatibilityDescription(num1: number, num2: number, score: number): string {
  if (score === 100) return `Same Life Path (${num1}) - You share the same soul mission and understand each other's journey intimately.`;
  if (score >= 85) return `Life Paths ${num1} and ${num2} are naturally harmonious. Your life purposes support and enhance each other.`;
  return `Life Paths ${num1} and ${num2} have different focuses, but can learn valuable lessons from each other's perspective.`;
}

function getExpressionCompatibilityDescription(score: number): string {
  if (score >= 85) return `You express yourselves in complementary ways, making communication natural and flowing.`;
  return `Different communication styles require mindful effort to understand each other fully.`;
}

function getPersonalityCompatibilityDescription(score: number): string {
  if (score >= 85) return `Your outer personalities mesh well, creating ease in social situations and first impressions.`;
  return `You present differently to the world, which can create interesting dynamics in how others perceive you as a pair.`;
}

// Human Design Compatibility
function calculateHumanDesignCompatibility(profile1: any, profile2: any): CompatibilityResult['humanDesign'] {
  const hd1 = profile1.humanDesignData;
  const hd2 = profile2.humanDesignData;

  if (!hd1 || !hd2) {
    return { score: 0, typeInteraction: { score: 0, description: 'Data unavailable' }, authorityAlignment: { score: 0, description: 'Data unavailable' }, channelConnections: { count: 0, description: 'Data unavailable' }, centerDynamics: { score: 0, description: 'Data unavailable' } };
  }

  // Type Interaction
  const typeScore = calculateTypeCompatibility(hd1.type, hd2.type);
  const typeDesc = getTypeInteractionDescription(hd1.type, hd2.type, typeScore);

  // Authority Alignment
  const authorityScore = calculateAuthorityCompatibility(hd1.authority, hd2.authority);
  const authorityDesc = getAuthorityDescription(hd1.authority, hd2.authority, authorityScore);

  // Center Dynamics (defined vs undefined)
  const centerScore = calculateCenterDynamics(hd1.centers, hd2.centers);
  const centerDesc = getCenterDynamicsDescription(centerScore);

  // Channel Connections (electromagnetic connections)
  const channelConnections = findChannelConnections(hd1.gates || [], hd2.gates || []);

  const hdScore = Math.round(
    typeScore * 0.30 +
    authorityScore * 0.25 +
    centerScore * 0.25 +
    (channelConnections.count > 0 ? 20 : 0)
  );

  return {
    score: Math.min(100, hdScore),
    typeInteraction: { score: typeScore, description: typeDesc },
    authorityAlignment: { score: authorityScore, description: authorityDesc },
    channelConnections: { count: channelConnections.count, description: channelConnections.description },
    centerDynamics: { score: centerScore, description: centerDesc }
  };
}

function calculateTypeCompatibility(type1: string, type2: string): number {
  const compatibility: { [key: string]: { [key: string]: number } } = {
    'Generator': { 'Generator': 85, 'Manifestor': 70, 'Projector': 90, 'Reflector': 75, 'Manifesting Generator': 90 },
    'Manifestor': { 'Generator': 70, 'Manifestor': 60, 'Projector': 75, 'Reflector': 70, 'Manifesting Generator': 75 },
    'Projector': { 'Generator': 90, 'Manifestor': 75, 'Projector': 70, 'Reflector': 80, 'Manifesting Generator': 85 },
    'Reflector': { 'Generator': 75, 'Manifestor': 70, 'Projector': 80, 'Reflector': 85, 'Manifesting Generator': 75 },
    'Manifesting Generator': { 'Generator': 90, 'Manifestor': 75, 'Projector': 85, 'Reflector': 75, 'Manifesting Generator': 85 }
  };

  return compatibility[type1]?.[type2] || 60;
}

function getTypeInteractionDescription(type1: string, type2: string, score: number): string {
  if (type1 === 'Generator' && type2 === 'Projector') return `Powerful pairing! ${type2}s are here to guide ${type1}s' abundant energy, creating mutual fulfillment.`;
  if (type1 === 'Projector' && type2 === 'Generator') return `Powerful pairing! ${type1}s are here to guide ${type2}s' abundant energy, creating mutual fulfillment.`;
  if (score >= 85) return `${type1} and ${type2} create natural energetic harmony. Your interaction feels easeful and supportive.`;
  if (score >= 70) return `${type1} and ${type2} can work well together with mutual understanding of each other's strategy.`;
  return `${type1} and ${type2} have different energetic needs. Success comes from respecting each other's unique design.`;
}

function calculateAuthorityCompatibility(auth1: string, auth2: string): number {
  if (auth1 === auth2) return 90;
  
  const emotionalAuthorities = ['Emotional', 'Solar Plexus'];
  const sacralAuthorities = ['Sacral'];
  const mentalAuthorities = ['Splenic', 'Mental', 'Ego', 'Self-Projected'];

  if (emotionalAuthorities.includes(auth1) && emotionalAuthorities.includes(auth2)) return 85;
  if (sacralAuthorities.includes(auth1) && sacralAuthorities.includes(auth2)) return 85;
  
  return 70;
}

function getAuthorityDescription(auth1: string, auth2: string, score: number): string {
  if (score >= 85) return `Similar decision-making processes create understanding in how you both navigate choices.`;
  return `Different authorities mean you make decisions differently. Respecting each other's process is key.`;
}

function calculateCenterDynamics(centers1: any, centers2: any): number {
  if (!centers1 || !centers2) return 60;

  let complementaryCount = 0;
  let totalCenters = 0;

  const centerNames = ['head', 'ajna', 'throat', 'gCenter', 'heart', 'spleen', 'sacral', 'solarPlexus', 'root'];

  for (const center of centerNames) {
    if (centers1[center] !== undefined && centers2[center] !== undefined) {
      totalCenters++;
      // Complementary: one defined, one undefined
      if (centers1[center].defined !== centers2[center].defined) {
        complementaryCount++;
      }
    }
  }

  const complementaryRatio = totalCenters > 0 ? complementaryCount / totalCenters : 0;
  
  // Ideal is 40-60% complementary (too much similarity or difference can be challenging)
  if (complementaryRatio >= 0.4 && complementaryRatio <= 0.6) return 90;
  if (complementaryRatio >= 0.3 && complementaryRatio <= 0.7) return 80;
  return 70;
}

function getCenterDynamicsDescription(score: number): string {
  if (score >= 85) return `Excellent balance of defined and undefined centers. You complement each other's energetic strengths and wisdom.`;
  return `Your energetic centers create unique dynamics. Each brings different awareness to the relationship.`;
}

function findChannelConnections(gates1: any[], gates2: any[]): { count: number; description: string } {
  // Electromagnetic connections happen when one person has one gate and the other has its pair
  const gateMap: { [key: number]: number } = {
    1: 8, 8: 1, 2: 14, 14: 2, 3: 60, 60: 3, 4: 63, 63: 4, 5: 15, 15: 5,
    6: 59, 59: 6, 7: 31, 31: 7, 9: 52, 52: 9, 10: 20, 20: 10, 11: 56, 56: 11,
    12: 22, 22: 12, 13: 33, 33: 13, 16: 48, 48: 16, 17: 62, 62: 17, 18: 58, 58: 18,
    19: 49, 49: 19, 21: 45, 45: 21, 23: 43, 43: 23, 24: 61, 61: 24, 25: 51, 51: 25,
    26: 44, 44: 26, 27: 50, 50: 27, 28: 38, 38: 28, 29: 46, 46: 29, 30: 41, 41: 30,
    32: 54, 54: 32, 34: 57, 57: 34, 35: 36, 36: 35, 37: 40, 40: 37, 39: 55, 55: 39,
    42: 53, 53: 42, 47: 64, 64: 47
  };

  let connectionCount = 0;

  for (const gate1 of gates1) {
    const pairedGate = gateMap[gate1.gate];
    if (pairedGate && gates2.some((g: any) => g.gate === pairedGate)) {
      connectionCount++;
    }
  }

  if (connectionCount === 0) {
    return { count: 0, description: 'No electromagnetic connections. Your charts maintain energetic independence.' };
  }

  if (connectionCount >= 3) {
    return {
      count: connectionCount,
      description: `${connectionCount} electromagnetic connections! This creates powerful energetic activation between you. The chemistry is intense and transformative.`
    };
  }

  return {
    count: connectionCount,
    description: `${connectionCount} electromagnetic connection${connectionCount > 1 ? 's' : ''}. This creates energetic resonance and mutual activation.`
  };
}

// Personality Compatibility (Enneagram + MBTI)
function calculatePersonalityCompatibility(profile1: any, profile2: any): CompatibilityResult['personality'] {
  const pers1 = profile1.personalityData;
  const pers2 = profile2.personalityData;

  if (!pers1 || !pers2) {
    return { score: 0, enneagramCompatibility: { score: 0, description: 'Data unavailable' }, mbtiCompatibility: { score: 0, description: 'Data unavailable' }, cognitiveAlignment: { score: 0, description: 'Data unavailable' } };
  }

  // Enneagram Compatibility
  const enneagramScore = calculateEnneagramCompatibility(pers1.enneagram?.type, pers2.enneagram?.type);
  const enneagramDesc = getEnneagramDescription(pers1.enneagram?.type, pers2.enneagram?.type, enneagramScore);

  // MBTI Compatibility
  const mbtiScore = calculateMBTICompatibility(pers1.mbti?.type, pers2.mbti?.type);
  const mbtiDesc = getMBTIDescription(pers1.mbti?.type, pers2.mbti?.type, mbtiScore);

  // Cognitive Function Alignment
  const cognitiveScore = calculateCognitiveFunctionAlignment(pers1.mbti?.type, pers2.mbti?.type);
  const cognitiveDesc = getCognitiveDescription(cognitiveScore);

  const personalityScore = Math.round(
    enneagramScore * 0.40 +
    mbtiScore * 0.35 +
    cognitiveScore * 0.25
  );

  return {
    score: personalityScore,
    enneagramCompatibility: { score: enneagramScore, description: enneagramDesc },
    mbtiCompatibility: { score: mbtiScore, description: mbtiDesc },
    cognitiveAlignment: { score: cognitiveScore, description: cognitiveDesc }
  };
}

function calculateEnneagramCompatibility(type1?: number, type2?: number): number {
  if (!type1 || !type2) return 60;
  if (type1 === type2) return 85;

  const compatibility: { [key: number]: number[] } = {
    1: [1, 2, 7, 9], 2: [1, 2, 4, 8], 3: [3, 6, 8, 9], 4: [2, 4, 5, 9],
    5: [4, 5, 7, 9], 6: [3, 6, 8, 9], 7: [1, 5, 7, 9], 8: [2, 3, 6, 8], 9: [1, 3, 4, 5, 6, 7, 9]
  };

  if (compatibility[type1]?.includes(type2)) return 85;
  return 65;
}

function getEnneagramDescription(type1?: number, type2?: number, score?: number): string {
  if (!type1 || !type2) return 'Enneagram data incomplete';
  if (score && score >= 85) return `Type ${type1} and Type ${type2} create natural harmony. Your core motivations align and support each other's growth.`;
  return `Type ${type1} and Type ${type2} have different core drives. Understanding each other's fears and desires builds connection.`;
}

function calculateMBTICompatibility(type1?: string, type2?: string): number {
  if (!type1 || !type2) return 60;
  if (type1 === type2) return 90;

  const letters1 = type1.split('');
  const letters2 = type2.split('');
  let matchCount = 0;

  for (let i = 0; i < 4; i++) {
    if (letters1[i] === letters2[i]) matchCount++;
  }

  // 3/4 matching = very compatible
  if (matchCount === 3) return 85;
  // 2/4 matching = moderately compatible
  if (matchCount === 2) return 75;
  // Opposite types can be complementary
  if (matchCount === 0) return 70;
  // 1/4 matching
  return 65;
}

function getMBTIDescription(type1?: string, type2?: string, score?: number): string {
  if (!type1 || !type2) return 'MBTI data incomplete';
  if (score && score >= 85) return `${type1} and ${type2} share similar cognitive approaches. You understand how each other thinks and processes information.`;
  if (score && score >= 70) return `${type1} and ${type2} have complementary perspectives. Your differences create balance and mutual learning.`;
  return `${type1} and ${type2} think quite differently. This requires extra effort to understand each other's logic and decision-making.`;
}

function calculateCognitiveFunctionAlignment(type1?: string, type2?: string): number {
  if (!type1 || !type2) return 60;

  // Simplified cognitive function compatibility
  const dominantFunction1 = type1[0] + type1[1];
  const dominantFunction2 = type2[0] + type2[1];

  // Same dominant function
  if (dominantFunction1 === dominantFunction2) return 90;

  // Complementary functions (N-S, T-F)
  if ((dominantFunction1.includes('N') && dominantFunction2.includes('S')) ||
      (dominantFunction1.includes('S') && dominantFunction2.includes('N'))) return 75;
  if ((dominantFunction1.includes('T') && dominantFunction2.includes('F')) ||
      (dominantFunction1.includes('F') && dominantFunction2.includes('T'))) return 75;

  return 70;
}

function getCognitiveDescription(score: number): string {
  if (score >= 85) return `Your cognitive functions align beautifully, making intellectual connection natural and stimulating.`;
  return `Different cognitive approaches mean you process information differently, which can enrich conversations when you're patient with each other.`;
}

// Advanced Systems Compatibility - ALL 15 NEW SYSTEMS

// Vedic Astrology Compatibility
function calculateVedicCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const vedic1 = profile1.vedicAstrologyData as any;
  const vedic2 = profile2.vedicAstrologyData as any;
  
  if (!vedic1 || !vedic2) {
    return { score: 70, description: 'Vedic data unavailable for full analysis.' };
  }
  
  let score = 60;
  
  // Moon Nakshatra compatibility (very important in Vedic astrology)
  if (vedic1.moonNakshatra?.name === vedic2.moonNakshatra?.name) {
    score += 20;
  }
  
  // Vedic sun/moon sign harmony
  if (vedic1.vedicSun === vedic2.vedicSun) score += 15;
  if (vedic1.vedicMoon === vedic2.vedicMoon) score += 15;
  
  return {
    score: Math.min(100, score),
    description: score >= 80 
      ? 'Strong Vedic compatibility with harmonious lunar mansions and planetary alignments.'
      : 'Vedic chart shows opportunities for growth through different karmic patterns.'
  };
}

// Chinese Astrology Compatibility
function calculateChineseCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const chinese1 = profile1.chineseAstrologyData as any;
  const chinese2 = profile2.chineseAstrologyData as any;
  
  if (!chinese1 || !chinese2) {
    return { score: 70, description: 'Chinese astrology data unavailable.' };
  }
  
  // Chinese zodiac compatibility matrix (simplified)
  const compatiblePairs = [
    ['Rat', 'Ox'], ['Rat', 'Dragon'], ['Rat', 'Monkey'],
    ['Ox', 'Snake'], ['Ox', 'Rooster'],
    ['Tiger', 'Horse'], ['Tiger', 'Dog'],
    ['Rabbit', 'Goat'], ['Rabbit', 'Pig'],
    ['Dragon', 'Monkey'], ['Dragon', 'Rooster'],
    ['Snake', 'Rooster'],
    ['Horse', 'Dog'], ['Horse', 'Tiger'],
    ['Goat', 'Pig'],
    ['Monkey', 'Rat'],
    ['Rooster', 'Ox'],
    ['Dog', 'Tiger'],
    ['Pig', 'Rabbit']
  ];
  
  const year1 = chinese1.yearAnimal?.name;
  const year2 = chinese2.yearAnimal?.name;
  
  let score = 70;
  const isCompatible = compatiblePairs.some(pair => 
    (pair[0] === year1 && pair[1] === year2) || (pair[1] === year1 && pair[0] === year2)
  );
  
  if (year1 === year2) score = 85; // Same animal
  else if (isCompatible) score = 90;
  
  // Element compatibility
  if (chinese1.element === chinese2.element) score += 5;
  
  return {
    score: Math.min(100, score),
    description: score >= 85
      ? `${year1} and ${year2} share natural harmony in Chinese astrology.`
      : `${year1} and ${year2} bring different energies that can balance each other.`
  };
}

// Ayurveda Dosha Compatibility
function calculateAyurvedaCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const ayurveda1 = profile1.ayurvedaData as any;
  const ayurveda2 = profile2.ayurvedaData as any;
  
  if (!ayurveda1 || !ayurveda2) {
    return { score: 70, description: 'Ayurvedic constitution data unavailable.' };
  }
  
  const dosha1 = ayurveda1.primaryDosha?.name;
  const dosha2 = ayurveda2.primaryDosha?.name;
  
  let score = 70;
  
  // Complementary doshas
  if (dosha1 === 'Vata' && dosha2 === 'Kapha') score = 85;
  else if (dosha1 === 'Kapha' && dosha2 === 'Vata') score = 85;
  else if (dosha1 === 'Pitta' && dosha2 === 'Kapha') score = 80;
  else if (dosha1 === 'Kapha' && dosha2 === 'Pitta') score = 80;
  else if (dosha1 === dosha2) score = 75; // Same dosha understands each other
  
  return {
    score,
    description: score >= 80
      ? `${dosha1} and ${dosha2} doshas complement each other beautifully.`
      : `${dosha1} and ${dosha2} doshas require balance and understanding.`
  };
}

// Gene Keys Compatibility
function calculateGeneKeysCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const gk1 = profile1.geneKeysData as any;
  const gk2 = profile2.geneKeysData as any;
  
  if (!gk1 || !gk2) {
    return { score: 70, description: 'Gene Keys data unavailable.' };
  }
  
  let score = 70;
  
  // Life Work alignment
  if (gk1.lifeWork?.gift === gk2.lifeWork?.gift) score += 10;
  
  // Evolution paths
  if (gk1.evolution?.gift === gk2.evolution?.gift) score += 10;
  
  return {
    score: Math.min(100, score),
    description: 'Gene Keys reveal complementary paths of consciousness evolution.'
  };
}

// I Ching Compatibility
function calculateIChingCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const iching1 = profile1.iChingData as any;
  const iching2 = profile2.iChingData as any;
  
  if (!iching1 || !iching2) {
    return { score: 70, description: 'I Ching data unavailable.' };
  }
  
  let score = 70;
  
  // Hexagram compatibility (simplified)
  const hexNum1 = iching1.birthHexagram?.number || 0;
  const hexNum2 = iching2.birthHexagram?.number || 0;
  
  // Complementary hexagrams (1-2, 3-4, etc.)
  if (Math.abs(hexNum1 - hexNum2) === 1) score = 85;
  else if (hexNum1 === hexNum2) score = 90;
  
  return {
    score,
    description: `I Ching hexagrams reveal ${score >= 80 ? 'harmonious' : 'complementary'} life patterns.`
  };
}

// Mayan Astrology Compatibility
function calculateMayanCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const mayan1 = profile1.mayanAstrologyData as any;
  const mayan2 = profile2.mayanAstrologyData as any;
  
  if (!mayan1 || !mayan2) {
    return { score: 70, description: 'Mayan astrology data unavailable.' };
  }
  
  let score = 70;
  
  // Day sign compatibility
  if (mayan1.daySign?.name === mayan2.daySign?.name) score = 85;
  
  // Tone harmony
  const tone1 = mayan1.galacticTone || 0;
  const tone2 = mayan2.galacticTone || 0;
  if (tone1 === tone2) score += 10;
  
  return {
    score: Math.min(100, score),
    description: 'Mayan calendar reveals complementary energetic signatures.'
  };
}

// Chakra Compatibility
function calculateChakraCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const chakra1 = profile1.chakraData as any;
  const chakra2 = profile2.chakraData as any;
  
  if (!chakra1 || !chakra2) {
    return { score: 70, description: 'Chakra data unavailable.' };
  }
  
  let score = 75;
  
  const dominant1 = chakra1.dominantChakra;
  const dominant2 = chakra2.dominantChakra;
  
  // Complementary chakra energies
  if (dominant1 === dominant2) score = 80;
  else if ((dominant1 === 'Heart' && dominant2 === 'Throat') || (dominant1 === 'Throat' && dominant2 === 'Heart')) score = 90;
  
  return {
    score,
    description: 'Chakra energies create opportunities for energetic balance and activation.'
  };
}

// Sacred Geometry Compatibility
function calculateSacredGeometryCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const sg1 = profile1.sacredGeometryData as any;
  const sg2 = profile2.sacredGeometryData as any;
  
  if (!sg1 || !sg2) {
    return { score: 70, description: 'Sacred geometry data unavailable.' };
  }
  
  let score = 75;
  
  if (sg1.primaryShape === sg2.primaryShape) score = 85;
  
  return {
    score,
    description: 'Sacred geometric patterns reveal harmonious structural alignment.'
  };
}

// Runes Compatibility
function calculateRunesCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const runes1 = profile1.runesData as any;
  const runes2 = profile2.runesData as any;
  
  if (!runes1 || !runes2) {
    return { score: 70, description: 'Runes data unavailable.' };
  }
  
  let score = 75;
  
  if (runes1.birthRune === runes2.birthRune) score = 85;
  
  return {
    score,
    description: 'Runic patterns suggest complementary ancestral wisdom paths.'
  };
}

// Sabian Symbols Compatibility
function calculateSabianCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const sabian1 = profile1.sabianSymbolsData as any;
  const sabian2 = profile2.sabianSymbolsData as any;
  
  if (!sabian1 || !sabian2) {
    return { score: 70, description: 'Sabian symbols data unavailable.' };
  }
  
  return {
    score: 80,
    description: 'Sabian symbols reveal complementary symbolic life themes.'
  };
}

// Biorhythms Compatibility
function calculateBiorhythmsCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const bio1 = profile1.biorhythmsData as any;
  const bio2 = profile2.biorhythmsData as any;
  
  if (!bio1 || !bio2) {
    return { score: 70, description: 'Biorhythms data unavailable.' };
  }
  
  let score = 75;
  
  // Physical cycle alignment
  if (bio1.physicalPeakDay === bio2.physicalPeakDay) score += 10;
  
  return {
    score: Math.min(100, score),
    description: 'Biorhythmic cycles show opportunities for synchronized energy.'
  };
}

// Asteroids Compatibility
function calculateAsteroidsCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const ast1 = profile1.asteroidsData as any;
  const ast2 = profile2.asteroidsData as any;
  
  if (!ast1 || !ast2) {
    return { score: 70, description: 'Asteroid placements unavailable.' };
  }
  
  return {
    score: 75,
    description: 'Asteroid placements add nuanced depth to compatibility dynamics.'
  };
}

// Arabic Parts Compatibility
function calculateArabicPartsCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const ap1 = profile1.arabicPartsData as any;
  const ap2 = profile2.arabicPartsData as any;
  
  if (!ap1 || !ap2) {
    return { score: 70, description: 'Arabic Parts data unavailable.' };
  }
  
  let score = 75;
  
  // Part of Fortune compatibility
  if (ap1.fortuneSign === ap2.fortuneSign) score += 10;
  
  return {
    score: Math.min(100, score),
    description: 'Arabic Parts reveal harmonious paths to fortune and purpose.'
  };
}

// Fixed Stars Compatibility
function calculateFixedStarsCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const fs1 = profile1.fixedStarsData as any;
  const fs2 = profile2.fixedStarsData as any;
  
  if (!fs1 || !fs2) {
    return { score: 70, description: 'Fixed stars data unavailable.' };
  }
  
  let score = 75;
  
  if (fs1.primaryStar === fs2.primaryStar) score = 90;
  
  return {
    score,
    description: 'Fixed star connections reveal timeless cosmic resonance.'
  };
}

// Kabbalah Compatibility
function calculateKabbalahCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const kab1 = profile1.kabbalisticData as any;
  const kab2 = profile2.kabbalisticData as any;
  
  if (!kab1 || !kab2) {
    return { score: 70, description: 'Kabbalistic data unavailable.' };
  }
  
  let score = 75;
  
  if (kab1.treePath === kab2.treePath) score = 85;
  
  return {
    score,
    description: 'Kabbalistic paths reveal complementary spiritual evolution.'
  };
}

// Tarot Compatibility
function calculateTarotCompatibility(profile1: any, profile2: any): { score: number; description: string } {
  const tarot1 = (profile1.archetypeData as any)?.tarotCards;
  const tarot2 = (profile2.archetypeData as any)?.tarotCards;
  
  if (!tarot1 || !tarot2) {
    return { score: 70, description: 'Tarot birth cards unavailable.' };
  }
  
  let score = 75;
  
  // Compare primary cards
  if (tarot1.personality?.number === tarot2.personality?.number) score = 90;
  else if (tarot1.soul?.number === tarot2.soul?.number) score = 85;
  
  return {
    score,
    description: score >= 85
      ? 'Tarot birth cards reveal deep archetypal resonance.'
      : 'Tarot cards show complementary soul lessons.'
  };
}

// Overall Synthesis
function createCompatibilitySynthesis(
  astro: CompatibilityResult['astrology'],
  num: CompatibilityResult['numerology'],
  hd: CompatibilityResult['humanDesign'],
  pers: CompatibilityResult['personality']
): CompatibilityResult['synthesis'] {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const growthOpportunities: string[] = [];

  // Identify strengths
  if (astro.moonCompatibility.score >= 85) strengths.push('Deep emotional understanding');
  if (astro.venusMarsChemistry.score >= 85) strengths.push('Strong romantic chemistry');
  if (astro.karmicConnection.hasConnection) strengths.push('Karmic soul connection');
  if (num.lifePathCompatibility.score >= 85) strengths.push('Aligned life purposes');
  if (hd.channelConnections.count > 0) strengths.push('Energetic activation and chemistry');
  if (pers.enneagramCompatibility.score >= 85) strengths.push('Compatible core motivations');

  // Identify challenges
  if (astro.sunCompatibility.score < 70) challenges.push('Different core values require understanding');
  if (num.score < 70) challenges.push('Different life rhythms and expressions');
  if (hd.typeInteraction.score < 70) challenges.push('Different energetic strategies');
  if (pers.mbtiCompatibility.score < 70) challenges.push('Different communication and thinking styles');

  // Growth opportunities
  if (astro.score >= 75 && pers.score < 70) {
    growthOpportunities.push('Strong spiritual connection can bridge personality differences');
  }
  if (hd.channelConnections.count > 0) {
    growthOpportunities.push('Electromagnetic connections create powerful transformation potential');
  }
  if (num.lifePathCompatibility.score >= 80) {
    growthOpportunities.push('Shared life purpose creates foundation for long-term partnership');
  }

  // Determine relationship type
  const avgScore = (astro.score + num.score + hd.score + pers.score) / 4;
  let relationshipType = '';
  if (avgScore >= 85) relationshipType = 'Soul Mate Connection';
  else if (avgScore >= 75) relationshipType = 'Highly Compatible Partnership';
  else if (avgScore >= 65) relationshipType = 'Growth-Oriented Relationship';
  else relationshipType = 'Challenging but Transformative Connection';

  // Long-term potential
  let longTermPotential = '';
  if (num.lifePathCompatibility.score >= 80 && astro.moonCompatibility.score >= 80) {
    longTermPotential = 'Excellent long-term potential. Shared life purpose and emotional compatibility create strong foundation.';
  } else if (avgScore >= 75) {
    longTermPotential = 'Strong long-term potential with conscious effort and mutual growth.';
  } else {
    longTermPotential = 'Long-term success requires significant compromise and personal development from both partners.';
  }

  return {
    strengths: strengths.length > 0 ? strengths : ['Every relationship has unique gifts to discover'],
    challenges: challenges.length > 0 ? challenges : ['All relationships require conscious effort'],
    growthOpportunities: growthOpportunities.length > 0 ? growthOpportunities : ['Every connection teaches us about ourselves'],
    relationshipType,
    longTermPotential
  };
}

export function calculateCompatibility(profile1: Profile, profile2: Profile): any {
  const astrology = calculateAstrologyCompatibility(profile1, profile2);
  const numerology = calculateNumerologyCompatibility(profile1, profile2);
  const humanDesign = calculateHumanDesignCompatibility(profile1, profile2);
  const personality = calculatePersonalityCompatibility(profile1, profile2);

  // Calculate ALL 15 new advanced systems compatibility
  const vedic = calculateVedicCompatibility(profile1, profile2);
  const chinese = calculateChineseCompatibility(profile1, profile2);
  const ayurveda = calculateAyurvedaCompatibility(profile1, profile2);
  const geneKeys = calculateGeneKeysCompatibility(profile1, profile2);
  const iChing = calculateIChingCompatibility(profile1, profile2);
  const mayan = calculateMayanCompatibility(profile1, profile2);
  const chakra = calculateChakraCompatibility(profile1, profile2);
  const sacredGeometry = calculateSacredGeometryCompatibility(profile1, profile2);
  const runes = calculateRunesCompatibility(profile1, profile2);
  const sabian = calculateSabianCompatibility(profile1, profile2);
  const biorhythms = calculateBiorhythmsCompatibility(profile1, profile2);
  const asteroids = calculateAsteroidsCompatibility(profile1, profile2);
  const arabicParts = calculateArabicPartsCompatibility(profile1, profile2);
  const fixedStars = calculateFixedStarsCompatibility(profile1, profile2);
  const kabbalah = calculateKabbalahCompatibility(profile1, profile2);
  const tarot = calculateTarotCompatibility(profile1, profile2);

  // Calculate average spiritual/advanced systems score from all 15 systems
  const spiritualScore = Math.round(
    (vedic.score + chinese.score + ayurveda.score + geneKeys.score + 
     iChing.score + mayan.score + chakra.score + sacredGeometry.score +
     runes.score + sabian.score + biorhythms.score + asteroids.score +
     arabicParts.score + fixedStars.score + kabbalah.score + tarot.score) / 16
  );

  const synthesis = createCompatibilitySynthesis(astrology, numerology, humanDesign, personality);

  // Calculate overall score with proper weights (ALL 30+ SYSTEMS INCLUDED)
  const overallScore = Math.round(
    astrology.score * 0.30 +
    numerology.score * 0.20 +
    humanDesign.score * 0.20 +
    personality.score * 0.20 +
    spiritualScore * 0.10  // Now calculated from ALL 15 advanced systems!
  );

  // Get profile data for astrology
  const astro1 = profile1.astrologyData as any;
  const astro2 = profile2.astrologyData as any;
  const num1 = profile1.numerologyData as any;
  const num2 = profile2.numerologyData as any;
  const hd1 = profile1.humanDesignData as any;
  const hd2 = profile2.humanDesignData as any;
  const pers1 = profile1.personalityData as any;
  const pers2 = profile2.personalityData as any;

  // Calculate element and modality compatibility from sun signs
  const getElement = (sign: string) => {
    const elements: { [key: string]: string } = {
      'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
      'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
      'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
      'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    };
    return elements[sign] || 'Unknown';
  };

  const getModality = (sign: string) => {
    const modalities: { [key: string]: string } = {
      'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
      'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
      'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
    };
    return modalities[sign] || 'Unknown';
  };

  const element1 = getElement(astro1?.sunSign || '');
  const element2 = getElement(astro2?.sunSign || '');
  const modality1 = getModality(astro1?.sunSign || '');
  const modality2 = getModality(astro2?.sunSign || '');

  // Transform to match frontend contract
  return {
    overallScore,
    categories: {
      astrology: {
        score: astrology.score,
        weight: 30,
        details: {
          elementCompatibility: {
            person1Element: element1,
            person2Element: element2,
            score: astrology.sunCompatibility.score,
            description: element1 === element2 
              ? `Both ${element1} signs share the same elemental energy, creating natural understanding.`
              : `${element1} and ${element2} elements bring different energies that can complement each other.`
          },
          modalityCompatibility: {
            person1Modality: modality1,
            person2Modality: modality2,
            score: modality1 === modality2 ? 85 : 70,
            description: modality1 === modality2
              ? `Shared ${modality1} modality means similar approaches to action and change.`
              : `Different modalities (${modality1} and ${modality2}) create diverse approaches to life's challenges.`
          },
          sunMoonHarmony: {
            score: Math.round((astrology.sunCompatibility.score + astrology.moonCompatibility.score) / 2),
            insights: [
              astrology.sunCompatibility.description,
              astrology.moonCompatibility.description
            ]
          },
          risingSignSynergy: {
            score: astrology.risingCompatibility.score,
            insights: [astrology.risingCompatibility.description]
          },
          aspects: {
            harmonious: astrology.venusMarsChemistry.score >= 70 ? 3 : 1,
            challenging: astrology.venusMarsChemistry.score < 70 ? 2 : 0,
            score: astrology.venusMarsChemistry.score,
            insights: [
              astrology.venusMarsChemistry.description,
              astrology.karmicConnection.description
            ]
          }
        },
        synastry: astrology.synastry
      },
      numerology: {
        score: numerology.score,
        weight: 20,
        details: {
          lifePathCompatibility: {
            person1LifePath: num1?.lifePath || 0,
            person2LifePath: num2?.lifePath || 0,
            score: numerology.lifePathCompatibility.score,
            description: numerology.lifePathCompatibility.description
          },
          expressionHarmony: {
            score: numerology.expressionCompatibility.score,
            description: numerology.expressionCompatibility.description
          },
          soulUrgeAlignment: {
            score: numerology.personalityNumbers.score,
            description: numerology.personalityNumbers.description
          }
        }
      },
      humanDesign: {
        score: humanDesign.score,
        weight: 20,
        details: {
          typeInteraction: {
            person1Type: hd1?.type || 'Unknown',
            person2Type: hd2?.type || 'Unknown',
            score: humanDesign.typeInteraction.score,
            description: humanDesign.typeInteraction.description
          },
          authorityAlignment: {
            score: humanDesign.authorityAlignment.score,
            description: humanDesign.authorityAlignment.description
          },
          channelConnections: {
            sharedChannels: humanDesign.channelConnections.count > 0 ? 1 : 0,
            complementaryChannels: humanDesign.channelConnections.count > 0 ? humanDesign.channelConnections.count - 1 : 0,
            score: humanDesign.channelConnections.count > 0 ? 85 : 60,
            insights: [humanDesign.channelConnections.description]
          },
          centerDynamics: {
            score: humanDesign.centerDynamics.score,
            insights: [humanDesign.centerDynamics.description]
          }
        }
      },
      personality: {
        score: personality.score,
        weight: 20,
        details: {
          enneagramDynamics: {
            person1Type: String(pers1?.enneagram?.type || ''),
            person2Type: String(pers2?.enneagram?.type || ''),
            score: personality.enneagramCompatibility.score,
            description: personality.enneagramCompatibility.description,
            growthPotential: `Both types can learn valuable lessons from each other's strengths and perspectives.`,
            challenges: `Understanding each other's core fears and motivations requires patience and empathy.`
          },
          mbtiCompatibility: {
            person1Type: pers1?.mbti?.type || 'Unknown',
            person2Type: pers2?.mbti?.type || 'Unknown',
            score: personality.mbtiCompatibility.score,
            description: personality.mbtiCompatibility.description,
            cognitiveAlignment: personality.cognitiveAlignment.description
          }
        }
      },
      spiritual: {
        score: spiritualScore,  // NOW CALCULATED FROM ALL 15 ADVANCED SYSTEMS!
        weight: 10,
        details: {
          vedic: { score: vedic.score, insights: [vedic.description] },
          chinese: { score: chinese.score, insights: [chinese.description] },
          ayurveda: { score: ayurveda.score, insights: [ayurveda.description] },
          geneKeys: { score: geneKeys.score, insights: [geneKeys.description] },
          iChing: { score: iChing.score, insights: [iChing.description] },
          mayan: { score: mayan.score, insights: [mayan.description] },
          chakra: { score: chakra.score, insights: [chakra.description] },
          sacredGeometry: { score: sacredGeometry.score, insights: [sacredGeometry.description] },
          runes: { score: runes.score, insights: [runes.description] },
          sabian: { score: sabian.score, insights: [sabian.description] },
          biorhythms: { score: biorhythms.score, insights: [biorhythms.description] },
          asteroids: { score: asteroids.score, insights: [asteroids.description] },
          arabicParts: { score: arabicParts.score, insights: [arabicParts.description] },
          fixedStars: { score: fixedStars.score, insights: [fixedStars.description] },
          kabbalah: { score: kabbalah.score, insights: [kabbalah.description] },
          tarot: { score: tarot.score, insights: [tarot.description] }
        }
      }
    },
    strengths: synthesis.strengths,
    challenges: synthesis.challenges,
    growthOpportunities: synthesis.growthOpportunities,
    relationshipDynamics: `${synthesis.relationshipType}. ${synthesis.longTermPotential}`
  };
}
