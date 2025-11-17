import type { Profile } from "@shared/schema";

interface CompatibilityInsight {
  category: string;
  yourType: string;
  bestMatches: Array<{
    type: string;
    score: number;
    description: string;
    keywords: string[];
  }>;
  avoidTypes?: Array<{
    type: string;
    reason: string;
  }>;
  generalGuidance: string;
}

interface CompatibilityInsights {
  sunSign?: CompatibilityInsight;
  moonSign?: CompatibilityInsight;
  mbti?: CompatibilityInsight;
  enneagram?: CompatibilityInsight;
  humanDesign?: CompatibilityInsight;
  lifePath?: CompatibilityInsight;
  summary: {
    topTraits: string[];
    idealPartnerQualities: string[];
    relationshipAdvice: string[];
  };
}

// Sun Sign Compatibility Data
const SUN_SIGN_COMPATIBILITY: { [key: string]: { best: string[]; descriptions: { [key: string]: string }; avoid?: string[] } } = {
  'Aries': {
    best: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    descriptions: {
      'Leo': 'Fiery passion and mutual admiration. You both love adventure and excitement.',
      'Sagittarius': 'Shared love of freedom and adventure. Natural understanding of each other\'s need for independence.',
      'Gemini': 'Intellectual spark and playful energy. You keep each other entertained.',
      'Aquarius': 'Innovative and forward-thinking together. You inspire each other\'s originality.'
    },
    avoid: ['Cancer', 'Capricorn']
  },
  'Taurus': {
    best: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    descriptions: {
      'Virgo': 'Practical and grounded connection. You both value stability and loyalty.',
      'Capricorn': 'Ambitious and dependable partnership. Building security together comes naturally.',
      'Cancer': 'Emotional depth meets sensual stability. You create a nurturing home together.',
      'Pisces': 'Creative romance and deep understanding. You balance practical with dreamy.'
    },
    avoid: ['Leo', 'Aquarius']
  },
  'Gemini': {
    best: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    descriptions: {
      'Libra': 'Intellectual harmony and social grace. You understand each other\'s need for communication.',
      'Aquarius': 'Mental stimulation and innovative ideas. You never run out of things to discuss.',
      'Aries': 'Playful and adventurous together. You keep each other excited and engaged.',
      'Leo': 'Creative expression and mutual entertainment. You bring out each other\'s fun side.'
    },
    avoid: ['Virgo', 'Pisces']
  },
  'Cancer': {
    best: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    descriptions: {
      'Scorpio': 'Deep emotional connection and loyalty. You understand each other\'s intensity.',
      'Pisces': 'Intuitive and nurturing bond. You create a safe emotional haven together.',
      'Taurus': 'Stability and sensuality. You build a comfortable, secure life together.',
      'Virgo': 'Practical care and emotional support. You take care of each other perfectly.'
    },
    avoid: ['Aries', 'Libra']
  },
  'Leo': {
    best: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    descriptions: {
      'Aries': 'Dynamic and passionate. You fuel each other\'s confidence and ambition.',
      'Sagittarius': 'Optimistic and adventurous together. You inspire each other\'s greatness.',
      'Gemini': 'Playful creativity and social energy. You shine brighter together.',
      'Libra': 'Romantic and harmonious. You appreciate each other\'s warmth and charm.'
    },
    avoid: ['Taurus', 'Scorpio']
  },
  'Virgo': {
    best: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    descriptions: {
      'Taurus': 'Grounded and practical together. You build solid foundations.',
      'Capricorn': 'Ambitious and detail-oriented. You help each other achieve goals.',
      'Cancer': 'Nurturing and supportive. You care for each other with dedication.',
      'Scorpio': 'Deep analysis and emotional depth. You understand each other\'s complexity.'
    },
    avoid: ['Gemini', 'Sagittarius']
  },
  'Libra': {
    best: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    descriptions: {
      'Gemini': 'Intellectual connection and social grace. You balance each other beautifully.',
      'Aquarius': 'Progressive and harmonious. You create positive change together.',
      'Leo': 'Romantic and charming. You bring out the best in each other.',
      'Sagittarius': 'Adventurous and optimistic. You explore the world together with grace.'
    },
    avoid: ['Cancer', 'Capricorn']
  },
  'Scorpio': {
    best: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    descriptions: {
      'Cancer': 'Emotionally intense and loyal. You create deep, lasting bonds.',
      'Pisces': 'Spiritual and transformative. You understand each other\'s depth.',
      'Virgo': 'Analytical and devoted. You help each other grow and transform.',
      'Capricorn': 'Ambitious and powerful together. You achieve great things through dedication.'
    },
    avoid: ['Leo', 'Aquarius']
  },
  'Sagittarius': {
    best: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    descriptions: {
      'Aries': 'Adventurous and independent. You explore life fearlessly together.',
      'Leo': 'Optimistic and enthusiastic. You inspire each other\'s confidence.',
      'Libra': 'Philosophical and social. You expand each other\'s horizons gracefully.',
      'Aquarius': 'Freedom-loving and progressive. You respect each other\'s independence.'
    },
    avoid: ['Virgo', 'Pisces']
  },
  'Capricorn': {
    best: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    descriptions: {
      'Taurus': 'Stable and ambitious. You build lasting security together.',
      'Virgo': 'Practical and goal-oriented. You support each other\'s success.',
      'Scorpio': 'Powerful and transformative. You achieve deep goals together.',
      'Pisces': 'Grounded dreams and spiritual ambition. You balance practical with mystical.'
    },
    avoid: ['Aries', 'Libra']
  },
  'Aquarius': {
    best: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    descriptions: {
      'Gemini': 'Innovative and intellectual. You stimulate each other\'s minds constantly.',
      'Libra': 'Progressive and harmonious. You create positive change with grace.',
      'Aries': 'Bold and forward-thinking. You inspire each other\'s originality.',
      'Sagittarius': 'Freedom-loving and visionary. You respect each other\'s uniqueness.'
    },
    avoid: ['Taurus', 'Scorpio']
  },
  'Pisces': {
    best: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    descriptions: {
      'Cancer': 'Deeply intuitive and nurturing. You create emotional sanctuary together.',
      'Scorpio': 'Spiritually profound and transformative. You understand each other\'s soul.',
      'Taurus': 'Romantic and grounding. You balance dreams with reality.',
      'Capricorn': 'Ambitious dreams meet practical action. You manifest visions together.'
    },
    avoid: ['Gemini', 'Sagittarius']
  }
};

// MBTI Compatibility Data (simplified)
const MBTI_COMPATIBILITY: { [key: string]: { best: string[]; description: string } } = {
  'INTJ': { best: ['ENTP', 'ENFP', 'ENTJ'], description: 'You thrive with partners who challenge your intellect and share your ambition.' },
  'INTP': { best: ['ENTJ', 'ESTJ', 'ENFJ'], description: 'You need partners who appreciate your analytical mind and give you space to think.' },
  'ENTJ': { best: ['INTP', 'INTJ', 'ENTP'], description: 'You match well with strategic thinkers who can keep up with your drive.' },
  'ENTP': { best: ['INTJ', 'INFJ', 'ENTJ'], description: 'You flourish with partners who enjoy debating ideas and exploring possibilities.' },
  'INFJ': { best: ['ENTP', 'ENFP', 'INFP'], description: 'You connect deeply with partners who value authenticity and emotional depth.' },
  'INFP': { best: ['ENFJ', 'ENTJ', 'INFJ'], description: 'You need partners who honor your values and creative spirit.' },
  'ENFJ': { best: ['INFP', 'ENFP', 'INFJ'], description: 'You thrive with partners who share your passion for making a difference.' },
  'ENFP': { best: ['INTJ', 'INFJ', 'ENFJ'], description: 'You shine with partners who appreciate your enthusiasm and depth.' },
  'ISTJ': { best: ['ESTP', 'ESFP', 'ESTJ'], description: 'You value partners who are reliable, practical, and share your dedication.' },
  'ISFJ': { best: ['ESFP', 'ESTP', 'ESTJ'], description: 'You need partners who appreciate your loyalty and caring nature.' },
  'ESTJ': { best: ['ISTJ', 'ISTP', 'INTP'], description: 'You match well with partners who respect your organization and decisiveness.' },
  'ESFJ': { best: ['ISFP', 'ISTP', 'ESFP'], description: 'You thrive with partners who value community and emotional connection.' },
  'ISTP': { best: ['ESTJ', 'ESFJ', 'ESTP'], description: 'You need partners who respect your independence and practical skills.' },
  'ISFP': { best: ['ESFJ', 'ESTJ', 'ENFJ'], description: 'You flourish with partners who appreciate your creativity and gentle nature.' },
  'ESTP': { best: ['ISTJ', 'ISFJ', 'ISTP'], description: 'You match well with partners who can keep up with your energy and spontaneity.' },
  'ESFP': { best: ['ISTJ', 'ISFJ', 'ESFJ'], description: 'You shine with partners who enjoy life\'s pleasures and social connection.' }
};

// Enneagram Compatibility Data (simplified)
const ENNEAGRAM_COMPATIBILITY: { [key: string]: { best: string[]; description: string } } = {
  '1': { best: ['2', '7', '9'], description: 'You balance well with partners who bring spontaneity, support, or peace to your perfectionism.' },
  '2': { best: ['1', '4', '8'], description: 'You thrive with partners who appreciate your care and can match your emotional depth.' },
  '3': { best: ['6', '7', '9'], description: 'You need partners who support your ambitions while helping you slow down and connect.' },
  '4': { best: ['1', '2', '9'], description: 'You flourish with partners who honor your authenticity and provide stability.' },
  '5': { best: ['7', '8', '9'], description: 'You match well with partners who draw you out while respecting your need for space.' },
  '6': { best: ['3', '8', '9'], description: 'You thrive with partners who provide reassurance, strength, or calming presence.' },
  '7': { best: ['1', '5', '9'], description: 'You need partners who ground your enthusiasm while joining your adventures.' },
  '8': { best: ['2', '6', '9'], description: 'You flourish with partners who can handle your intensity and soften your edges.' },
  '9': { best: ['1', '3', '4', '6'], description: 'You balance well with partners who energize you while appreciating your peace-making.' }
};

// Human Design Type Compatibility
const HUMAN_DESIGN_COMPATIBILITY: { [key: string]: { best: string[]; description: string } } = {
  'Manifestor': { best: ['Generator', 'Manifesting Generator'], description: 'You need partners who can match your initiative while providing sustainable energy.' },
  'Generator': { best: ['Manifestor', 'Manifesting Generator', 'Projector'], description: 'You thrive with partners who appreciate your responsive energy and let you lead with your gut.' },
  'Manifesting Generator': { best: ['Generator', 'Projector'], description: 'You flourish with partners who can keep up with your multi-passionate energy.' },
  'Projector': { best: ['Generator', 'Manifesting Generator'], description: 'You match well with partners whose energy you can guide and who recognize your wisdom.' },
  'Reflector': { best: ['Generator', 'Manifestor', 'Projector'], description: 'You need partners who respect your sensitivity and provide stable energy to reflect.' }
};

// Life Path Compatibility
const LIFE_PATH_COMPATIBILITY: { [key: number]: { best: number[]; description: string } } = {
  1: { best: [1, 3, 5, 7], description: 'You match well with independent, creative, and intellectually stimulating partners.' },
  2: { best: [2, 6, 8, 9], description: 'You thrive with partners who value harmony, partnership, and emotional connection.' },
  3: { best: [1, 3, 5, 6], description: 'You need partners who appreciate creativity, communication, and joyful expression.' },
  4: { best: [2, 4, 6, 8], description: 'You flourish with stable, loyal partners who value building together.' },
  5: { best: [1, 3, 5, 7], description: 'You match well with adventurous, freedom-loving partners who keep things exciting.' },
  6: { best: [2, 3, 6, 9], description: 'You thrive with partners who value family, responsibility, and nurturing love.' },
  7: { best: [1, 5, 7, 9], description: 'You need partners who respect your spiritual depth and need for solitude.' },
  8: { best: [2, 4, 6, 8], description: 'You flourish with ambitious partners who can handle your power and drive.' },
  9: { best: [2, 6, 7, 9], description: 'You match well with compassionate, idealistic partners who share your humanitarian vision.' },
  11: { best: [2, 6, 11, 22], description: 'You thrive with spiritually aware partners who honor your intuitive gifts.' },
  22: { best: [4, 11, 22], description: 'You need partners who understand your grand vision and help you manifest it.' },
  33: { best: [6, 9, 11, 33], description: 'You flourish with compassionate partners who support your healing mission.' }
};

export function generateCompatibilityInsights(profile: Profile): CompatibilityInsights {
  const insights: CompatibilityInsights = {
    summary: {
      topTraits: [],
      idealPartnerQualities: [],
      relationshipAdvice: []
    }
  };

  // Sun Sign Insights
  const astroData = profile.astrologyData as any;
  const sunSign = astroData?.sunSign;
  if (sunSign && SUN_SIGN_COMPATIBILITY[sunSign]) {
    const sunCompat = SUN_SIGN_COMPATIBILITY[sunSign];
    insights.sunSign = {
      category: 'Sun Sign',
      yourType: sunSign,
      bestMatches: sunCompat.best.map(sign => ({
        type: sign,
        score: 90,
        description: sunCompat.descriptions[sign],
        keywords: []
      })),
      avoidTypes: sunCompat.avoid?.map(sign => ({
        type: sign,
        reason: 'Requires extra effort and understanding to harmonize'
      })),
      generalGuidance: `As a ${sunSign}, you shine brightest with partners who complement your core energy. Look for the signs listed above for natural harmony.`
    };
  }

  // Moon Sign Insights
  const moonSign = astroData?.moonSign;
  if (moonSign && SUN_SIGN_COMPATIBILITY[moonSign]) {
    const moonCompat = SUN_SIGN_COMPATIBILITY[moonSign];
    insights.moonSign = {
      category: 'Moon Sign (Emotional Needs)',
      yourType: moonSign,
      bestMatches: moonCompat.best.slice(0, 3).map(sign => ({
        type: sign,
        score: 85,
        description: `Emotionally harmonious - your ${moonSign} Moon feels understood with ${sign} energy.`,
        keywords: []
      })),
      generalGuidance: `Your ${moonSign} Moon needs emotional compatibility. Look for partners whose Moon or Sun is in the signs listed above.`
    };
  }

  // MBTI Insights
  const personalityData = profile.personalityData as any;
  const mbti = personalityData?.mbti?.type;
  if (mbti && MBTI_COMPATIBILITY[mbti]) {
    const mbtiCompat = MBTI_COMPATIBILITY[mbti];
    insights.mbti = {
      category: 'MBTI Type',
      yourType: mbti,
      bestMatches: mbtiCompat.best.map(type => ({
        type: type,
        score: 88,
        description: `Strong cognitive function alignment with ${type}`,
        keywords: []
      })),
      generalGuidance: mbtiCompat.description
    };
  }

  // Enneagram Insights
  const enneagram = personalityData?.enneagram?.type;
  if (enneagram && ENNEAGRAM_COMPATIBILITY[enneagram.toString()]) {
    const ennCompat = ENNEAGRAM_COMPATIBILITY[enneagram.toString()];
    insights.enneagram = {
      category: 'Enneagram Type',
      yourType: `Type ${enneagram}`,
      bestMatches: ennCompat.best.map(type => ({
        type: `Type ${type}`,
        score: 85,
        description: `Natural balance with Type ${type} dynamics`,
        keywords: []
      })),
      generalGuidance: ennCompat.description
    };
  }

  // Human Design Insights
  const hdData = profile.humanDesignData as any;
  const hdType = hdData?.type;
  if (hdType && HUMAN_DESIGN_COMPATIBILITY[hdType]) {
    const hdCompat = HUMAN_DESIGN_COMPATIBILITY[hdType];
    insights.humanDesign = {
      category: 'Human Design Type',
      yourType: hdType,
      bestMatches: hdCompat.best.map(type => ({
        type: type,
        score: 87,
        description: `Energetic harmony with ${type} types`,
        keywords: []
      })),
      generalGuidance: hdCompat.description
    };
  }

  // Life Path Insights
  const numData = profile.numerologyData as any;
  const lifePath = numData?.lifePath;
  if (lifePath && LIFE_PATH_COMPATIBILITY[lifePath]) {
    const lpCompat = LIFE_PATH_COMPATIBILITY[lifePath];
    insights.lifePath = {
      category: 'Life Path Number',
      yourType: lifePath.toString(),
      bestMatches: lpCompat.best.map(num => ({
        type: num.toString(),
        score: 86,
        description: `Numerological harmony with Life Path ${num}`,
        keywords: []
      })),
      generalGuidance: lpCompat.description
    };
  }

  // Generate Summary
  insights.summary = generateSummary(profile, insights);

  return insights;
}

function generateSummary(profile: Profile, insights: CompatibilityInsights): CompatibilityInsights['summary'] {
  const topTraits: string[] = [];
  const idealPartnerQualities: string[] = [];
  const relationshipAdvice: string[] = [];

  // Extract top traits from profile
  const astroData = profile.astrologyData as any;
  if (astroData?.sunSign) {
    const element = getElement(astroData.sunSign);
    topTraits.push(`${element} energy (${astroData.sunSign})`);
  }
  
  const personalityData = profile.personalityData as any;
  if (personalityData?.enneagram?.type) {
    topTraits.push(`Enneagram ${personalityData.enneagram.type} core motivations`);
  }

  const hdData = profile.humanDesignData as any;
  if (hdData?.type) {
    topTraits.push(`${hdData.type} energy type`);
  }

  // Generate ideal partner qualities
  if (insights.sunSign) {
    idealPartnerQualities.push(`Complement your ${insights.sunSign.yourType} nature`);
  }
  
  idealPartnerQualities.push('Share your values and life vision');
  idealPartnerQualities.push('Balance your strengths with their own gifts');
  idealPartnerQualities.push('Communicate openly and honestly');

  // Generate relationship advice
  relationshipAdvice.push('Focus on emotional compatibility, not just attraction');
  relationshipAdvice.push('Look for partners who support your growth');
  relationshipAdvice.push('Trust your intuition - your profile is a guide, not a rulebook');
  relationshipAdvice.push('Every relationship requires effort, even with compatible types');

  return {
    topTraits,
    idealPartnerQualities,
    relationshipAdvice
  };
}

function getElement(sign: string): string {
  const elements: { [key: string]: string } = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };
  return elements[sign] || 'Unknown';
}
