// Kabbalah - Tree of Life, Sefirot, Hebrew Letters, Gematria

interface Sefirah {
  name: string;
  hebrew: string;
  meaning: string;
  attribute: string;
  number: number;
  color: string;
  archangel: string;
  spiritualLesson: string;
  keywords: string[];
}

const SEFIROT: Sefirah[] = [
  { name: "Keter", hebrew: "כֶּתֶר", meaning: "Crown", attribute: "Divine Will", number: 1, color: "White/Brilliant", archangel: "Metatron", spiritualLesson: "Unity with the Divine", keywords: ["Unity", "Source", "Pure Being"] },
  { name: "Chokmah", hebrew: "חָכְמָה", meaning: "Wisdom", attribute: "Divine Wisdom", number: 2, color: "Gray", archangel: "Raziel", spiritualLesson: "Intuitive Insight", keywords: ["Wisdom", "Inspiration", "Flash of Insight"] },
  { name: "Binah", hebrew: "בִּינָה", meaning: "Understanding", attribute: "Divine Understanding", number: 3, color: "Black", archangel: "Tzaphkiel", spiritualLesson: "Comprehension", keywords: ["Understanding", "Form", "Structure"] },
  { name: "Chesed", hebrew: "חֶסֶד", meaning: "Mercy", attribute: "Divine Love", number: 4, color: "Blue", archangel: "Tzadkiel", spiritualLesson: "Unconditional Love", keywords: ["Mercy", "Kindness", "Expansion"] },
  { name: "Gevurah", hebrew: "גְּבוּרָה", meaning: "Severity", attribute: "Divine Strength", number: 5, color: "Red", archangel: "Kamael", spiritualLesson: "Discipline & Boundaries", keywords: ["Strength", "Justice", "Discernment"] },
  { name: "Tiferet", hebrew: "תִּפְאֶרֶת", meaning: "Beauty", attribute: "Divine Beauty", number: 6, color: "Yellow/Gold", archangel: "Michael", spiritualLesson: "Balance & Harmony", keywords: ["Beauty", "Balance", "Truth"] },
  { name: "Netzach", hebrew: "נֶצַח", meaning: "Victory", attribute: "Divine Eternity", number: 7, color: "Green", archangel: "Haniel", spiritualLesson: "Perseverance", keywords: ["Victory", "Endurance", "Nature"] },
  { name: "Hod", hebrew: "הוֹד", meaning: "Glory", attribute: "Divine Splendor", number: 8, color: "Orange", archangel: "Raphael", spiritualLesson: "Gratitude & Surrender", keywords: ["Glory", "Intellect", "Communication"] },
  { name: "Yesod", hebrew: "יְסוֹד", meaning: "Foundation", attribute: "Divine Foundation", number: 9, color: "Purple", archangel: "Gabriel", spiritualLesson: "Connection to Reality", keywords: ["Foundation", "Subconscious", "Dreams"] },
  { name: "Malkuth", hebrew: "מַלְכוּת", meaning: "Kingdom", attribute: "Divine Kingdom", number: 10, color: "Earth tones", archangel: "Sandalphon", spiritualLesson: "Manifestation", keywords: ["Kingdom", "Physical World", "Action"] }
];

const HEBREW_LETTERS = [
  { letter: "א", name: "Aleph", number: 1, meaning: "Ox", spiritual: "Divine breath, unity" },
  { letter: "ב", name: "Bet", number: 2, meaning: "House", spiritual: "Duality, shelter" },
  { letter: "ג", name: "Gimel", number: 3, meaning: "Camel", spiritual: "Movement, giving" },
  { letter: "ד", name: "Dalet", number: 4, meaning: "Door", spiritual: "Gateway, humility" },
  { letter: "ה", name: "Hey", number: 5, meaning: "Window", spiritual: "Revelation, breath" },
  { letter: "ו", name: "Vav", number: 6, meaning: "Hook", spiritual: "Connection, truth" },
  { letter: "ז", name: "Zayin", number: 7, meaning: "Sword", spiritual: "Spirit, struggle" },
  { letter: "ח", name: "Chet", number: 8, meaning: "Fence", spiritual: "Life force, transcendence" },
  { letter: "ט", name: "Tet", number: 9, meaning: "Serpent", spiritual: "Involution, goodness" }
];

interface KabbalahProfile {
  birthSefirah: Sefirah;
  pathSefirot: Sefirah[];
  hebrewLetter: typeof HEBREW_LETTERS[0];
  gematria: {
    nameValue: number;
    reducedValue: number;
    interpretation: string;
  };
  treeOfLifePath: {
    from: Sefirah;
    to: Sefirah;
    lesson: string;
  };
  interpretation: {
    summary: string;
    spiritualPath: string;
    divineAttribute: string;
    lifePurpose: string;
  };
}

function calculateGematria(name: string): { value: number; reduced: number } {
  const hebrewValues: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 10, 'K': 20, 'L': 30, 'M': 40, 'N': 50, 'O': 60, 'P': 70, 'Q': 80, 'R': 90,
    'S': 100, 'T': 200, 'U': 300, 'V': 400, 'W': 500, 'X': 600, 'Y': 700, 'Z': 800
  };
  
  const value = name.toUpperCase().replace(/[^A-Z]/g, '').split('').reduce((sum, letter) => {
    return sum + (hebrewValues[letter] || 0);
  }, 0);
  
  // Reduce to single digit (Pythagorean)
  let reduced = value;
  while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    reduced = reduced.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  return { value, reduced };
}

export function calculateKabbalah(
  name: string,
  birthDate: string,
  lifePath: number
): KabbalahProfile {
  const date = new Date(birthDate);
  const day = date.getDate();
  
  // Birth Sefirah based on day of month
  const sefirahIndex = ((day - 1) % 10);
  const birthSefirah = SEFIROT[sefirahIndex];
  
  // Path Sefirot based on life path
  const pathSefirot: Sefirah[] = [
    birthSefirah,
    SEFIROT[(lifePath - 1) % 10],
    SEFIROT[5] // Tiferet - center of the tree
  ];
  
  // Hebrew letter based on life path
  const hebrewLetter = HEBREW_LETTERS[(lifePath - 1) % 9];
  
  // Calculate Gematria
  const gematria = calculateGematria(name);
  const gematriaSefirah = SEFIROT[(gematria.reduced - 1) % 10];
  
  return {
    birthSefirah,
    pathSefirot,
    hebrewLetter,
    gematria: {
      nameValue: gematria.value,
      reducedValue: gematria.reduced,
      interpretation: `Your name's gematria value of ${gematria.value} reduces to ${gematria.reduced}, connecting you to ${gematriaSefirah.name} - ${gematriaSefirah.meaning}. This reveals your soul's numerical signature.`
    },
    treeOfLifePath: {
      from: birthSefirah,
      to: SEFIROT[5], // Tiferet
      lesson: `Your spiritual journey moves from ${birthSefirah.name} (${birthSefirah.meaning}) to Tiferet (Beauty), learning to balance ${birthSefirah.keywords.join(' and ')}.`
    },
    interpretation: {
      summary: `Born on the ${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} day, you embody ${birthSefirah.name} - ${birthSefirah.meaning}. Your soul's essence vibrates with ${birthSefirah.attribute}.`,
      spiritualPath: `Your path on the Tree of Life ascends through ${pathSefirot.map(s => s.name).join(' → ')}, integrating ${birthSefirah.keywords[0]}, ${pathSefirot[1].keywords[0]}, and divine harmony.`,
      divineAttribute: `The divine attribute of ${birthSefirah.attribute} flows through you. Archangel ${birthSefirah.archangel} guides your spiritual unfoldment.`,
      lifePurpose: `Your soul's purpose is to manifest ${birthSefirah.spiritualLesson} in the physical world, bringing ${birthSefirah.color} light to all you touch.`
    }
  };
}
