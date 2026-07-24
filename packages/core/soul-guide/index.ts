import { generateSoulGuidePrompt } from "./prompt.js";
import type { SoulGuideInterpretation, SoulGuideOptions } from "./types.js";
import type { TimelineIntelligenceSummary } from "../timeline-intelligence/types.js";

const STORAGE_KEY = "soulcodex.soulGuide.v1";

export type { SoulGuideInterpretation, SoulGuideOptions };
export * from "./depth-types.js";
export * from "./depth-prompt.js";
export * from "./depth-parser.js";
export * from "./depth-fallback.js";
export * from "./depth-view-model.js";

/**
 * Generates a Soul Guide prompt for Claude to interpret Timeline Intelligence data.
 * The prompt is designed to prevent the AI from inventing evidence while enabling
 * thoughtful interpretation of the measured data.
 */
export function generateSoulGuidePromptText(
  summary: TimelineIntelligenceSummary,
  options?: SoulGuideOptions
): string {
  return generateSoulGuidePrompt(summary, options);
}

/**
 * Parses Claude's JSON response into a SoulGuideInterpretation.
 * Validates structure and ensures all required fields are present.
 */
export function parseSoulGuideResponse(
  response: string
): SoulGuideInterpretation | null {
  try {
    // Extract JSON from the response (Claude may include markdown formatting)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !parsed.theme ||
      !parsed.narrative ||
      !Array.isArray(parsed.reflectionPrompts) ||
      !Array.isArray(parsed.nextSteps) ||
      !Array.isArray(parsed.keyInsights)
    ) {
      return null;
    }

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      theme: parsed.theme,
      narrative: parsed.narrative,
      reflectionPrompts: parsed.reflectionPrompts.slice(0, 3),
      nextSteps: parsed.nextSteps.slice(0, 2),
      keyInsights: parsed.keyInsights.slice(0, 3),
      dataPointsAnalyzed: 0,
      confidenceInInterpretation: "Moderate",
    };
  } catch {
    return null;
  }
}

/**
 * Saves a SoulGuideInterpretation to localStorage for offline access.
 */
export function saveSoulGuideInterpretation(
  interpretation: SoulGuideInterpretation
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interpretation));
  } catch (e) {
    console.warn("[soulGuide] Failed to save interpretation:", e);
  }
}

/**
 * Loads the most recent SoulGuideInterpretation from localStorage.
 */
export function loadSoulGuideInterpretation(): SoulGuideInterpretation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;

    const parsed = JSON.parse(raw);
    if (
      parsed.version === 1 &&
      parsed.theme &&
      parsed.narrative &&
      Array.isArray(parsed.reflectionPrompts) &&
      Array.isArray(parsed.nextSteps) &&
      Array.isArray(parsed.keyInsights)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clears the cached Soul Guide interpretation.
 */
export function clearSoulGuideCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[soulGuide] Failed to clear cache:", e);
  }
}
