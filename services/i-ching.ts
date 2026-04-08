// I Ching (Yi Jing) - Book of Changes
// 64 Hexagrams representing universal principles

interface Hexagram {
  number: number;
  chinese: string;
  name: string;
  judgment: string;
  image: string;
  interpretation: string;
  lines: {
    [key: number]: {
      text: string;
      meaning: string;
    };
  };
  keywords: string[];
  element: string;
  trigrams: {
    upper: string;
    lower: string;
  };
}

// First 10 hexagrams (abbreviated - full implementation would have all 64)
const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    chinese: "乾",
    name: "The Creative",
    judgment: "The Creative works supreme success, furthering through perseverance.",
    image: "The movement of heaven is full of power. Thus the superior person makes themselves strong and untiring.",
    interpretation: "Pure yang energy, creative force, initiation, leadership. This hexagram represents the primal power of the universe.",
    lines: {
      1: { text: "Hidden dragon. Do not act.", meaning: "Potential not yet ready to emerge" },
      2: { text: "Dragon appearing in the field.", meaning: "First manifestation of power" },
      3: { text: "All day long working creatively.", meaning: "Sustained creative effort" },
      4: { text: "Wavering flight over the depths.", meaning: "Testing new heights" },
      5: { text: "Flying dragon in the heavens.", meaning: "Full expression of power" },
      6: { text: "Arrogant dragon will have cause to repent.", meaning: "Excess leads to downfall" }
    },
    keywords: ["Creativity", "Heaven", "Initiative", "Yang", "Leadership"],
    element: "Metal",
    trigrams: { upper: "Heaven", lower: "Heaven" }
  },
  {
    number: 2,
    chinese: "坤",
    name: "The Receptive",
    judgment: "The Receptive brings supreme success through the perseverance of a mare.",
    image: "The earth's condition is receptive devotion. Thus the superior person with breadth of character carries the outer world.",
    interpretation: "Pure yin energy, receptivity, nourishment, support. Yielding strength that sustains all things.",
    lines: {
      1: { text: "When there is hoarfrost underfoot, solid ice is not far off.", meaning: "Early signs of change" },
      2: { text: "Straight, square, great. Without purpose, yet nothing remains unfurthered.", meaning: "Natural order prevails" },
      3: { text: "Hidden lines. One is able to remain persevering.", meaning: "Quiet strength endures" },
      4: { text: "A tied-up sack. No blame, no praise.", meaning: "Discretion and restraint" },
      5: { text: "A yellow lower garment brings supreme good fortune.", meaning: "Humble excellence" },
      6: { text: "Dragons fight in the meadow. Their blood is black and yellow.", meaning: "Conflict between extremes" }
    },
    keywords: ["Receptivity", "Earth", "Yielding", "Yin", "Support"],
    element: "Earth",
    trigrams: { upper: "Earth", lower: "Earth" }
  },
  {
    number: 3,
    chinese: "屯",
    name: "Difficulty at the Beginning",
    judgment: "Difficulty at the beginning works supreme success through perseverance.",
    image: "Clouds and thunder: the image of difficulty at the beginning. Thus the superior person brings order out of confusion.",
    interpretation: "New beginnings face obstacles. Like a blade of grass pushing through earth, growth requires perseverance.",
    lines: {
      1: { text: "Hesitation and hindrance.", meaning: "Initial resistance to movement" },
      2: { text: "Difficulties pile up.", meaning: "Challenges accumulate" },
      3: { text: "Whoever hunts deer without the forester only loses their way in the forest.", meaning: "Need for guidance" },
      4: { text: "Horse and wagon part.", meaning: "Temporary setback" },
      5: { text: "Difficulties in blessing.", meaning: "Hidden opportunity" },
      6: { text: "Horse and wagon part. Bloody tears flow.", meaning: "Deep struggle" }
    },
    keywords: ["Beginning", "Difficulty", "Growth", "Perseverance", "Chaos"],
    element: "Water",
    trigrams: { upper: "Water", lower: "Thunder" }
  }
  // Abbreviated to 3 hexagrams - full system would include all 64
];

interface IChingReading {
  birthHexagram: {
    hexagram: Hexagram;
    interpretation: string;
    personalGuidance: string;
  };
  changingLines: number[];
  futureHexagram?: {
    hexagram: Hexagram;
    interpretation: string;
  };
  dailyHexagram?: {
    hexagram: Hexagram;
    guidance: string;
  };
  lifeLesson: string;
}

// Calculate hexagram from birth data
function calculateBirthHexagram(birthDate: string): { hexagramNumber: number; changingLines: number[] } {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Use birth numbers to generate hexagram (simplified method)
  const hexagramNumber = ((day + month + year) % 64) || 1;
  
  // Generate changing lines from date components
  const changingLines: number[] = [];
  if (day % 2 === 0) changingLines.push(1);
  if (month % 3 === 0) changingLines.push(3);
  if (year % 5 === 0) changingLines.push(5);
  
  return { hexagramNumber, changingLines };
}

// Calculate daily hexagram
function calculateDailyHexagram(currentDate: Date = new Date()): number {
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  return ((day + month + year) % 64) || 1;
}

// Get hexagram by number
function getHexagram(number: number): Hexagram {
  if (number <= 3) {
    return HEXAGRAMS[number - 1];
  }
  // Fallback for hexagrams 4-64 (would be fully implemented)
  return {
    number,
    chinese: "待定",
    name: `Hexagram ${number}`,
    judgment: "The situation calls for contemplation.",
    image: "The wise person reflects on the patterns of change.",
    interpretation: "Each hexagram reveals a pattern in the eternal dance of yin and yang.",
    lines: {
      1: { text: "Beginning", meaning: "The situation begins" },
      2: { text: "Development", meaning: "The situation develops" },
      3: { text: "Midpoint", meaning: "The situation reaches its center" },
      4: { text: "Transition", meaning: "The situation transforms" },
      5: { text: "Culmination", meaning: "The situation peaks" },
      6: { text: "Completion", meaning: "The situation concludes" }
    },
    keywords: ["Change", "Transformation", "Wisdom"],
    element: "Unknown",
    trigrams: { upper: "Unknown", lower: "Unknown" }
  };
}

export function calculateIChing(birthDate: string): IChingReading {
  const birthCalc = calculateBirthHexagram(birthDate);
  const birthHexagram = getHexagram(birthCalc.hexagramNumber);
  
  // Calculate future hexagram if there are changing lines
  let futureHexagram;
  if (birthCalc.changingLines.length > 0) {
    // In full implementation, would calculate transformation
    const futureNumber = ((birthCalc.hexagramNumber + birthCalc.changingLines.length) % 64) || 1;
    futureHexagram = {
      hexagram: getHexagram(futureNumber),
      interpretation: `Your path transforms toward ${getHexagram(futureNumber).name}. The changing lines indicate evolution in your life pattern.`
    };
  }
  
  // Daily hexagram
  const dailyNumber = calculateDailyHexagram();
  const dailyHexagram = {
    hexagram: getHexagram(dailyNumber),
    guidance: `Today's hexagram ${dailyNumber} (${getHexagram(dailyNumber).name}) advises: ${getHexagram(dailyNumber).judgment}`
  };
  
  return {
    birthHexagram: {
      hexagram: birthHexagram,
      interpretation: birthHexagram.interpretation,
      personalGuidance: `Born under Hexagram ${birthHexagram.number} (${birthHexagram.chinese} ${birthHexagram.name}), your life embodies ${birthHexagram.keywords.join(', ')}. ${birthHexagram.judgment}`
    },
    changingLines: birthCalc.changingLines,
    futureHexagram,
    dailyHexagram,
    lifeLesson: `The I Ching teaches you the wisdom of ${birthHexagram.name}. ${birthHexagram.image}`
  };
}
