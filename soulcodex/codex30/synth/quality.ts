const BANNED_INTERPRETIVE = [
  "i think", "i feel", "i try to", "i aim to", "i hope to",
  "i want to", "i wish", "i might", "perhaps", "maybe",
  "sometimes", "usually", "tend to"
];

const BANNED_GENERIC = [
  "you are a unique individual", "your journey", "the universe",
  "cosmic blueprint", "embrace your truth", "growth and transformation",
  "aligned with your purpose", "sacred blueprint", "divine timing",
  "vibrational frequency", "holistic convergence", "celestial influence",
  "divine nature", "cosmic signature", "measurable goals",
  "specific goals", "detailed planner", "allocate time",
  "attend workshops", "industry trends", "hold myself accountable",
];

const CONCRETE_PATTERN = /(lies|repetitiveness|boundaries|legacy|immortal|build|precision|craft|intensity|privacy|truth|discipline|stall|delay|avoid|push|ignore)/i;

export interface QualityScore {
  specificity: number;       // 0-10
  sharpness: number;         // 0-10
  structuralIntegrity: number; // 0-10
  narrativeBluntness: number; // 0-10
  total: number;             // average
  passed: boolean;           // >= 7.5
}

export function scoreOutput(text: string): QualityScore {
  const minLength = text.includes("Observation") ? 150 : 400; // Adjust for Daily vs Full
  if (!text || text.length < minLength) {
    return { specificity: 0, sharpness: 0, structuralIntegrity: 0, narrativeBluntness: 0, total: 0, passed: false };
  }

  const t = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // 1. SPECIFICITY: Check for concrete anchors and behavioral patterns
  const concreteHits = (text.match(CONCRETE_PATTERN) || []).length;
  const specificity = Math.min(10, (concreteHits * 2) + (text.length > 1000 ? 2 : 0));

  // 2. SHARPNESS: Deduct for interpretive narrators and banned generic words
  const interpretiveHits = BANNED_INTERPRETIVE.filter(p => t.includes(p)).length;
  const genericHits = BANNED_GENERIC.filter(p => t.includes(p)).length;
  const sharpness = Math.max(0, 10 - (interpretiveHits * 2.5) - (genericHits * 2));

  // 3. STRUCTURAL INTEGRITY: Sentence length variance (Structure Variation Law)
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
  const variance = lengths.reduce((a, b) => a + Math.abs(b - avgLength), 0) / (lengths.length || 1);
  const structuralIntegrity = Math.min(10, variance * 2);

  // 4. NARRATIVE BLUNTNESS: Check for "I" statements + Direct Verbs
  const firstPersonCount = (t.match(/\bi\b/g) || []).length;
  const verbHits = (t.match(/\b(delay|avoid|push|stall|ignore|refuse|build|fix|stop)\b/g) || []).length;
  const narrativeBluntness = Math.min(10, (firstPersonCount + verbHits) / (sentences.length || 1) * 4);

  const total = (specificity + sharpness + structuralIntegrity + narrativeBluntness) / 4;

  return {
    specificity,
    sharpness,
    structuralIntegrity,
    narrativeBluntness,
    total,
    passed: total >= 7.5
  };
}

export function isGeneric(text: string): boolean {
  const score = scoreOutput(text);
  return !score.passed;
}
