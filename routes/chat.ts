import type { Express } from "express";
import { storage } from "../storage";
import { isAnyProviderAvailable, streamChatMulti } from "../services/ai-provider";

export function registerChatRoutes(app: Express) {
  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [], profileContext } = req.body || {};

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

      const systemInstruction = profile
        ? buildProfileContextPrompt(profile)
        : (profileContext ? buildProfileContextPrompt(profileContext) : buildGeneralPrompt());

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
  if (numData?.lifePath || profile.lifePath)
    parts.push(`Life Path: ${numData.lifePath || profile.lifePath}`);
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
  if (profile.synthesis?.coreEssence || profile.coreEssence)
    parts.push(`Core Essence: ${profile.synthesis?.coreEssence || profile.coreEssence}`);

  return `You are the Soul Guide inside the Soul Codex app.

User profile:
${parts.join("\n")}

Rules:
- Answer directly and clearly.
- Avoid vague mystical phrases. No "the universe," no "cosmic blueprint," no "your journey."
- Explain behavior patterns in real life terms.
- Give practical, actionable insight.
- Use their specific placements to personalize every answer.
- Reference how their Human Design Strategy affects their decisions when relevant.
- Tone: confident, grounded, direct. Like a street-smart oracle who actually knows what's up.`;
}

function buildGeneralPrompt(): string {
  return `You are the Soul Guide inside the Soul Codex app.

The user hasn't created a profile yet.

Rules:
- Encourage creating a profile for personalized guidance.
- Answer general questions without vague filler.
- Be direct and practical.
- No "cosmic blueprint," no "your journey," no spiritual clichés.`;
}
