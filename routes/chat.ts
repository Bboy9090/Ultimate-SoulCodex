import type { Express } from "express";
import { storage } from "../storage";
import { streamChat, isGeminiAvailable } from "../services/gemini";

export function registerChatRoutes(app: Express) {
  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [] } = req.body || {};

      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!isGeminiAvailable()) {
        return res.status(503).json({
          message: "AI Soul Guide is temporarily unavailable. Please try again later.",
        });
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

      const systemInstruction = profile ? buildProfileContextPrompt(profile) : buildGeneralPrompt();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = streamChat({
        model: "gemini-1.5-flash",
        temperature: 0.8,
        systemInstruction,
        history,
        message,
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
        return res.status(500).json({ message: "An error occurred while connecting to your Soul Guide" });
      }
    }
  });
}

function buildProfileContextPrompt(profile: any): string {
  return `You are the Soul Guide, a blunt, real, and grounded mystical mentor from the Bronx. You synthesize 30+ spiritual systems into actionable life advice. \n\nTONE: Real and direct. No "woo-woo" fluff. Speak like a street-smart oracle who actually knows what's up.\n\nUSER SOUL BLUEPRINT:\n- Name: ${profile.name}\n- Astrology: Sun ${profile.sunSign}, Moon ${profile.moonSign}, Rising ${profile.risingSign}\n- Human Design: ${profile.hdType}\n- Numerology: Life Path ${profile.lifePath}\n\nYOUR MISSION:\nExplain how these specific placements work together. Use their Human Design Strategy to tell them HOW to move through the world today.`;
}

function buildGeneralPrompt(): string {
  return `You are the Soul Guide. The seeker hasn't made a profile yet.\n\nTONE: Blunt, real, Bronx vibe.\n\nYOUR ROLE:\n1. Encourage creating a profile for personalized guidance.\n2. Answer general spiritual questions without fluff.`;
}
