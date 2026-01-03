interface PersonalityData {
  enneagram?: {
    type: number;
    wing?: string;
    description: string;
    motivation: string;
    fear: string;
  };
  mbti?: {
    type: string;
    description: string;
    functions: string[];
  };
}

const enneagramTypes = {
  1: {
    description: "The Perfectionist - Principled, purposeful, self-controlled, and perfectionistic.",
    motivation: "To be good, right, perfect, and to improve everything",
    fear: "Being corrupt, defective, or wrong"
  },
  2: {
    description: "The Helper - Demonstrative, generous, people-pleasing, and possessive.",
    motivation: "To be loved and needed",
    fear: "Being unloved or unwanted for themselves"
  },
  3: {
    description: "The Achiever - Adaptive, excelling, driven, and image-conscious.",
    motivation: "To be valuable and worthwhile",
    fear: "Being worthless or without value apart from achievements"
  },
  4: {
    description: "The Individualist - Expressive, dramatic, self-absorbed, and temperamental.",
    motivation: "To find themselves and their significance",
    fear: "Having no identity or personal significance"
  },
  5: {
    description: "The Investigator - Perceptive, innovative, secretive, and isolated.",
    motivation: "To be capable and competent",
    fear: "Being useless, helpless, or incapable"
  },
  6: {
    description: "The Loyalist - Engaging, responsible, anxious, and suspicious.",
    motivation: "To have security and support",
    fear: "Being without support or guidance"
  },
  7: {
    description: "The Enthusiast - Spontaneous, versatile, acquisitive, and scattered.",
    motivation: "To maintain happiness and satisfaction",
    fear: "Being trapped in pain or deprivation"
  },
  8: {
    description: "The Challenger - Self-confident, decisive, willful, and confrontational.",
    motivation: "To be self-reliant and in control of their environment",
    fear: "Being controlled or vulnerable to others"
  },
  9: {
    description: "The Peacemaker - Receptive, reassuring, agreeable, and complacent.",
    motivation: "To maintain inner and outer peace",
    fear: "Loss of connection and fragmentation"
  }
};

const mbtiTypes = {
  'INTJ': {
    description: "The Architect - Imaginative and strategic thinkers, with a plan for everything.",
    functions: ["Ni", "Te", "Fi", "Se"]
  },
  'INTP': {
    description: "The Thinker - Innovative inventors with an unquenchable thirst for knowledge.",
    functions: ["Ti", "Ne", "Si", "Fe"]
  },
  'ENTJ': {
    description: "The Commander - Bold, imaginative and strong-willed leaders.",
    functions: ["Te", "Ni", "Se", "Fi"]
  },
  'ENTP': {
    description: "The Debater - Smart and curious thinkers who cannot resist an intellectual challenge.",
    functions: ["Ne", "Ti", "Fe", "Si"]
  },
  'INFJ': {
    description: "The Advocate - Quiet and mystical, yet very inspiring and tireless idealists.",
    functions: ["Ni", "Fe", "Ti", "Se"]
  },
  'INFP': {
    description: "The Mediator - Poetic, kind and altruistic people, always eager to help a good cause.",
    functions: ["Fi", "Ne", "Si", "Te"]
  },
  'ENFJ': {
    description: "The Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners.",
    functions: ["Fe", "Ni", "Se", "Ti"]
  },
  'ENFP': {
    description: "The Campaigner - Enthusiastic, creative and sociable free spirits.",
    functions: ["Ne", "Fi", "Te", "Si"]
  },
  'ISTJ': {
    description: "The Logistician - Practical and fact-minded, reliable and responsible.",
    functions: ["Si", "Te", "Fi", "Ne"]
  },
  'ISFJ': {
    description: "The Protector - Warm-hearted and dedicated, always ready to protect their loved ones.",
    functions: ["Si", "Fe", "Ti", "Ne"]
  },
  'ESTJ': {
    description: "The Executive - Excellent administrators, unsurpassed at managing things or people.",
    functions: ["Te", "Si", "Ne", "Fi"]
  },
  'ESFJ': {
    description: "The Consul - Extraordinarily caring, social and popular people, always eager to help.",
    functions: ["Fe", "Si", "Ne", "Ti"]
  },
  'ISTP': {
    description: "The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.",
    functions: ["Ti", "Se", "Ni", "Fe"]
  },
  'ISFP': {
    description: "The Adventurer - Flexible and charming artists, always ready to explore new possibilities.",
    functions: ["Fi", "Se", "Ni", "Te"]
  },
  'ESTP': {
    description: "The Entrepreneur - Smart, energetic and perceptive people, truly enjoy living on the edge.",
    functions: ["Se", "Ti", "Fe", "Ni"]
  },
  'ESFP': {
    description: "The Entertainer - Spontaneous, energetic and enthusiastic people - life is never boring.",
    functions: ["Se", "Fi", "Te", "Ni"]
  }
};

/**
 * Calculate Enneagram type from survey responses.
 * 
 * Question mapping (6 questions, 1-5 scale):
 * 0: "I am usually decisive and like to take charge" → Type 8
 * 1: "I strive for perfection in everything I do" → Type 1
 * 2: "I focus on helping others and their needs" → Type 2
 * 3: "I am highly motivated to succeed and achieve goals" → Type 3
 * 4: "I value uniqueness and authenticity above all else" → Type 4
 * 5: "I prefer to analyze and understand before acting" → Type 5
 */
export function calculateEnneagram(responses: number[]): PersonalityData['enneagram'] {
  // Initialize scores for all 9 types
  const scores: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };
  
  // Map each question to its corresponding type
  const questionTypeMap = [8, 1, 2, 3, 4, 5];
  
  // Score each type based on responses (1-5 scale)
  responses.forEach((response, index) => {
    if (index < questionTypeMap.length) {
      const typeNumber = questionTypeMap[index];
      scores[typeNumber] = response;
    }
  });

  // Find the primary type (highest score)
  let primaryType = 1;
  let maxScore = scores[1];
  
  for (let type = 2; type <= 9; type++) {
    if (scores[type] > maxScore) {
      maxScore = scores[type];
      primaryType = type;
    }
  }

  // Calculate wing (adjacent type with higher score)
  const wing = calculateEnneagramWing(primaryType, scores);
  
  return {
    type: primaryType,
    wing,
    description: enneagramTypes[primaryType as keyof typeof enneagramTypes].description,
    motivation: enneagramTypes[primaryType as keyof typeof enneagramTypes].motivation,
    fear: enneagramTypes[primaryType as keyof typeof enneagramTypes].fear
  };
}

/**
 * Calculate the wing for an Enneagram type.
 * Wing is the adjacent type (type-1 or type+1) with the higher score.
 * The Enneagram circle: 1-2-3-4-5-6-7-8-9-1 (wraps around)
 */
function calculateEnneagramWing(primaryType: number, scores: Record<number, number>): string {
  // Get adjacent types (wrapping around the circle)
  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  
  const leftScore = scores[leftWing] || 0;
  const rightScore = scores[rightWing] || 0;
  
  // Return the wing with higher score
  if (leftScore > rightScore) {
    return `${primaryType}w${leftWing}`;
  } else if (rightScore > leftScore) {
    return `${primaryType}w${rightWing}`;
  } else {
    // Equal scores (including both 0) - default to lower numbered wing
    return `${primaryType}w${Math.min(leftWing, rightWing)}`;
  }
}

/**
 * Calculate MBTI type from survey responses.
 * 
 * Question mapping (4 questions, Likert scale):
 * 0: "I prefer working with groups rather than alone" → E (agree) vs I (disagree)
 * 1: "I focus more on facts than possibilities" → S (agree) vs N (disagree)
 * 2: "I make decisions based on logic rather than feelings" → T (agree) vs F (disagree)
 * 3: "I prefer structured plans over flexible approaches" → J (agree) vs P (disagree)
 * 
 * Response values: "strongly_disagree", "disagree", "neither", "agree", "strongly_agree"
 */
export function calculateMBTI(responses: string[]): PersonalityData['mbti'] {
  // Score each dichotomy
  const scores = {
    E: 0, I: 0,  // Extraversion vs Introversion
    S: 0, N: 0,  // Sensing vs Intuition
    T: 0, F: 0,  // Thinking vs Feeling
    J: 0, P: 0   // Judging vs Perceiving
  };

  // Weight for each response level
  const responseWeights: Record<string, number> = {
    'strongly_disagree': -2,
    'disagree': -1,
    'neither': 0,
    'agree': 1,
    'strongly_agree': 2
  };

  // Question 0: E vs I
  if (responses[0]) {
    const weight = responseWeights[responses[0]] || 0;
    if (weight > 0) {
      scores.E += weight;
    } else if (weight < 0) {
      scores.I += Math.abs(weight);
    }
  }

  // Question 1: S vs N
  if (responses[1]) {
    const weight = responseWeights[responses[1]] || 0;
    if (weight > 0) {
      scores.S += weight;
    } else if (weight < 0) {
      scores.N += Math.abs(weight);
    }
  }

  // Question 2: T vs F
  if (responses[2]) {
    const weight = responseWeights[responses[2]] || 0;
    if (weight > 0) {
      scores.T += weight;
    } else if (weight < 0) {
      scores.F += Math.abs(weight);
    }
  }

  // Question 3: J vs P
  if (responses[3]) {
    const weight = responseWeights[responses[3]] || 0;
    if (weight > 0) {
      scores.J += weight;
    } else if (weight < 0) {
      scores.P += Math.abs(weight);
    }
  }

  // Determine type from scores (higher score wins each dichotomy)
  const type = 
    (scores.E > scores.I ? 'E' : 'I') +
    (scores.S > scores.N ? 'S' : 'N') +
    (scores.T > scores.F ? 'T' : 'F') +
    (scores.J > scores.P ? 'J' : 'P');
  
  return {
    type,
    description: mbtiTypes[type as keyof typeof mbtiTypes]?.description || "Unique personality type",
    functions: mbtiTypes[type as keyof typeof mbtiTypes]?.functions || []
  };
}
