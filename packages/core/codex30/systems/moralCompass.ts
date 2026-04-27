import type { Signal } from "../types.js";

const DECISION_MAP: Record<string, { label: string; tags: string[] }> = {
  calm_logic:     { label: "Best decisions happen when my mind is calm. Pressure makes me slower, not dumber.", tags: ["precision", "discipline", "truth"] },
  sleep_on_it:    { label: "I need time to let decisions settle. Rushed choices cost me more than waiting ever does.", tags: ["intuition", "privacy", "discipline"] },
  quiet_instinct: { label: "I trust the signal that shows up in silence, not the one produced by urgency.", tags: ["intuition", "precision", "truth"] },
  willpower:      { label: "I commit hard and push through. The decision is made by my spine, not my comfort level.", tags: ["courage", "intensity", "discipline"] },
  gut_yes_no:     { label: "I know immediately. Anything that needs convincing is already a no.", tags: ["truth", "courage", "boundaries"] },
  analysis:       { label: "I map options before I move. Acting without data feels reckless to me.", tags: ["precision", "order", "discipline"] },
  gut:            { label: "My instinct reads the room before my brain catches up. I trust that.", tags: ["intuition", "courage", "freedom"] },
  consensus:      { label: "The right answer survives being heard by others. I check my thinking before locking in.", tags: ["social_sensitivity", "truth", "healing"] },
  impulse:        { label: "I move when the energy is right. Waiting often costs more than acting fast.", tags: ["freedom", "courage", "rebellion"] },
  avoidance:      { label: "I protect my peace by declining decisions that don't serve where I'm going.", tags: ["boundaries", "privacy", "discipline"] }
};

const PRESSURE_MAP: Record<string, { label: string; tags: string[] }> = {
  step_in:    { label: "Under pressure I step in and take command. Someone has to.", tags: ["leadership", "courage", "intensity"] },
  assess:     { label: "Under pressure I pause and map the field before moving. Speed without direction is noise.", tags: ["precision", "discipline", "truth"] },
  exit:       { label: "Under pressure I disengage and recalibrate before I burn anything down.", tags: ["privacy", "boundaries", "discipline"] },
  fight:      { label: "Pressure activates me. I push back harder when pushed.", tags: ["courage", "intensity", "boundaries"] },
  freeze:     { label: "Under extreme pressure I stop. Not from weakness — from needing to compute before acting.", tags: ["precision", "privacy", "discipline"] },
  adapt:      { label: "Pressure makes me shapeless in a useful way. I find the gap and move through it.", tags: ["freedom", "innovation", "social_sensitivity"] },
  withdraw:   { label: "When it gets loud I go quiet. My processing requires space, not audience.", tags: ["privacy", "intuition", "boundaries"] },
  perform:    { label: "Pressure is a stage. I find clarity when the stakes are real.", tags: ["courage", "leadership", "legacy"] }
};

export function moralCompassSignals(userInputs: any): Signal[] {
  const out: Signal[] = [];
  const nn: string[] = userInputs?.nonNegotiables ?? [];
  const decision = userInputs?.decisionStyle ?? "";
  const pressure = userInputs?.pressureStyle ?? "";

  if (nn.some(x => /lie|deception|dishon/i.test(x))) {
    out.push({
      id: "moral.truth.no_lies",
      system: "moralCompass",
      label: "I don't tolerate lies to my face. Trust breaks fast and permanently.",
      evidence: ["Non-negotiable: no lies"],
      intensity: 0.95,
      polarity: "strength",
      confidence: "high",
      tags: ["truth", "boundaries", "privacy"]
    });
  }

  if (nn.some(x => /repeat|boring|monoton/i.test(x))) {
    out.push({
      id: "moral.novelty.no_repetition",
      system: "moralCompass",
      label: "Repetitiveness drains me. I need novelty or progress — not loops.",
      evidence: ["Non-negotiable: no repetition"],
      intensity: 0.75,
      polarity: "neutral",
      confidence: "high",
      tags: ["freedom", "innovation"]
    });
  }

  if (nn.some(x => /control|dominat|manipulat/i.test(x))) {
    out.push({
      id: "moral.boundaries.no_control",
      system: "moralCompass",
      label: "Attempts to control or manipulate me end relationships fast. I need to choose, not be managed.",
      evidence: ["Non-negotiable: no control"],
      intensity: 0.9,
      polarity: "strength",
      confidence: "high",
      tags: ["boundaries", "freedom", "truth"]
    });
  }

  if (nn.some(x => /disrespect|dismiss|rude/i.test(x))) {
    out.push({
      id: "moral.respect.no_disrespect",
      system: "moralCompass",
      label: "Disrespect ends access immediately. I don't argue for basic dignity.",
      evidence: ["Non-negotiable: respect"],
      intensity: 0.85,
      polarity: "strength",
      confidence: "high",
      tags: ["boundaries", "truth", "courage"]
    });
  }

  const decisionEntry = DECISION_MAP[decision];
  if (decisionEntry) {
    out.push({
      id: `moral.decide.${decision}`,
      system: "moralCompass",
      label: decisionEntry.label,
      evidence: [`Decision style: ${decision.replace(/_/g, " ")}`],
      intensity: 0.8,
      polarity: "strength",
      confidence: "high",
      tags: decisionEntry.tags
    });
  }

  const pressureEntry = PRESSURE_MAP[pressure];
  if (pressureEntry) {
    out.push({
      id: `moral.pressure.${pressure}`,
      system: "moralCompass",
      label: pressureEntry.label,
      evidence: [`Pressure style: ${pressure.replace(/_/g, " ")}`],
      intensity: 0.8,
      polarity: "neutral",
      confidence: "high",
      tags: pressureEntry.tags
    });
  }

  return out;
}
