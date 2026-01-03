import { birthDay, lifePath, personalYear, hasNineHarmony, expressionNumber } from "./numerology";
import { scorePsych } from "./psych";
import { computePillarErrors, rebalanceWeights, getConfidenceLevel, generateNudges } from "./confidence";
import type { PersonInput, CompatResult, Scores, InputsAvailable, DetailedAspects, RelationshipCategory, Pillar, SynastryData } from "./types";

const DEFAULT_WEIGHTS = { 
  attraction: 0.25, 
  emotional: 0.25, 
  lifestyle: 0.20, 
  longTerm: 0.20, 
  timing: 0.10 
};

const scoreAttraction = (
  lp1: number | null, 
  bd1: number | null,
  lp2: number | null,
  bd2: number | null
): number => {
  let base = 50;
  
  // Check 9-theme harmony (Life Path + Birth Day combinations that add to 9)
  if (hasNineHarmony(lp1, bd2)) base += 15;
  if (hasNineHarmony(lp2, bd1)) base += 15;
  
  // Same numbers bonus
  if (lp1 === lp2 && lp1 !== null) base += 15;
  if (bd1 === bd2 && bd1 !== null) base += 10;
  
  // Complementary life paths (add to 9 or 10)
  if (lp1 && lp2) {
    const sum = lp1 + lp2;
    if (sum === 9 || sum === 10) base += 20;
  }
  
  // ENHANCED: Special Life Path 9 humanitarian compatibility bonuses
  if (lp1 === 9 || lp2 === 9) {
    const other = lp1 === 9 ? lp2 : lp1;
    if (other === 3) base += 15;  // Creative expression + humanitarian vision
    if (other === 6) base += 18;  // Both deeply service-oriented and nurturing
    if (other === 11) base += 16; // Spiritual service + humanitarian wisdom
    if (other === 33) base += 17; // Universal healing + humanitarian compassion
    if (other === 2) base += 12;  // Diplomacy + humanitarian ideals
    if (other === 7) base += 10;  // Wisdom seeking + humanitarian philosophy
  }
  
  // Compatible modality (both odd or both even life paths)
  if (lp1 && lp2 && lp1 % 2 === lp2 % 2) base += 10;
  
  // Master number attraction
  const isMaster1 = lp1 && [11, 22, 33].includes(lp1);
  const isMaster2 = lp2 && [11, 22, 33].includes(lp2);
  if (isMaster1 && isMaster2) base += 15; // Both masters
  else if (isMaster1 || isMaster2) base += 5; // One master
  
  // Birth day harmony
  if (bd1 && bd2) {
    const bdSum = bd1 + bd2;
    if (bdSum === 9 || bdSum === 10) base += 10;
  }
  
  return Math.min(100, base);
};

const scoreEmotional = (psychScores: { attachment: number; loveLanguages: number }) =>
  Math.round(((psychScores.attachment ?? 50) + (psychScores.loveLanguages ?? 50)) / 2);

const scoreLifestyle = (
  expr1: number | null,
  expr2: number | null
): number => {
  if (!expr1 || !expr2) return 65; // Base score when data missing
  
  let score = 60;
  
  // Same Expression number = very compatible lifestyles
  if (expr1 === expr2) {
    score += 25;
  }
  
  // Complementary Expression numbers (add to 9 or 10)
  const sum = expr1 + expr2;
  if (sum === 9 || sum === 10) {
    score += 20;
  }
  
  // Compatible modality (both odd or both even)
  if (expr1 % 2 === expr2 % 2) {
    score += 10;
  }
  
  // Master number bonus (11, 22, 33)
  if ([11, 22, 33].includes(expr1) || [11, 22, 33].includes(expr2)) {
    score += 5;
  }
  
  return Math.min(100, score);
};

const scoreLongTerm = (saturnScore?: number): number => {
  // If no Saturn data available, use moderate baseline
  if (saturnScore === undefined) return 68;
  
  // Saturn aspects are the #1 indicator of long-term commitment
  // Use Saturn score directly as it's already weighted for commitment potential
  return saturnScore;
};
const scoreTiming = (aDOB?: string, bDOB?: string) => {
  if (!aDOB || !bDOB) return 55;
  const good = new Set([1, 5, 6]);
  const ay = personalYear(aDOB);
  const by = personalYear(bDOB);
  return (ay && by && good.has(ay) && good.has(by)) ? 70 : 60;
};

const computeDetailedAspects = (scores: Scores): DetailedAspects => {
  const { attraction, emotional, lifestyle, longTerm, timing, overall } = scores;
  
  return {
    sex: Math.round(attraction.value * 0.7 + emotional.value * 0.3),
    communication: Math.round(emotional.value * 0.6 + lifestyle.value * 0.4),
    trust: Math.round(emotional.value * 0.5 + longTerm.value * 0.5),
    friendship: Math.round(lifestyle.value * 0.6 + emotional.value * 0.4),
    overall: overall.value,
    relationship: Math.round(overall.value * 0.4 + emotional.value * 0.3 + attraction.value * 0.3),
    colleagues: Math.round(lifestyle.value * 0.7 + emotional.value * 0.3),
    marriage: Math.round(longTerm.value * 0.6 + emotional.value * 0.4),
    emotionalConnection: emotional.value,
    intimacy: Math.round(attraction.value * 0.5 + emotional.value * 0.5),
    commonValues: Math.round(lifestyle.value * 0.5 + longTerm.value * 0.5)
  };
};

const deriveRelationshipCategories = (
  scores: Scores, 
  flags: string[], 
  confidence: string
): RelationshipCategory[] => {
  const categories: RelationshipCategory[] = [];
  const { attraction, emotional, lifestyle, longTerm, timing, overall } = scores;
  
  if (overall.value >= 85 && attraction.value >= 85 && longTerm.value >= 80) {
    categories.push({
      label: "Soulmate",
      rationale: "Exceptional overall compatibility with strong attraction and long-term potential",
      dominantPillars: ["attraction", "longTerm", "emotional"],
      strength: overall.value
    });
  }
  
  if (lifestyle.value >= 80 && emotional.value >= 75 && (attraction.value < 85 || overall.value < 85)) {
    categories.push({
      label: "Best Friends",
      rationale: "Strong lifestyle alignment and emotional connection, perfect for deep friendship",
      dominantPillars: ["lifestyle", "emotional"],
      strength: Math.round((lifestyle.value + emotional.value) / 2)
    });
  }
  
  if (timing.value >= 70 && flags.includes("master-number-present") && emotional.value >= 60 && emotional.value < 85) {
    categories.push({
      label: "Karmic Lesson",
      rationale: "Significant timing and spiritual indicators suggest a karmic connection for growth",
      dominantPillars: ["timing"],
      strength: timing.value
    });
  }
  
  if (flags.includes("nine-theme-harmony") && overall.value >= 75) {
    categories.push({
      label: "Great Match",
      rationale: "Nine-theme harmony indicates natural flow and balance in the relationship",
      dominantPillars: ["attraction", "emotional"],
      strength: overall.value
    });
  }
  
  if (categories.length === 0) {
    if (overall.value >= 70) {
      categories.push({
        label: "Compatible",
        rationale: "Good overall compatibility with potential for a positive connection",
        dominantPillars: Object.entries(scores)
          .filter(([k, v]) => k !== "overall" && v.value >= 70)
          .map(([k]) => k as Pillar)
          .slice(0, 2),
        strength: overall.value
      });
    } else if (overall.value >= 50) {
      categories.push({
        label: "Challenging",
        rationale: "Moderate compatibility with areas requiring work and understanding",
        dominantPillars: Object.entries(scores)
          .filter(([k, v]) => k !== "overall" && v.value < 60)
          .map(([k]) => k as Pillar)
          .slice(0, 2),
        strength: overall.value
      });
    } else {
      categories.push({
        label: "Challenging",
        rationale: "Significant differences may require extra effort and compromise",
        dominantPillars: ["emotional", "lifestyle"],
        strength: overall.value
      });
    }
  }
  
  return categories.sort((a, b) => b.strength - a.strength);
};

export const computeCompatibility = (
  a: PersonInput, 
  b: PersonInput, 
  rules?: Partial<typeof DEFAULT_WEIGHTS>
): CompatResult => {
  const W = { ...DEFAULT_WEIGHTS, ...(rules || {}) };

  const aLP = lifePath(a.dob);
  const aBD = birthDay(a.dob);
  const bLP = lifePath(b.dob);
  const bBD = birthDay(b.dob);
  const aExpr = expressionNumber(a.fullName);
  const bExpr = expressionNumber(b.fullName);

  const attraction = scoreAttraction(aLP, aBD, bLP, bBD);
  const psych = scorePsych(a.psych, b.psych);
  const emotional = scoreEmotional(psych);
  const lifestyle = scoreLifestyle(aExpr, bExpr);
  const longTerm = scoreLongTerm(undefined); // Will be enhanced with Saturn data when synastry is calculated
  const timing = scoreTiming(a.dob, b.dob);

  // Determine what inputs are available
  const inputs: InputsAvailable = {
    dob: !!(a.dob && b.dob),
    birthTime: !!(a.tob && b.tob),
    birthPlace: !!(a.place && b.place),
    fullName: !!(a.fullName && b.fullName),
    psych: !!(a.psych && b.psych),
    // Venus/Mars can be calculated from DOB alone (approximate), but needs birth time for precision
    venusMars: !!(a.dob && b.dob),
    // Moon needs birth time for confidence
    moonConfident: !!(a.tob && b.tob && a.place && b.place),
    // Saturn aspects will be computed when we integrate astrology service
    saturn: false,
    personalYear: !!(a.dob && b.dob)
  };

  const pillarErrors = computePillarErrors(inputs);

  // Count signals per pillar
  const signals = {
    attraction: ((aLP && bBD) || (bLP && aBD) ? 1 : 0) + (inputs.birthTime ? 1 : 0) + 1,
    emotional: (inputs.psych ? 1 : 0) + (inputs.moonConfident ? 1 : 0) + (inputs.fullName ? 1 : 0),
    lifestyle: (inputs.fullName ? 1 : 0) + 1,
    longTerm: (inputs.fullName ? 1 : 0) + (inputs.saturn ? 1 : 0),
    timing: (inputs.personalYear ? 1 : 0) + 1
  };

  const weights = rebalanceWeights(signals, W);

  const overall = Math.round(
    attraction * weights.attraction +
    emotional * weights.emotional +
    lifestyle * weights.lifestyle +
    longTerm * weights.longTerm +
    timing * weights.timing
  );
  
  const overallErr = Math.max(...Object.values(pillarErrors));

  const scores: Scores = {
    attraction: { value: attraction, error: pillarErrors.attraction },
    emotional: { value: emotional, error: pillarErrors.emotional },
    lifestyle: { value: lifestyle, error: pillarErrors.lifestyle },
    longTerm: { value: longTerm, error: pillarErrors.longTerm },
    timing: { value: timing, error: pillarErrors.timing },
    overall: { value: overall, error: overallErr }
  };

  const confidence = getConfidenceLevel(overallErr);
  const nudges = generateNudges(pillarErrors, inputs);
  
  // Generate flags
  const flags: string[] = [];
  if (hasNineHarmony(aLP, bBD) || hasNineHarmony(bLP, aBD)) {
    flags.push("nine-theme-harmony");
  }
  if ([aLP, bLP, aBD, bBD].some(n => [11, 22, 33].includes(n ?? 0))) {
    flags.push("master-number-present");
  }

  const detailedAspects = computeDetailedAspects(scores);
  const relationshipCategories = deriveRelationshipCategories(scores, flags, confidence);

  // Note: Synastry calculation is handled separately via compatibility.ts
  // when full astrology data is available. The fusion engine focuses on
  // numerology, psychology, and timing. Synastry requires geocoded birth
  // locations which are handled at the route level.

  return { 
    scores, 
    flags, 
    version: "compat-engine@1.0-ts",
    confidence,
    nudges,
    detailedAspects,
    relationshipCategories,
    synastry: undefined // Synastry added at route level when astrology data available
  };
};
