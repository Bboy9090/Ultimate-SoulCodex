import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { entitlementService } from "../../services/entitlement-service";
import { buildTodayCard } from "./todayRender";
import { generateTimeline, generateSoulCodexOutputV1 } from "@soulcodex/core";

function asToneMode(raw: unknown): "clean" | "deep" | "raw" {
  return raw === "deep" || raw === "raw" ? raw : "clean";
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  // Entitlements used for premium boundaries
  app.get("/api/entitlements", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id || null;
      const sessionId = req.sessionID || null;
      const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
      return res.json(status);
    } catch (error) {
      console.error("[Entitlements] Error:", error);
      return res.status(500).json({ message: "Failed to load entitlements" });
    }
  });

  // Profiles
  app.post("/api/profiles", async (req, res) => {
    try {
      const profile = await storage.createProfile(req.body as any);
      return res.json(profile);
    } catch (error) {
      console.error("[CreateProfile] Error:", error);
      return res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      return res.json(profile);
    } catch (error) {
      console.error("[GetProfile] Error:", error);
      return res.status(500).json({ message: "Failed to load profile" });
    }
  });

  // Soul Codex Output Schema v1 (canonical)
  app.get("/api/profiles/:id/soul-codex-v1", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const tone_mode = asToneMode((req.query as any)?.tone_mode);
      const payload = generateSoulCodexOutputV1({ profile, profileId: req.params.id, toneMode: tone_mode });
      return res.json(payload);
    } catch (error) {
      console.error("[SoulCodexV1] Error:", error);
      return res.status(500).json({ message: "Failed to generate Soul Codex v1" });
    }
  });

  // Today (used by apps/web TodayPage)
  app.post("/api/today/render", async (req, res) => {
    try {
      const { horoscopeData, profile, codexSynthesis } = req.body || {};
      const card = buildTodayCard(horoscopeData, profile, codexSynthesis);
      return res.json(card);
    } catch (error) {
      console.error("[TodayRender] Error:", error);
      return res.status(500).json({ message: "Failed to render today card" });
    }
  });

  // Timeline (used by apps/web TimelinePage)
  app.post("/api/timeline/current", async (req, res) => {
    try {
      const { profile, fullChart, currentDateISO } = req.body || {};
      const out = generateTimeline({
        profile,
        fullChart,
        currentDateISO: currentDateISO || new Date().toISOString(),
      } as any);
      return res.json(out);
    } catch (error) {
      console.error("[TimelineCurrent] Error:", error);
      return res.status(500).json({ message: "Failed to generate timeline" });
    }
  });

  return createServer(app);
}

