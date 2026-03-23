/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - PARENTAL INFLUENCE SYSTEM
 * How Parent Signs Affect Your Astrological Blueprint
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ParentalInfluenceProfile {
  fatherInfluence: ParentInfluence;
  motherInfluence: ParentInfluence;
  combinedInfluence: CombinedInfluence;
  inheritedTraits: string[];
  balancingAct: string;
  growthOpportunities: string[];
  relationshipPatterns: string[];
}

export interface ParentInfluence {
  sign: string;
  element: string;
  modality: string;
  influence: string;
  strengths: string[];
  challenges: string[];
  howItShows: string;
}

export interface CombinedInfluence {
  dynamic: string;
  description: string;
  howItManifests: string;
  elementalBlend: string;
  modalityBlend: string;
  compatibility: 'Harmonious' | 'Challenging' | 'Balanced' | 'Dynamic';
  lessons: string[];
}

/**
 * Calculate parental influence on user's astrological profile
 */
export function calculateParentalInfluence(
  userSunSign: string,
  userMoonSign: string,
  fatherSign?: string,
  motherSign?: string
): ParentalInfluenceProfile {
  const fatherInfluence = fatherSign 
    ? calculateParentInfluence(fatherSign, userSunSign, userMoonSign, 'father')
    : generateDefaultInfluence(userSunSign, 'father');
  
  const motherInfluence = motherSign
    ? calculateParentInfluence(motherSign, userSunSign, userMoonSign, 'mother')
    : generateDefaultInfluence(userSunSign, 'mother');
  
  const combinedInfluence = calculateCombinedInfluence(
    fatherInfluence,
    motherInfluence,
    userSunSign,
    userMoonSign
  );
  
  const inheritedTraits = extractInheritedTraits(fatherInfluence, motherInfluence, userSunSign);
  const balancingAct = generateBalancingAct(fatherInfluence, motherInfluence, userSunSign);
  const growthOpportunities = generateGrowthOpportunities(fatherInfluence, motherInfluence, userSunSign);
  const relationshipPatterns = generateRelationshipPatterns(fatherInfluence, motherInfluence, userSunSign);
  
  return {
    fatherInfluence,
    motherInfluence,
    combinedInfluence,
    inheritedTraits,
    balancingAct,
    growthOpportunities,
    relationshipPatterns
  };
}

function calculateParentInfluence(
  parentSign: string,
  userSunSign: string,
  userMoonSign: string,
  parentType: 'father' | 'mother'
): ParentInfluence {
  const signInfo = getSignInfo(parentSign);
  const userSignInfo = getSignInfo(userSunSign);
  
  // Determine influence based on compatibility and aspects
  const compatibility = getSignCompatibility(parentSign, userSunSign);
  const influence = generateInfluenceDescription(parentSign, userSunSign, userMoonSign, parentType, compatibility);
  
  const strengths = generateParentStrengths(parentSign, userSunSign, compatibility);
  const challenges = generateParentChallenges(parentSign, userSunSign, compatibility);
  const howItShows = generateHowItShows(parentSign, userSunSign, parentType, compatibility);
  
  return {
    sign: parentSign,
    element: signInfo.element,
    modality: signInfo.modality,
    influence,
    strengths,
    challenges,
    howItShows
  };
}

function generateDefaultInfluence(userSunSign: string, parentType: 'father' | 'mother'): ParentInfluence {
  // Generate a default influence based on user's sign
  const signInfo = getSignInfo(userSunSign);
  
  // Opposite element often represents what we need to balance
  const oppositeElement = getOppositeElement(signInfo.element);
  const defaultSign = getDefaultSignForElement(oppositeElement);
  const defaultInfo = getSignInfo(defaultSign);
  
  return {
    sign: defaultSign,
    element: defaultInfo.element,
    modality: defaultInfo.modality,
    influence: `Your ${parentType}'s influence (represented by ${defaultSign} energy) brings ${oppositeElement} balance to your ${signInfo.element} nature. This creates a dynamic of integration and growth.`,
    strengths: [`Brings ${oppositeElement} perspective`, 'Creates balance', 'Offers different approach'],
    challenges: ['May feel conflicting at times', 'Requires integration', 'Different energy patterns'],
    howItShows: `You may find yourself integrating ${oppositeElement} qualities into your ${signInfo.element} nature, creating a unique blend of energies.`
  };
}

function calculateCombinedInfluence(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string,
  userMoonSign: string
): CombinedInfluence {
  const elementalBlend = blendElements(father.element, mother.element);
  const modalityBlend = blendModalities(father.modality, mother.modality);
  const compatibility = determineCompatibility(father.sign, mother.sign);
  
  const dynamic = generateDynamic(father.sign, mother.sign, userSunSign);
  const description = generateCombinedDescription(father, mother, userSunSign);
  const howItManifests = generateHowItManifests(father, mother, userSunSign, elementalBlend);
  const lessons = generateLessons(father, mother, userSunSign, compatibility);
  
  return {
    dynamic,
    description,
    howItManifests,
    elementalBlend,
    modalityBlend,
    compatibility,
    lessons
  };
}

function getSignInfo(sign: string): { element: string; modality: string } {
  const signs: Record<string, { element: string; modality: string }> = {
    Aries: { element: 'Fire', modality: 'Cardinal' },
    Taurus: { element: 'Earth', modality: 'Fixed' },
    Gemini: { element: 'Air', modality: 'Mutable' },
    Cancer: { element: 'Water', modality: 'Cardinal' },
    Leo: { element: 'Fire', modality: 'Fixed' },
    Virgo: { element: 'Earth', modality: 'Mutable' },
    Libra: { element: 'Air', modality: 'Cardinal' },
    Scorpio: { element: 'Water', modality: 'Fixed' },
    Sagittarius: { element: 'Fire', modality: 'Mutable' },
    Capricorn: { element: 'Earth', modality: 'Cardinal' },
    Aquarius: { element: 'Air', modality: 'Fixed' },
    Pisces: { element: 'Water', modality: 'Mutable' }
  };
  
  return signs[sign] || { element: 'Fire', modality: 'Cardinal' };
}

function getSignCompatibility(sign1: string, sign2: string): number {
  // Simple compatibility: same element = high, same modality = medium, opposite = challenging but growth
  const info1 = getSignInfo(sign1);
  const info2 = getSignInfo(sign2);
  
  if (info1.element === info2.element) return 3; // High compatibility
  if (info1.modality === info2.modality) return 2; // Medium compatibility
  if (areOppositeSigns(sign1, sign2)) return 1; // Challenging but growth-oriented
  return 1.5; // Neutral
}

function areOppositeSigns(sign1: string, sign2: string): boolean {
  const opposites: Record<string, string> = {
    Aries: 'Libra',
    Taurus: 'Scorpio',
    Gemini: 'Sagittarius',
    Cancer: 'Capricorn',
    Leo: 'Aquarius',
    Virgo: 'Pisces',
    Libra: 'Aries',
    Scorpio: 'Taurus',
    Sagittarius: 'Gemini',
    Capricorn: 'Cancer',
    Aquarius: 'Leo',
    Pisces: 'Virgo'
  };
  
  return opposites[sign1] === sign2 || opposites[sign2] === sign1;
}

function generateInfluenceDescription(
  parentSign: string,
  userSunSign: string,
  userMoonSign: string,
  parentType: 'father' | 'mother',
  compatibility: number
): string {
  const parentInfo = getSignInfo(parentSign);
  const userInfo = getSignInfo(userSunSign);
  
  if (compatibility >= 2.5) {
    return `Your ${parentType}'s ${parentSign} energy harmonizes with your ${userSunSign} nature. You naturally embody ${parentInfo.element} qualities and ${parentInfo.modality} approaches.`;
  } else if (compatibility >= 1.5) {
    return `Your ${parentType}'s ${parentSign} energy creates a dynamic blend with your ${userSunSign} nature. You integrate ${parentInfo.element} and ${parentInfo.modality} qualities into your expression.`;
  } else {
    return `Your ${parentType}'s ${parentSign} energy challenges and complements your ${userSunSign} nature. You've learned to balance ${parentInfo.element} and ${userInfo.element} energies, creating growth through integration.`;
  }
}

function generateParentStrengths(parentSign: string, userSunSign: string, compatibility: number): string[] {
  const parentInfo = getSignInfo(parentSign);
  const strengths: Record<string, string[]> = {
    Aries: ['Courage', 'Initiative', 'Independence', 'Directness'],
    Taurus: ['Stability', 'Patience', 'Reliability', 'Practicality'],
    Gemini: ['Communication', 'Adaptability', 'Curiosity', 'Versatility'],
    Cancer: ['Nurturing', 'Intuition', 'Emotional depth', 'Protectiveness'],
    Leo: ['Confidence', 'Creativity', 'Leadership', 'Generosity'],
    Virgo: ['Precision', 'Service', 'Practical wisdom', 'Attention to detail'],
    Libra: ['Harmony', 'Diplomacy', 'Aesthetics', 'Balance'],
    Scorpio: ['Depth', 'Transformation', 'Intensity', 'Loyalty'],
    Sagittarius: ['Adventure', 'Philosophy', 'Optimism', 'Freedom'],
    Capricorn: ['Ambition', 'Structure', 'Discipline', 'Responsibility'],
    Aquarius: ['Innovation', 'Independence', 'Humanitarianism', 'Originality'],
    Pisces: ['Compassion', 'Intuition', 'Creativity', 'Empathy']
  };
  
  return strengths[parentSign] || ['Unique perspective', 'Balancing influence'];
}

function generateParentChallenges(parentSign: string, userSunSign: string, compatibility: number): string[] {
  const parentInfo = getSignInfo(parentSign);
  const challenges: Record<string, string[]> = {
    Aries: ['Impatience', 'Impulsiveness', 'Competitiveness'],
    Taurus: ['Stubbornness', 'Resistance to change', 'Possessiveness'],
    Gemini: ['Restlessness', 'Scattered energy', 'Indecisiveness'],
    Cancer: ['Moodiness', 'Over-protectiveness', 'Emotional sensitivity'],
    Leo: ['Pride', 'Drama', 'Need for attention'],
    Virgo: ['Criticism', 'Perfectionism', 'Worry'],
    Libra: ['Indecisiveness', 'Avoidance of conflict', 'People-pleasing'],
    Scorpio: ['Intensity', 'Jealousy', 'Secretiveness'],
    Sagittarius: ['Restlessness', 'Commitment issues', 'Tactlessness'],
    Capricorn: ['Rigidity', 'Workaholism', 'Emotional distance'],
    Aquarius: ['Detachment', 'Rebellion', 'Unpredictability'],
    Pisces: ['Escapism', 'Boundary issues', 'Over-sensitivity']
  };
  
  return challenges[parentSign] || ['Different approach', 'Integration needed'];
}

function generateHowItShows(
  parentSign: string,
  userSunSign: string,
  parentType: 'father' | 'mother',
  compatibility: number
): string {
  const examples: Record<string, Record<string, string>> = {
    'Gemini-Virgo': {
      father: 'Your Gemini father\'s communication style and Virgo\'s analytical nature create a blend of quick thinking and precision in you.',
      mother: 'Your Gemini mother\'s adaptability and your Virgo nature create a balance of flexibility and structure.'
    },
    'Virgo-Scorpio': {
      father: 'Your Virgo father\'s practicality and Scorpio\'s intensity create a blend of analytical depth and emotional insight.',
      mother: 'Your Virgo mother\'s attention to detail and Scorpio\'s transformative energy shape your approach to growth.'
    },
    'Scorpio-Gemini': {
      father: 'Your Scorpio father\'s depth and Gemini\'s lightness create a dynamic of intensity balanced with communication.',
      mother: 'Your Scorpio mother\'s emotional depth and Gemini\'s versatility create a blend of intensity and adaptability.'
    }
  };
  
  const key = `${parentSign}-${userSunSign}`;
  const reverseKey = `${userSunSign}-${parentSign}`;
  
  if (examples[key]?.[parentType]) {
    return examples[key][parentType];
  }
  if (examples[reverseKey]?.[parentType]) {
    return examples[reverseKey][parentType];
  }
  
  // Generic description
  const parentInfo = getSignInfo(parentSign);
  return `Your ${parentType}'s ${parentSign} influence shows in how you integrate ${parentInfo.element} energy and ${parentInfo.modality} approaches into your ${userSunSign} expression.`;
}

function blendElements(element1: string, element2: string): string {
  if (element1 === element2) return `Strong ${element1} influence`;
  
  const blends: Record<string, string> = {
    'Fire-Earth': 'Action meets stability',
    'Fire-Air': 'Passion meets intellect',
    'Fire-Water': 'Intensity meets emotion',
    'Earth-Air': 'Practicality meets ideas',
    'Earth-Water': 'Stability meets depth',
    'Air-Water': 'Communication meets intuition'
  };
  
  const key = `${element1}-${element2}`;
  const reverseKey = `${element2}-${element1}`;
  
  return blends[key] || blends[reverseKey] || `${element1} and ${element2} blend`;
}

function blendModalities(modality1: string, modality2: string): string {
  if (modality1 === modality2) return `Strong ${modality1} energy`;
  
  const blends: Record<string, string> = {
    'Cardinal-Fixed': 'Initiative meets stability',
    'Cardinal-Mutable': 'Action meets adaptability',
    'Fixed-Mutable': 'Stability meets flexibility'
  };
  
  const key = `${modality1}-${modality2}`;
  const reverseKey = `${modality2}-${modality1}`;
  
  return blends[key] || blends[reverseKey] || `${modality1} and ${modality2} blend`;
}

function determineCompatibility(sign1: string, sign2: string): CombinedInfluence['compatibility'] {
  const compatibility = getSignCompatibility(sign1, sign2);
  
  if (compatibility >= 2.5) return 'Harmonious';
  if (compatibility >= 1.5) return 'Balanced';
  if (areOppositeSigns(sign1, sign2)) return 'Dynamic';
  return 'Challenging';
}

function generateDynamic(fatherSign: string, motherSign: string, userSunSign: string): string {
  const fatherInfo = getSignInfo(fatherSign);
  const motherInfo = getSignInfo(motherSign);
  const userInfo = getSignInfo(userSunSign);
  
  if (fatherInfo.element === motherInfo.element && fatherInfo.element === userInfo.element) {
    return `Triple ${fatherInfo.element} - You embody this element strongly, with deep integration of both parents' ${fatherInfo.element} qualities.`;
  }
  
  if (fatherInfo.element === userInfo.element) {
    return `${fatherInfo.element} from father, ${motherInfo.element} from mother - You carry your father's ${fatherInfo.element} energy while integrating your mother's ${motherInfo.element} influence.`;
  }
  
  if (motherInfo.element === userInfo.element) {
    return `${motherInfo.element} from mother, ${fatherInfo.element} from father - You carry your mother's ${motherInfo.element} energy while integrating your father's ${fatherInfo.element} influence.`;
  }
  
  return `${fatherInfo.element} (father) + ${motherInfo.element} (mother) = ${userInfo.element} (you) - You've synthesized both parents' elements into your unique ${userInfo.element} expression.`;
}

function generateCombinedDescription(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string
): string {
  const userInfo = getSignInfo(userSunSign);
  
  if (father.element === mother.element) {
    return `Both parents share ${father.element} energy, creating a strong ${father.element} foundation in your chart. You naturally embody ${father.element} qualities with depth and consistency.`;
  }
  
  if (father.element === userInfo.element) {
    return `Your father's ${father.sign} (${father.element}) aligns with your ${userSunSign} nature, while your mother's ${mother.sign} (${mother.element}) adds complementary qualities. You carry your father's ${father.element} energy while integrating your mother's ${mother.element} influence.`;
  }
  
  if (mother.element === userInfo.element) {
    return `Your mother's ${mother.sign} (${mother.element}) aligns with your ${userSunSign} nature, while your father's ${father.sign} (${father.element}) adds complementary qualities. You carry your mother's ${mother.element} energy while integrating your father's ${father.element} influence.`;
  }
  
  return `Your father's ${father.sign} (${father.element}) and mother's ${mother.sign} (${mother.element}) create a unique blend. Your ${userSunSign} (${userInfo.element}) nature synthesizes both parents' energies into something entirely your own.`;
}

function generateHowItManifests(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string,
  elementalBlend: string
): string {
  return `This parental influence manifests as ${elementalBlend}. You may find yourself naturally embodying qualities from both parents, creating a unique synthesis of ${father.element} and ${mother.element} energies in your ${userSunSign} expression.`;
}

function generateLessons(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string,
  compatibility: CombinedInfluence['compatibility']
): string[] {
  const lessons: string[] = [];
  
  if (compatibility === 'Harmonious') {
    lessons.push('You\'ve learned to flow with natural harmony between different energies');
    lessons.push('Integration comes easily when energies align');
  } else if (compatibility === 'Challenging') {
    lessons.push('You\'ve learned to find balance between conflicting energies');
    lessons.push('Growth comes from integrating opposites');
  } else if (compatibility === 'Dynamic') {
    lessons.push('You\'ve learned to embrace the tension between opposite energies');
    lessons.push('Transformation comes from holding paradox');
  } else {
    lessons.push('You\'ve learned to balance different approaches');
    lessons.push('Flexibility allows you to integrate diverse energies');
  }
  
  if (father.element !== mother.element) {
    lessons.push(`Balancing ${father.element} and ${mother.element} energies`);
  }
  
  if (father.modality !== mother.modality) {
    lessons.push(`Integrating ${father.modality} and ${mother.modality} approaches`);
  }
  
  return lessons;
}

function extractInheritedTraits(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string
): string[] {
  const traits: string[] = [];
  
  // Inherit from father
  traits.push(...father.strengths.slice(0, 2));
  
  // Inherit from mother
  traits.push(...mother.strengths.slice(0, 2));
  
  // Add synthesis traits
  if (father.element === mother.element) {
    traits.push(`Strong ${father.element} foundation`);
  } else {
    traits.push(`${father.element}-${mother.element} integration`);
  }
  
  return [...new Set(traits)];
}

function generateBalancingAct(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string
): string {
  const userInfo = getSignInfo(userSunSign);
  
  if (father.element === mother.element && father.element === userInfo.element) {
    return `You embody ${father.element} energy strongly from both parents. Your challenge is to integrate other elements for balance.`;
  }
  
  if (father.element === userInfo.element) {
    return `You carry your father's ${father.element} energy while balancing your mother's ${mother.element} influence. Your growth comes from honoring both.`;
  }
  
  if (mother.element === userInfo.element) {
    return `You carry your mother's ${mother.element} energy while balancing your father's ${father.element} influence. Your growth comes from honoring both.`;
  }
  
  return `You've synthesized both parents' energies (${father.element} + ${mother.element}) into your unique ${userInfo.element} expression. Your challenge is maintaining balance while honoring both influences.`;
}

function generateGrowthOpportunities(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string
): string[] {
  const opportunities: string[] = [];
  
  if (father.element !== mother.element) {
    opportunities.push(`Integrating ${father.element} and ${mother.element} perspectives`);
  }
  
  if (father.modality !== mother.modality) {
    opportunities.push(`Balancing ${father.modality} and ${mother.modality} approaches`);
  }
  
  opportunities.push('Honoring both parents\' influences while finding your own path');
  opportunities.push('Using inherited strengths while developing your unique expression');
  
  return opportunities;
}

function generateRelationshipPatterns(
  father: ParentInfluence,
  mother: ParentInfluence,
  userSunSign: string
): string[] {
  const patterns: string[] = [];
  
  const compatibility = determineCompatibility(father.sign, mother.sign);
  
  if (compatibility === 'Harmonious') {
    patterns.push('You may seek harmonious relationships that mirror your parents\' compatibility');
    patterns.push('You value relationships where energies flow naturally');
  } else if (compatibility === 'Challenging') {
    patterns.push('You may be drawn to relationships that challenge you, like your parents\' dynamic');
    patterns.push('You\'ve learned to navigate tension and find growth in differences');
  } else if (compatibility === 'Dynamic') {
    patterns.push('You may be drawn to relationships with opposite energies, creating dynamic tension');
    patterns.push('You value relationships that push you to grow and transform');
  } else {
    patterns.push('You may seek relationships that balance different energies');
    patterns.push('You value relationships that allow for integration and flexibility');
  }
  
  return patterns;
}

function getOppositeElement(element: string): string {
  const opposites: Record<string, string> = {
    Fire: 'Water',
    Water: 'Fire',
    Earth: 'Air',
    Air: 'Earth'
  };
  return opposites[element] || 'Fire';
}

function getDefaultSignForElement(element: string): string {
  const signs: Record<string, string> = {
    Fire: 'Aries',
    Earth: 'Taurus',
    Air: 'Gemini',
    Water: 'Cancer'
  };
  return signs[element] || 'Aries';
}

export default {
  calculateParentalInfluence
};
