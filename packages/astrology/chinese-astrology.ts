// Chinese Astrology - BaZi (Four Pillars of Destiny)
// 12 Animals + 5 Elements + Yin/Yang

const ANIMALS = [
  { name: "Rat", element: "Water", yin: true, traits: ["Clever", "Resourceful", "Adaptable"], years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020] },
  { name: "Ox", element: "Earth", yin: true, traits: ["Patient", "Reliable", "Strong"], years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021] },
  { name: "Tiger", element: "Wood", yang: true, traits: ["Brave", "Confident", "Competitive"], years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022] },
  { name: "Rabbit", element: "Wood", yin: true, traits: ["Gentle", "Elegant", "Diplomatic"], years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023] },
  { name: "Dragon", element: "Earth", yang: true, traits: ["Powerful", "Charismatic", "Ambitious"], years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024] },
  { name: "Snake", element: "Fire", yin: true, traits: ["Wise", "Intuitive", "Mysterious"], years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025] },
  { name: "Horse", element: "Fire", yang: true, traits: ["Energetic", "Independent", "Free-spirited"], years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026] },
  { name: "Goat", element: "Earth", yin: true, traits: ["Creative", "Gentle", "Compassionate"], years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027] },
  { name: "Monkey", element: "Metal", yang: true, traits: ["Clever", "Playful", "Curious"], years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028] },
  { name: "Rooster", element: "Metal", yin: true, traits: ["Confident", "Hardworking", "Observant"], years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029] },
  { name: "Dog", element: "Earth", yang: true, traits: ["Loyal", "Honest", "Protective"], years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030] },
  { name: "Pig", element: "Water", yin: true, traits: ["Generous", "Compassionate", "Diligent"], years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031] }
];

const ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"];

interface ChineseAstrologyData {
  yearAnimal: {
    name: string;
    element: string;
    polarity: "Yin" | "Yang";
    traits: string[];
    interpretation: string;
  };
  monthAnimal: {
    name: string;
    element: string;
  };
  dayMaster: {
    element: string;
    polarity: "Yin" | "Yang";
    stem: string;
  };
  luckyElements: string[];
  compatibility: {
    best: string[];
    challenging: string[];
  };
  lifeStage: string;
  interpretation: {
    summary: string;
    strengths: string[];
    challenges: string[];
    lifePath: string;
  };
}

function getAnimalFromYear(year: number): typeof ANIMALS[0] {
  const baseYear = 1924; // Year of Rat
  const index = (year - baseYear) % 12;
  return ANIMALS[index];
}

function getAnimalFromMonth(month: number): typeof ANIMALS[0] {
  // Chinese zodiac month roughly aligns with solar calendar
  const monthIndex = ((month + 1) % 12);
  return ANIMALS[monthIndex];
}

function getDayElement(day: number): { element: string; polarity: "Yin" | "Yang"; stem: string } {
  const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];
  const elementIndex = (day - 1) % 5;
  const polarity = day % 2 === 0 ? "Yang" : "Yin";
  
  const stems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
  const stemIndex = (day - 1) % 10;
  
  return {
    element: elements[elementIndex],
    polarity,
    stem: stems[stemIndex]
  };
}

function getCompatibility(animal: string): { best: string[]; challenging: string[] } {
  const compatibility: { [key: string]: { best: string[]; challenging: string[] } } = {
    "Rat": { best: ["Dragon", "Monkey", "Ox"], challenging: ["Horse", "Rooster"] },
    "Ox": { best: ["Rat", "Snake", "Rooster"], challenging: ["Goat", "Horse"] },
    "Tiger": { best: ["Horse", "Dog", "Pig"], challenging: ["Monkey", "Snake"] },
    "Rabbit": { best: ["Goat", "Pig", "Dog"], challenging: ["Rooster", "Rat"] },
    "Dragon": { best: ["Rat", "Monkey", "Rooster"], challenging: ["Dog", "Dragon"] },
    "Snake": { best: ["Ox", "Rooster", "Monkey"], challenging: ["Pig", "Tiger"] },
    "Horse": { best: ["Tiger", "Goat", "Dog"], challenging: ["Rat", "Ox"] },
    "Goat": { best: ["Rabbit", "Horse", "Pig"], challenging: ["Ox", "Dog"] },
    "Monkey": { best: ["Rat", "Dragon", "Snake"], challenging: ["Tiger", "Pig"] },
    "Rooster": { best: ["Ox", "Snake", "Dragon"], challenging: ["Rabbit", "Dog"] },
    "Dog": { best: ["Tiger", "Rabbit", "Horse"], challenging: ["Dragon", "Goat"] },
    "Pig": { best: ["Rabbit", "Goat", "Tiger"], challenging: ["Snake", "Monkey"] }
  };
  
  return compatibility[animal] || { best: [], challenging: [] };
}

export function calculateChineseAstrology(birthDate: string): ChineseAstrologyData {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const yearAnimal = getAnimalFromYear(year);
  const monthAnimal = getAnimalFromMonth(month);
  const dayMaster = getDayElement(day);
  
  const compatibility = getCompatibility(yearAnimal.name);
  
  // Calculate lucky elements (element that supports day master)
  const elementCycle: { [key: string]: string } = {
    "Wood": "Fire",
    "Fire": "Earth",
    "Earth": "Metal",
    "Metal": "Water",
    "Water": "Wood"
  };
  
  const luckyElements = [
    dayMaster.element,
    elementCycle[dayMaster.element],
    ELEMENTS[(ELEMENTS.indexOf(dayMaster.element) + 2) % 5]
  ];
  
  const polarity = yearAnimal.yin ? "Yin" : "Yang";
  
  return {
    yearAnimal: {
      name: yearAnimal.name,
      element: yearAnimal.element,
      polarity,
      traits: yearAnimal.traits,
      interpretation: `Born in the Year of the ${yearAnimal.name}, you embody ${yearAnimal.traits.join(', ')} qualities. Your ${yearAnimal.element} nature brings grounding and manifestation power.`
    },
    monthAnimal: {
      name: monthAnimal.name,
      element: monthAnimal.element
    },
    dayMaster: {
      element: dayMaster.element,
      polarity: dayMaster.polarity,
      stem: dayMaster.stem
    },
    luckyElements,
    compatibility,
    lifeStage: year % 12 < 4 ? "Growth" : year % 12 < 8 ? "Maturity" : "Wisdom",
    interpretation: {
      summary: `Your Chinese astrology profile reveals a ${yearAnimal.name} (${polarity}) with ${dayMaster.element} Day Master (${dayMaster.stem}). This combination creates a unique energetic signature.`,
      strengths: yearAnimal.traits,
      challenges: [`Balancing ${yearAnimal.element} and ${dayMaster.element} energies`, `Managing ${polarity} tendencies`],
      lifePath: `As a ${yearAnimal.name}, your path involves ${yearAnimal.traits[0].toLowerCase()} and ${yearAnimal.traits[1].toLowerCase()}. Your ${dayMaster.element} Day Master guides how you express this in the world.`
    }
  };
}
