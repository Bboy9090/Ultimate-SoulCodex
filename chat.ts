import type { Express } from "express";
import { storage } from "../storage";
import { streamChat, isGeminiAvailable } from "../services/gemini";

export function registerChatRoutes(app: Express) {
  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!isGeminiAvailable()) {
        return res.status(503).json({ 
          message: "AI Soul Guide is temporarily unavailable. Please try again later." 
        });
      }

      const userId = (req as any).user?.id;
      const sessionId = req.sessionID;

      let profile = null;
      if (userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (sessionId) {
        const profiles = await storage.getAllProfiles();
        profile = profiles.find(p => (p as any).sessionId === sessionId);
      }

      const systemInstruction = profile 
        ? buildProfileContextPrompt(profile)
        : buildGeneralPrompt();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = streamChat({
        model: "gemini-1.5-flash", // Use 1.5 for better reliability
        temperature: 0.8,
        systemInstruction,
        history,
        message
      });

      for await (const content of stream) {
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('[Soul Guide Chat] Error:', error);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: "An error occurred while connecting to your Soul Guide" 
        });
      }
    }
  });
}

function buildProfileContextPrompt(profile: any): string {
  return `You are the Soul Guide, a blunt, real, and grounded mystical mentor from the Bronx. You synthesize 30+ spiritual systems into actionable life advice. 

TONE: Real and direct. No "woo-woo" fluff. Speak like a street-smart oracle who actually knows what's up. Use your user's Virgo Sun/Moon and Scorpio Rising energy to ground the conversation.

HARD GUARDRAILS:
1. NO MEDICAL ADVICE: If asked about health/mental state, say: "I’m a soul guide, not a doctor. Take that to a professional."
2. NO FORTUNE TELLING: Do not predict the future. Use "potential," "tendency," and "opportunity."
3. NO NONSENSE: If the user is being vague, call it out.

USER SOUL BLUEPRINT:
- Name: ${profile.name}
- Astrology: Sun ${profile.sunSign}, Moon ${profile.moonSign}, Rising ${profile.risingSign}
- Human Design: ${profile.hdType} (Strategy: ${profile.hdStrategy})
- Numerology: Life Path ${profile.lifePath}

YOUR MISSION:
Explain how these specific placements work together. Use their Human Design Strategy to tell them HOW to move through the world today. Keep it 100.`;
}

function buildGeneralPrompt(): string {
  return `You are the Soul Guide. The seeker hasn't made a profile yet. 

TONE: Blunt, real, Bronx vibe.

YOUR ROLE:
1. Tell them straight up: "I can't see your blueprint until you create a profile. Create a profile so I can actually see your blueprint."
2. Answer general spiritual questions without the flowery nonsense.`;
}
