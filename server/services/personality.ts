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
    description: "Type 1 / Reformer: traditionally associated with principled, improvement-focused themes.",
    motivation: "Traditional motivation theme: to be good, right, perfect, and to improve everything",
    fear: "Traditional fear theme: being corrupt, defective, or wrong"
  },
  2: {
    description: "Type 2 / Helper: traditionally associated with generosity, connection, and being useful to others.",
    motivation: "Traditional motivation theme: to be loved and needed",
    fear: "Traditional fear theme: being unloved or unwanted for themselves"
  },
  3: {
    description: "Type 3 / Achiever: traditionally associated with achievement, adaptation, and recognition themes.",
    motivation: "Traditional motivation theme: to be valuable and worthwhile",
    fear: "Traditional fear theme: being worthless or without value apart from achievements"
  },
  4: {
    description: "Type 4 / Individualist: traditionally associated with identity, expression, and emotional depth themes.",
    motivation: "Traditional motivation theme: to find themselves and their significance",
    fear: "Traditional fear theme: having no identity or personal significance"
  },
  5: {
    description: "Type 5 / Investigator: traditionally associated with observation, competence, and conserving personal resources.",
    motivation: "Traditional motivation theme: to be capable and competent",
    fear: "Traditional fear theme: being useless, helpless, or incapable"
  },
  6: {
    description: "Type 6 / Loyalist: traditionally associated with security, preparation, loyalty, and questioning risk.",
    motivation: "Traditional motivation theme: to have security and support",
    fear: "Traditional fear theme: being without support or guidance"
  },
  7: {
    description: "Type 7 / Enthusiast: traditionally associated with possibility, variety, optimism, and avoiding constraint.",
    motivation: "Traditional motivation theme: to maintain happiness and satisfaction",
    fear: "Traditional fear theme: being trapped in pain or deprivation"
  },
  8: {
    description: "Type 8 / Challenger: traditionally associated with autonomy, directness, protection, and use of personal power.",
    motivation: "Traditional motivation theme: to be self-reliant and in control of their environment",
    fear: "Traditional fear theme: being controlled or vulnerable to others"
  },
  9: {
    description: "Type 9 / Peacemaker: traditionally associated with harmony, receptivity, steadiness, and conflict avoidance.",
    motivation: "Traditional motivation theme: to maintain inner and outer peace",
    fear: "Traditional fear theme: loss of connection and fragmentation"
  }
};

const mbtiTypes = {
  'INTJ': {
    description: "INTJ: traditionally described as strategic, independent, and pattern-oriented.",
    functions: ["Ni", "Te", "Fi", "Se"]
  },
  'INTP': {
    description: "INTP: traditionally described as analytical, exploratory, and concept-oriented.",
    functions: ["Ti", "Ne", "Si", "Fe"]
  },
  'ENTJ': {
    description: "ENTJ: traditionally described as decisive, strategic, and organizing.",
    functions: ["Te", "Ni", "Se", "Fi"]
  },
  'ENTP': {
    description: "ENTP: traditionally described as exploratory, idea-generating, and debate-oriented.",
    functions: ["Ne", "Ti", "Fe", "Si"]
  },
  'INFJ': {
    description: "INFJ: traditionally described as reflective, values-oriented, and pattern-sensitive.",
    functions: ["Ni", "Fe", "Ti", "Se"]
  },
  'INFP': {
    description: "INFP: traditionally described as values-oriented, imaginative, and individually expressive.",
    functions: ["Fi", "Ne", "Si", "Te"]
  },
  'ENFJ': {
    description: "ENFJ: traditionally described as socially attuned, expressive, and group-oriented.",
    functions: ["Fe", "Ni", "Se", "Ti"]
  },
  'ENFP': {
    description: "ENFP: traditionally described as possibility-oriented, expressive, and socially curious.",
    functions: ["Ne", "Fi", "Te", "Si"]
  },
  'ISTJ': {
    description: "ISTJ: traditionally described as detail-oriented, structured, and reliability-focused.",
    functions: ["Si", "Te", "Fi", "Ne"]
  },
  'ISFJ': {
    description: "ISFJ: traditionally described as supportive, detail-aware, and continuity-focused.",
    functions: ["Si", "Fe", "Ti", "Ne"]
  },
  'ESTJ': {
    description: "ESTJ: traditionally described as structured, decisive, and implementation-focused.",
    functions: ["Te", "Si", "Ne", "Fi"]
  },
  'ESFJ': {
    description: "ESFJ: traditionally described as socially attentive, cooperative, and structure-oriented.",
    functions: ["Fe", "Si", "Ne", "Ti"]
  },
  'ISTP': {
    description: "ISTP: traditionally described as analytical, adaptable, and hands-on.",
    functions: ["Ti", "Se", "Ni", "Fe"]
  },
  'ISFP': {
    description: "ISFP: traditionally described as values-aware, adaptable, and experience-oriented.",
    functions: ["Fi", "Se", "Ni", "Te"]
  },
  'ESTP': {
    description: "ESTP: traditionally described as action-oriented, adaptable, and present-focused.",
    functions: ["Se", "Ti", "Fe", "Ni"]
  },
  'ESFP': {
    description: "ESFP: traditionally described as expressive, present-focused, and socially responsive.",
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
    description: mbtiTypes[type as keyof typeof mbtiTypes]?.description || "Assessment result available; use the type as a self-reflection framework rather than a fixed identity claim.",
    functions: mbtiTypes[type as keyof typeof mbtiTypes]?.functions || []
  };
}
