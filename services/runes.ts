// Elder Futhark Runes - Norse/Germanic Divination

const RUNES = [
  { name: "Fehu", symbol: "ᚠ", meaning: "Cattle/Wealth", element: "Fire", aett: "Freya", keywords: ["Abundance", "Prosperity", "Fulfillment"], interpretation: "Mobile wealth, new beginnings, success" },
  { name: "Uruz", symbol: "ᚢ", meaning: "Aurochs/Strength", element: "Earth", aett: "Freya", keywords: ["Strength", "Vitality", "Endurance"], interpretation: "Raw power, health, primal force" },
  { name: "Thurisaz", symbol: "ᚦ", meaning: "Giant/Thorn", element: "Fire", aett: "Freya", keywords: ["Protection", "Defense", "Breakthrough"], interpretation: "Protective force, gateway, challenge" },
  { name: "Ansuz", symbol: "ᚨ", meaning: "Divine Breath", element: "Air", aett: "Freya", keywords: ["Communication", "Wisdom", "Inspiration"], interpretation: "Divine messages, insight, signals" },
  { name: "Raidho", symbol: "ᚱ", meaning: "Journey/Wheel", element: "Air", aett: "Freya", keywords: ["Journey", "Movement", "Rhythm"], interpretation: "Travel, life path, natural order" },
  { name: "Kenaz", symbol: "ᚲ", meaning: "Torch", element: "Fire", aett: "Freya", keywords: ["Knowledge", "Creativity", "Illumination"], interpretation: "Inner fire, transformation, revelation" },
  { name: "Gebo", symbol: "ᚷ", meaning: "Gift", element: "Air", aett: "Freya", keywords: ["Partnership", "Exchange", "Balance"], interpretation: "Sacred gift, relationship, union" },
  { name: "Wunjo", symbol: "ᚹ", meaning: "Joy", element: "Earth", aett: "Freya", keywords: ["Joy", "Harmony", "Success"], interpretation: "Happiness, wellbeing, fellowship" },
  { name: "Hagalaz", symbol: "ᚺ", meaning: "Hail", element: "Ice", aett: "Heimdall", keywords: ["Disruption", "Change", "Challenge"], interpretation: "Uncontrolled forces, transformation" },
  { name: "Nauthiz", symbol: "ᚾ", meaning: "Need", element: "Fire", aett: "Heimdall", keywords: ["Necessity", "Constraint", "Resistance"], interpretation: "Need fire, constraint teaches" },
  { name: "Isa", symbol: "ᛁ", meaning: "Ice", element: "Ice", aett: "Heimdall", keywords: ["Stillness", "Patience", "Standstill"], interpretation: "Frozen potential, pause, reflection" },
  { name: "Jera", symbol: "ᛃ", meaning: "Harvest/Year", element: "Earth", aett: "Heimdall", keywords: ["Cycles", "Harvest", "Reward"], interpretation: "Natural timing, fruition, cycles" },
  { name: "Eihwaz", symbol: "ᛇ", meaning: "Yew Tree", element: "All", aett: "Heimdall", keywords: ["Endurance", "Protection", "Mysteries"], interpretation: "Spiritual strength, initiation" },
  { name: "Perthro", symbol: "ᛈ", meaning: "Dice Cup", element: "Water", aett: "Heimdall", keywords: ["Mystery", "Fate", "Hidden"], interpretation: "Fate, the unknown, occult" },
  { name: "Algiz", symbol: "ᛉ", meaning: "Elk/Protection", element: "Air", aett: "Heimdall", keywords: ["Protection", "Shield", "Connection"], interpretation: "Divine protection, higher self" },
  { name: "Sowilo", symbol: "ᛋ", meaning: "Sun", element: "Fire", aett: "Heimdall", keywords: ["Success", "Vitality", "Wholeness"], interpretation: "Life force, victory, clarity" },
  { name: "Tiwaz", symbol: "ᛏ", meaning: "Tyr (God)", element: "Air", aett: "Tyr", keywords: ["Justice", "Warrior", "Sacrifice"], interpretation: "Honor, leadership, right action" },
  { name: "Berkano", symbol: "ᛒ", meaning: "Birch", element: "Earth", aett: "Tyr", keywords: ["Birth", "Growth", "Nurturing"], interpretation: "Fertility, new beginnings, rebirth" },
  { name: "Ehwaz", symbol: "ᛖ", meaning: "Horse", element: "Earth", aett: "Tyr", keywords: ["Movement", "Progress", "Partnership"], interpretation: "Gradual progress, teamwork, trust" },
  { name: "Mannaz", symbol: "ᛗ", meaning: "Human", element: "Air", aett: "Tyr", keywords: ["Self", "Humanity", "Intelligence"], interpretation: "Human experience, social order" },
  { name: "Laguz", symbol: "ᛚ", meaning: "Water/Lake", element: "Water", aett: "Tyr", keywords: ["Flow", "Intuition", "Emotion"], interpretation: "Life energy, intuition, psychic" },
  { name: "Ingwaz", symbol: "ᛜ", meaning: "Fertility God", element: "Earth", aett: "Tyr", keywords: ["Gestation", "Potential", "Internal"], interpretation: "Seed time, potential, completion" },
  { name: "Dagaz", symbol: "ᛞ", meaning: "Day", element: "Fire/Air", aett: "Tyr", keywords: ["Breakthrough", "Awakening", "Dawn"], interpretation: "Transformation, breakthrough, clarity" },
  { name: "Othala", symbol: "ᛟ", meaning: "Ancestral Property", element: "Earth", aett: "Tyr", keywords: ["Heritage", "Home", "Legacy"], interpretation: "Inheritance, homeland, tradition" }
];

interface RunicProfile {
  birthRune: typeof RUNES[0];
  nameRunes: Array<typeof RUNES[0]>;
  destinyRune: typeof RUNES[0];
  challengeRune: typeof RUNES[0];
  interpretation: {
    summary: string;
    spiritualPath: string;
    strengths: string[];
    lifeLessons: string[];
    guidance: string;
  };
}

function getRuneFromNumber(num: number): typeof RUNES[0] {
  return RUNES[num % 24];
}

function nameToRunes(name: string): Array<typeof RUNES[0]> {
  const runeMap: { [key: string]: number } = {
    'F': 0, 'U': 1, 'TH': 2, 'A': 3, 'R': 4, 'K': 5, 'G': 6, 'W': 7,
    'H': 8, 'N': 9, 'I': 10, 'J': 11, 'E': 12, 'P': 13, 'Z': 14, 'S': 15,
    'T': 16, 'B': 17, 'M': 19, 'L': 20, 'D': 22, 'O': 23
  };
  
  const runes: Array<typeof RUNES[0]> = [];
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  
  for (const letter of cleanName) {
    const runeIndex = runeMap[letter];
    if (runeIndex !== undefined) {
      runes.push(RUNES[runeIndex]);
    }
  }
  
  return runes.slice(0, 5); // First 5 runes of name
}

export function calculateRunes(name: string, birthDate: string, lifePath: number): RunicProfile {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  // Birth rune from day
  const birthRune = getRuneFromNumber(day - 1);
  
  // Name runes
  const nameRunes = nameToRunes(name);
  
  // Destiny rune from life path
  const destinyRune = getRuneFromNumber(lifePath - 1);
  
  // Challenge rune from month
  const challengeRune = getRuneFromNumber(month + 11);
  
  return {
    birthRune,
    nameRunes,
    destinyRune,
    challengeRune,
    interpretation: {
      summary: `Born under ${birthRune.name} (${birthRune.symbol}), your runic signature carries ${birthRune.keywords.join(', ')} energy. This ancient Norse symbol reveals ${birthRune.interpretation}.`,
      spiritualPath: `Your destiny rune ${destinyRune.name} (${destinyRune.symbol}) guides you toward ${destinyRune.keywords[0].toLowerCase()} and ${destinyRune.keywords[1].toLowerCase()}. The ${destinyRune.aett} Aett teaches you these mysteries.`,
      strengths: birthRune.keywords,
      lifeLessons: [
        `Master the ${birthRune.element} element through ${birthRune.meaning.toLowerCase()}`,
        `Navigate ${challengeRune.name} challenges with ${challengeRune.keywords[0].toLowerCase()}`,
        `Fulfill your destiny through ${destinyRune.interpretation.toLowerCase()}`
      ],
      guidance: `Meditate on ${birthRune.symbol} to connect with your primal essence. The runes of your name (${nameRunes.map(r => r.symbol).join(' ')}) spell your spiritual identity in the elder script.`
    }
  };
}
