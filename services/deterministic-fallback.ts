/**
 * Deterministic AI-outage fallback.
 *
 * This layer must be safer than the AI path, not more speculative. It does not
 * infer psychology, trauma, motives, destiny, health, energy, aura, or behavior
 * from astrology, numerology, Human Design, or archetype labels.
 */

import type { AIRequest } from "../src/types/ai";

interface FallbackResult {
  title: string;
  content: string;
}

interface ArchetypeProfileInput {
  sunSign?: string;
  moonSign?: string;
  lifePath?: number | string;
  element?: string;
  archetypeName?: string;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function suppliedFocus(input: AIRequest): string {
  return (
    cleanText((input.dailyCard as any)?.focus) ||
    cleanText((input.timeline as any)?.focus) ||
    "choose one concrete next step and judge it by what actually happens"
  );
}

function suppliedPhase(input: AIRequest): string {
  return (
    cleanText((input.timeline as any)?.phase) ||
    cleanText((input.timeline as any)?.currentPhase) ||
    "Unavailable"
  );
}

function neutralReflection(title: string, input: AIRequest): FallbackResult {
  const focus = suppliedFocus(input);
  const phase = suppliedPhase(input);

  return {
    title,
    content: [
      "AI interpretation is unavailable, so Soul Codex is not filling the gap with invented personality claims.",
      phase !== "Unavailable"
        ? `Recorded timeline phase: ${phase}. Treat that label as a reflection framework, not a prediction.`
        : "No timeline phase is being assumed.",
      `Next experiment: ${focus}.`,
      "Keep what is supported by observed results; discard what does not fit.",
    ].join("\n\n"),
  };
}

function soulGuideFallback(input: AIRequest): FallbackResult {
  const focus = suppliedFocus(input);
  return {
    title: "Soul Guide Failsafe",
    content: [
      "## CORE PATTERN",
      "No hidden behavioral pattern is inferred while AI interpretation is unavailable.",
      "",
      "## NEXT MOVE",
      `Use the available profile data only as context. For now: ${focus}.`,
      "",
      "## CHECK",
      "What observable result would confirm or change this interpretation?",
    ].join("\n"),
  };
}

function dailyGuidanceFallback(input: AIRequest): FallbackResult {
  return {
    title: "Daily Guidance Failsafe",
    content: [
      "**Observation**: I separate what I know from what I am assuming.",
      `**Focus**: I ${suppliedFocus(input).replace(/^I\s+/i, "")}.`,
      "**Action**: I complete one low-risk step, record the result, and update the plan from evidence.",
    ].join("\n\n"),
  };
}

function dailyHoroscopeFallback(input: AIRequest): FallbackResult {
  return {
    title: "Daily Reflection Failsafe",
    content: [
      "**Observation**",
      "Current sky or numerology symbolism is not being converted into a prediction while AI interpretation is unavailable.",
      "",
      "**Meaning**",
      "I can still use any measured sky data or deterministic number shown elsewhere in the app as an optional reflection prompt.",
      "",
      "**Action**",
      `I ${suppliedFocus(input).replace(/^I\s+/i, "")}.`,
    ].join("\n"),
  };
}

function codexReadingFallback(input: AIRequest): FallbackResult {
  return {
    title: "Codex Reading Failsafe",
    content: [
      "## EVIDENCE STATUS",
      "AI interpretation is unavailable. No substitute identity, strength, shadow, motive, destiny, or purpose is being generated.",
      "",
      "## REFLECTION",
      "Use only verified/calculated fields already displayed in the profile and any explicit self-assessment answers you supplied.",
      "",
      "## NEXT STEP",
      `${suppliedFocus(input)}.`,
    ].join("\n"),
  };
}

function biographyFallback(_input: AIRequest): FallbackResult {
  return {
    title: "Biography Failsafe",
    content: JSON.stringify({
      status: "unavailable",
      reason: "AI biography interpretation is unavailable and no behavioral biography is inferred from symbolic profile fields.",
      prompt: "Add explicit lived-experience details or retry interpretation when an AI provider is available.",
    }),
  };
}

function todayCardFallback(input: AIRequest): FallbackResult {
  const focus = suppliedFocus(input);
  return {
    title: "Today's Failsafe Guidance",
    content: [
      "RECOGNITION: I verify the pattern before I name it.",
      "MEMORY: Previous generated cards are prompts, not behavioral evidence.",
      `FOCUS: ${focus}.`,
      "TOMORROW: What result from today should change tomorrow's plan?",
      "DO:",
      "- Separate facts from assumptions.",
      "- Complete one concrete next step.",
      "- Record what actually happened.",
      "DONT:",
      "- Treat symbolism as a prediction.",
      "- Invent a motive from missing evidence.",
      "- Turn one reaction into a fixed identity.",
      "WATCHOUT:",
      "- Repeating a generic narrative because it sounds familiar.",
      "- Confusing confidence with evidence.",
      "DECISION: I use consequences, constraints, and observed results before symbolic interpretation.",
    ].join("\n"),
  };
}

function compatibilityFallback(_input: AIRequest): FallbackResult {
  return {
    title: "Compatibility Failsafe",
    content:
      "Compatibility interpretation is unavailable. No relationship score, motive, chemistry, or outcome is inferred without the governed dual-profile evidence required by the compatibility engine.",
  };
}

function genericFallback(input: AIRequest): FallbackResult {
  return neutralReflection("Codex Failsafe", input);
}

export function deterministicFallback(input: AIRequest): FallbackResult {
  switch (input.promptType as string) {
    case "soul_guide":
      return soulGuideFallback(input);
    case "daily_guidance":
      return dailyGuidanceFallback(input);
    case "daily_horoscope":
      return dailyHoroscopeFallback(input);
    case "codex_reading":
      return codexReadingFallback(input);
    case "biography":
      return biographyFallback(input);
    case "today_card":
      return todayCardFallback(input);
    case "compatibility":
      return compatibilityFallback(input);
    default:
      return genericFallback(input);
  }
}

/**
 * Legacy export retained for compatibility.
 *
 * It intentionally returns no inferred strengths/shadows from symbolic fields.
 * Consumers that need behavioral traits must use explicit assessed evidence.
 */
export function deterministicArchetypeProfile(
  _input: ArchetypeProfileInput,
): {
  strengths: string[];
  shadows: string[];
  bio: string;
  purpose: string;
} {
  return {
    strengths: [],
    shadows: [],
    bio: "No deterministic behavioral biography is inferred from astrology, numerology, element, or archetype labels.",
    purpose: "No life purpose or destiny is inferred from symbolic profile fields.",
  };
}
