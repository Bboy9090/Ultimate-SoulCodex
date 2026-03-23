/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOUL CODEX - MORAL COMPASS SYSTEM
 * Values & Ethics Based on Family & Neighborhood Experiences
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface MoralCompassProfile {
  coreValues: string[];
  ethicalFramework: string;
  decisionMakingStyle: string;
  familyInfluence: string;
  neighborhoodInfluence: string;
  moralArchetype: string;
  compassType: 'Guardian' | 'Explorer' | 'Builder' | 'Protector' | 'Visionary';
  description: string;
  strengths: string[];
  growthAreas: string[];
}

export interface MoralCompassAnswers {
  familyValues: string; // "traditional" | "progressive" | "mixed" | "independent"
  neighborhoodType: string; // "close-knit" | "diverse" | "individualistic" | "supportive"
  conflictResolution: string; // "direct" | "diplomatic" | "avoidant" | "collaborative"
}

/**
 * Calculate moral compass from simple 3-question assessment
 * This is designed to be quick and non-intrusive
 */
export function calculateMoralCompass(
  answers: MoralCompassAnswers,
  lifePath?: number,
  sunSign?: string
): MoralCompassProfile {
  // Determine compass type from answers
  let compassType: MoralCompassProfile['compassType'] = 'Guardian';
  
  // Family values influence
  if (answers.familyValues === 'traditional') {
    compassType = 'Guardian';
  } else if (answers.familyValues === 'progressive') {
    compassType = 'Visionary';
  } else if (answers.familyValues === 'independent') {
    compassType = 'Explorer';
  }
  
  // Neighborhood influence
  if (answers.neighborhoodType === 'close-knit') {
    if (compassType === 'Explorer') compassType = 'Builder';
    else if (compassType === 'Visionary') compassType = 'Protector';
  } else if (answers.neighborhoodType === 'diverse') {
    if (compassType === 'Guardian') compassType = 'Protector';
  }
  
  // Conflict resolution style
  if (answers.conflictResolution === 'direct') {
    if (compassType === 'Guardian') compassType = 'Protector';
  } else if (answers.conflictResolution === 'collaborative') {
    if (compassType === 'Explorer') compassType = 'Builder';
  }
  
  // Life Path influence
  if (lifePath) {
    if ([1, 8].includes(lifePath)) compassType = 'Visionary';
    else if ([2, 6, 9].includes(lifePath)) compassType = 'Protector';
    else if ([4, 22].includes(lifePath)) compassType = 'Guardian';
    else if ([3, 5].includes(lifePath)) compassType = 'Builder';
    else if ([7, 11].includes(lifePath)) compassType = 'Explorer';
  }
  
  // Generate profile based on type
  const profiles: Record<MoralCompassProfile['compassType'], Omit<MoralCompassProfile, 'compassType'>> = {
    Guardian: {
      coreValues: ['Loyalty', 'Tradition', 'Stability', 'Honor', 'Duty'],
      ethicalFramework: 'Rule-based ethics with emphasis on tradition and honor',
      decisionMakingStyle: 'Considers family and community expectations, values stability and proven paths',
      familyInfluence: 'Strong family traditions shape your moral foundation. You value what has worked before.',
      neighborhoodInfluence: 'Community standards and neighborhood values reinforce your sense of right and wrong.',
      moralArchetype: 'The Keeper of Tradition',
      description: 'You hold the values passed down through generations. Your moral compass points toward stability, loyalty, and honoring commitments. You protect what matters most.',
      strengths: ['Reliable', 'Loyal', 'Principled', 'Protective', 'Consistent'],
      growthAreas: ['Flexibility in changing times', 'Embracing new perspectives', 'Balancing tradition with innovation']
    },
    
    Explorer: {
      coreValues: ['Freedom', 'Authenticity', 'Independence', 'Growth', 'Truth'],
      ethicalFramework: 'Personal ethics based on experience and authenticity',
      decisionMakingStyle: 'Follows inner truth, values personal freedom and authentic expression',
      familyInfluence: 'You may have broken from family expectations to forge your own path. Your values come from experience.',
      neighborhoodInfluence: 'Diverse or individualistic environments taught you to think for yourself and question norms.',
      moralArchetype: 'The Truth Seeker',
      description: 'Your moral compass is calibrated by your own experiences. You value authenticity over tradition, truth over comfort. You forge your own ethical path.',
      strengths: ['Authentic', 'Independent', 'Open-minded', 'Courageous', 'Self-aware'],
      growthAreas: ['Learning from tradition', 'Building lasting commitments', 'Balancing freedom with responsibility']
    },
    
    Builder: {
      coreValues: ['Community', 'Cooperation', 'Progress', 'Unity', 'Service'],
      ethicalFramework: 'Communitarian ethics focused on collective good',
      decisionMakingStyle: 'Considers impact on community, values collaboration and mutual support',
      familyInfluence: 'Family taught you that we rise together. Your values center on building something greater than yourself.',
      neighborhoodInfluence: 'Close-knit or supportive neighborhoods showed you the power of community and mutual aid.',
      moralArchetype: 'The Community Architect',
      description: 'Your moral compass points toward the collective good. You build bridges, create systems that serve many, and believe in the power of unity.',
      strengths: ['Collaborative', 'Service-oriented', 'Inclusive', 'Practical', 'Empathetic'],
      growthAreas: ['Setting personal boundaries', 'Honoring individual needs', 'Preventing burnout from over-giving']
    },
    
    Protector: {
      coreValues: ['Justice', 'Protection', 'Fairness', 'Courage', 'Advocacy'],
      ethicalFramework: 'Justice-based ethics with emphasis on protecting the vulnerable',
      decisionMakingStyle: 'Acts on principle, stands up for what\'s right, protects those who need it',
      familyInfluence: 'You learned early to protect yourself or others. Your values center on justice and fairness.',
      neighborhoodInfluence: 'Diverse or challenging environments taught you to stand up for yourself and others. You fight for fairness.',
      moralArchetype: 'The Shield of Justice',
      description: 'Your moral compass points toward justice. You protect the vulnerable, fight for fairness, and stand up when others won\'t. You are the shield.',
      strengths: ['Courageous', 'Just', 'Protective', 'Advocacy-minded', 'Principled'],
      growthAreas: ['Choosing battles wisely', 'Self-care while protecting others', 'Finding balance between justice and peace']
    },
    
    Visionary: {
      coreValues: ['Innovation', 'Progress', 'Transformation', 'Future', 'Change'],
      ethicalFramework: 'Forward-looking ethics focused on creating better systems',
      decisionMakingStyle: 'Considers future impact, values innovation and transformation over maintaining status quo',
      familyInfluence: 'Progressive family values shaped your forward-thinking approach. You see beyond current limitations.',
      neighborhoodInfluence: 'Diverse or changing neighborhoods showed you that transformation is possible and necessary.',
      moralArchetype: 'The Future Builder',
      description: 'Your moral compass points toward the future. You see what could be, not just what is. You build new systems, challenge old ways, and create transformation.',
      strengths: ['Innovative', 'Forward-thinking', 'Transformative', 'Courageous', 'Visionary'],
      growthAreas: ['Honoring the past while building the future', 'Patience with slower change', 'Practical implementation of vision']
    }
  };
  
  const baseProfile = profiles[compassType];
  
  // Customize based on specific answers
  let coreValues = [...baseProfile.coreValues];
  if (answers.familyValues === 'mixed') {
    coreValues.push('Balance', 'Integration');
  }
  if (answers.neighborhoodType === 'supportive') {
    coreValues.push('Mutual Support', 'Empathy');
  }
  
  return {
    compassType,
    ...baseProfile,
    coreValues: [...new Set(coreValues)], // Remove duplicates
    familyInfluence: generateFamilyInfluence(answers.familyValues, compassType),
    neighborhoodInfluence: generateNeighborhoodInfluence(answers.neighborhoodType, compassType)
  };
}

function generateFamilyInfluence(familyValues: string, compassType: MoralCompassProfile['compassType']): string {
  const influences: Record<string, Record<string, string>> = {
    traditional: {
      Guardian: 'Strong family traditions shape your moral foundation. You value what has worked before and honor the wisdom of generations.',
      Protector: 'Traditional family values gave you a strong foundation, but you learned to question when tradition conflicts with justice.',
      Builder: 'Family traditions taught you the importance of community, but you\'re building new ways to honor those values.',
      Explorer: 'Traditional family values created tension that pushed you to find your own path. You honor the intent while forging new ways.',
      Visionary: 'Traditional family values showed you what to preserve and what to transform. You honor the past while building the future.'
    },
    progressive: {
      Guardian: 'Progressive family values taught you to honor tradition while embracing positive change. You balance stability with growth.',
      Protector: 'Progressive family values shaped your commitment to justice and protecting the vulnerable. You fight for what\'s right.',
      Builder: 'Progressive family values showed you the power of community action and collective good. You build systems that serve all.',
      Explorer: 'Progressive family values gave you freedom to explore and question. You value authenticity and personal truth.',
      Visionary: 'Progressive family values shaped your forward-thinking approach. You see transformation as necessary and possible.'
    },
    mixed: {
      Guardian: 'Mixed family values taught you to find balance between tradition and innovation. You honor what works while staying open.',
      Protector: 'Mixed family values showed you that justice looks different in different contexts. You adapt your protection to what\'s needed.',
      Builder: 'Mixed family values taught you to build bridges between different perspectives. You create unity from diversity.',
      Explorer: 'Mixed family values gave you flexibility to explore while maintaining connection. You value both freedom and belonging.',
      Visionary: 'Mixed family values showed you that transformation requires honoring multiple perspectives. You build inclusive futures.'
    },
    independent: {
      Guardian: 'Independent family values taught you self-reliance while maintaining your own traditions. You create stability from within.',
      Protector: 'Independent family values shaped your self-advocacy. You learned to protect yourself and others through your own strength.',
      Builder: 'Independent family values showed you that community can be chosen. You build your own supportive networks.',
      Explorer: 'Independent family values gave you complete freedom to explore. You forge your own path and create your own values.',
      Visionary: 'Independent family values shaped your ability to see beyond current systems. You create new possibilities from your own vision.'
    }
  };
  
  return influences[familyValues]?.[compassType] || 'Your family values have shaped your moral foundation in unique ways.';
}

function generateNeighborhoodInfluence(neighborhoodType: string, compassType: MoralCompassProfile['compassType']): string {
  const influences: Record<string, Record<string, string>> = {
    'close-knit': {
      Guardian: 'Close-knit neighborhood reinforced the value of community and looking out for each other. You learned that we\'re all connected.',
      Protector: 'Close-knit neighborhood showed you the importance of protecting your community. You learned to stand up for your people.',
      Builder: 'Close-knit neighborhood shaped your understanding of mutual support. You build systems that strengthen community bonds.',
      Explorer: 'Close-knit neighborhood created both belonging and the need to find your own space. You value community while maintaining independence.',
      Visionary: 'Close-knit neighborhood showed you what community can be. You envision ways to strengthen and transform community bonds.'
    },
    diverse: {
      Guardian: 'Diverse neighborhood taught you to honor different traditions while maintaining your own. You value stability within diversity.',
      Protector: 'Diverse neighborhood showed you the importance of protecting all voices. You fight for justice across differences.',
      Builder: 'Diverse neighborhood shaped your ability to build bridges. You create unity that honors all perspectives.',
      Explorer: 'Diverse neighborhood gave you exposure to many ways of being. You learned to explore and appreciate different paths.',
      Visionary: 'Diverse neighborhood showed you the power of inclusive transformation. You build futures that honor all voices.'
    },
    individualistic: {
      Guardian: 'Individualistic neighborhood taught you self-reliance while maintaining your values. You create your own stability.',
      Protector: 'Individualistic neighborhood shaped your self-advocacy. You learned to protect yourself and stand alone when needed.',
      Builder: 'Individualistic neighborhood showed you that community can be intentional. You build your own chosen family.',
      Explorer: 'Individualistic neighborhood gave you complete freedom to explore. You forge your own path without external pressure.',
      Visionary: 'Individualistic neighborhood shaped your ability to see beyond groupthink. You create new possibilities from independent vision.'
    },
    supportive: {
      Guardian: 'Supportive neighborhood reinforced the value of mutual aid. You learned that stability comes from supporting each other.',
      Protector: 'Supportive neighborhood showed you the power of collective protection. You learned to advocate for yourself and others.',
      Builder: 'Supportive neighborhood shaped your understanding of community care. You build systems of mutual support.',
      Explorer: 'Supportive neighborhood gave you safety to explore. You learned that support enables authentic growth.',
      Visionary: 'Supportive neighborhood showed you what caring communities can be. You envision systems that support all members.'
    }
  };
  
  return influences[neighborhoodType]?.[compassType] || 'Your neighborhood experiences have shaped your understanding of community and values.';
}

/**
 * Generate moral compass from birth data alone (fallback when answers not provided)
 */
export function calculateMoralCompassFromBirthData(
  lifePath?: number,
  sunSign?: string,
  moonSign?: string
): MoralCompassProfile {
  // Use default answers based on astrological/numerological patterns
  const defaultAnswers: MoralCompassAnswers = {
    familyValues: 'mixed',
    neighborhoodType: 'diverse',
    conflictResolution: 'collaborative'
  };
  
  // Adjust based on signs
  if (sunSign) {
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    
    if (earthSigns.includes(sunSign)) {
      defaultAnswers.familyValues = 'traditional';
      defaultAnswers.neighborhoodType = 'close-knit';
    } else if (fireSigns.includes(sunSign)) {
      defaultAnswers.familyValues = 'independent';
      defaultAnswers.conflictResolution = 'direct';
    } else if (waterSigns.includes(sunSign)) {
      defaultAnswers.familyValues = 'progressive';
      defaultAnswers.neighborhoodType = 'supportive';
    } else if (airSigns.includes(sunSign)) {
      defaultAnswers.familyValues = 'progressive';
      defaultAnswers.neighborhoodType = 'diverse';
    }
  }
  
  return calculateMoralCompass(defaultAnswers, lifePath, sunSign);
}

export default {
  calculateMoralCompass,
  calculateMoralCompassFromBirthData
};
