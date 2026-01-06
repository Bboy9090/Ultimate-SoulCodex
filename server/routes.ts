import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { birthDataSchema, enneagramAssessmentSchema, mbtiAssessmentSchema } from "@shared/schema";
import { calculateAstrology, getTarotBirthCards } from "./services/astrology";
import { calculateNumerology } from "./services/numerology";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype } from "./services/archetype";
import { generateBiography, generateDailyGuidance } from "./services/openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a soul profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const birthData = birthDataSchema.parse(req.body);
      
      // Calculate all systems
      const astrologyData = calculateAstrology({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        latitude: parseFloat(String(birthData.latitude)),
        longitude: parseFloat(String(birthData.longitude)),
        timezone: birthData.timezone
      });
      
      const numerologyData = calculateNumerology(birthData.name, birthData.birthDate);
      
      // Get Tarot birth cards
      const tarotCards = getTarotBirthCards(birthData.birthDate);
      
      // Basic archetype synthesis (will be enhanced with personality data)
      const archetypeData = synthesizeArchetype(astrologyData, numerologyData, {});
      
      // Generate biography and guidance
      const biography = await generateBiography({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData
      });
      
      const dailyGuidance = await generateDailyGuidance({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData
      });
      
      // Create profile
      const profile = await storage.createProfile({
        userId: null, // Guest profile for now
        name: birthData.name,
        birthDate: new Date(birthData.birthDate),
        birthTime: birthData.birthTime,
        birthLocation: birthData.birthLocation,
        timezone: birthData.timezone,
        latitude: String(birthData.latitude),
        longitude: String(birthData.longitude),
        isPremium: false,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetypeData: {
          ...archetypeData,
          tarotCards
        },
        biography,
        dailyGuidance
      });
      
      res.json(profile);
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
      
      // Save assessment
      await storage.createAssessment({
        profileId,
        assessmentType: 'enneagram',
        responses: assessment.responses,
        calculatedType: enneagramResult?.type?.toString() || null
      });
      
      // Update profile with personality data
      const updatedPersonalityData = {
        ...profile.personalityData as any,
        enneagram: enneagramResult
      };
      
      // Re-synthesize archetype with new data
      const archetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: {
          ...archetypeData,
          tarotCards: (profile.archetypeData as any)?.tarotCards
        }
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
      
      // Save assessment
      await storage.createAssessment({
        profileId,
        assessmentType: 'mbti',
        responses: assessment.responses,
        calculatedType: mbtiResult?.type || null
      });
      
      // Update profile with personality data
      const updatedPersonalityData = {
        ...profile.personalityData as any,
        mbti: mbtiResult
      };
      
      // Re-synthesize archetype with new data
      const archetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: {
          ...archetypeData,
          tarotCards: (profile.archetypeData as any)?.tarotCards
        }
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
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // In a real app, this would process payment first
      
      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true
      });
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error upgrading profile:", error);
      res.status(500).json({ message: "Failed to upgrade profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
