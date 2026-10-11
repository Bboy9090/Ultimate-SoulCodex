import { randomBytes } from "crypto";
import type { Express } from "express";
import rateLimit from "express-rate-limit";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession } from "./session";
import { registerConsumerAuthRoutes } from "./routes/consumer-auth";
import { profileBelongsToActor } from "./lib/profile-ownership";
import {
  durableFeatureUnavailable,
  DURABLE_STORAGE_UNAVAILABLE_RESPONSE,
} from "./lib/persistence-capabilities";
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
import { calculateProfileHumanDesign, ProfileHumanDesignError } from "./services/profile-human-design";
import { storedProfileVerificationHandler } from "./routes/stored-profile-verification";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype } from "./services/archetype";
import {
  generateBiography,
  generateDailyGuidance,
} from "./services/openai-service";
import { buildNatalReportPdf } from "./natalReportPdf";
import {
  buildNatalReportInput,
  natalReportFilename,
} from "./lib/natal-report-contract";
import {
  buildPublicProfileProjection,
  publicShareSelectionSchema,
} from "./lib/public-profile-projection";
import { resolveProductEntitlementForUser } from "./lib/product-entitlement";
import { tierAllowsCapability } from "@shared/product-access";
import { registerBillingRoutes } from "./billing";

function finiteCoordinate(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function verifiedLegacySign(placement: any): string | null {
  const evidence = placement?.provenance ?? placement?.evidence;
  const evidenceComplete = Boolean(
    typeof evidence?.source === "string" && evidence.source.trim() &&
    typeof evidence?.engine === "string" && evidence.engine.trim() &&
    typeof evidence?.calculatedAt === "string" &&
    evidence.calculatedAt.trim() &&
    !Number.isNaN(Date.parse(evidence.calculatedAt))
  );
  return placement?.verificationStatus === "verified" &&
    evidenceComplete &&
    typeof placement?.sign === "string" &&
    placement.sign.trim()
    ? placement.sign.trim()
    : null;
}

function withVerifiedLegacyAliases(astrologyData: AstrologyData) {
  return {
    ...astrologyData,
    sunSign: verifiedLegacySign(astrologyData.sun),
    moonSign: verifiedLegacySign(astrologyData.moon),
    risingSign: verifiedLegacySign(astrologyData.rising),
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

function requireDurableFeature(res: any): boolean {
  if (!durableFeatureUnavailable()) return true;
  res.status(503).json(DURABLE_STORAGE_UNAVAILABLE_RESPONSE);
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);
  registerConsumerAuthRoutes(app);
  registerBillingRoutes(app);
  app.post("/api/profiles/:id/verify-systems", rateLimit({ windowMs: 60_000, max: 5 }), storedProfileVerificationHandler({ storage, requireDurableFeature }));

  app.get("/api/access", async (req: any, res) => {
    try {
      const userId = req.session?.userId ?? null;
      const entitlement = await resolveProductEntitlementForUser(storage, userId);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      res.status(200).json({
        ...entitlement,
        resolvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[ProductAccess] Failed to resolve entitlement:", error);
      res.status(500).json({
        tier: "free",
        source: "free",
        verified: false,
        plan: null,
        status: null,
        expiresAt: null,
        lastVerifiedAt: null,
        resolvedAt: null,
      });
    }
  });

  const publicShareReadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many public share requests. Please try again later.", code: "public_share_rate_limited" },
  });
  const publicShareMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many share changes. Please try again later.", code: "public_share_mutation_rate_limited" },
  });

  app.delete("/api/auth/account", async (req: any, res) => {
    try {
      const userId = req.session?.userId ?? null;
      const sessionId = req.sessionID || null;
      if (userId) await storage.deleteUserAccount(userId);
      else if (sessionId) await storage.deleteSessionData(sessionId);
      else return res.status(400).json({ message: "No account or session data was found to delete." });

      const finish = () => {
        res.clearCookie("connect.sid");
        return res.json({
          message: "Your account and profile data have been deleted. Minimal billing and security audit records may be retained where required for financial integrity, fraud prevention, or legal obligations and are not used to restore personalization.",
        });
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
    if (!requireDurableFeature(res)) return;
    try {
      const birthData = birthDataSchema.parse(req.body);
      const humanDesignData = calculateProfileHumanDesign(birthData);
      const verifiedAstrologyData = await calculateVerifiedAstrology({
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime,
        latitude: finiteCoordinate(birthData.latitude),
        longitude: finiteCoordinate(birthData.longitude),
        timezone: birthData.timezone,
      });
      const astrologyData = withVerifiedLegacyAliases(verifiedAstrologyData);
      const numerologyData = calculateNumerology(birthData.fullBirthName, birthData.birthDate);
      const tarotCards = getTarotBirthCards(birthData.birthDate);
      const archetypeData = synthesizeArchetype(astrologyData, numerologyData, {}, humanDesignData);
      const biography = await generateBiography({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        humanDesignData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData,
      });
      const dailyGuidance = await generateDailyGuidance({
        name: birthData.name,
        archetypeTitle: archetypeData.title,
        astrologyData,
        humanDesignData,
        numerologyData,
        personalityData: {},
        archetype: archetypeData,
      });

      const authenticatedUserId = req.session?.userId ?? null;
      const profile = await storage.createProfile({
        userId: authenticatedUserId,
        sessionId: authenticatedUserId ? null : (req.sessionID ?? null),
        name: birthData.name,
        fullBirthName: birthData.fullBirthName?.trim() || null,
        birthDate: new Date(birthData.birthDate),
        birthTime: birthData.birthTime,
        birthLocation: birthData.birthLocation,
        timezone: birthData.timezone,
        latitude: birthData.latitude === undefined ? null : String(birthData.latitude),
        longitude: birthData.longitude === undefined ? null : String(birthData.longitude),
        isPremium: false,
        humanDesignData,
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
      if (error instanceof ProfileHumanDesignError) return res.status(422).json({ message: error.message, code: "human_design_unresolved" });
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

  app.get("/api/profiles/:id/public-shares", publicShareMutationLimiter, async (req: any, res) => {
    if (!requireDurableFeature(res)) return;
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);

      const shares = await storage.listPublicProfileShares(profile.id);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      res.json(shares.map((share) => ({
        token: share.token,
        path: `/shared/${share.token}`,
        snapshot: share.snapshot,
        createdAt: share.createdAt,
        revokedAt: share.revokedAt,
      })));
    } catch (error) {
      console.error("Error listing public profile shares:", error);
      res.status(500).json({ message: "Failed to list public shares" });
    }
  });

  app.post("/api/profiles/:id/public-shares", publicShareMutationLimiter, async (req: any, res) => {
    if (!requireDurableFeature(res)) return;
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);

      const selection = publicShareSelectionSchema.parse(req.body);
      const existingShares = await storage.listPublicProfileShares(profile.id);
      const activeShareCount = existingShares.filter((share) => !share.revokedAt).length;
      if (activeShareCount >= 10) {
        return res.status(409).json({
          message: "This profile already has 10 active public links. Revoke an older link before creating another.",
          code: "public_share_active_limit",
        });
      }

      const snapshot = buildPublicProfileProjection(profile, selection);
      if (Object.keys(snapshot.fields).length === 0) {
        return res.status(422).json({ message: "None of the selected fields are currently eligible for public sharing." });
      }

      const token = randomBytes(32).toString("base64url");
      await storage.createPublicProfileShare(profile.id, token, snapshot);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      res.status(201).json({
        token,
        path: `/shared/${token}`,
        snapshot,
      });
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({ message: "Invalid public share selection", issues: error.issues });
      }
      console.error("Error creating public profile share:", error);
      res.status(500).json({ message: "Failed to create public share" });
    }
  });

  app.delete("/api/profiles/:id/public-shares/:token", publicShareMutationLimiter, async (req: any, res) => {
    if (!requireDurableFeature(res)) return;
    try {
      const share = await storage.getPublicProfileShareByToken(req.params.token);
      if (!share || share.revokedAt || share.profileId !== req.params.id) return profileNotFound(res);

      const profile = await storage.getProfile(share.profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);

      await storage.revokePublicProfileShare(share.token);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      res.status(204).end();
    } catch (error) {
      console.error("Error revoking public profile share:", error);
      res.status(500).json({ message: "Failed to revoke public share" });
    }
  });

  app.get("/api/public-shares/:token", publicShareReadLimiter, async (req, res) => {
    try {
      const token = String(req.params.token ?? "");
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return profileNotFound(res);

      const share = await storage.getPublicProfileShareByToken(token);
      if (!share || share.revokedAt) return profileNotFound(res);

      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.json(share.snapshot);
    } catch (error) {
      console.error("Error loading public profile share:", error);
      res.status(500).json({ message: "Failed to load public share" });
    }
  });

  app.post("/api/profiles/:id/enneagram", async (req: any, res) => {
    if (!requireDurableFeature(res)) return;
    try {
      const assessment = enneagramAssessmentSchema.parse(req.body);
      const profileId = req.params.id;
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      const enneagramResult = calculateEnneagram(assessment.responses);
      await storage.createAssessment({ profileId, assessmentType: "enneagram", responses: assessment.responses, calculatedType: enneagramResult?.type?.toString() || null });
      const updatedPersonalityData = { ...(profile.personalityData as any), enneagram: enneagramResult };
      const archetypeData = synthesizeArchetype(profile.astrologyData, profile.numerologyData, updatedPersonalityData, profile.humanDesignData);
      const biography = await generateBiography({
        name: profile.name,
        archetypeTitle: archetypeData.title,
        astrologyData: profile.astrologyData,
        humanDesignData: profile.humanDesignData,
        numerologyData: profile.numerologyData,
        personalityData: updatedPersonalityData,
        archetype: archetypeData,
      });
      const dailyGuidance = await generateDailyGuidance({
        name: profile.name,
        archetypeTitle: archetypeData.title,
        astrologyData: profile.astrologyData,
        humanDesignData: profile.humanDesignData,
        numerologyData: profile.numerologyData,
        personalityData: updatedPersonalityData,
        archetype: archetypeData,
      });
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: { ...archetypeData, tarotCards: (profile.archetypeData as any)?.tarotCards },
        biography,
        dailyGuidance,
      });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error processing Enneagram assessment:", error);
      res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  app.post("/api/profiles/:id/mbti", async (req: any, res) => {
    if (!requireDurableFeature(res)) return;
    try {
      const assessment = mbtiAssessmentSchema.parse(req.body);
      const profileId = req.params.id;
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      const mbtiResult = calculateMBTI(assessment.responses);
      await storage.createAssessment({ profileId, assessmentType: "mbti", responses: assessment.responses, calculatedType: mbtiResult?.type || null });
      const updatedPersonalityData = { ...(profile.personalityData as any), mbti: mbtiResult };
      const archetypeData = synthesizeArchetype(profile.astrologyData, profile.numerologyData, updatedPersonalityData, profile.humanDesignData);
      const biography = await generateBiography({
        name: profile.name,
        archetypeTitle: archetypeData.title,
        astrologyData: profile.astrologyData,
        humanDesignData: profile.humanDesignData,
        numerologyData: profile.numerologyData,
        personalityData: updatedPersonalityData,
        archetype: archetypeData,
      });
      const dailyGuidance = await generateDailyGuidance({
        name: profile.name,
        archetypeTitle: archetypeData.title,
        astrologyData: profile.astrologyData,
        humanDesignData: profile.humanDesignData,
        numerologyData: profile.numerologyData,
        personalityData: updatedPersonalityData,
        archetype: archetypeData,
      });
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData: { ...archetypeData, tarotCards: (profile.archetypeData as any)?.tarotCards },
        biography,
        dailyGuidance,
      });
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
      const profile = await storage.getProfile(profileId);
      if (!profile || !requestOwnsProfile(req, profile)) return profileNotFound(res);
      const userId = req.session?.userId ?? null;
      const entitlement = await resolveProductEntitlementForUser(storage, userId);
      if (!tierAllowsCapability(entitlement.tier, "premium_exports")) {
        return res.status(403).json({
          message: "Soul Codex+ access required",
          code: "soul_codex_plus_required",
        });
      }

      // Ownership is established by the same user/session policy as the profile
      // itself. Do not require a second pseudo-secret equal to the profile ID.
      const pdfBuffer = await buildNatalReportPdf(buildNatalReportInput(profile));
      const filename = natalReportFilename(profile.name);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
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

  // Galactic Code remains an internal deterministic service until a
  // server-owned evidence adapter can supply verified astrology, deterministic
  // numerology, assessed behavior, and a verified Human Design trust record.
  // Do not mount its legacy caller-supplied route as a production synthesis
  // boundary: clients cannot self-attest that candidate values are verified.
  return createServer(app);
}
