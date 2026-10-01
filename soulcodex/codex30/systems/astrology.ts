import type { Signal } from "../types";

const ZODIAC = new Set([
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]);

const SUN_MOON_TAGS: Record<string, string[]> = {
  Aries: ["courage", "leadership", "intensity", "rebellion"],
  Taurus: ["craft", "discipline", "legacy", "order"],
  Gemini: ["innovation", "freedom", "social_sensitivity", "precision"],
  Cancer: ["emotion_depth", "healing", "privacy", "intuition"],
  Leo: ["leadership", "courage", "legacy", "intensity"],
  Virgo: ["precision", "craft", "service", "order"],
  Libra: ["truth", "social_sensitivity", "boundaries", "healing"],
  Scorpio: ["intensity", "privacy", "truth", "boundaries"],
  Sagittarius: ["freedom", "courage", "innovation", "rebellion"],
  Capricorn: ["legacy", "discipline", "order", "craft"],
  Aquarius: ["innovation", "freedom", "rebellion", "social_sensitivity"],
  Pisces: ["intuition", "emotion_depth", "healing", "privacy"],
};

const RISING_TAGS: Record<string, string[]> = {
  Aries: ["courage", "leadership", "intensity"],
  Taurus: ["craft", "discipline", "boundaries"],
  Gemini: ["innovation", "social_sensitivity", "freedom"],
  Cancer: ["emotion_depth", "privacy", "healing"],
  Leo: ["leadership", "legacy", "courage"],
  Virgo: ["precision", "service", "order"],
  Libra: ["social_sensitivity", "truth", "boundaries"],
  Scorpio: ["privacy", "intensity", "boundaries", "truth"],
  Sagittarius: ["freedom", "courage", "rebellion"],
  Capricorn: ["legacy", "discipline", "order"],
  Aquarius: ["innovation", "rebellion", "freedom"],
  Pisces: ["intuition", "healing", "emotion_depth"],
};

function verifiedSign(value: any): string | null {
  if (!value || typeof value !== "object") return null;
  const sign = typeof value.sign === "string" ? value.sign.trim() : "";
  if (!ZODIAC.has(sign) || value.verificationStatus !== "verified") return null;

  const evidence = value.provenance ?? value.evidence;
  const direct = Boolean(
    typeof evidence?.source === "string" && evidence.source.trim() &&
    typeof evidence?.engine === "string" && evidence.engine.trim() &&
    typeof evidence?.calculatedAt === "string" &&
    !Number.isNaN(Date.parse(evidence.calculatedAt)),
  );
  const governed = Boolean(
    typeof value.policyId === "string" && value.policyId.trim() &&
    typeof value.evidenceArtifactId === "string" && value.evidenceArtifactId.trim(),
  );
  return direct || governed ? sign : null;
}

export function astrologySignals(fullChart: any, _legacyVerifiedBadge?: boolean): Signal[] {
  const out: Signal[] = [];
  const sun = verifiedSign(fullChart?.planets?.sun ?? fullChart?.sun);
  const moon = verifiedSign(fullChart?.planets?.moon ?? fullChart?.moon);
  const rising = verifiedSign(fullChart?.rising ?? fullChart?.planets?.rising);

  if (sun) {
    out.push({
      id: `astro.sun.${sun.toLowerCase()}`,
      system: "astrology",
      label: `Verified Sun in ${sun} contributes a symbolic ${sun} theme; it does not establish personality.`,
      evidence: [`Verified Sun in ${sun}`],
      intensity: 0.9,
      polarity: "neutral",
      confidence: "high",
      tags: SUN_MOON_TAGS[sun] ?? [],
    });
  }

  if (moon) {
    out.push({
      id: `astro.moon.${moon.toLowerCase()}`,
      system: "astrology",
      label: `Verified Moon in ${moon} contributes a symbolic internal-pattern theme; it does not establish private emotional facts.`,
      evidence: [`Verified Moon in ${moon}`],
      intensity: 0.8,
      polarity: "neutral",
      confidence: "high",
      tags: SUN_MOON_TAGS[moon] ?? [],
    });
  }

  if (rising) {
    out.push({
      id: `astro.rising.${rising.toLowerCase()}`,
      system: "astrology",
      label: `Verified Rising in ${rising} contributes a symbolic first-impression theme; it does not define how others actually perceive the person.`,
      evidence: [`Verified Rising in ${rising}`],
      intensity: 0.75,
      polarity: "neutral",
      confidence: "high",
      tags: RISING_TAGS[rising] ?? [],
    });
  }

  return out;
}
