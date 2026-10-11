import type { Request, Response } from "express";
import { z } from "zod";
import { profileBelongsToActor } from "../lib/profile-ownership";
import { calculateVerifiedAstrology } from "../services/astrology-production";
import { calculateProfileHumanDesign, ProfileHumanDesignError } from "../services/profile-human-design";
import { synthesizeArchetype } from "../services/archetype";
import { generateBiography, generateDailyGuidance } from "../services/openai-service";
import type { Profile } from "@shared/schema";
import { calculateNumerology } from "../services/numerology";

export function storedProfileVerificationHandler(dependencies: {
  storage: { getProfile(id: string): Promise<Profile | undefined>; updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> };
  requireDurableFeature(res: Response): boolean;
  calculateAstrology?: typeof calculateVerifiedAstrology;
}) {
  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    if (!dependencies.requireDurableFeature(res)) return;
    try {
      if (!z.object({}).strict().safeParse(req.body ?? {}).success) {
        return res.status(400).json({ message: "Verification uses the saved birth details; overrides are not accepted." });
      }
      const profile = await dependencies.storage.getProfile(req.params.id);
      if (!profile || !profileBelongsToActor(profile, {
        userId: (req as any).session?.userId ?? null, sessionId: (req as any).sessionID ?? null,
      })) return res.status(404).json({ message: "Profile not found" });
      const birthDate = new Date(profile.birthDate).toISOString().slice(0, 10);
      const input = {
        birthDate, birthTime: profile.birthTime ?? undefined, timezone: profile.timezone ?? undefined,
        latitude: profile.latitude ?? undefined, longitude: profile.longitude ?? undefined,
      };
      const humanDesignData = calculateProfileHumanDesign(input);
      const astrologyData = await (dependencies.calculateAstrology ?? calculateVerifiedAstrology)({
        ...input, latitude: input.latitude?.trim() ? Number(input.latitude) : undefined,
        longitude: input.longitude?.trim() ? Number(input.longitude) : undefined,
      });
      const numerologyData = calculateNumerology(profile.fullBirthName ?? undefined, birthDate);
      const archetypeData = synthesizeArchetype(astrologyData, numerologyData, profile.personalityData, humanDesignData);
      const narrative = { name: profile.name, archetypeTitle: archetypeData.title, astrologyData,
        humanDesignData, numerologyData, personalityData: profile.personalityData, archetype: archetypeData };
      const biography = await generateBiography(narrative);
      const dailyGuidance = await generateDailyGuidance(narrative);
      // Re-check ownership after external calculation before committing a write.
      const current = await dependencies.storage.getProfile(profile.id);
      if (!current || !profileBelongsToActor(current, { userId: (req as any).session?.userId ?? null, sessionId: (req as any).sessionID ?? null })) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (["birthDate", "birthTime", "timezone", "latitude", "longitude", "fullBirthName", "name", "personalityData", "archetypeData", "numerologyData"].some((key) => JSON.stringify((current as any)[key]) !== JSON.stringify((profile as any)[key]))) {
        return res.status(409).json({ message: "Birth details changed during verification. Retry using the saved details." });
      }
      return res.json(await dependencies.storage.updateProfile(profile.id, {
        astrologyData, humanDesignData, numerologyData, archetypeData: { ...(profile.archetypeData as any), ...archetypeData }, biography, dailyGuidance,
      }));
    } catch (error) {
      if (error instanceof ProfileHumanDesignError) return res.status(422).json({ message: error.message, code: "human_design_unresolved" });
      console.error("[StoredProfileVerification] failed:", error);
      return res.status(503).json({ message: "Profile verification is temporarily unavailable. Your saved profile remains unchanged." });
    }
  };
}
