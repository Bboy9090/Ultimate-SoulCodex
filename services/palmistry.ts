// Palmistry Analysis Service
// Analyzes birth date and numerology to generate palm reading insights

interface PalmistryReading {
  dominantHand: "left" | "right";
  heartLine: {
    type: string;
    meaning: string;
    traits: string[];
  };
  headLine: {
    type: string;
    meaning: string;
    traits: string[];
  };
  lifeLine: {
    type: string;
    meaning: string;
    traits: string[];
  };
  fateLine: {
    present: boolean;
    type?: string;
    meaning?: string;
  };
  sunLine: {
    present: boolean;
    type?: string;
    meaning?: string;
  };
  mounts: {
    venus: { strength: number; meaning: string };
    jupiter: { strength: number; meaning: string };
    saturn: { strength: number; meaning: string };
    apollo: { strength: number; meaning: string };
    mercury: { strength: number; meaning: string };
    mars: { strength: number; meaning: string };
    luna: { strength: number; meaning: string };
  };
  fingerAnalysis: {
    jupiter: { meaning: string };
    saturn: { meaning: string };
    apollo: { meaning: string };
    mercury: { meaning: string };
  };
  specialMarks: string[];
  summary: string;
}

/**
 * Generate palm reading based on birth date and numerology
 */
export function generatePalmReading(birthDate: string, lifePath: number): PalmistryReading {
  // Validate birthDate to prevent NaN issues
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid birthDate provided: ${birthDate}`);
  }
  
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  
  // Determine dominant hand (based on life path)
  const dominantHand = lifePath % 2 === 0 ? "right" : "left";
  
  // Heart Line (emotional life) - based on month
  const heartLineTypes = [
    { type: "Deep and Long", meaning: "You experience emotions intensely and form deep, lasting connections", traits: ["Passionate", "Loyal", "Romantic"] },
    { type: "Curved Upward", meaning: "You express your feelings openly and seek emotional harmony", traits: ["Expressive", "Warm", "Affectionate"] },
    { type: "Straight Across", meaning: "You approach relationships with logic and practicality", traits: ["Rational", "Stable", "Thoughtful"] },
    { type: "Chained Pattern", meaning: "You experience emotional complexity and deep sensitivity", traits: ["Empathetic", "Intuitive", "Compassionate"] }
  ];
  const heartLine = heartLineTypes[month % heartLineTypes.length];
  
  // Head Line (intellect and decision-making) - based on life path
  const headLineTypes = [
    { type: "Long and Straight", meaning: "You possess sharp analytical abilities and clear thinking", traits: ["Logical", "Focused", "Decisive"] },
    { type: "Curved", meaning: "You blend creativity with intellect in your thought process", traits: ["Creative", "Adaptable", "Imaginative"] },
    { type: "Deep and Well-Defined", meaning: "You have strong concentration and mental clarity", traits: ["Intelligent", "Perceptive", "Wise"] },
    { type: "Forked at End", meaning: "You can see multiple perspectives and think holistically", traits: ["Versatile", "Open-minded", "Strategic"] }
  ];
  const headLine = headLineTypes[lifePath % headLineTypes.length];
  
  // Life Line (vitality and life force) - based on day of birth
  const lifeLineTypes = [
    { type: "Long and Deep", meaning: "You possess strong vitality and enduring life force", traits: ["Energetic", "Resilient", "Healthy"] },
    { type: "Wide Curve", meaning: "You embrace life with enthusiasm and adventurous spirit", traits: ["Adventurous", "Dynamic", "Bold"] },
    { type: "Close to Thumb", meaning: "You value security and careful approach to life", traits: ["Cautious", "Grounded", "Practical"] },
    { type: "Chained", meaning: "You navigate life's challenges with flexibility", traits: ["Adaptable", "Resourceful", "Flexible"] }
  ];
  const lifeLine = lifeLineTypes[dayOfMonth % lifeLineTypes.length];
  
  // Fate Line (career and destiny) - based on life path
  const hasFateLine = lifePath >= 5;
  const fateLine = hasFateLine ? {
    present: true,
    type: "Strong and Clear",
    meaning: "You have a clear sense of purpose and destiny in your career path"
  } : {
    present: false
  };
  
  // Sun Line (success and creativity) - based on life path
  const hasSunLine = [1, 3, 6, 9].includes(lifePath);
  const sunLine = hasSunLine ? {
    present: true,
    type: "Well-Defined",
    meaning: "You possess natural creative talents and potential for recognition"
  } : {
    present: false
  };
  
  // Mounts (planetary influences) - calculated from birth data
  const mounts = calculateMounts(month, dayOfMonth, lifePath);
  
  // Finger Analysis
  const fingerAnalysis = {
    jupiter: { meaning: "Leadership qualities and ambition guide your path" },
    saturn: { meaning: "Discipline and responsibility shape your character" },
    apollo: { meaning: "Creative expression and artistic sensibilities illuminate your soul" },
    mercury: { meaning: "Communication skills and adaptability serve you well" }
  };
  
  // Special Marks (mystical significance)
  const specialMarks = generateSpecialMarks(lifePath, month, dayOfMonth);
  
  // Generate comprehensive summary
  const summary = `Your palm reveals a ${dominantHand}-hand dominant individual with ${heartLine.type.toLowerCase()} heart line indicating ${heartLine.meaning.toLowerCase()}. Combined with your ${headLine.type.toLowerCase()} head line, you approach life with both ${heartLine.traits[0].toLowerCase()} emotion and ${headLine.traits[0].toLowerCase()} intellect. Your ${lifeLine.type.toLowerCase()} life line suggests ${lifeLine.meaning.toLowerCase()}, empowering you to navigate your path with ${lifeLine.traits[0].toLowerCase()} energy.`;
  
  return {
    dominantHand,
    heartLine,
    headLine,
    lifeLine,
    fateLine,
    sunLine,
    mounts,
    fingerAnalysis,
    specialMarks,
    summary
  };
}

function calculateMounts(month: number, day: number, lifePath: number): PalmistryReading['mounts'] {
  // Venus (love, passion, sensuality)
  const venusStrength = ((month + day) % 5) + 3; // 3-7 range
  
  // Jupiter (ambition, leadership)
  const jupiterStrength = ((lifePath + month) % 5) + 3;
  
  // Saturn (discipline, wisdom)
  const saturnStrength = ((day * 2) % 5) + 3;
  
  // Apollo (creativity, success)
  const apolloStrength = ([1, 3, 6, 9].includes(lifePath) ? 6 : 4);
  
  // Mercury (communication, intelligence)
  const mercuryStrength = ([1, 5, 7].includes(lifePath) ? 6 : 4);
  
  // Mars (energy, courage)
  const marsStrength = ((lifePath + day) % 5) + 4;
  
  // Luna (intuition, imagination)
  const lunaStrength = ([2, 7, 9].includes(lifePath) ? 6 : 4);
  
  return {
    venus: {
      strength: venusStrength,
      meaning: venusStrength >= 6 ? "Strong capacity for love and emotional expression" : "Balanced approach to relationships and passion"
    },
    jupiter: {
      strength: jupiterStrength,
      meaning: jupiterStrength >= 6 ? "Natural leadership abilities and ambitious drive" : "Steady growth in personal development"
    },
    saturn: {
      strength: saturnStrength,
      meaning: saturnStrength >= 6 ? "Deep wisdom and strong sense of responsibility" : "Practical approach to life's challenges"
    },
    apollo: {
      strength: apolloStrength,
      meaning: apolloStrength >= 6 ? "Exceptional creative talents and artistic brilliance" : "Appreciation for beauty and creative expression"
    },
    mercury: {
      strength: mercuryStrength,
      meaning: mercuryStrength >= 6 ? "Gift for communication and quick wit" : "Clear and effective communication skills"
    },
    mars: {
      strength: marsStrength,
      meaning: marsStrength >= 6 ? "Powerful energy and courageous spirit" : "Balanced vitality and assertiveness"
    },
    luna: {
      strength: lunaStrength,
      meaning: lunaStrength >= 6 ? "Profound intuition and psychic sensitivity" : "Healthy imagination and emotional depth"
    }
  };
}

function generateSpecialMarks(lifePath: number, month: number, day: number): string[] {
  const marks: string[] = [];
  
  // Triangle (rare, positive)
  if (lifePath === 9 || (month + day) % 11 === 0) {
    marks.push("Triangle on Mount of Apollo - Exceptional creative success and recognition");
  }
  
  // Star (powerful energy)
  if ([1, 3, 5, 7].includes(lifePath)) {
    marks.push("Star on Jupiter Mount - Leadership destiny and influential power");
  }
  
  // Cross (significant life events)
  if (day > 15) {
    marks.push("Cross near Head Line - Important decision point in intellectual journey");
  }
  
  // Square (protection)
  if (lifePath % 2 === 0) {
    marks.push("Square on Life Line - Protection during times of challenge");
  }
  
  // Mystic Cross (spiritual insight)
  if ([2, 7, 9, 11].includes(lifePath)) {
    marks.push("Mystic Cross in Palm Center - Deep spiritual awareness and intuitive gifts");
  }
  
  // Ring of Solomon (wisdom)
  if (lifePath >= 7) {
    marks.push("Ring of Solomon - Natural wisdom and understanding of human nature");
  }
  
  // If no special marks, add general positive indicator
  if (marks.length === 0) {
    marks.push("Clear Palm Lines - Straightforward life path with minimal obstacles");
  }
  
  return marks;
}
