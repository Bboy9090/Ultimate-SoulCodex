/**
 * Shared AI endpoint — POST /api/ai/respond
 *
 * Every AI feature routes through this gateway. Astrology enters prompts only
 * after the server-side verification filter clears it.
 */

import type { Express } from "express";
import { routeAIRequest } from "../services/ai-router";
import { buildSoulCodexSystemPrompt } from "../src/ai/soulCodexEngine";
import type { AIPromptType } from "../src/types/ai";
import { extractVerifiedAstrology } from "../server/lib/verified-astrology";

function buildPromptForType(
  type: AIPromptType,
  question: string,
  profile: any,
  timeline?: any,
  dailyCard?: any
): { prompt: string; systemPrompt?: string } {
  const numData = profile?.numerologyData || {};
  const hdData = profile?.humanDesignData || {};
  const elemData = profile?.elementalMedicineData || {};
  const archData = profile?.archetypeData || profile?.archetype || {};
  const verifiedAstrology = extractVerifiedAstrology(profile);

  const archetype =
    archData?.archetype ||
    archData?.name ||
    (typeof profile?.archetype === "string" ? profile.archetype : profile?.archetype?.name) ||
    "Unresolved";
  const lifePath = numData?.lifePath || profile?.lifePath || "";
  const hdType = hdData?.type || profile?.hdType || "";
  const hdStrategy = hdData?.strategy || "";
  const primaryElement = elemData?.primaryElement || archData?.element || profile?.element || "";
  const phase = timeline?.phase || timeline?.currentPhase || "current phase";
  const focus = dailyCard?.focus || "one grounded next step";
  const birthTimeKnown = Boolean(verifiedAstrology.rising);

  const astrologyLines = [
    verifiedAstrology.sun ? `- Sun: ${verifiedAstrology.sun}` : null,
    verifiedAstrology.moon ? `- Moon: ${verifiedAstrology.moon}` : null,
    verifiedAstrology.rising ? `- Rising: ${verifiedAstrology.rising}` : null,
    verifiedAstrology.unresolved.length
      ? `- Unresolved astrology: ${verifiedAstrology.unresolved.join(", ")}. Do not infer or interpret these placements.`
      : null,
  ].filter(Boolean).join("\n");

  const profileBlock = `
User Profile:
- Archetype: ${archetype}
${astrologyLines || "- Astrology: unresolved; do not infer placements."}
${lifePath ? `- Life Path: ${lifePath}` : ""}
${hdType ? `- Human Design: ${hdType}${hdStrategy ? ` (Strategy: ${hdStrategy})` : ""}` : ""}
${primaryElement ? `- Element (Elemental Medicine): ${primaryElement}` : ""}
- Phase: ${phase}
- Focus: ${focus}`.trim();

  const systemPrompt = `${buildSoulCodexSystemPrompt({ includePatternDetection: true, birthTimeKnown })}\n\nTRUST RULE: Use only explicitly supplied profile facts. Never invent, recover, infer, or upgrade unresolved placements.`;

  switch (type) {
    case "soul_guide":
      return { systemPrompt, prompt: `${profileBlock}\n\nUser question:\n${question}\n\nRespond with Observation, Meaning, Action. Reference only available core data.` };
    case "daily_guidance":
      return { systemPrompt, prompt: `${profileBlock}\n\nGenerate a daily guidance card using Observation → Meaning → Action. Use only available, supported data.` };
    case "daily_horoscope":
      return { systemPrompt, prompt: `${profileBlock}\n\nWrite daily guidance from verified astrology only. If no verified astrology is available, clearly state that the astrology layer is paused and use supported non-astrology context instead.` };
    case "codex_reading":
      return { systemPrompt, prompt: `${profileBlock}\n\nGenerate a psychologically sharp Codex reading. Reference all available supported data and omit unresolved layers. Minimum 400 words.` };
    case "biography":
      return { systemPrompt, prompt: `${profileBlock}\n\nWrite a 2-3 paragraph first-person behavioral profile. Every sentence must describe something observable and supported by available data.` };
    case "compatibility":
      return { systemPrompt, prompt: `${profileBlock}\n\n${question || "Generate a compatibility reading between these two evidence-cleared profiles."}` };
    default:
      return { systemPrompt, prompt: `${profileBlock}\n\n${question || "Provide insight based on the supported profile data."}` };
  }
}

export function registerAIRespondRoute(app: Express) {
  app.post("/api/ai/respond", async (req, res) => {
    try {
      const { type, question, profile, timeline, dailyCard } = req.body || {};
      if (!type) return res.status(400).json({ error: "Missing AI request type" });

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
        content: "Your Codex is available. Live AI interpretation is temporarily paused. Use the strongest supported signal visible on the page.",
        meta: { reason: error?.message || "Unexpected server error", promptType: req.body?.type },
      });
    }
  });
}
