import type { Signal } from "../types.js";

const SUN_MOON_TAGS: Record<string, string[]> = {
  Aries:       ["courage", "leadership", "intensity", "rebellion"],
  Taurus:      ["craft", "discipline", "legacy", "order"],
  Gemini:      ["innovation", "freedom", "social_sensitivity", "precision"],
  Cancer:      ["emotion_depth", "healing", "privacy", "intuition"],
  Leo:         ["leadership", "courage", "legacy", "intensity"],
  Virgo:       ["precision", "craft", "service", "order"],
  Libra:       ["truth", "social_sensitivity", "boundaries", "healing"],
  Scorpio:     ["intensity", "privacy", "truth", "boundaries"],
  Sagittarius: ["freedom", "courage", "innovation", "rebellion"],
  Capricorn:   ["legacy", "discipline", "order", "craft"],
  Aquarius:    ["innovation", "freedom", "rebellion", "social_sensitivity"],
  Pisces:      ["intuition", "emotion_depth", "healing", "privacy"]
};

const RISING_TAGS: Record<string, string[]> = {
  Aries:       ["courage", "leadership", "intensity"],
  Taurus:      ["craft", "discipline", "boundaries"],
  Gemini:      ["innovation", "social_sensitivity", "freedom"],
  Cancer:      ["emotion_depth", "privacy", "healing"],
  Leo:         ["leadership", "legacy", "courage"],
  Virgo:       ["precision", "service", "order"],
  Libra:       ["social_sensitivity", "truth", "boundaries"],
  Scorpio:     ["privacy", "intensity", "boundaries", "truth"],
  Sagittarius: ["freedom", "courage", "rebellion"],
  Capricorn:   ["legacy", "discipline", "order"],
  Aquarius:    ["innovation", "rebellion", "freedom"],
  Pisces:      ["intuition", "healing", "emotion_depth"]
};

export function astrologySignals(fullChart: any, verified: boolean): Signal[] {
  const conf = verified ? "high" : "medium";
  const out: Signal[] = [];

  const sun    = fullChart?.planets?.sun?.sign    ?? fullChart?.sun;
  const moon   = fullChart?.planets?.moon?.sign   ?? fullChart?.moon;
  const rising = fullChart?.planets?.rising?.sign ?? fullChart?.rising ?? fullChart?.houses?.ascSign;

  if (sun) {
    out.push({
      id: `astro.sun.${sun.toLowerCase()}`,
      system: "astrology",
      label: `Identity expresses through ${sun} patterns — how I build, decide, and judge quality.`,
      evidence: [`Sun in ${sun}`],
      intensity: 0.9,
      polarity: "neutral",
      confidence: conf as any,
      tags: SUN_MOON_TAGS[sun] ?? ["craft", "legacy"]
    });
  }

  if (moon) {
    out.push({
      id: `astro.moon.${moon.toLowerCase()}`,
      system: "astrology",
      label: `Emotional processing follows ${moon} patterns — what soothes me and what sets me off.`,
      evidence: [`Moon in ${moon}`],
      intensity: 0.8,
      polarity: "neutral",
      confidence: conf as any,
      tags: SUN_MOON_TAGS[moon] ?? ["emotion_depth", "intuition"]
    });
  }

  if (rising) {
    out.push({
      id: `astro.rising.${String(rising).toLowerCase()}`,
      system: "astrology",
      label: `First impression and defense style reflect ${rising} — how I guard and approach the world.`,
      evidence: [`Rising in ${rising}`],
      intensity: 0.75,
      polarity: "neutral",
      confidence: verified ? "high" : "low",
      tags: RISING_TAGS[rising] ?? ["boundaries", "leadership"]
    });
  }

  return out;
}
