import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  birthDataSchema,
  enneagramAssessmentSchema,
  mbtiAssessmentSchema,
} from "@shared/schema";
import {
  calculateVerifiedAstrology,
  getTarotBirthCards,
} from "./services/astrology";
import { calculateNumerology } from "./services/numerology";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype } from "./services/archetype";
import {
  generateBiography,
  generateDailyGuidance,
} from "./services/openai-service";
import { registerGalacticCodeRoutes } from "./routes/galactic-code";
import {
  calculateArchetypeMatches,
  getMatchesByMode,
  type RelationshipMode,
} from "../services/archetype-matches";
import { buildNatalReportPdf } from "./natalReportPdf";

function finiteCoordinate(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a soul profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const birthData = birthDataSchema.parse(req.body);

      const astrologyData = await calculateVerifiedAstrology({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        latitude: finiteCoordinate(birthData.latitude),
        longitude: finiteCoordinate(birthData.longitude),
        timezone: birthData.timezone,
      });

      const numerologyData = calculateNumerology(
        birthData.name,
        birthData.birthDate,
      );

      const tarotCards = getTarotBirthCards(birthData.birthDate);

      // Archetype and AI layers receive the evidence-traceable astrology object.
      // They are not permitted to pull values from legacy sunSign/moonSign keys.
      const archetypeData = synthesizeArchetype(
        astrologyData,
        numerologyData,
        {},
      );

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

      const profile = await storage.createProfile({
        userId: null,
        name: birthData.name,
        birthDate: new Date(birthData.birthDate),
        birthTime: birthData.birthTime,
        birthLocation: birthData.birthLocation,
        timezone: birthData.timezone,
        latitude:
          birthData.latitude === undefined ? null : String(birthData.latitude),
        longitude:
          birthData.longitude === undefined ? null : String(birthData.longitude),
        isPremium: false,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetypeData: {
          ...archetypeData,
          tarotCards,
        },
        biography,
        dailyGuidance,
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Get a profile
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  // Submit Enneagram assessment
  app.post("/api/profiles/:id/enneagram", async (req, res) => {
    try {
      const assessment = enneagramAssessmentSchema.parse(req.body);
      const profileId = req.params.id;

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const enneagramResult = calculateEnneagram(assessment.responses);

      await storage.createAssessment({
        profileId,
        assessmentType: "enneagram",
        responses: assessment.responses,
        calculatedType: enneagramResult?.type?.toString() || null,
      });

      const updatedPersonalityData = {
        ...(profile.personalityData as any),
        enneagram: enneagramResult,
      };

      const archetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData,
      );

      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: {
          ...archetypeData,
          tarotCards: (profile.archetypeData as any)?.tarotCards,
        },
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error processing Enneagram assessment:", error);
      res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  // Submit MBTI assessment
  app.post("/api/profiles/:id/mbti", async (req, res) => {
    try {
      const assessment = mbtiAssessmentSchema.parse(req.body);
      const profileId = req.params.id;

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const mbtiResult = calculateMBTI(assessment.responses);

      await storage.createAssessment({
        profileId,
        assessmentType: "mbti",
        responses: assessment.responses,
        calculatedType: mbtiResult?.type || null,
      });

      const updatedPersonalityData = {
        ...(profile.personalityData as any),
        mbti: mbtiResult,
      };

      const archetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData,
      );

      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: {
          ...archetypeData,
          tarotCards: (profile.archetypeData as any)?.tarotCards,
        },
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error processing MBTI assessment:", error);
      res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  // Upgrade to premium
  app.post("/api/profiles/:id/upgrade", async (req, res) => {
    try {
      const profileId = req.params.id;
      const authToken = req.headers.authorization?.split(" ")[1];
      const { cardNumber, expiryDate, cvv } = req.body;

      if (!authToken || authToken !== profileId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!cardNumber || !expiryDate || !cvv) {
        return res
          .status(400)
          .json({ message: "Payment information is required" });
      }

      if (cardNumber.length < 13) {
        return res.status(400).json({ message: "Invalid card number" });
      }

      if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
        return res.status(400).json({ message: "Invalid expiry date" });
      }

      if (cvv.length < 3) {
        return res.status(400).json({ message: "Invalid CVV" });
      }

      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true,
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error("Error upgrading profile:", error);
      res.status(500).json({ message: "Failed to upgrade profile" });
    }
  });

  // Download PDF report (premium only)
  app.get("/api/pdf/profile/:id", async (req, res) => {
    try {
      const profileId = req.params.id;
      const authToken = req.headers.authorization?.split(" ")[1];

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!profile.isPremium) {
        return res.status(403).json({ message: "Premium access required" });
      }

      if (!authToken || authToken !== profileId) {
        return res
          .status(401)
          .json({ message: "Unauthorized access to this profile" });
      }

      const pdfBuffer = await buildNatalReportPdf({
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime || "",
        birthLocation: profile.birthLocation || "",
        astrology: profile.astrologyData || {},
        humanDesign: {},
        aiText: {
          overview: profile.biography || "Your cosmic profile awaits.",
          bigThreeSun: "",
          bigThreeMoon: "",
          bigThreeRising: "",
          whatStandsOut: [],
          workingInterpretation: "",
          elementEmphasis: "",
          houseEmphasis: "",
          bottomLine: profile.dailyGuidance || "",
          hdInterpretation: "",
        },
        isPremium: true,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${profile.name}-soul-codex.pdf"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Compatibility archetype matches
  app.post("/api/compatibility/archetype-matches", (req, res) => {
    try {
      const { sunSign, lifePathNumber, hdType, mode = "love" } = req.body;

      if (!sunSign) {
        return res.status(400).json({ message: "sunSign is required" });
      }

      const all = calculateArchetypeMatches(
        sunSign,
        lifePathNumber,
        hdType,
        mode as RelationshipMode,
      );

      const { best, challenging } = getMatchesByMode(
        sunSign,
        lifePathNumber,
        hdType,
        mode as RelationshipMode,
      );

      res.json({
        all,
        best,
        challenging,
      });
    } catch (error) {
      console.error("Error calculating archetype matches:", error);
      res.status(500).json({ message: "Failed to calculate compatibility" });
    }
  });

  registerGalacticCodeRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
