import type { Express } from "express";
import { storage } from "../storage";
import { routeAIStream } from "../services/ai-router";
import { entitlementService } from "../services/entitlement-service";
import { buildSoulCodexSystemPrompt } from "../src/ai/soulCodexEngine";
import { runSoulCodexEngine } from "@soulcodex/core";



export function registerChatRoutes(app: Express) {
  app.post("/api/chat/soul-guide", async (req, res) => {
    try {
      const { message, history = [], profileContext } = req.body || {};

      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }



      const userId   = (req as any).user?.id;
      const sessionId = (req as any).sessionID;
      const session  = (req as any).session;

      // ── Premium check ────────────────────────────────────────────────────
      let isPremium = false;

      if ((req as any).session?.isPremium) {
        isPremium = true;
      }

      if (!isPremium) {
        const ownerProfileId = process.env.OWNER_PROFILE_ID;
        if (ownerProfileId && userId) {
          try {
            const dbProfile = await storage.getProfileByUserId(userId);
            if (dbProfile?.id === ownerProfileId) isPremium = true;
          } catch (err) {
            console.warn("[soul-guide] Owner profile lookup failed:", err);
          }
          if (!isPremium && userId === ownerProfileId) isPremium = true;
        }
      }

      if (!isPremium) {
        try {
          const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
          isPremium = status.isPremium;
        } catch (err) {
          console.warn("[soul-guide] Entitlement check failed:", err);
        }
      }

      // ── Profile context ──────────────────────────────────────────────────
      let profile: any = null;
      if (userId) {
        profile = await storage.getProfileByUserId(userId);
      } else if (sessionId) {
        const profiles = await storage.getAllProfiles();
        profile = profiles.find((p: any) => (p as any).sessionId === sessionId);
      }

      const hasProfileData = !!profile || !!profileContext;
      const dynamicLimit = hasProfileData ? 2 : 1;

      // ── Usage gate ───────────────────────────────────────────────────────
      if (!isPremium) {
        const chatCount: number = session?.chatCount ?? 0;
        if (chatCount >= dynamicLimit) {
          return res.status(403).json({
            error: "limit_reached",
            used: chatCount,
            limit: dynamicLimit,
          });
        }
        // Increment before streaming so failed streams still count
        if (session) session.chatCount = chatCount + 1;
      }

      // ── Engine Data ─────────────────────────────────────────────────────
      let systemInstruction = "";
      
      if (profile) {
        const engineData = runSoulCodexEngine({
          toneMode: "challenging",
          astrology: {
            sun: profile.sunSign,
            moon: profile.moonSign,
            rising: profile.risingSign,
          },
          human_design: {
            type: profile.hdType,
          },
          numerology: {
            life_path: profile.lifePath,
          },
          mirror: profile.mirrorProfile,
        });

        systemInstruction = buildSoulCodexSystemPrompt({
          directMode: true,
          includePatternDetection: true,
        }, engineData);
      } else if (profileContext) {
        systemInstruction = buildProfileContextPrompt(profileContext);
      } else {
        systemInstruction = buildGeneralPrompt();
      }


      // ── Stream ───────────────────────────────────────────────────────────
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = routeAIStream({
        promptType: "chat",
        systemInstruction,
        history,
        message,
        temperature: 0.8,
      });

      for await (const { chunk } of stream) {
        if (chunk) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
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

  // Return current question usage for the session
  app.get("/api/chat/soul-guide/usage", async (req, res) => {
    try {
      const userId    = (req as any).user?.id;
      const sessionId = (req as any).sessionID;
      const session   = (req as any).session;

      let isPremium = false;
      if ((req as any).session?.isPremium) {
        isPremium = true;
      }
      if (!isPremium) {
        const ownerProfileId = process.env.OWNER_PROFILE_ID;
        if (ownerProfileId && userId) {
          try {
            const dbProfile = await storage.getProfileByUserId(userId);
            if (dbProfile?.id === ownerProfileId) isPremium = true;
          } catch {}
          if (!isPremium && userId === ownerProfileId) isPremium = true;
        }
      }
      if (!isPremium) {
        try {
          const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
          isPremium = status.isPremium;
        } catch {}
      }

      const hasLocalProfile = req.query.hasProfile === 'true';
      let profile: any = null;
      if (userId) {
        try { profile = await storage.getProfileByUserId(userId); } catch {}
      } else if (sessionId) {
        try {
          const profiles = await storage.getAllProfiles();
          profile = profiles.find((p: any) => (p as any).sessionId === sessionId);
        } catch {}
      }
      
      const hasProfileData = !!profile || hasLocalProfile;
      const limit = hasProfileData ? 2 : 1;

      const used  = isPremium ? 0 : (session?.chatCount ?? 0);
      res.json({ isPremium, used, limit, remaining: isPremium ? null : Math.max(0, limit - used) });
    } catch (err) {
      console.error("[soul-guide usage]", err);
      res.status(500).json({ error: "usage_check_failed" });
    }
  });
}

function buildProfileContextPrompt(profile: any): string {
  const parts = [];
  if (profile.name) parts.push(`- Name: ${profile.name}`);
  if (profile.archetype) parts.push(`- Archetype: ${profile.archetype}`);
  if (profile.sunSign || profile.moonSign || profile.risingSign) {
    parts.push(`- Astrology: Sun ${profile.sunSign || 'Unknown'}, Moon ${profile.moonSign || 'Unknown'}, Rising ${profile.risingSign || 'Unknown'}`);
  }
  if (profile.hdType) parts.push(`- Human Design: ${profile.hdType}`);
  if (profile.lifePath) parts.push(`- Numerology: Life Path ${profile.lifePath}`);
  if (profile.element) parts.push(`- Element: ${profile.element}`);
  if (profile.role) parts.push(`- Role: ${profile.role}`);
  if (profile.coreEssence) parts.push(`- Core Essence: ${profile.coreEssence}`);

  return `You are the Soul Guide, a blunt, real, and grounded mystical mentor from the Bronx. You synthesize 30+ spiritual systems into actionable life advice. \n\nTONE: Real and direct. No "woo-woo" fluff. Speak like a street-smart oracle who actually knows what's up.\n\nUSER SOUL BLUEPRINT:\n${parts.join('\n')}\n\nYOUR MISSION:\nExplain how these specific placements work together. Use their Human Design Strategy to tell them HOW to move through the world today.`;
}

function buildGeneralPrompt(): string {
  return `You are the Soul Guide. The seeker hasn't made a profile yet.\n\nTONE: Blunt, real, Bronx vibe.\n\nYOUR ROLE:\n1. Encourage creating a profile for personalized guidance.\n2. Answer general spiritual questions without fluff.`;
}
