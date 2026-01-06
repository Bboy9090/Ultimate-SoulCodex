interface BirthData {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface AstrologyData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: { sign: string; house: number; degree: number };
    moon: { sign: string; house: number; degree: number };
    mercury: { sign: string; house: number; degree: number };
    venus: { sign: string; house: number; degree: number };
    mars: { sign: string; house: number; degree: number };
    jupiter: { sign: string; house: number; degree: number };
    saturn: { sign: string; house: number; degree: number };
    uranus: { sign: string; house: number; degree: number };
    neptune: { sign: string; house: number; degree: number };
    pluto: { sign: string; house: number; degree: number };
  };
  houses: Array<{ sign: string; degree: number }>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
  northNode: { sign: string; house: number; degree: number };
  southNode: { sign: string; house: number; degree: number };
  chiron: { sign: string; house: number; degree: number };
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function calculateSunSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified sun sign calculation
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

function calculateMoonSign(birthDate: string, birthTime: string): string {
  // Simplified moon sign calculation - in a real app this would use ephemeris data
  const date = new Date(birthDate);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const timeHours = parseInt(birthTime.split(':')[0]);
  
  const index = (dayOfYear + timeHours) % 12;
  return ZODIAC_SIGNS[index];
}

function calculateRisingSign(birthDate: string, birthTime: string, latitude: number): string {
  // Simplified rising sign calculation - in a real app this would use sidereal time and house system
  const date = new Date(birthDate);
  const timeHours = parseInt(birthTime.split(':')[0]);
  const timeMinutes = parseInt(birthTime.split(':')[1]);
  
  const totalMinutes = timeHours * 60 + timeMinutes;
  const latitudeAdjustment = Math.floor(latitude / 10);
  
  const index = (Math.floor(totalMinutes / 120) + latitudeAdjustment) % 12;
  return ZODIAC_SIGNS[index];
}

export function calculateAstrology(birthData: BirthData): AstrologyData {
  const sunSign = calculateSunSign(birthData.birthDate);
  const moonSign = calculateMoonSign(birthData.birthDate, birthData.birthTime);
  const risingSign = calculateRisingSign(birthData.birthDate, birthData.birthTime, parseFloat(birthData.latitude.toString()));

  // Simplified planetary calculations - in production this would use Swiss Ephemeris
  const planets = {
    sun: { sign: sunSign, house: 1, degree: 15.5 },
    moon: { sign: moonSign, house: 4, degree: 23.2 },
    mercury: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 1) % 12], house: 3, degree: 8.7 },
    venus: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 2) % 12], house: 2, degree: 19.3 },
    mars: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 3) % 12], house: 6, degree: 12.8 },
    jupiter: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 4) % 12], house: 9, degree: 26.1 },
    saturn: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 5) % 12], house: 10, degree: 4.9 },
    uranus: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 6) % 12], house: 11, degree: 18.4 },
    neptune: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 7) % 12], house: 12, degree: 21.7 },
    pluto: { sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 8) % 12], house: 8, degree: 14.2 }
  };

  const houses = Array.from({ length: 12 }, (_, i) => ({
    sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(risingSign) + i) % 12],
    degree: (i * 30 + Math.random() * 30) % 360
  }));

  const aspects = [
    { planet1: 'sun', planet2: 'moon', aspect: 'sextile', orb: 2.3 },
    { planet1: 'venus', planet2: 'mars', aspect: 'trine', orb: 1.8 },
    { planet1: 'jupiter', planet2: 'saturn', aspect: 'square', orb: 3.1 }
  ];

  const northNode = { 
    sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(moonSign) + 6) % 12], 
    house: 5, 
    degree: 11.3 
  };
  
  const southNode = { 
    sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(northNode.sign) + 6) % 12], 
    house: 11, 
    degree: 11.3 
  };

  const chiron = { 
    sign: ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 9) % 12], 
    house: 7, 
    degree: 16.8 
  };

  return {
    sunSign,
    moonSign,
    risingSign,
    planets,
    houses,
    aspects,
    northNode,
    southNode,
    chiron
  };
}

export function getTarotBirthCards(birthDate: string): { card1: string; card2: string; interpretation: string } {
  const date = new Date(birthDate);
  const sum = date.getDate() + (date.getMonth() + 1) + date.getFullYear();
  const digitalRoot = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  const finalSum = digitalRoot > 9 ? digitalRoot.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0) : digitalRoot;

  const tarotCards = [
    { card1: "The Fool", card2: "The World", interpretation: "Journey of infinite potential and cosmic completion" },
    { card1: "The Magician", card2: "The High Priestess", interpretation: "Balance of conscious will and intuitive wisdom" },
    { card1: "The Empress", card2: "The Emperor", interpretation: "Creative nurturing paired with structured authority" },
    { card1: "The Hierophant", card2: "The Lovers", interpretation: "Traditional wisdom meets heart-centered choices" },
    { card1: "The Chariot", card2: "Strength", interpretation: "Directed willpower flowing through inner courage" },
    { card1: "The Hermit", card2: "Wheel of Fortune", interpretation: "Inner guidance navigating life's cycles" },
    { card1: "Justice", card2: "The Hanged Man", interpretation: "Divine balance through surrender and perspective" },
    { card1: "Death", card2: "Temperance", interpretation: "Transformation through divine alchemy" },
    { card1: "The Devil", card2: "The Tower", interpretation: "Breaking free from illusion and limitation" }
  ];

  return tarotCards[finalSum % tarotCards.length];
}
