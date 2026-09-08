import type { SoulProfile } from "../types/soulcodex";

const SIGN_MOTTOS: Record<string, string[]> = {
  Aries: ["I start before the world is ready.", "I move first. I adjust later."],
  Taurus: ["I build what lasts.", "I hold the line when everything shakes."],
  Gemini: ["I connect what others keep separate.", "I see the pattern before the picture forms."],
  Cancer: ["I protect what matters without apology.", "I feel first. Then I decide."],
  Leo: ["I create what didn't exist before me.", "I bring light that others navigate by."],
  Virgo: ["I build clarity where others see chaos.", "I refine until it runs clean."],
  Libra: ["I find the fair answer nobody else sees.", "I hold the balance when the room tilts."],
  Scorpio: ["I see through surfaces. Always.", "I hold truth when it costs more than silence."],
  Sagittarius: ["I chase meaning, not comfort.", "I expand what others accept as fixed."],
  Capricorn: ["I build legacy through discipline, not drama.", "I outlast the noise."],
  Aquarius: ["I redesign what everyone else accepts.", "I think different because different is where the answer lives."],
  Pisces: ["I feel everything and turn it into something beautiful.", "I carry what others can't see."],
};

const LP_MOTTOS: Record<number, string> = {
  1: "I walk my own path even when the road hasn't been built.",
  2: "I make others better by being present, not by performing.",
  3: "I turn what's inside me into something the world can feel.",
  4: "I create order from chaos because chaos is where I see clearly.",
  5: "I adapt faster than the world changes around me.",
  6: "I carry responsibility because it's where my strength lives.",
  7: "I find truth where others stop looking.",
  8: "I master the material world so it serves the immaterial.",
  9: "I complete what others start and leave behind what lasts.",
  11: "I see what's coming before it arrives.",
  22: "I build what most people only talk about.",
  33: "I teach by living, not by lecturing.",
};

export function generateMotto(profile: SoulProfile): string {
  const sun = profile.chart?.sun?.sign || "";
  const lp = profile.numerology?.lifePath || 0;

  const signMottos = SIGN_MOTTOS[sun] || [];
  const lpMotto = LP_MOTTOS[lp];

  const dayIndex = new Date().getDate();

  if (lpMotto && dayIndex % 3 === 0) return lpMotto;
  if (signMottos.length > 0) return signMottos[dayIndex % signMottos.length];
  return "I operate with intention, not impulse.";
}

export function generatePersonalCode(profile: SoulProfile): string[] {
  const code: string[] = [];
  const synthesis = profile.synthesis;

  if (synthesis?.topThemes?.includes("Precision") || synthesis?.topThemes?.some(t => t.toLowerCase().includes("precision")))
    code.push("Precision before speed.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("truth") || t.toLowerCase().includes("honest")))
    code.push("Truth before comfort.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("boundar") || t.toLowerCase().includes("privacy")))
    code.push("Boundaries before burnout.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("legacy") || t.toLowerCase().includes("building")))
    code.push("Legacy before applause.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("freedom") || t.toLowerCase().includes("independence")))
    code.push("Freedom before conformity.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("stability") || t.toLowerCase().includes("structure")))
    code.push("Structure before chaos.");
  if (synthesis?.topThemes?.some(t => t.toLowerCase().includes("emotional") || t.toLowerCase().includes("feeling")))
    code.push("Depth before surface.");

  if (profile.mirror?.decisionStyle?.toLowerCase().includes("logic"))
    code.push("Clarity before reaction.");
  if (profile.humanDesign?.type === "Projector")
    code.push("Guidance before labor.");
  if (profile.humanDesign?.type === "Generator")
    code.push("Excitement before obligation.");

  if (code.length < 3) {
    code.push("Awareness before autopilot.");
    code.push("One finished action before ten scattered thoughts.");
  }

  return code.slice(0, 5);
}
