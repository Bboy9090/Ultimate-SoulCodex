/**
 * Shared AI endpoint — POST /api/ai/respond
 *
 * Every AI feature can route through this single gateway.
 * Returns a consistent AIResponse shape. Never returns a dead error.
 */

import type { Express } from "express";
import { routeAIRequest } from "../services/ai-router";
import {
  buildSoulCodexSystemPrompt,
  SOUL_CODEX_ENGINE_RULES,
  CORE_DATA_RULE,
} from "../src/ai/soulCodexEngine";
import type { AIPromptType } from "../src/types/ai";

function buildPromptForType(
  type: AIPromptType,
  question: string,
  profile: any,
  timeline?: any,
  dailyCard?: any
): { prompt: string; systemPrompt?: string } {
  const astro = profile?.astrologyData || {};
  const numData = profile?.numerologyData || {};
  const hdData = profile?.humanDesignData || {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};

  const archetype =
    archData?.archetype ||
    archData?.name ||
    (typeof profile?.archetype === "string" ? profile.archetype : profile?.archetype?.name) ||
    "Unknown";
  const sunSign = astro?.sunSign || profile?.sunSign || "Unknown";
  const moonSign = astro?.moonSign || profile?.moonSign || "Unknown";
  const risingSign = astro?.risingSign || profile?.risingSign || "";
  const lifePath = numData?.lifePath || profile?.lifePath || "";
  const hdType = hdData?.type || profile?.hdType || "";
  const hdStrategy = hdData?.strategy || "";
  const primaryElement = elemData?.primaryElement || archData?.element || profile?.element || "";
  const phase = timeline?.phase || timeline?.currentPhase || "current phase";
  const focus = dailyCard?.focus || "one grounded next step";

  const profileBlock = `
User Profile:
- Archetype: ${archetype}
- Sun: ${sunSign} | Moon: ${moonSign}${risingSign ? ` | Rising: ${risingSign}` : ""}
${lifePath ? `- Life Path: ${lifePath}` : ""}
${hdType ? `- Human Design: ${hdType}${hdStrategy ? ` (Strategy: ${hdStrategy})` : ""}` : ""}
${primaryElement ? `- Element (Elemental Medicine): ${primaryElement}` : ""}
- Phase: ${phase}
- Focus: ${focus}`.trim();

  const systemPrompt = buildSoulCodexSystemPrompt({ includePatternDetection: true });

  switch (type) {
    case "soul_guide":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\nUser question:\n${question}\n\nRespond with Observation, Meaning, Action. Reference their core data by name.`,
      };

    case "daily_guidance":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\nGenerate a daily guidance card. Use the Observation → Meaning → Action format. Reference at least 3 of their core data points by name. Write in first person (I/my/me).`,
      };

    case "daily_horoscope":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\nWrite a daily horoscope using Observation → Meaning → Action. Reference Sun, Moon, and at least one other core data point. Write in first person. Keep it to 4-6 sentences total.`,
      };

    case "codex_reading":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\nGenerate a premium Codex reading. Be psychologically sharp, behavior-based, and directly useful. Reference all available core data points. Write in first person. Minimum 400 words.`,
      };

    case "biography":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\nWrite a 2-3 paragraph first-person behavioral profile. Reference Sun, Moon, Rising, Life Path, Human Design, and Element by name. Every sentence must describe something observable.`,
      };

    case "compatibility":
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\n${question || "Generate a compatibility reading between these two profiles."}`,
      };

    default:
      return {
        systemPrompt,
        prompt: `${profileBlock}\n\n${question || "Provide insight based on this profile."}`,
      };
  }
}

export function registerAIRespondRoute(app: Express) {
  app.post("/api/ai/respond", async (req, res) => {
    try {
      const { type, question, profile, timeline, dailyCard } = req.body || {};

      if (!type) {
        return res.status(400).json({ error: "Missing AI request type" });
      }

      const { prompt, systemPrompt } = buildPromptForType(
        type as AIPromptType,
        question || "What matters most right now?",
        profile,
        timeline,
        dailyCard
      );

      const result = await routeAIRequest({
        prompt,
        systemPrompt,
        promptType: type as AIPromptType,
        temperature: 0.8,
        profile,
        timeline,
        dailyCard,
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[AI Respond] Unexpected error:", error);
      return res.status(200).json({
        status: "fallback",
        provider: "deterministic",
        content:
          "Your Codex is available. Live AI interpretation is temporarily paused — use the strongest visible signal on the page as your guide for now.",
        meta: {
          reason: error?.message || "Unexpected server error",
          promptType: req.body?.type,
        },
      });
    }
  });
}
