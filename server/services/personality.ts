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

export function calculateEnneagram(responses: number[]): PersonalityData['enneagram'] {
  // Simple scoring based on response patterns
  const scores = Array(9).fill(0);
  
  // Map responses to enneagram types (simplified algorithm)
  responses.forEach((response, index) => {
    const typeIndex = index % 9;
    scores[typeIndex] += response;
  });

  const maxScore = Math.max(...scores);
  const type = scores.indexOf(maxScore) + 1;
  
  return {
    type,
    description: enneagramTypes[type as keyof typeof enneagramTypes].description,
    motivation: enneagramTypes[type as keyof typeof enneagramTypes].motivation,
    fear: enneagramTypes[type as keyof typeof enneagramTypes].fear
  };
}

export function calculateMBTI(responses: string[]): PersonalityData['mbti'] {
  // Simple MBTI calculation based on dichotomies
  let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;

  responses.forEach((response, index) => {
    const value = response.toLowerCase();
    
    // Extraversion vs Introversion questions (every 4th starting at 0)
    if (index % 4 === 0) {
      value.includes('extro') || value.includes('social') || value.includes('group') ? e++ : i++;
    }
    // Sensing vs Intuition questions (every 4th starting at 1)
    else if (index % 4 === 1) {
      value.includes('detail') || value.includes('practical') || value.includes('concrete') ? s++ : n++;
    }
    // Thinking vs Feeling questions (every 4th starting at 2)
    else if (index % 4 === 2) {
      value.includes('logical') || value.includes('objective') || value.includes('analyze') ? t++ : f++;
    }
    // Judging vs Perceiving questions (every 4th starting at 3)
    else {
      value.includes('plan') || value.includes('schedule') || value.includes('organize') ? j++ : p++;
    }
  });

  const type = `${e > i ? 'E' : 'I'}${s > n ? 'S' : 'N'}${t > f ? 'T' : 'F'}${j > p ? 'J' : 'P'}`;
  
  return {
    type,
    description: mbtiTypes[type as keyof typeof mbtiTypes]?.description || "Unique personality type",
    functions: mbtiTypes[type as keyof typeof mbtiTypes]?.functions || []
  };
}
