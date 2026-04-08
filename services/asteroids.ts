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
      // User-friendly explanations (assumes users know nothing about asteroids)
      wounds: `WHAT THIS IS: Chiron (called "The Wounded Healer") represents your deepest wound that becomes your greatest gift. YOUR PLACEMENT: Chiron in ${chiron.sign} reveals: ${chiron.interpretation} WHAT THIS MEANS FOR YOU: Your deepest wound becomes your greatest gift for healing others. This means the area where you've experienced pain or struggle is exactly where you can help and heal others who face similar challenges. HOW THIS SHOWS UP: You might find yourself drawn to helping others with similar wounds, or you may notice that your own healing journey gives you wisdom to share. WHY THIS MATTERS: Chiron shows where your greatest wound lives, but also where your greatest healing power resides - this is why it's called "The Wounded Healer."`,
      
      nurturing: `WHAT THIS IS: Ceres (called "The Great Mother") represents how you nurture and want to be nurtured. YOUR PLACEMENT: Ceres in ${ceres.sign} shows how you nurture through ${ceres.sign} qualities. WHAT THIS MEANS FOR YOU: You need ${ceres.keywords[0]?.toLowerCase() || 'nurturing'} in caregiving relationships. This means you express care and receive care through ${ceres.sign} energy. HOW THIS SHOWS UP: You might notice that you feel most nurtured when ${ceres.sign} qualities are present, and you naturally offer care in ways that align with ${ceres.sign}. WHY THIS MATTERS: Ceres shows your relationship with nurturing - both giving and receiving - which is fundamental to emotional well-being.`,
      
      wisdom: `WHAT THIS IS: Pallas (called "Warrior Wisdom") represents your unique intelligence and creative problem-solving abilities. YOUR PLACEMENT: Pallas in ${pallas.sign} illuminates your ${pallas.keywords[1]?.toLowerCase() || 'creative'} and ${pallas.keywords[2]?.toLowerCase() || 'healing'} abilities. WHAT THIS MEANS FOR YOU: You solve problems through ${pallas.sign} energy. This means your intelligence and creativity express themselves in ${pallas.sign} ways. HOW THIS SHOWS UP: You might notice that you think and solve problems differently than others, using ${pallas.sign} approaches that feel natural to you. WHY THIS MATTERS: Pallas shows your unique way of thinking and creating - it's your intellectual and creative signature.`,
      
      partnership: `WHAT THIS IS: Juno represents what you need in committed relationships and partnerships. YOUR PLACEMENT: Juno in ${juno.sign} indicates what you need in partnership: ${juno.keywords[2]?.toLowerCase() || 'partnership'} and ${juno.keywords[0]?.toLowerCase() || 'commitment'} expressed through ${juno.sign} qualities. WHAT THIS MEANS FOR YOU: Your ideal partnership includes ${juno.sign} energy, where you can experience ${juno.keywords.join(' and ')}. HOW THIS SHOWS UP: You might find yourself drawn to partners who embody ${juno.sign} qualities, or you may notice that relationships work best when ${juno.sign} themes are present. WHY THIS MATTERS: Juno shows your relationship needs and what makes you feel truly partnered and committed.`,
      
      devotion: `WHAT THIS IS: Vesta represents where you maintain sacred focus and devotion in your life. YOUR PLACEMENT: Vesta in ${vesta.sign} shows where you maintain sacred ${vesta.keywords[0]?.toLowerCase() || 'focus'}: through ${vesta.sign} dedication. WHAT THIS MEANS FOR YOU: This is your holy flame - the area of life where you can maintain deep, sacred focus and devotion. HOW THIS SHOWS UP: You might find yourself drawn to ${vesta.sign} activities or experiences that feel deeply meaningful and sacred to you. WHY THIS MATTERS: Vesta shows where your deepest devotion lives - this is your sacred flame that keeps you connected to what matters most.`,
      
      shadow: `WHAT THIS IS: Lilith (Black Moon Lilith) represents your dark feminine power and what society has tried to shame in you. YOUR PLACEMENT: Lilith in ${lilith.sign} reveals your ${lilith.keywords[0]?.toLowerCase() || 'power'} and ${lilith.keywords[1]?.toLowerCase() || 'potential'}. WHAT THIS MEANS FOR YOU: What society tried to shame, you must reclaim through ${lilith.sign} expression. This means parts of yourself that were suppressed or shamed need to be reclaimed and expressed. HOW THIS SHOWS UP: You might notice areas where you've been told to be smaller, quieter, or different, but your authentic power wants to express through ${lilith.sign} energy. WHY THIS MATTERS: Lilith shows your shadow power - the parts of yourself that need to be reclaimed for your full expression.`,
      
      synthesis: `THE ASTEROIDS REVEAL YOUR SOUL'S DEEPER DIMENSIONS: These smaller celestial bodies add depth and nuance to your chart. Together, they show: healing through Chiron (your wounded healer gift), nurturing through Ceres (how you give and receive care), wisdom through Pallas (your unique intelligence), partnership through Juno (what you need in relationships), devotion through Vesta (your sacred focus), and shadow power through Lilith (what needs to be reclaimed). While the main planets show your core identity, the asteroids reveal the deeper, more nuanced layers of your soul's journey.`
    }
  };
}
