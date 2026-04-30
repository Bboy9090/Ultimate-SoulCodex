import { Profile } from "../shared/schema";
import { routeAIRequest, finalOutputGuard } from "./ai-router";
import { scoreOutput } from "../soulcodex/codex30/synth/quality";
import { VOICE_LAWS } from "../soulcodex/codex30/prompts/voice_laws";

export async function generateRelationshipAutopsy(profile1: Profile, profile2: Profile) {
  const p1Signals = (profile1 as any).signals || {};
  const p2Signals = (profile2 as any).signals || {};
  
  const p1Name = profile1.name || "Person A";
  const p2Name = profile2.name || "Person B";
  
  const p1Data = `
NAME: ${p1Name}
IDENTITY: ${(profile1 as any).archetype?.name}
PRESSURE: ${p1Signals.pressureStyle}
ENERGY: ${p1Signals.socialEnergy}
DECISION: ${p1Signals.decisionStyle}
`.trim();

  const p2Data = `
NAME: ${p2Name}
IDENTITY: ${(profile2 as any).archetype?.name}
PRESSURE: ${p2Signals.pressureStyle}
ENERGY: ${p2Signals.socialEnergy}
DECISION: ${p2Signals.decisionStyle}
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
Expose the specific behavioral friction. 

Write in a direct, blunt, almost uncomfortable tone.

## OUTPUT FORMAT
TENSION: [One sentence exposing the primary behavioral friction point]
FRICTION_1: [Specific behavioral collision]
FRICTION_2: [Specific behavioral collision]
AUTOPSY: [Short paragraph exposing why this connection eventually breaks or stalls]
`.trim();

  const response = await routeAIRequest({
    prompt,
    promptType: "biography",
    temperature: 0.85
  });

  // Tier B: Deterministic Behavioral Shot
  const fallbackAutopsy = {
    tension: `${(profile1 as any).archetype?.name || "One"} moves, ${(profile2 as any).archetype?.name || "the other"} watches.`,
    frictionPoints: [
      `${p1Name} pushes for immediate result. ${p2Name} stalls to verify state.`,
      `Communication breaks when urgency hits. One retreats while the other escalates.`
    ],
    autopsy: `The connection is a loop of missed timing. ${p1Name} assumes momentum is progress. ${p2Name} assumes stillness is safety. Neither is correct. The friction is inevitable and constant.`
  };

  if (response.content) {
    const score = scoreOutput(response.content);
    if (!score.passed) {
      console.warn(`[RelationshipAutopsy] Output score ${score.total.toFixed(1)} failed threshold. Using Tier B fallback.`);
      return fallbackAutopsy;
    }
  }

  const raw = finalOutputGuard(response.content || "");
  
  if (!raw) return fallbackAutopsy;
  
  const tensionMatch = raw.match(/^TENSION:\s*(.+)/m);
  const f1Match = raw.match(/^FRICTION_1:\s*(.+)/m);
  const f2Match = raw.match(/^FRICTION_2:\s*(.+)/m);
  const autopsyMatch = raw.match(/^AUTOPSY:\s*([\s\S]+?)(?:\n[A-Z]+:|$)/);

  return {
    tension: tensionMatch?.[1]?.trim() || "Behavioral friction detected.",
    frictionPoints: [
      f1Match?.[1]?.trim(),
      f2Match?.[1]?.trim()
    ].filter(Boolean),
    autopsy: autopsyMatch?.[1]?.trim() || "The connection follows a predictable behavioral loop."
  };
}
