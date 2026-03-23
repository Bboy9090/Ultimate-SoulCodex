// Fixed Stars - Major star conjunctions with natal planets

interface FixedStar {
  name: string;
  longitude: number; // Current position (updates slowly ~1° per 72 years)
  magnitude: number;
  constellation: string;
  nature: string; // Planetary nature
  meaning: string;
  keywords: string[];
}

const MAJOR_FIXED_STARS: FixedStar[] = [
  { name: "Regulus", longitude: 29.9, magnitude: 1.4, constellation: "Leo", nature: "Mars-Jupiter", meaning: "Royal Star of Leadership", keywords: ["Power", "Success", "Honor", "Downfall through revenge"] },
  { name: "Aldebaran", longitude: 9.8, magnitude: 0.9, constellation: "Taurus", nature: "Mars", meaning: "The Bull's Eye - Integrity", keywords: ["Courage", "Integrity", "Success", "Blindness to consequences"] },
  { name: "Antares", longitude: 9.8, magnitude: 1.0, constellation: "Scorpio", nature: "Mars-Jupiter", meaning: "Heart of the Scorpion - Obsession", keywords: ["Passion", "Obsession", "Sudden events", "Recklessness"] },
  { name: "Fomalhaut", longitude: 3.9, constellation: "Pisces Australis", magnitude: 1.2, nature: "Venus-Mercury", meaning: "Royal Star of Idealism", keywords: ["Idealism", "Dreams", "Fame", "Fall from grace"] },
  { name: "Spica", longitude: 23.8, magnitude: 1.0, constellation: "Virgo", nature: "Venus-Mars", meaning: "The Wheat Shaft - Gifts", keywords: ["Gifts", "Protection", "Creativity", "Success"] },
  { name: "Sirius", longitude: 14.1, magnitude: -1.5, constellation: "Canis Major", nature: "Jupiter-Mars", meaning: "The Dog Star - Ambition", keywords: ["Ambition", "Fame", "Honor", "Passion"] },
  { name: "Algol", longitude: 26.3, magnitude: 2.1, constellation: "Perseus", nature: "Saturn-Jupiter", meaning: "The Demon Star", keywords: ["Intensity", "Transformation", "Violence", "Kundalini"] },
  { name: "Pleiades", longitude: 29.6, magnitude: 1.6, constellation: "Taurus", nature: "Moon-Mars", meaning: "The Seven Sisters - Ambition", keywords: ["Ambition", "Mourning", "Accidents", "Mysticism"] },
  { name: "Alcyone", longitude: 0.1, magnitude: 2.9, constellation: "Taurus", nature: "Moon-Jupiter", meaning: "Central Pleiades - Mystical", keywords: ["Mysticism", "Sorrow", "Prominence", "Blindness"] },
  { name: "Vega", longitude: 15.4, magnitude: 0.0, constellation: "Lyra", nature: "Venus-Mercury", meaning: "The Harp Star", keywords: ["Artistic", "Idealistic", "Grave", "Critical"] }
];

interface StarConjunction {
  star: FixedStar;
  planet: string;
  orb: number; // Degrees from exact
  interpretation: string;
}

interface FixedStarsData {
  conjunctions: StarConjunction[];
  interpretation: {
    summary: string;
    majorInfluences: string[];
    warnings: string[];
    gifts: string[];
  };
}

export function calculateFixedStars(
  planets: { [planet: string]: number } // Planet longitudes
): FixedStarsData {
  const conjunctions: StarConjunction[] = [];
  const ORB_LIMIT = 2; // Maximum orb for conjunction (tight orb for fixed stars)
  
  // Check each planet against each fixed star
  Object.entries(planets).forEach(([planetName, planetLong]) => {
    MAJOR_FIXED_STARS.forEach(star => {
      let orb = Math.abs(planetLong - star.longitude);
      if (orb > 180) orb = 360 - orb; // Take shorter arc
      
      if (orb <= ORB_LIMIT) {
        const interpretation = `${planetName} conjunct ${star.name}: ${star.meaning}. This amplifies ${star.keywords[0].toLowerCase()} and ${star.keywords[1].toLowerCase()} in your ${planetName} expression. ${star.nature} nature blends with ${planetName} energy.`;
        
        conjunctions.push({
          star,
          planet: planetName,
          orb,
          interpretation
        });
      }
    });
  });
  
  // Sort by orb (closest first)
  conjunctions.sort((a, b) => a.orb - b.orb);
  
  const majorInfluences: string[] = [];
  const warnings: string[] = [];
  const gifts: string[] = [];
  
  conjunctions.forEach(conj => {
    if (conj.orb < 1) {
      majorInfluences.push(`${conj.star.name} strongly influences your ${conj.planet}`);
    }
    
    // Identify warnings and gifts
    if (["Algol", "Antares"].includes(conj.star.name)) {
      warnings.push(`${conj.star.name}-${conj.planet}: Potential for ${conj.star.keywords[2].toLowerCase()}. Channel intensity wisely.`);
    }
    
    if (["Regulus", "Spica", "Fomalhaut"].includes(conj.star.name)) {
      gifts.push(`${conj.star.name}-${conj.planet}: ${conj.star.keywords[0]} and ${conj.star.keywords[1].toLowerCase()} are your gifts.`);
    }
  });
  
  return {
    conjunctions: conjunctions.slice(0, 5), // Top 5 closest
    interpretation: {
      summary: conjunctions.length > 0
        ? `You have ${conjunctions.length} significant fixed star conjunction${conjunctions.length > 1 ? 's' : ''}. The stars ${conjunctions.map(c => c.star.name).join(', ')} mark your chart with special significance.`
        : "No major fixed star conjunctions within tight orb. Your chart expresses primarily through planetary and zodiacal energies.",
      majorInfluences,
      warnings: warnings.length > 0 ? warnings : ["No challenging fixed star aspects. Navigate your path with awareness of planetary energies."],
      gifts: gifts.length > 0 ? gifts : ["Your gifts come primarily from planetary placements rather than fixed stars."]
    }
  };
}
