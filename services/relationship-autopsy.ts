import { Profile } from "../shared/schema";
import { routeAIRequest, finalOutputGuard } from "./ai-router";

export async function generateRelationshipAutopsy(profile1: Profile, profile2: Profile) {
  const p1Signals = (profile1 as any).signals || {};
  const p2Signals = (profile2 as any).signals || {};
  
  const p1Name = profile1.name || "Person A";
  const p2Name = profile2.name || "Person B";
  
  const p1Data = `
NAME: ${p1Name}
IDENTITY: ${profile1.archetype?.name}
PRESSURE: ${p1Signals.pressureStyle}
ENERGY: ${p1Signals.socialEnergy}
DECISION: ${p1Signals.decisionStyle}
`.trim();

  const p2Data = `
NAME: ${p2Name}
IDENTITY: ${profile2.archetype?.name}
PRESSURE: ${p2Signals.pressureStyle}
ENERGY: ${p2Signals.socialEnergy}
DECISION: ${p2Signals.decisionStyle}
`.trim();

  const prompt = `
You are the surgical relationship analyst for Soul Codex.
Your job is to perform a RELATIONSHIP AUTOPSY between two people.

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
Example: "You move fast emotionally. They don't. That's where it breaks."
Example: "You expect consistency. They respond in bursts. That's the tension."

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

  const raw = finalOutputGuard(response.content || "");
  
  if (!raw) {
    return {
      tension: "Signal stabilizing...",
      frictionPoints: ["Behavioral calibration in progress."],
      autopsy: "The relationship autopsy is currently stabilizing as the behavioral signals align."
    };
  }
  
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
