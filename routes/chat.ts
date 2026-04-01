import type { Express } from "express";
import { storage } from "../storage";
import { isAnyProviderAvailable, streamChatMulti } from "../services/ai-provider";
import { soulGuideFallback, answerFromProfile } from "../services/soul-guide-fallback";
import {
  buildSoulCodexSystemPrompt,
  SOUL_CODEX_ENGINE_RULES,
  OUTPUT_FORMAT_INSTRUCTIONS,
  DIRECT_MODE_INSTRUCTIONS,
} from "../src/ai/soulCodexEngine";

const REFLECTION_PROMPTS = [
  "What pattern am I not seeing right now?",
  "Where am I confusing comfort with growth?",
  "What would I do differently if I trusted myself more?",
  "What am I tolerating that I shouldn't be?",
  "What is this phase actually teaching me?",
];

const TONE_INSTRUCTIONS: Record<string, string> = {
  oracle: "Respond as a grounded oracle. Centered, authoritative, slightly poetic but never vague. Speak truth with calm certainty. Every statement must be specific — no abstract generalizations.",
  mirror: "Respond as a behavioral mirror. Describe what the person actually does, how it shows up in real life, and what drives it. No judgment, just accurate reflection. Name the behavior, the trigger, and the consequence.",
  strategy: "Respond as a strategic advisor. Focus on what to do next, what to stop, and what to prioritize. Concrete, actionable, zero filler. Every recommendation must be something the person can do today.",
  direct: "DIRECT MODE. Shorter. More blunt. No soft language. No metaphors. No hedging. Say the uncomfortable thing plainly. If there's a hard truth, lead with it.",
};

export function registerChatRoutes(app: Express) {

  app.post("/api/chat/soul-guide/fallback", async (req, res) => {
    try {
      const { profileContext, question } = req.body || {};

      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionID;

      let profile: any = profileContext || null;
      if (!profile && userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (!profile && sessionId) {
        const profiles = await storage.getAllProfiles();
        profile = profiles.find((p: any) => (p as any).sessionId === sessionId);
      }

      if (question && profile) {
        const answer = answerFromProfile(question, profile);
        return res.json({
          status: "fallback",
          answer,
          reflectionPrompts: REFLECTION_PROMPTS.slice(0, 3),
        });
      }

      const fallback = soulGuideFallback(profile || {});
      return res.json({ ...fallback, reflectionPrompts: REFLECTION_PROMPTS });
    } catch (error) {
      console.error("[Soul Guide Fallback] Error:", error);
      return res.json(soulGuideFallback({}));
    }
  });

  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [], profileContext, tone, deeper, directMode } = req.body || {};

      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionID;

      let profile: any = null;
      if (userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (sessionId) {
        const profiles = await storage.getAllProfiles();
        profile = profiles.find((p: any) => (p as any).sessionId === sessionId);
      }

      const isDirectMode = directMode === true || tone === "direct";

      let systemInstruction = buildSoulCodexSystemPrompt({
        directMode: isDirectMode,
        includePatternDetection: true,
      });

      systemInstruction += "\n\n";
      systemInstruction += profile
        ? buildProfileContextPrompt(profile)
        : (profileContext ? buildProfileContextPrompt(profileContext) : buildGeneralPrompt());

      const toneKey = (tone || "oracle").toLowerCase();
      if (toneKey !== "direct" && TONE_INSTRUCTIONS[toneKey]) {
        systemInstruction += `\n\nTone: ${TONE_INSTRUCTIONS[toneKey]}`;
      }

      if (deeper) {
        systemInstruction += "\n\nThe user wants a deeper answer. Go further than the surface. Explain the underlying pattern, why it formed, and what maintaining or changing it would cost. Include a **Pattern** section if you detect repeated behavior.";
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const chatHistory = history.map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        content: h.parts?.[0]?.text || h.text || h.content || "",
      }));

      const stream = streamChatMulti({
        systemInstruction,
        history: chatHistory,
        message,
        temperature: 0.8,
      });

      for await (const content of stream) {
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("[Soul Guide Chat] Error:", error);
      if (!res.headersSent) {
        return res.status(500).json({
          message: "The Soul Guide is reconnecting. Please try again in a moment."
        });
      }
    }
  });
}

function buildProfileContextPrompt(profile: any): string {
  const astro = profile.astrologyData || profile;
  const numData = profile.numerologyData || profile;
  const hdData = profile.humanDesignData || profile;
  const archData = profile.archetypeData || profile;
  const moralData = profile.moralCompassData || profile;

  const parts: string[] = [];

  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (archData?.archetype || archData?.name || profile.archetype)
    parts.push(`Archetype: ${archData.archetype || archData.name || (typeof profile.archetype === "string" ? profile.archetype : profile.archetype?.name) || ""}`);
  if (astro?.sunSign || profile.sunSign)
    parts.push(`Sun: ${astro.sunSign || profile.sunSign}`);
  if (astro?.moonSign || profile.moonSign)
    parts.push(`Moon: ${astro.moonSign || profile.moonSign}`);
  if (astro?.risingSign || profile.risingSign)
    parts.push(`Rising: ${astro.risingSign || profile.risingSign}`);
  if (astro?.planets?.mercury?.sign) parts.push(`Mercury: ${astro.planets.mercury.sign}`);
  if (astro?.planets?.venus?.sign) parts.push(`Venus: ${astro.planets.venus.sign}`);
  if (astro?.planets?.mars?.sign) parts.push(`Mars: ${astro.planets.mars.sign}`);
  if (numData?.lifePath || profile.lifePath)
    parts.push(`Life Path: ${numData.lifePath || profile.lifePath}`);
  if (numData?.soulUrge) parts.push(`Soul Urge: ${numData.soulUrge}`);
  if (numData?.expressionNumber) parts.push(`Expression: ${numData.expressionNumber}`);
  if (hdData?.type || profile.hdType)
    parts.push(`Human Design: ${hdData.type || profile.hdType}`);
  if (hdData?.strategy) parts.push(`Strategy: ${hdData.strategy}`);
  if (hdData?.authority) parts.push(`Authority: ${hdData.authority}`);
  if (archData?.element || profile.element)
    parts.push(`Element: ${archData.element || profile.element}`);
  if (archData?.role || profile.role)
    parts.push(`Role: ${archData.role || profile.role}`);
  if (moralData?.compassType)
    parts.push(`Moral Compass: ${moralData.compassType}`);
  if (moralData?.coreValues?.length)
    parts.push(`Values: ${moralData.coreValues.slice(0, 3).join(", ")}`);
  if (profile.synthesis?.coreEssence || profile.coreEssence)
    parts.push(`Core Essence: ${profile.synthesis?.coreEssence || profile.coreEssence}`);
  if (profile.synthesis?.stressPattern)
    parts.push(`Stress Pattern: ${profile.synthesis.stressPattern}`);

  return `CONTEXT — Soul Guide (personalized)

User's chart and profile:
${parts.join("\n")}

RULES:
- Reference their specific placements when answering. Cite Sun, Moon, Mercury, Venus, Mars signs by name.
- Explain how their Human Design type, strategy, and authority affect the situation.
- Connect numerology Life Path to the broader pattern.
- Use behavioral language: what they do, how it shows up, what it costs.
- Give practical, actionable insight — every response must include something the user can do today.
- No vague mystical phrases. No "the universe," no "cosmic blueprint," no "a shift is happening."
- Every statement must point to a real behavior, decision, or situation.
- Tone: confident, grounded, direct.`;
}

function buildGeneralPrompt(): string {
  return `CONTEXT — Soul Guide (general)

The user hasn't created a profile yet.

RULES:
- Encourage creating a profile for personalized guidance.
- Answer general questions without vague filler.
- Be direct and practical.
- Every response must include a concrete action the user can take.
- No "cosmic blueprint," no "your journey," no spiritual clichés.
- No abstract language — every sentence should describe something observable or actionable.`;
}
