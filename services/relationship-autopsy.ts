import { Profile } from "../shared/schema";
import { routeAIRequest, finalOutputGuard } from "./ai-router";
import { scoreOutput } from "../soulcodex/codex30/synth/quality";
import { VOICE_LAWS } from "../soulcodex/codex30/prompts/voice_laws";

function cleanSignal(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length > 0 ? clean : null;
}

export async function generateRelationshipAutopsy(profile1: Profile, profile2: Profile) {
  const p1Signals = (profile1 as any).signals || {};
  const p2Signals = (profile2 as any).signals || {};
  
  const p1Name = profile1.name || "Person A";
  const p2Name = profile2.name || "Person B";
  const required1 = {
    pressureStyle: cleanSignal(p1Signals.pressureStyle),
    socialEnergy: cleanSignal(p1Signals.socialEnergy),
    decisionStyle: cleanSignal(p1Signals.decisionStyle),
  };
  const required2 = {
    pressureStyle: cleanSignal(p2Signals.pressureStyle),
    socialEnergy: cleanSignal(p2Signals.socialEnergy),
    decisionStyle: cleanSignal(p2Signals.decisionStyle),
  };

  const missing = [
    ...Object.entries(required1).filter(([, value]) => !value).map(([key]) => `${p1Name}.${key}`),
    ...Object.entries(required2).filter(([, value]) => !value).map(([key]) => `${p2Name}.${key}`),
  ];

  if (missing.length > 0) {
    return {
      available: false,
      reason: "behavioral_signals_incomplete",
      missing,
      tension: null,
      frictionPoints: [],
      autopsy: null,
    };
  }

  const p1Data = `
NAME: ${p1Name}
PRESSURE: ${required1.pressureStyle}
ENERGY: ${required1.socialEnergy}
DECISION: ${required1.decisionStyle}
`.trim();

  const p2Data = `
NAME: ${p2Name}
PRESSURE: ${required2.pressureStyle}
ENERGY: ${required2.socialEnergy}
DECISION: ${required2.decisionStyle}
`.trim();

  const prompt = `
You are the surgical relationship analyst for Soul Codex.
Your job is to perform a RELATIONSHIP AUTOPSY between two people.

${VOICE_LAWS}

DO NOT give advice.
DO NOT use cosmic/zodiac language.
DO NOT focus on percentages.

EXPOSE THE TENSION POINTS.

---
## PERSON 1 DATA
${p1Data}

---
## PERSON 2 DATA
${p2Data}

---
## CORE DIRECTIVE
Expose only friction that is supportable from the supplied behavioral signals.

Write directly, without diagnosing either person or predicting that the relationship will fail.

## OUTPUT FORMAT
TENSION: [One sentence describing the strongest supported behavioral tension]
FRICTION_1: [Specific behavioral collision supported by the supplied signals]
FRICTION_2: [Specific behavioral collision supported by the supplied signals]
AUTOPSY: [Short paragraph describing where the interaction may strain and what pattern creates that strain]
`.trim();

  const response = await routeAIRequest({
    prompt,
    promptType: "biography",
    temperature: 0.85
  });

  if (response.content) {
    const score = scoreOutput(response.content);
    if (!score.passed) {
      console.warn(`[RelationshipAutopsy] Output score ${score.total.toFixed(1)} failed threshold. Returning unavailable.`);
      return {
        available: false,
        reason: "generated_output_failed_quality_gate",
        missing: [],
        tension: null,
        frictionPoints: [],
        autopsy: null,
      };
    }
  }

  const raw = finalOutputGuard(response.content || "");
  
  if (!raw) {
    return {
      available: false,
      reason: "generated_output_unavailable",
      missing: [],
      tension: null,
      frictionPoints: [],
      autopsy: null,
    };
  }
  
  const tensionMatch = raw.match(/^TENSION:\s*(.+)/m);
  const f1Match = raw.match(/^FRICTION_1:\s*(.+)/m);
  const f2Match = raw.match(/^FRICTION_2:\s*(.+)/m);
  const autopsyMatch = raw.match(/^AUTOPSY:\s*([\s\S]+?)(?:\n[A-Z]+:|$)/);

  const tension = tensionMatch?.[1]?.trim() || null;
  const frictionPoints = [
    f1Match?.[1]?.trim(),
    f2Match?.[1]?.trim()
  ].filter((value): value is string => Boolean(value));
  const autopsy = autopsyMatch?.[1]?.trim() || null;

  if (!tension || frictionPoints.length === 0 || !autopsy) {
    return {
      available: false,
      reason: "generated_output_incomplete",
      missing: [],
      tension: null,
      frictionPoints: [],
      autopsy: null,
    };
  }

  return {
    available: true,
    reason: null,
    missing: [],
    tension,
    frictionPoints,
    autopsy,
  };
}
