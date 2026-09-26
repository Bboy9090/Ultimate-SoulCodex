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
  if (!verified) return [];
  const out: Signal[] = [];

  const sun    = fullChart?.planets?.sun?.sign    ?? fullChart?.sun;
  const moon   = fullChart?.planets?.moon?.sign   ?? fullChart?.moon;
  const rising = fullChart?.planets?.rising?.sign ?? fullChart?.rising ?? fullChart?.houses?.ascSign;

  if (typeof sun === "string" && SUN_MOON_TAGS[sun]) {
    out.push({
      id: `astro.sun.${sun.toLowerCase()}`,
      system: "astrology",
      label: `Sun in ${sun} is used here as verified astronomical evidence with optional symbolic reflection themes.`,
      evidence: [`Sun in ${sun}`],
      intensity: 0.9,
      polarity: "neutral",
      confidence: "high",
      tags: SUN_MOON_TAGS[sun]
    });
  }

  if (typeof moon === "string" && SUN_MOON_TAGS[moon]) {
    out.push({
      id: `astro.moon.${moon.toLowerCase()}`,
      system: "astrology",
      label: `Moon in ${moon} is verified astronomical evidence; any emotional meaning is optional symbolic interpretation.`,
      evidence: [`Moon in ${moon}`],
      intensity: 0.8,
      polarity: "neutral",
      confidence: "high",
      tags: SUN_MOON_TAGS[moon]
    });
  }

  if (typeof rising === "string" && RISING_TAGS[rising]) {
    out.push({
      id: `astro.rising.${String(rising).toLowerCase()}`,
      system: "astrology",
      label: `Rising in ${rising} is verified chart geometry; outward-style meaning remains optional symbolism.`,
      evidence: [`Rising in ${rising}`],
      intensity: 0.75,
      polarity: "neutral",
      confidence: "high",
      tags: RISING_TAGS[rising]
    });
  }

  return out;
}
