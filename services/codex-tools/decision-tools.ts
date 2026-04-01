/**
 * Decision Tools — Reality Check, Decision Temperature, Signal vs Noise.
 * Simple frameworks for thinking clearly.
 */

import type { CodexToolResult, ProfileInput } from "./types";
import { extractCore } from "./types";

export function realityCheck(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  const checks = [
    { observation: "You may be overthinking a situation that requires less analysis and more action", action: "Name the decision. Set a 24-hour deadline. Choose." },
    { observation: "You're carrying weight that isn't yours to carry right now", action: "Identify whose problem this actually is. If it's not yours, put it down." },
    { observation: "The urgency you feel may be manufactured — not every fire needs your response", action: "Wait 4 hours. If it still feels urgent, act. If not, it wasn't." },
    { observation: "You're confusing preparation with progress — planning isn't doing", action: "Close the plan. Open the work. Start the hardest part first." },
    { observation: "You're looking for the right answer when you need to pick a good-enough answer and move", action: "Choose the option that's 70% right and start. Adjust as you go." },
  ];

  const now = new Date();
  const idx = (now.getHours() + now.getDate() + (core.birthDate ? new Date(core.birthDate).getDate() : 0)) % checks.length;
  const check = checks[idx];

  const meaning = core.hdType
    ? `Your ${core.hdType} design means you process decisions ${core.hdType === "Generator" || core.hdType === "Manifesting Generator" ? "through gut response — if there's no clear 'yes', it's a 'not yet'" : core.hdType === "Projector" ? "through recognition — wait until someone asks" : core.hdType === "Manifestor" ? "through initiation — inform, then move" : "through sampling — give it time before locking in"}. ${core.moonSign ? `Your ${core.moonSign} Moon may be clouding this with emotion.` : ""}`
    : `Your default under pressure is to ${core.stressPattern || "speed up"}. That's the pattern to interrupt right now.`;

  return {
    tool: "reality_check",
    title: "Reality Check",
    observation: check.observation,
    meaning,
    action: check.action,
  };
}

export type DecisionTemp = "cold" | "warm" | "hot" | "clear";

export function decisionTemperature(
  profile: ProfileInput,
  decision?: string
): CodexToolResult {
  const core = extractCore(profile);
  const now = new Date();

  const dayNum = now.getDate() % 9 || 9;
  let temp: DecisionTemp;
  let explanation: string;

  if (dayNum === 7) {
    temp = "cold";
    explanation = "Not ready. The decision lacks clarity — you're choosing between assumptions, not facts.";
  } else if (dayNum === 9 || dayNum === 5) {
    temp = "hot";
    explanation = "Emotionally charged. The urgency is real but the reasoning is reactive.";
  } else if (dayNum === 1 || dayNum === 8 || dayNum === 3) {
    temp = "clear";
    explanation = "Conditions are good. You have enough information and the emotional charge is manageable.";
  } else {
    temp = "warm";
    explanation = "Approaching readiness. A few more inputs would help, but don't wait too long.";
  }

  const tempLabel = {
    cold: "❄ Cold — Not ready",
    warm: "◐ Warm — Consider",
    hot: "🔥 Hot — Delay",
    clear: "✓ Clear — Move",
  };

  const observation = `Decision temperature: ${tempLabel[temp]}\n${decision ? `Decision: "${decision}"` : ""}`;

  const meaning = `${explanation} ${core.hdType ? `Your ${core.hdType} authority (${core.hdAuthority || core.hdStrategy || "inner signal"}) is the tiebreaker — not external pressure.` : ""} ${core.moonSign ? `Your ${core.moonSign} Moon adds emotional weight ${temp === "hot" ? "that's distorting your read on this" : "— account for it but don't let it drive"}.` : ""}`;

  const actionMap: Record<DecisionTemp, string> = {
    cold: "Gather one more piece of real information (not opinions). Revisit in 48 hours.",
    warm: "Sleep on it one more night. If the answer is the same tomorrow morning, act.",
    hot: "Do NOT decide today. Write down what you're feeling, then revisit when the charge drops.",
    clear: "Make the call. Don't second-guess. Execute the first step within 2 hours.",
  };

  return {
    tool: "decision_temperature",
    title: "Decision Temperature",
    observation,
    meaning,
    action: actionMap[temp],
    extras: { temperature: temp },
  };
}

export function signalVsNoise(profile: ProfileInput): CodexToolResult {
  const core = extractCore(profile);

  const signals = [
    "The thing you keep coming back to when everything else quiets down",
    "The conversation you've been avoiding because you know it matters",
    core.growthEdge || "The area where growth feels uncomfortable but necessary",
    core.lifePath ? `Life Path ${core.lifePath} pointing toward the pattern you always return to` : "The pattern you notice repeating",
  ].filter(Boolean);

  const noise = [
    "Other people's urgency that you've adopted as your own",
    "The comparison loop — checking how others are doing instead of focusing on your own work",
    "Busywork that feels productive but changes nothing",
    core.stressPattern ? `Your stress pattern: ${core.stressPattern}` : "The impulse to add more instead of simplifying",
  ].filter(Boolean);

  const observation = `**Signal (act on this):**\n${signals.slice(0, 3).map(s => `• ${s}`).join("\n")}\n\n**Noise (ignore this):**\n${noise.slice(0, 3).map(n => `• ${n}`).join("\n")}`;

  const meaning = `${core.sunSign ? `Your ${core.sunSign} Sun treats everything like a priority — it's not. ` : ""}${core.hdType ? `Your ${core.hdType} design is built to ${core.hdType === "Projector" ? "guide, not grind" : core.hdType === "Generator" || core.hdType === "Manifesting Generator" ? "respond to what excites you, not what pressures you" : core.hdType === "Manifestor" ? "initiate the important, not the urgent" : "reflect, not absorb"}.` : "Separate what matters from what's loud."}`;

  const action = `Pick the strongest signal. Give it 90 minutes of undivided attention today. Let the noise wait.`;

  return {
    tool: "signal_vs_noise",
    title: "Signal vs Noise",
    observation,
    meaning,
    action,
  };
}
