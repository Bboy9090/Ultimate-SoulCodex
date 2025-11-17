import type { InputsAvailable } from "./types";

const CAPS: Record<string, number> = { 
  attraction: 10, 
  emotional: 12, 
  lifestyle: 9, 
  longTerm: 10, 
  timing: 8 
};

export const computePillarErrors = (i: InputsAvailable) => {
  const e = { attraction: 0, emotional: 0, lifestyle: 0, longTerm: 0, timing: 0 };
  
  // Attraction errors
  if (!i.venusMars) e.attraction += 5;
  if (!(i.birthTime && i.birthPlace)) e.attraction += 4;

  // Emotional errors
  if (!i.moonConfident) e.emotional += 7;
  if (!i.fullName) e.emotional += 4;
  if (!i.psych) e.emotional += 5;

  // Lifestyle errors
  if (!i.fullName) e.lifestyle += 6;

  // Long-term errors
  if (!i.fullName) e.longTerm += 4;
  if (!i.saturn) e.longTerm += 5;

  // Timing errors
  if (!i.personalYear) e.timing += 6;

  // Cap errors
  (Object.keys(e) as (keyof typeof e)[]).forEach(k => {
    e[k] = Math.min(e[k], CAPS[k]);
  });
  
  return e;
};

export const rebalanceWeights = (
  signals: Record<"attraction" | "emotional" | "lifestyle" | "longTerm" | "timing", number>,
  w: Record<"attraction" | "emotional" | "lifestyle" | "longTerm" | "timing", number>
) => {
  const out = { ...w };
  const weak = (p: keyof typeof signals) => (signals[p] ?? 0) < 2;

  const shift = (
    src: keyof typeof out, 
    targets: (keyof typeof out)[], 
    ratios: number[]
  ) => {
    if (!weak(src)) return;
    const missing = out[src] * 0.5;
    out[src] -= missing;
    const sum = ratios.reduce((a, b) => a + b, 0);
    targets.forEach((t, i) => { 
      out[t] += missing * (ratios[i] / sum); 
    });
  };

  shift("attraction", ["emotional", "lifestyle"], [0.6, 0.4]);
  shift("emotional", ["longTerm", "attraction"], [0.6, 0.4]);
  shift("lifestyle", ["longTerm", "emotional"], [0.5, 0.5]);
  shift("longTerm", ["lifestyle", "emotional"], [0.6, 0.4]);
  // timing stays as-is
  
  return out;
};

export const getConfidenceLevel = (maxError: number): "high" | "medium" | "low" => {
  if (maxError <= 3) return "high";
  if (maxError <= 7) return "medium";
  return "low";
};

export const generateNudges = (errors: Record<string, number>, inputs: InputsAvailable): string[] => {
  const nudges: string[] = [];
  
  if (!inputs.birthTime && errors.emotional >= 5) {
    nudges.push("Add birth time to refine Moon/Rising (improves Emotional and Attraction accuracy)");
  }
  
  if (!inputs.fullName && (errors.lifestyle >= 5 || errors.emotional >= 4)) {
    nudges.push("Add full name to unlock Expression/Soul Urge numbers (improves Lifestyle and Emotional scores)");
  }
  
  if (!inputs.psych && errors.emotional >= 5) {
    nudges.push("Complete attachment style and love language assessment to improve Emotional compatibility");
  }
  
  return nudges;
};
