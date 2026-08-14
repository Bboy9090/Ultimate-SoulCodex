import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession } from "./session";
import { registerConsumerAuthRoutes } from "./routes/consumer-auth";
import { profileBelongsToActor } from "./lib/profile-ownership";
import {
  birthDataSchema,
  enneagramAssessmentSchema,
  mbtiAssessmentSchema,
} from "@shared/schema";
import {
  calculateVerifiedAstrology,
  getTarotBirthCards,
  type AstrologyData,
} from "./services/astrology-production";
import { calculateNumerology } from "./services/numerology";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype } from "./services/archetype";
import {
  generateBiography,
  generateDailyGuidance,
} from "./services/openai-service";
import { registerGalacticCodeRoutes } from "./routes/galactic-code";
import { buildNatalReportPdf } from "./natalReportPdf";

function finiteCoordinate(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function withVerifiedLegacyAliases(astrologyData: AstrologyData) {
  return {
    ...astrologyData,
    sunSign: astrologyData.sun.verificationStatus === "verified" ? astrologyData.sun.sign : null,
    moonSign: astrologyData.moon.verificationStatus === "verified" ? astrologyData.moon.sign : null,
    risingSign: astrologyData.rising.verificationStatus === "verified" ? astrologyData.rising.sign : null,
  };
}

function requestOwnsProfile(req: any, profile: any): boolean {
  return profileBelongsToActor(profile, {
    userId: req.session?.userId ?? null,
    sessionId: req.sessionID ?? null,
  });
}

function profileNotFound(res: any) {
  // Deliberately do not reveal whether another user's profile ID exists.
  return res.status(404).json({ message: "Profile not found" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);
  registerConsumerAuthRoutes(app);

  app.delete("/api/auth/account", async (req: any, res) => {
    try {
      const userId = req.session?.userId ?? null;
      const sessionId = req.sessionID || null;
      if (userId) await storage.deleteUserAccount(userId);
      else if (sessionId) await storage.deleteSessionData(sessionId);
      else return res.status(400).json({ message: "No account or session data was found to delete." });

      const finish = () => {
        res.clearCookie("connect.sid");
        return res.json({ message: "All your data has been permanently deleted." });
      };
      if (!req.session) return finish();
      req.session.destroy((destroyErr: unknown) => {
        if (destroyErr) console.error("[DeleteAccount] Session destroy failed:", destroyErr);
        finish();
      });
    } catch (error) {
      console.error("[DeleteAccount] Failed:", error);
      res.status(500).json({ message: "Failed to delete account data" });
    }
  });

  app.post("/api/profiles", async (req: any, res) => {
    try {
      const birthData = birthDataSchema.parse(req.body);
      const verifiedAstrologyData = await calculateVerifiedAstrology({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        latitude: finiteCoordinate(birthData.latitude),
        longitude: finiteCoordinate(birthData.longitude),
        timezone: birthData.timezone,
      });
      const astrologyData = withVerifiedLegacyAliases(verifiedAstrologyData);
      const numerologyData = calculateNumerology(birthData.name, birthData.birthDate);
      const tarotCards = getTarotBirthCards(birthData.birthDate);
      const archetypeData = synthesizeArchetype(astrologyData, numerologyData, {});
      const biography = await generateBiography({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData,
      });
      const dailyGuidance = await generateDailyGuidance({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData,
      });

      const authenticatedUserId = req.session?.userId ?? null;
      const profile = await storage.createProfile({
        userId: authenticatedUserId,
        sessionId: authenticatedUserId ? null : (req.sessionID ?? null),
        name: birthData.name,
        birthDate: new Date(birthData.birthDate),
        birthTime: birthData.birthTime,
        birthLocation: birthData.birthLocation,
        timezone: birthData.timezone,
        latitude: birthData.latitude === undefined ? null : String(birthData.latitude),
        longitude: birthData.longitude === undefined ? null : String(birthData.longitude),
        isPremium: false,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetypeData: { ...archetypeData, tarotCards },
        biography,
        dailyGuidance,
      });
      if (!authenticatedUserId && req.session) req.session.profileCreated = true;
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.get("/api/profiles/:id", async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.post("/api/profiles/:id/enneagram", async (req: any, res) => {
    try {
      const assessment = enneagramAssessmentSchema.parse(req.body);
      const profileId = req.params.id;
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      const enneagramResult = calculateEnneagram(assessment.responses);
      await storage.createAssessment({ profileId, assessmentType: "enneagram", responses: assessment.responses, calculatedType: enneagramResult?.type?.toString() || null });
      const updatedPersonalityData = { ...(profile.personalityData as any), enneagram: enneagramResult };
      const archetypeData = synthesizeArchetype(profile.astrologyData, profile.numerologyData, updatedPersonalityData);
      const updatedProfile = await storage.updateProfile(profileId, { personalityData: updatedPersonalityData, archetypeData: { ...archetypeData, tarotCards: (profile.archetypeData as any)?.tarotCards } });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error processing Enneagram assessment:", error);
      res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  app.post("/api/profiles/:id/mbti", async (req: any, res) => {
    try {
      const assessment = mbtiAssessmentSchema.parse(req.body);
      const profileId = req.params.id;
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      const mbtiResult = calculateMBTI(assessment.responses);
      await storage.createAssessment({ profileId, assessmentType: "mbti", responses: assessment.responses, calculatedType: mbtiResult?.type || null });
      const updatedPersonalityData = { ...(profile.personalityData as any), mbti: mbtiResult };
      const archetypeData = synthesizeArchetype(profile.astrologyData, profile.numerologyData, updatedPersonalityData);
      const updatedProfile = await storage.updateProfile(profileId, { personalityData: updatedPersonalityData, archetypeData: { ...archetypeData, tarotCards: (profile.archetypeData as any)?.tarotCards } });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error processing MBTI assessment:", error);
      res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  // Retired direct-card upgrade route. Soul Codex never accepts PAN, expiry,
  // or security-code data into application memory. Premium purchase starts only
  // through the hosted checkout routes registered in server/billing.ts.
  app.post("/api/profiles/:id/upgrade", (_req, res) => {
    res.status(410).json({
      message: "Direct card upgrades are retired. Use hosted checkout to purchase premium access.",
      code: "direct_card_upgrade_retired",
    });
  });

  app.get("/api/pdf/profile/:id", async (req: any, res) => {
    try {
      const profileId = req.params.id;
      const authToken = req.headers.authorization?.split(" ")[1];
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      if (!profile.isPremium) return res.status(403).json({ message: "Premium access required" });
      if (!authToken || authToken !== profileId) return res.status(401).json({ message: "Unauthorized access to this profile" });
      const pdfBuffer = await buildNatalReportPdf({
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime || "",
        birthLocation: profile.birthLocation || "",
        astrology: profile.astrologyData || {},
        humanDesign: {},
        aiText: {
          overview: profile.biography || "Your cosmic profile awaits.",
          bigThreeSun: "", bigThreeMoon: "", bigThreeRising: "", whatStandsOut: [], workingInterpretation: "", elementEmphasis: "", houseEmphasis: "", bottomLine: profile.dailyGuidance || "", hdInterpretation: "",
        },
        isPremium: true,
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${profile.name}-soul-codex.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Compatibility is mounted once, before registerRoutes(), by server/index.ts
  // through the evidence-aware router in routes/compatibility.ts. Do not add a
  // second naked-sign or Human Design compatibility path here: alternate routes
  // become alternate truth policies.

  registerGalacticCodeRoutes(app);
  return createServer(app);
}