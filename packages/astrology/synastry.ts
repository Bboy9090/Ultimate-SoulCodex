import {
  TROPICAL_ZODIAC_SIGNS,
  circularDegreesDelta,
  normalizeDegrees,
} from '@soulcodex/core';

/**
 * Synastry Analysis Engine
 * Calculates symbolic astrological comparison patterns between two birth charts.
 * Scores are interpretive heuristics, not empirical relationship predictions.
 */

interface Planet {
  sign: string;
  degree: number;
  house?: number;
}

interface ChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: Planet;
    moon: Planet;
    mercury: Planet;
    venus: Planet;
    mars: Planet;
    jupiter: Planet;
    saturn: Planet;
    uranus: Planet;
    neptune: Planet;
    pluto: Planet;
  };
  northNode?: Planet;
  southNode?: Planet;
  chiron?: Planet;
  vertex?: { sign: string; degree: number };
  ascendant?: { sign: string; degree: number };
  descendant?: { sign: string; degree: number };
  houses?: number[];
}

interface SynastryAspect {
  person1Planet: string;
  person2Planet: string;
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  tier: 'golden' | 'diamond' | 'fated' | 'standard';
  description: string;
  impact: 'harmony' | 'tension' | 'growth';
  score: number;
}

interface HouseOverlay {
  planet: string;
  house: number;
  significance: string;
  impact: 'profound' | 'moderate' | 'light';
}

interface SynastryResult {
  overallScore: number;
  goldenAspects: SynastryAspect[];
  diamondAspects: SynastryAspect[];
  fatedAspects: SynastryAspect[];
  otherAspects: SynastryAspect[];
  houseOverlays: {
    person1Planets: HouseOverlay[];
    person2Planets: HouseOverlay[];
  };
  chemistry: {
    score: number;
    description: string;
  };
  commitment: {
    score: number;
    description: string;
  };
  growth: {
    score: number;
    description: string;
  };
  summary: {
    strengths: string[];
    challenges: string[];
    soulMateIndicators: string[];
    relationshipType: string;
  };
}

// Convert sign + degree to absolute longitude (0-360°)
function getAbsoluteLongitude(sign: string, degree: number): number {
  const signIndex = TROPICAL_ZODIAC_SIGNS.findIndex(
    (candidate) => candidate === sign,
  );
  if (signIndex === -1) {
    throw new RangeError(`Unsupported zodiac sign: ${sign}`);
  }
  if (!Number.isFinite(degree) || degree < 0 || degree >= 30) {
    throw new RangeError(`Degree within sign must be finite and in [0, 30): ${degree}`);
  }
  return normalizeDegrees(signIndex * 30 + degree);
}

// Calculate the angular difference between two planets
function calculateAspectAngle(long1: number, long2: number): number {
  return circularDegreesDelta(long1, long2);
}

// Identify the type of aspect and orb
function identifyAspect(angle: number): { aspect: SynastryAspect['aspect']; maxOrb: number } | null {
  const aspects = [
    { name: 'conjunction' as const, angle: 0, maxOrb: 10 },
    { name: 'sextile' as const, angle: 60, maxOrb: 6 },
    { name: 'square' as const, angle: 90, maxOrb: 8 },
    { name: 'trine' as const, angle: 120, maxOrb: 8 },
    { name: 'opposition' as const, angle: 180, maxOrb: 10 }
  ];

  for (const asp of aspects) {
    const orbDiff = Math.abs(angle - asp.angle);
    if (orbDiff <= asp.maxOrb) {
      return { aspect: asp.name, maxOrb: asp.maxOrb };
    }
  }
  return null;
}

// Calculate orb-weighted score (tight orbs 0-4° score higher)
function calculateOrbScore(baseScore: number, orb: number, maxOrb: number): number {
  if (orb <= 4) {
    // Tight orb: 95-100% of base score
    return Math.round(baseScore * (1 - orb * 0.0125));
  } else {
    // Loose orb: 70-95% of base score
    const orbDiff = maxOrb - 4;
    const orbRatio = orbDiff > 0 ? (orb - 4) / orbDiff : 0;
    return Math.round(baseScore * (0.95 - orbRatio * 0.25));
  }
}

// Check if an aspect qualifies as a soul mate indicator
function classifyAspectTier(
  planet1: string,
  planet2: string,
  aspect: SynastryAspect['aspect'],
  orb: number
): { tier: SynastryAspect['tier']; description: string; impact: SynastryAspect['impact']; score: number } {
  
  const maxOrbs: Record<SynastryAspect['aspect'], number> = {
    conjunction: 10,
    sextile: 6,
    square: 8,
    trine: 8,
    opposition: 10
  };
  
  // GOLDEN TIER: high-emphasis harmonious symbolism
  if ((planet1 === 'sun' && planet2 === 'moon') || (planet1 === 'moon' && planet2 === 'sun')) {
    if (aspect === 'conjunction') {
      return {
        tier: 'golden',
        description: '☀️🌙 Sun-Moon Conjunction: Traditionally read as strong identity-emotion alignment. This can feel familiar and mutually understandable.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(100, orb, maxOrbs.conjunction)
      };
    }
    if (aspect === 'trine' || aspect === 'sextile') {
      return {
        tier: 'golden',
        description: '☀️🌙 Sun-Moon Harmony: Traditionally read as supportive flow between identity and emotional needs. Understanding may come more easily here.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(90, orb, maxOrbs[aspect])
      };
    }
  }

  if (planet1 === 'moon' && planet2 === 'moon' && aspect === 'conjunction') {
    return {
      tier: 'golden',
      description: '🌙🌙 Moon-Moon Conjunction: Emotional rhythms may feel familiar, which can support empathy and mutual understanding.' + (orb <= 4 ? ' [EXACT]' : ''),
      impact: 'harmony',
      score: calculateOrbScore(95, orb, maxOrbs.conjunction)
    };
  }

  if ((planet1 === 'venus' && planet2 === 'ascendant') || (planet1 === 'ascendant' && planet2 === 'venus')) {
    if (aspect === 'conjunction') {
      return {
        tier: 'golden',
        description: '♀️↑ Venus-Ascendant Conjunction: Traditionally associated with attraction and aesthetic appreciation. The contact can feel immediately noticeable.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(85, orb, maxOrbs.conjunction)
      };
    }
  }

  // Jupiter aspects - expansion and joy
  if (planet1 === 'jupiter' || planet2 === 'jupiter') {
    const otherPlanet = planet1 === 'jupiter' ? planet2 : planet1;
    if (['sun', 'moon', 'venus'].includes(otherPlanet) && (aspect === 'trine' || aspect === 'conjunction')) {
      return {
        tier: 'golden',
        description: `♃ Jupiter ${aspect} ${otherPlanet}: Traditionally associated with encouragement, expansion, and optimism in the relationship.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(80, orb, maxOrbs[aspect])
      };
    }
  }

  // Neptune aspects - spiritual connection
  if (planet1 === 'neptune' || planet2 === 'neptune') {
    const otherPlanet = planet1 === 'neptune' ? planet2 : planet1;
    if (['sun', 'moon', 'venus'].includes(otherPlanet) && aspect === 'trine') {
      return {
        tier: 'golden',
        description: `♆ Neptune trine ${otherPlanet}: Can add idealism, imagination, and spiritual or romantic symbolism. Keep room for clear perception as well.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(75, orb, maxOrbs.trine)
      };
    }
  }

  // DIAMOND TIER: Saturn-based structure and commitment symbolism
  if (planet1 === 'saturn' || planet2 === 'saturn') {
    const otherPlanet = planet1 === 'saturn' ? planet2 : planet1;
    
    if (['sun', 'moon'].includes(otherPlanet) && (aspect === 'trine' || aspect === 'sextile')) {
      return {
        tier: 'diamond',
        description: `♄ Saturn ${aspect} ${otherPlanet}: Traditionally associated with structure, responsibility, and commitment-building; it does not guarantee longevity.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(95, orb, maxOrbs[aspect])
      };
    }
    
    if (otherPlanet === 'venus' && aspect === 'conjunction') {
      return {
        tier: 'diamond',
        description: '♄ Saturn conjunct Venus: Can emphasize seriousness, responsibility, and questions of commitment, while sometimes feeling heavy.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(85, orb, maxOrbs.conjunction)
      };
    }
    
    if (otherPlanet === 'venus' && (aspect === 'trine' || aspect === 'sextile')) {
      return {
        tier: 'diamond',
        description: `♄ Saturn ${aspect} Venus: Traditionally linked with steadiness and commitment-building. It may support practical investment in the relationship.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(82, orb, maxOrbs[aspect])
      };
    }
    
    if (['sun', 'moon', 'venus'].includes(otherPlanet) && aspect === 'square') {
      return {
        tier: 'diamond',
        description: `♄ Saturn square ${otherPlanet}: Creates friction but also lasting bonds. Requires effort but builds resilience.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'growth',
        score: calculateOrbScore(60, orb, maxOrbs.square)
      };
    }
    
    if (['sun', 'moon'].includes(otherPlanet) && aspect === 'conjunction') {
      return {
        tier: 'diamond',
        description: `♄ Saturn conjunct ${otherPlanet}: Can bring seriousness, responsibility, and a stronger focus on what the relationship requires.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(90, orb, maxOrbs.conjunction)
      };
    }
  }

  // Legacy 'fated' tier key: nodal/Vertex salience symbolism (schema retained for compatibility)
  if (planet1 === 'northNode' || planet2 === 'northNode' || planet1 === 'southNode' || planet2 === 'southNode') {
    const otherPlanet = planet1.includes('Node') ? planet2 : planet1;
    const node = planet1.includes('Node') ? planet1 : planet2;
    
    if (['sun', 'moon', 'venus', 'mars'].includes(otherPlanet) && aspect === 'conjunction') {
      return {
        tier: 'fated',
        description: `☊ ${node} conjunct ${otherPlanet}: Nodal conjunctions are traditionally read as developmentally salient contacts. They may feel meaningful while remaining symbolic rather than predictive.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(90, orb, maxOrbs.conjunction)
      };
    }
    
    // Any significant Node contact
    if (['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'].includes(otherPlanet) && (aspect === 'trine' || aspect === 'sextile')) {
      return {
        tier: 'fated',
        description: `☊ ${node} ${aspect} ${otherPlanet}: Traditionally read as a supportive developmental contact. Its significance is symbolic and does not establish why two people met.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(75, orb, maxOrbs[aspect])
      };
    }
  }
  
  // Vertex contacts - traditionally treated as salient/catalytic encounters
  if (planet1 === 'vertex' || planet2 === 'vertex') {
    const otherPlanet = planet1 === 'vertex' ? planet2 : planet1;
    if (['sun', 'moon', 'venus', 'mars', 'ascendant'].includes(otherPlanet) && aspect === 'conjunction') {
      return {
        tier: 'fated',
        description: `⚡ Vertex conjunct ${otherPlanet}: Traditionally treated as an unusually salient or catalytic contact. It can feel significant without establishing inevitability.` + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(88, orb, maxOrbs.conjunction)
      };
    }
  }

  // Venus-Mars: The Chemistry Aspects
  if ((planet1 === 'venus' && planet2 === 'mars') || (planet1 === 'mars' && planet2 === 'venus')) {
    if (aspect === 'conjunction') {
      return {
        tier: 'golden',
        description: '♀️♂️ Venus-Mars Conjunction: A strong traditional attraction and chemistry indicator. Intensity still depends on the people and wider relationship context.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(100, orb, maxOrbs.conjunction)
      };
    }
    if (aspect === 'trine' || aspect === 'sextile') {
      return {
        tier: 'golden',
        description: '♀️♂️ Venus-Mars Harmony: Traditionally associated with easier attraction and expressive chemistry. How balanced it feels depends on the wider relationship.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(85, orb, maxOrbs[aspect])
      };
    }
    if (aspect === 'square' || aspect === 'opposition') {
      return {
        tier: 'standard',
        description: '♀️♂️ Venus-Mars Tension: Traditionally associated with charged attraction and friction. It can feel energizing or challenging depending on context.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'tension',
        score: calculateOrbScore(70, orb, maxOrbs[aspect])
      };
    }
  }

  // Moon-Moon aspects
  if (planet1 === 'moon' && planet2 === 'moon') {
    if (aspect === 'trine' || aspect === 'sextile') {
      return {
        tier: 'golden',
        description: '🌙🌙 Moon Harmony: Emotional needs may be easier to coordinate, which can support empathy and understanding.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(88, orb, maxOrbs[aspect])
      };
    }
  }

  // Sun-Sun aspects
  if (planet1 === 'sun' && planet2 === 'sun') {
    if (aspect === 'trine') {
      return {
        tier: 'golden',
        description: '☀️☀️ Sun Trine: Core styles may support one another more naturally, making mutual encouragement easier.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(85, orb, maxOrbs.trine)
      };
    }
    if (aspect === 'conjunction') {
      return {
        tier: 'standard',
        description: '☀️☀️ Sun Conjunction: Similar core styles can increase familiarity while also amplifying points of sameness.' + (orb <= 4 ? ' [EXACT]' : ''),
        impact: 'harmony',
        score: calculateOrbScore(75, orb, maxOrbs.conjunction)
      };
    }
  }

  // Standard aspects with orb-based scoring
  const impactMap: Record<SynastryAspect['aspect'], SynastryAspect['impact']> = {
    conjunction: 'harmony',
    trine: 'harmony',
    sextile: 'harmony',
    square: 'tension',
    opposition: 'tension'
  };

  const baseScoreMap: Record<SynastryAspect['aspect'], number> = {
    conjunction: 70,
    trine: 75,
    sextile: 65,
    square: 45,
    opposition: 50
  };

  return {
    tier: 'standard',
    description: `${planet1}-${planet2} ${aspect}: Creates ${impactMap[aspect]} between these energies.` + (orb <= 4 ? ' [EXACT]' : ''),
    impact: impactMap[aspect],
    score: calculateOrbScore(baseScoreMap[aspect], orb, maxOrbs[aspect])
  };
}

// Calculate house overlays - where person1's planets fall in person2's houses
function calculateHouseOverlays(
  person1Planets: ChartData['planets'],
  person2HouseCusps: number[], // Array of 12 house cusp longitudes for person2
  person2Name: string
): HouseOverlay[] {
  if (!person2HouseCusps || person2HouseCusps.length < 12) return [];

  const overlays: HouseOverlay[] = [];
  const planetEntries = Object.entries(person1Planets);

  for (const [planetName, planetData] of planetEntries) {
    if (!planetData) continue;
    
    // Calculate person1's planet longitude
    const planetLongitude = getAbsoluteLongitude(planetData.sign, planetData.degree);
    
    // Determine which of person2's houses this planet falls into
    const houseNumber = findHouseForLongitude(planetLongitude, person2HouseCusps);
    
    if (houseNumber >= 1 && houseNumber <= 12) {
      const overlay = analyzeHouseOverlay(planetName, houseNumber, person2Name);
      if (overlay) overlays.push(overlay);
    }
  }

  return overlays;
}

// Find which house a given longitude falls into
function findHouseForLongitude(longitude: number, houseCusps: number[]): number {
  if (!Number.isFinite(longitude)) {
    throw new RangeError('House overlay longitude must be finite');
  }
  if (
    houseCusps.length !== 12 ||
    houseCusps.some((cusp) => !Number.isFinite(cusp))
  ) {
    throw new RangeError('House cusps must contain exactly 12 finite longitudes');
  }

  const normalizedLongitude = normalizeDegrees(longitude);
  const normalizedCusps = houseCusps.map((cusp) => normalizeDegrees(cusp));

  for (let i = 0; i < 12; i++) {
    const currentCusp = normalizedCusps[i];
    const nextCusp = normalizedCusps[(i + 1) % 12];

    if (nextCusp > currentCusp) {
      if (normalizedLongitude >= currentCusp && normalizedLongitude < nextCusp) {
        return i + 1;
      }
    } else if (
      normalizedLongitude >= currentCusp ||
      normalizedLongitude < nextCusp
    ) {
      return i + 1;
    }
  }

  throw new Error('house_overlay_position_unresolved');
}

function analyzeHouseOverlay(planet: string, house: number, personName: string): HouseOverlay | null {
  // Critical houses for relationships
  const significantHouses: Record<number, { significance: string; impact: HouseOverlay['impact'] }> = {
    1: {
      significance: `${planet} in ${personName}'s 1st House: They energize your sense of self. You feel more "you" with them.`,
      impact: 'profound'
    },
    4: {
      significance: `${planet} in ${personName}'s 4th House: Can evoke home, family, and belonging themes, including questions about what building a life together would mean.`,
      impact: 'profound'
    },
    5: {
      significance: `${planet} in ${personName}'s 5th House: Brings romance, fun, and creative energy. Playful and joyful.`,
      impact: 'moderate'
    },
    7: {
      significance: `${planet} in ${personName}'s 7th House: Activates partnership themes and expectations, including how each person approaches commitment.`,
      impact: 'profound'
    },
    8: {
      significance: `${planet} in ${personName}'s 8th House: Can emphasize intimacy, vulnerability, shared resources, and transformative relationship themes.`,
      impact: 'profound'
    }
  };

  if (significantHouses[house]) {
    return {
      planet,
      house,
      ...significantHouses[house]
    };
  }

  return null;
}

/**
 * Main synastry calculation function
 */
export function calculateDetailedSynastry(
  chart1: ChartData,
  chart2: ChartData
): SynastryResult {
  const allAspects: SynastryAspect[] = [];

  // Get all planets + nodes + ascendant + vertex
  const person1Points: Record<string, Planet | { sign: string; degree: number }> = {
    ...chart1.planets,
    ...(chart1.northNode && { northNode: chart1.northNode }),
    ...(chart1.southNode && { southNode: chart1.southNode }),
    ...(chart1.vertex && { vertex: chart1.vertex }),
    ...(chart1.ascendant && { ascendant: chart1.ascendant })
  };

  const person2Points: Record<string, Planet | { sign: string; degree: number }> = {
    ...chart2.planets,
    ...(chart2.northNode && { northNode: chart2.northNode }),
    ...(chart2.southNode && { southNode: chart2.southNode }),
    ...(chart2.vertex && { vertex: chart2.vertex }),
    ...(chart2.ascendant && { ascendant: chart2.ascendant })
  };

  // Calculate all cross-chart aspects
  for (const [p1Name, p1Data] of Object.entries(person1Points)) {
    if (!p1Data) continue;
    const long1 = getAbsoluteLongitude(p1Data.sign, p1Data.degree);

    for (const [p2Name, p2Data] of Object.entries(person2Points)) {
      if (!p2Data) continue;
      const long2 = getAbsoluteLongitude(p2Data.sign, p2Data.degree);

      const angle = calculateAspectAngle(long1, long2);
      const aspectInfo = identifyAspect(angle);

      if (aspectInfo) {
        const orb = Math.abs(angle - (aspectInfo.aspect === 'conjunction' ? 0 : 
                                      aspectInfo.aspect === 'sextile' ? 60 :
                                      aspectInfo.aspect === 'square' ? 90 :
                                      aspectInfo.aspect === 'trine' ? 120 : 180));

        const classification = classifyAspectTier(p1Name, p2Name, aspectInfo.aspect, orb);

        allAspects.push({
          person1Planet: p1Name,
          person2Planet: p2Name,
          aspect: aspectInfo.aspect,
          orb: parseFloat(orb.toFixed(2)),
          ...classification
        });
      }
    }
  }

  // Categorize aspects by tier
  const goldenAspects = allAspects.filter(a => a.tier === 'golden').sort((a, b) => b.score - a.score);
  const diamondAspects = allAspects.filter(a => a.tier === 'diamond').sort((a, b) => b.score - a.score);
  const fatedAspects = allAspects.filter(a => a.tier === 'fated').sort((a, b) => b.score - a.score);
  const otherAspects = allAspects.filter(a => a.tier === 'standard').sort((a, b) => b.score - a.score);

  // Calculate house overlays
  const person1Overlays = calculateHouseOverlays(chart1.planets, chart2.houses || [], 'Person 2');
  const person2Overlays = calculateHouseOverlays(chart2.planets, chart1.houses || [], 'Person 1');

  // Calculate component scores
  const chemistryScore = Math.round(
    goldenAspects.reduce((sum, asp) => sum + asp.score, 0) / Math.max(goldenAspects.length, 1)
  );

  const commitmentScore = Math.round(
    diamondAspects.reduce((sum, asp) => sum + asp.score, 0) / Math.max(diamondAspects.length, 1) || 50
  );

  const growthScore = Math.round(
    (allAspects.filter(a => a.impact === 'tension').reduce((sum, asp) => sum + asp.score, 0) / 
     Math.max(allAspects.filter(a => a.impact === 'tension').length, 1)) || 60
  );

  // Overall score weighted by importance
  const overallScore = Math.round(
    chemistryScore * 0.35 +
    commitmentScore * 0.40 +
    growthScore * 0.25
  );

  // Generate summary
  const soulMateIndicators: string[] = [];
  if (goldenAspects.length >= 3) soulMateIndicators.push('Multiple high-emphasis harmonious synastry aspects');
  if (diamondAspects.length >= 2) soulMateIndicators.push('Saturn aspects present - stronger structure and responsibility themes');
  if (fatedAspects.length >= 1) soulMateIndicators.push('Nodal or Vertex contacts present - developmental or catalytic symbolism');
  if (person1Overlays.filter(o => o.impact === 'profound').length >= 2) {
    soulMateIndicators.push('Significant house overlays - stronger life-area overlap themes');
  }

  const strengths: string[] = [];
  if (goldenAspects.length > 0) strengths.push(`${goldenAspects.length} harmonious high-emphasis aspects`);
  if (diamondAspects.length > 0) strengths.push(`${diamondAspects.length} commitment-building Saturn aspects`);
  if (chemistryScore >= 80) strengths.push('High symbolic attraction/chemistry emphasis');

  const challenges: string[] = [];
  const tensionAspects = allAspects.filter(a => a.impact === 'tension');
  if (tensionAspects.length > 5) challenges.push('Multiple challenging aspects requiring conscious work');
  if (commitmentScore < 60) challenges.push('Fewer traditional structure/commitment indicators');
  if (goldenAspects.length === 0) challenges.push('Fewer easy-flow indicators; communication and effort may matter more');

  const relationshipType = 
    overallScore >= 85 ? 'High-Emphasis Symbolic Compatibility' :
    overallScore >= 75 ? 'Strong Symbolic Partnership Themes' :
    overallScore >= 65 ? 'Moderate-High Symbolic Compatibility' :
    overallScore >= 50 ? 'Mixed Symbolic Compatibility' :
    'Higher-Friction Symbolic Pattern';

  return {
    overallScore,
    goldenAspects,
    diamondAspects,
    fatedAspects,
    otherAspects,
    houseOverlays: {
      person1Planets: person1Overlays,
      person2Planets: person2Overlays
    },
    chemistry: {
      score: chemistryScore,
      description: chemistryScore >= 80 ? 'Exceptional' : chemistryScore >= 65 ? 'Strong' : chemistryScore >= 50 ? 'Moderate' : 'Requires cultivation'
    },
    commitment: {
      score: commitmentScore,
      description: commitmentScore >= 80 ? 'Strong traditional commitment symbolism' : commitmentScore >= 65 ? 'Moderate-strong structure symbolism' : commitmentScore >= 50 ? 'Moderate structure symbolism' : 'Fewer traditional stability indicators'
    },
    growth: {
      score: growthScore,
      description: growthScore >= 70 ? 'Healthy tension for growth' : growthScore >= 50 ? 'Balanced growth dynamics' : 'Significant challenges requiring work'
    },
    summary: {
      strengths,
      challenges,
      soulMateIndicators,
      relationshipType
    }
  };
}
