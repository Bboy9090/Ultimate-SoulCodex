interface BirthData {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface PlacementVerification {
  sign: string | null;
  status: "verified" | "pending_ephemeris" | "requires_verified_birth_time" | "requires_location";
  confidence: number | null;
  source: string | null;
  reason?: string;
}

interface AstrologyData {
  sun: PlacementVerification;
  moon: PlacementVerification;
  rising: PlacementVerification;
  planets?: {
    sun?: { sign?: string; house?: number; degree?: number };
    moon?: { sign?: string; house?: number; degree?: number };
    [key: string]: any;
  };
  houses?: Array<{ sign?: string; degree?: number }>;
  aspects?: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode?: { sign?: string; house?: number; degree?: number };
  southNode?: { sign?: string; house?: number; degree?: number };
  chiron?: { sign?: string; house?: number; degree?: number };
  verification: {
    complete: boolean;
    missingData: string[];
    suggestions: string;
    lastUpdated: string;
  };
}

function getSunPlacement(_birthData: BirthData): PlacementVerification {
  return {
    sign: null,
    status: "pending_ephemeris",
    confidence: null,
    source: null,
    reason: "Awaiting verified ephemeris engine for accurate calculation",
  };
}

function getMoonPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime) {
    return {
      sign: null,
      status: "requires_verified_birth_time",
      confidence: null,
      source: null,
      reason: "Birth time required for Moon sign calculation",
    };
  }

  return {
    sign: null,
    status: "pending_ephemeris",
    confidence: null,
    source: null,
    reason: "Awaiting verified ephemeris engine for accurate calculation",
  };
}

function getRisingPlacement(birthData: BirthData): PlacementVerification {
  if (!birthData.birthTime) {
    return {
      sign: null,
      status: "requires_verified_birth_time",
      confidence: null,
      source: null,
      reason: "Birth time and location required for Rising sign calculation",
    };
  }

  if (birthData.latitude === undefined || birthData.longitude === undefined) {
    return {
      sign: null,
      status: "requires_location",
      confidence: null,
      source: null,
      reason: "Precise birth location required for Rising sign calculation",
    };
  }

  return {
    sign: null,
    status: "pending_ephemeris",
    confidence: null,
    source: null,
    reason: "Awaiting verified ephemeris engine for accurate calculation",
  };
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const sun = getSunPlacement(birthData);
  const moon = getMoonPlacement(birthData);
  const rising = getRisingPlacement(birthData);

  const missingData: string[] = [];
  if (!birthData.birthTime) missingData.push("verified_birth_time");
  if (birthData.latitude === undefined || birthData.longitude === undefined) missingData.push("precise_location");
  if (!sun.sign) missingData.push("ephemeris_engine");

  return {
    sun,
    moon,
    rising,
    planets: undefined,
    houses: undefined,
    aspects: undefined,
    northNode: undefined,
    southNode: undefined,
    chiron: undefined,
    verification: {
      complete: false,
      missingData,
      suggestions: missingData.length > 0
        ? `To calculate your astrology: ${missingData.map((item) => {
            if (item === "verified_birth_time") return "provide exact birth time";
            if (item === "precise_location") return "provide precise birth location";
            if (item === "ephemeris_engine") return "activate ephemeris calculation engine";
            return item;
          }).join(", ")}.`
        : "Your astrology chart is ready for calculation.",
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function getTarotBirthCards(birthDate: string): { card1: string; card2: string; interpretation: string } {
  const date = new Date(birthDate);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  const digitalRoot = sum.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const finalSum = digitalRoot > 9
    ? digitalRoot.toString().split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0)
    : digitalRoot;

  const tarotCards = [
    { card1: "The Fool", card2: "The World", interpretation: "Journey of infinite potential and cosmic completion" },
    { card1: "The Magician", card2: "The High Priestess", interpretation: "Balance of conscious will and intuitive wisdom" },
    { card1: "The Empress", card2: "The Emperor", interpretation: "Creative nurturing paired with structured authority" },
    { card1: "The Hierophant", card2: "The Lovers", interpretation: "Traditional wisdom meets heart-centered choices" },
    { card1: "The Chariot", card2: "Strength", interpretation: "Directed willpower flowing through inner courage" },
    { card1: "The Hermit", card2: "Wheel of Fortune", interpretation: "Inner guidance navigating life's cycles" },
    { card1: "Justice", card2: "The Hanged Man", interpretation: "Divine balance through surrender and perspective" },
    { card1: "Death", card2: "Temperance", interpretation: "Transformation through divine alchemy" },
    { card1: "The Devil", card2: "The Tower", interpretation: "Breaking free from illusion and limitation" },
  ];

  return tarotCards[finalSum % tarotCards.length];
}
