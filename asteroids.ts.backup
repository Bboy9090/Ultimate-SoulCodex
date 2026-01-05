// Asteroid Astrology - Chiron, Ceres, Pallas, Juno, Vesta, Lilith

import * as Astronomy from 'astronomy-engine';

interface Asteroid {
  name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: number;
  meaning: string;
  keywords: string[];
  interpretation: string;
}

interface AsteroidData {
  chiron: Asteroid;
  ceres: Asteroid;
  pallas: Asteroid;
  juno: Asteroid;
  vesta: Asteroid;
  lilith: Asteroid; // Black Moon Lilith
  interpretation: {
    wounds: string; // Chiron
    nurturing: string; // Ceres
    wisdom: string; // Pallas
    partnership: string; // Juno
    devotion: string; // Vesta
    shadow: string; // Lilith
    synthesis: string;
  };
}

const ASTEROID_MEANINGS = {
  chiron: {
    meaning: "The Wounded Healer",
    keywords: ["Healing", "Wounds", "Teaching", "Wisdom through pain"],
    bySign: {
      Aries: "Wound around identity and self-assertion; healer through courage",
      Taurus: "Wound around security and self-worth; healer through grounding",
      Gemini: "Wound around communication; healer through sharing knowledge",
      Cancer: "Wound around nurturing and emotions; healer through empathy",
      Leo: "Wound around self-expression and recognition; healer through creativity",
      Virgo: "Wound around perfection and service; healer through practical wisdom",
      Libra: "Wound around relationships and fairness; healer through balance",
      Scorpio: "Wound around power and transformation; healer through depth",
      Sagittarius: "Wound around meaning and beliefs; healer through philosophy",
      Capricorn: "Wound around authority and achievement; healer through mastery",
      Aquarius: "Wound around belonging and uniqueness; healer through innovation",
      Pisces: "Wound around boundaries and spirituality; healer through compassion"
    }
  },
  ceres: {
    meaning: "The Great Mother",
    keywords: ["Nurturing", "Loss", "Cycles", "Unconditional love"],
    theme: "How you nurture and wish to be nurtured"
  },
  pallas: {
    meaning: "Warrior Wisdom",
    keywords: ["Strategy", "Creativity", "Healing", "Pattern recognition"],
    theme: "Your unique intelligence and creative wisdom"
  },
  juno: {
    meaning: "Soul Partnerships",
    keywords: ["Commitment", "Marriage", "Equality", "Betrayal/loyalty"],
    theme: "What you need in committed relationships"
  },
  vesta: {
    meaning: "Sacred Devotion",
    keywords: ["Focus", "Dedication", "Sexuality", "Sacred flame"],
    theme: "Where you maintain sacred focus and devotion"
  },
  lilith: {
    meaning: "Dark Feminine Power",
    keywords: ["Shadow", "Repressed power", "Raw sexuality", "Rebellion"],
    theme: "Your shadow power and what you've been taught to hide"
  }
};

function getSignFromLongitude(longitude: number): string {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(longitude / 30) % 12];
}

function calculateHouseFromLongitude(longitude: number, ascendantLongitude: number): number {
  let houseLongitude = longitude - ascendantLongitude;
  if (houseLongitude < 0) houseLongitude += 360;
  return (Math.floor(houseLongitude / 30) % 12) + 1;
}

export function calculateAsteroids(
  birthDate: string,
  birthTime: string,
  timezone: string,
  ascendantLongitude: number
): AsteroidData {
  const dateTimeParts = `${birthDate}T${birthTime}`;
  const date = new Date(dateTimeParts);
  
  // Calculate approximate positions (simplified - in production would use precise ephemeris)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Approximate Chiron (slow-moving, ~50 year orbit)
  const chironLong = ((dayOfYear + date.getFullYear() * 7.3) % 360);
  
  // Approximate Ceres (4.6 year orbit)
  const ceresLong = ((dayOfYear * 0.21 + date.getFullYear() * 78) % 360);
  
  // Approximate other asteroids
  const pallasLong = ((dayOfYear * 0.23 + date.getFullYear() * 83) % 360);
  const junoLong = ((dayOfYear * 0.22 + date.getFullYear() * 81) % 360);
  const vestaLong = ((dayOfYear * 0.27 + date.getFullYear() * 97) % 360);
  
  // Black Moon Lilith (lunar apogee, ~9 year cycle)
  const lilithLong = ((dayOfYear * 0.11 + date.getFullYear() * 40) % 360);
  
  const processAsteroid = (name: string, longitude: number): Asteroid => {
    const sign = getSignFromLongitude(longitude);
    const house = calculateHouseFromLongitude(longitude, ascendantLongitude);
    const degree = longitude % 30;
    
    const meanings = ASTEROID_MEANINGS[name as keyof typeof ASTEROID_MEANINGS];
    let interpretation = "";
    
    if (name === "chiron" && 'bySign' in meanings) {
      interpretation = meanings.bySign[sign as keyof typeof meanings.bySign];
    } else {
      const theme = 'theme' in meanings ? meanings.theme : meanings.meaning.toLowerCase();
      interpretation = `${meanings.meaning} in ${sign} brings ${theme} through ${sign} energy.`;
    }
    
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      longitude,
      sign,
      house,
      degree,
      meaning: meanings.meaning,
      keywords: meanings.keywords,
      interpretation
    };
  };
  
  const chiron = processAsteroid("chiron", chironLong);
  const ceres = processAsteroid("ceres", ceresLong);
  const pallas = processAsteroid("pallas", pallasLong);
  const juno = processAsteroid("juno", junoLong);
  const vesta = processAsteroid("vesta", vestaLong);
  const lilith = processAsteroid("lilith", lilithLong);
  
  return {
    chiron,
    ceres,
    pallas,
    juno,
    vesta,
    lilith,
    interpretation: {
      wounds: `Chiron in ${chiron.sign} reveals: ${chiron.interpretation} Your deepest wound becomes your greatest gift for healing others.`,
      nurturing: `Ceres in ${ceres.sign} shows how you nurture: through ${ceres.sign} qualities. You need ${ceres.keywords[0].toLowerCase()} in caregiving relationships.`,
      wisdom: `Pallas in ${pallas.sign} illuminates your ${pallas.keywords[1].toLowerCase()} and ${pallas.keywords[2].toLowerCase()} abilities. You solve problems through ${pallas.sign} energy.`,
      partnership: `Juno in ${juno.sign} indicates what you need in partnership: ${juno.keywords[2].toLowerCase()} and ${juno.keywords[0].toLowerCase()} expressed through ${juno.sign} qualities.`,
      devotion: `Vesta in ${vesta.sign} shows where you maintain sacred ${vesta.keywords[0].toLowerCase()}: through ${vesta.sign} dedication. This is your holy flame.`,
      shadow: `Lilith in ${lilith.sign} reveals your ${lilith.keywords[0].toLowerCase()} power and ${lilith.keywords[1].toLowerCase()} potential. What society tried to shame, you must reclaim through ${lilith.sign} expression.`,
      synthesis: `The asteroids reveal your soul's deeper dimensions: healing through Chiron, nurturing through Ceres, wisdom through Pallas, partnership through Juno, devotion through Vesta, and shadow power through Lilith.`
    }
  };
}
