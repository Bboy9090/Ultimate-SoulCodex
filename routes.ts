import type { Express } from "express";
import appleSignin from "apple-signin-auth";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { birthDataSchema, enneagramAssessmentSchema, mbtiAssessmentSchema, type Profile, type User, signupSchema, loginSchema } from "./shared/schema";
import { sendTestNotificationSchema, broadcastNotificationSchema } from "./shared/notification-schemas";
import { calculateAstrology } from "./services/astrology";
import { getAstroProvider } from "./server/astro/provider";
import { buildPosterSvg, type PosterData as PosterSvgData } from "./server/posterSvg";
import sharp from "sharp";
import { calculateNumerology } from "./services/numerology";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype, generateIntegrationAnalysis, generatePersonalizedInsights } from "./services/archetype";
import { generateBiography, generateDailyGuidance } from "./services/openai";
import { calculateHumanDesign } from "@soulcodex/astrology";
import { generateDailyInsights } from "./services/daily-insights";
import type { RelationshipMode } from "./services/archetype-matches";
import { getMoonPhase, getMoonSign, getCurrentHDGate, calculateUniversalDayNumber, calculatePersonalDayNumber } from "./services/daily-context";
import { calculateMoralCompass } from "./services/moral-compass";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./auth";
import { hashPassword, verifyPassword } from "./auth/passwordUtils";
import { randomUUID } from "crypto";
import { calculateActiveTransits, extractNatalPositions } from "./services/transits";
import { generateDailyHoroscope } from "./services/horoscope";
import { getActiveTransmutationTechniques } from "./services/transmutation";
import { calculateCongruenceScore } from "./services/congruence";
import { registerChatRoutes } from "./routes/chat";
import { getAllPrompts, getPromptByCategory, getPromptById, getTransitPrompt, getMoodBasedPrompt } from "./services/journaling";
import { finalOutputGuard, routeAIRequest } from "./services/ai-router";
import { generateRelationshipAutopsy } from "./services/relationship-autopsy";
import { generateTransitsCalendar, getUpcomingSignificantTransits } from "./services/transits-calendar";
import { generateProfilePDF, generateTransitsPDF, renderPDF } from "./services/pdf-generator";
import { createShareableLink, getShareableProfile, updateShareableLink, deactivateShareableLink, getUserShareableLinks } from "./services/shareable-links";
import { checkAndNotifySignificantTransits, getUpcomingTransitNotifications } from "./services/transit-notifications";

import { SubscriptionService } from "./services/subscription-service";
import { entitlementService } from "./services/entitlement-service";
import { runWithTimeoutAndTiming, TIMEOUT_VALUES } from "./utils/timeout";
import { geocodeLocation } from "./geocoding";
import * as geoTz from "geo-tz";
import { formatInTimeZone } from "date-fns-tz";
import { resolveGeo } from "./server/geo/index";
import { computeConfidence } from "./soulcodex/compute/confidence";
import { buildTodayCard, buildTodayCardSvg } from "./server/todayRender";
import { buildNatalReportPdf } from "./server/natalReportPdf";
import { buildNatalReportInput, natalReportFilename } from "./server/lib/natal-report-contract";
import { profileBelongsToActor } from "./server/lib/profile-ownership";
import { extractVerifiedAstrology } from "./server/lib/verified-astrology";
import { collectSignals } from "./soulcodex/codex30/registry";
import { scoreThemes } from "./soulcodex/codex30/synth/score";
import { compileBulletLists, pickCodename } from "./soulcodex/codex30/synth/compile";
import { isGeneric, scoreOutput } from "./soulcodex/codex30/synth/quality";
import { narratorPrompt } from "./soulcodex/codex30/prompts/narrator";
import { rewritePrompt } from "./soulcodex/codex30/prompts/rewrite";
import { calcLifePath, getContradictionHint, getBehavioralStatements, checkNarrative, type AntiGenericContext, type MirrorAnswers } from "@soulcodex/core";
import { VOICE_LAWS } from "./soulcodex/codex30/prompts/voice_laws";
import { pureText } from "./services/sanitizer";


// Utility function for consistent error responses
function profileLocalDateKey(
  profile: { timezone?: unknown },
  now: Date = new Date(),
): string {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new RangeError("Profile-local date requires a valid instant");
  }

  const timezone =
    typeof profile?.timezone === "string" && profile.timezone.trim()
      ? profile.timezone.trim()
      : "UTC";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(now);
  } catch {
    throw new RangeError(`Invalid profile timezone: ${timezone}`);
  }

  return formatInTimeZone(now, timezone, "yyyy-MM-dd");
}


function handleError(error: unknown, res: any, context: string) {
  console.error(`[${context}] Error:`, error);
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = fromZodError(error as any);
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: validationError.details,
      details: error.errors 
    });
  }
  
  // Handle known error types
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes("unauthorized") || error.message.includes("forbidden")) {
      return res.status(403).json({ message: error.message });
    }
    
    // Generic error with message
    return res.status(500).json({ 
      message: error.message || "An unexpected error occurred",
      context 
    });
  }
  
  // Unknown error type
  return res.status(500).json({ 
    message: "An unexpected error occurred",
    context 
  });
}

import compatibilityRoutes, { buildMatchResponse } from "./routes/compatibility";
import { getVapidPublicKey } from "./services/push-notifications";
import { insertPushSubscriptionSchema } from "./shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);
  
  // Mount chat routes
  registerChatRoutes(app);
  
  // Mount compatibility routes
  app.use("/api", compatibilityRoutes);

  // Local Authentication Endpoints
  
  // Sign up with email/password
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getLocalUserByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      // Hash password
      const passwordHash = await hashPassword(data.password);
      
      // Create user record
      const userId = randomUUID();
      const user = await storage.upsertUser({
        id: userId,
        email: data.email,
        firstName: data.name || null,
        lastName: null,
        profileImageUrl: null,
      });
      
      // Create local credentials
      await storage.createLocalUser(userId, data.email, passwordHash);
      
      // Capture sessionId BEFORE login (for anonymous data migration)
      const previousSessionId = req.sessionID;
      console.log(`[Signup] Previous session before login: ${previousSessionId}`);
      
      // Log user in (create session)
      req.login({ id: userId, email: data.email, authProvider: 'local' }, async (err) => {
        if (err) {
          console.error("Login error after signup:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        // Migrate anonymous data from session to user
        if (previousSessionId) {
          try {
            // Migrate soul profile first (if exists)
            const profileMigrated = await storage.migrateSoulProfileFromSessionToUser(previousSessionId, userId);
            if (profileMigrated) {
              console.log(`[Signup] Migrated soul profile for new user ${userId}`);
            }
            
            // Then migrate persons (for compatibility)
            await storage.migratePersonsFromSessionToUser(previousSessionId, userId);
            console.log(`[Signup] Migrated anonymous data for new user ${userId}`);
          } catch (migrationError) {
            console.error("[Signup] Failed to migrate anonymous data:", migrationError);
            // Don't fail signup if migration fails
          }
        }
        
        res.json({ user, message: "Account created successfully" });
      });
    } catch (error) {
      handleError(error, res, "Signup");
    }
  });

  // Log in with email/password
  // ── Authentication endpoints ──────────────────────────────────────────

  app.post('/api/auth/apple', async (req, res) => {
    const { identityToken, user: appleUser } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({ message: "identityToken is required" });
    }

    try {
      // Verify the Apple Identity Token
      // audience is usually the App Bundle ID (e.g. com.soulcodex.app)
      const data = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID, 
        ignoreExpiration: false,
      });

      const { sub: appleId, email } = data;

      // 1. Get or Create user
      let user = await storage.getUserByAppleId(appleId);
      
      if (!user) {
        console.log(`[AppleAuth] Creating new user for appleId: ${appleId}`);
        user = await storage.upsertUser({
          id: randomUUID(),
          appleId,
          email: email || appleUser?.email || null,
          firstName: appleUser?.name?.firstName || null,
          lastName: appleUser?.name?.lastName || null,
          subscriptionStatus: "free",
        });
      } else {
        console.log(`[AppleAuth] Found existing user: ${user.id}`);
      }

      // 2. Establish session
      req.login(user, (err) => {
        if (err) return handleError(err, res, "AppleAuthLogin");
        res.json({ user, message: "Successfully authenticated with Apple" });
      });

    } catch (err) {
      handleError(err, res, "AppleAuthVerify");
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user by email
      const localUser = await storage.getLocalUserByEmail(data.email);
      if (!localUser) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValid = await verifyPassword(localUser.passwordHash, data.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Update last login
      await storage.updateLocalUserLastLogin(localUser.id);
      
      // Get full user data
      const user = await storage.getUser(localUser.id);
      
      // Capture sessionId BEFORE login (for anonymous data migration)
      const previousSessionId = req.sessionID;
      
      // Log user in (create session)
      req.login({ id: localUser.id, email: localUser.email, authProvider: 'local' }, async (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        // Migrate anonymous data from session to user
        if (previousSessionId) {
          try {
            // Migrate soul profile first (if exists)
            const profileMigrated = await storage.migrateSoulProfileFromSessionToUser(previousSessionId, localUser.id);
            if (profileMigrated) {
              console.log(`[Login] Migrated soul profile for user ${localUser.id}`);
            }
            
            // Then migrate persons (for compatibility)
            await storage.migratePersonsFromSessionToUser(previousSessionId, localUser.id);
            console.log(`[Login] Migrated anonymous data for user ${localUser.id}`);
          } catch (migrationError) {
            console.error("[Login] Failed to migrate anonymous data:", migrationError);
            // Don't fail login if migration fails
          }
        }
        
        res.json({ user, message: "Logged in successfully" });
      });
    } catch (error) {
      handleError(error, res, "Login");
    }
  });

  // Get current user (standard local auth)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Allow anonymous users - return null instead of 401
      if (!req.isAuthenticated() || !req.user) {
        return res.json(null);
      }
      
      // Standard auth user retrieval
      const user = await storage.getUser(req.user.id);
      return res.json({ ...user, authProvider: req.user.authProvider });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });


  // Logout (works for both auth methods)
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Delete account / personal data — App Store + Google Play required.
  // Works for both authenticated users (full account delete) and anonymous
  // sessions (all session-owned server data). Always destroys the session.
  app.delete('/api/auth/account', async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub || null;
      const sessionId = req.sessionID || null;

      if (userId) {
        await storage.deleteUserAccount(userId);
        console.log(`[DeleteAccount] Removed user ${userId} and all associated data`);
      } else if (sessionId) {
        await storage.deleteSessionData(sessionId);
        console.log(`[DeleteAccount] Cleared anonymous session ${sessionId} data`);
      }

      // End the session and clear premium flag for both cases
      if (req.session) req.session.isPremium = false;
      const finish = () => {
        if (!req.session) {
          res.clearCookie("connect.sid");
          return res.json({ message: "All data associated with this device session has been deleted." });
        }
        req.session.destroy((destroyErr: any) => {
          if (destroyErr) {
            console.error("[DeleteAccount] Session destroy failed:", destroyErr);
          }
          res.clearCookie("connect.sid");
          res.json({ message: "All your data has been permanently deleted." });
        });
      };
      if (req.logout) {
        req.logout((logoutErr: any) => {
          if (logoutErr) console.error("[DeleteAccount] Logout failed:", logoutErr);
          finish();
        });
      } else {
        finish();
      }
    } catch (error) {
      console.error("[DeleteAccount] Failed:", error);
      return res.status(500).json({ message: "Failed to delete account. Please try again or contact support." });
    }
  });

  // Get user entitlement status (premium access)
  app.get('/api/entitlements', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;

      if (!userId && !sessionId) {
        return res.status(401).json({ message: "Unauthorized - no user or session found" });
      }

      // Owner bypass: compare against server-side profile lookup only
      const ownerProfileId = process.env.OWNER_PROFILE_ID;
      if (ownerProfileId && userId) {
        try {
          const dbProfile = await storage.getProfileByUserId(userId);
          if (dbProfile?.id === ownerProfileId) {
            return res.json({ isPremium: true, source: "owner_bypass" });
          }
        } catch (lookupErr) {
          console.warn("[entitlements] Owner profile lookup failed:", lookupErr);
        }
        // Also allow matching userId directly (if operator set OWNER_PROFILE_ID to their userId)
        if (userId === ownerProfileId) {
          return res.json({ isPremium: true, source: "owner_bypass" });
        }
      }

      // Check session-level premium flag first (survives MemStorage resets)
      if ((req.session as any)?.isPremium) {
        return res.json({
          isPremium: true,
          source: (req.session as any).premiumSource || 'access_code',
        });
      }

      const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
      res.json(status);
    } catch (error) {
      handleError(error, res, "GetEntitlements");
    }
  });

  // ── Single premium guard ──
  // The one source of truth for gating premium endpoints. Mirrors /api/entitlements:
  // owner bypass → session flag → entitlement service (access code / subscription /
  // legacy). Returns 403 when not entitled. Apply this to every premium route.
  const requirePremium = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;

      const ownerProfileId = process.env.OWNER_PROFILE_ID;
      if (ownerProfileId && userId) {
        try {
          const dbProfile = await storage.getProfileByUserId(userId);
          if (dbProfile?.id === ownerProfileId) return next();
        } catch (e) {
          console.warn("[requirePremium] Owner lookup failed:", e);
        }
        if (userId === ownerProfileId) return next();
      }

      if ((req.session as any)?.isPremium) return next();

      if (userId || sessionId) {
        const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
        if (status.isPremium) return next();
      }

      return res.status(403).json({
        message: "Premium access required.",
        code: "PREMIUM_REQUIRED",
        upgrade: "/pricing",
      });
    } catch (error) {
      return handleError(error, res, "requirePremium");
    }
  };

  // Generate soul archetype (standalone endpoint for frontend)
  app.post("/api/soul-archetype", async (req, res) => {
    try {
      const { birth_data, user_id, all_systems, ...signals } = req.body;
      
      if (!birth_data) {
        return res.status(400).json({ message: "birth_data is required" });
      }

      // Merge signals into birth_data for validation
      const fullBirthData = {
        ...birth_data,
        ...signals
      };
      
      // Validate birth data
      const validatedBirthData = birthDataSchema.parse(fullBirthData);

      const normalizeOptionalText = (value: unknown): string | undefined => {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      };

      const normalizeCoordinateValue = (value: unknown): string | number | undefined => {
        if (typeof value === "number") {
          return Number.isFinite(value) ? value : undefined;
        }
        if (typeof value === "string") {
          const trimmed = value.trim();
          if (!trimmed) return undefined;
          const parsed = parseFloat(trimmed);
          return Number.isFinite(parsed) ? trimmed : undefined;
        }
        return undefined;
      };

      const isValidTime24 = (value: string | undefined): value is string =>
        !!value && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

      validatedBirthData.birthTime = normalizeOptionalText(validatedBirthData.birthTime);
      validatedBirthData.birthLocation = normalizeOptionalText(validatedBirthData.birthLocation);
      validatedBirthData.timezone = normalizeOptionalText(validatedBirthData.timezone);
      validatedBirthData.latitude = normalizeCoordinateValue(validatedBirthData.latitude);
      validatedBirthData.longitude = normalizeCoordinateValue(validatedBirthData.longitude);
      if (!isValidTime24(validatedBirthData.birthTime)) {
        validatedBirthData.birthTime = undefined;
      }
      
      // Geocode if lat/lng/timezone are missing but birthLocation is provided
      let resolvedGeo: Awaited<ReturnType<typeof resolveGeo>> = null;
      if (validatedBirthData.birthLocation &&
          (validatedBirthData.latitude === undefined || validatedBirthData.longitude === undefined)) {
        try {
          resolvedGeo = await resolveGeo(validatedBirthData.birthLocation);
          if (resolvedGeo) {
            validatedBirthData.latitude = resolvedGeo.lat.toString();
            validatedBirthData.longitude = resolvedGeo.lon.toString();
            if (!validatedBirthData.timezone) {
              try {
                const tzs = geoTz.find(resolvedGeo.lat, resolvedGeo.lon);
                if (tzs.length > 0) validatedBirthData.timezone = tzs[0];
              } catch (e) {
                console.error("[SoulArchetype] Timezone lookup failed:", e);
              }
            }
          }
        } catch (e) {
          console.error("[SoulArchetype] Geocoding failed:", e);
        }
      } else if (validatedBirthData.latitude !== undefined && validatedBirthData.longitude !== undefined) {
        resolvedGeo = {
          normalizedPlace: validatedBirthData.birthLocation ?? "",
          lat: parseFloat(String(validatedBirthData.latitude)),
          lon: parseFloat(String(validatedBirthData.longitude)),
          provider: "static",
        };
      }
      
      // Check if we have complete birth data
      const hasCompleteData = !!(
        validatedBirthData.birthTime && 
        validatedBirthData.birthLocation && 
        validatedBirthData.timezone && 
        validatedBirthData.latitude !== undefined && 
        validatedBirthData.longitude !== undefined
      );

      // Compute confidence badge
      const confidence = computeConfidence({
        timeUnknown: !validatedBirthData.birthTime,
        hasGeo: resolvedGeo?.lat !== undefined && resolvedGeo?.lon !== undefined,
        hasTimezone: !!validatedBirthData.timezone,
      });
      
      // Calculate core systems via cached astro provider
      let astrologyData = null;
      let astroResult = null;
      try {
        const astroProvider = getAstroProvider();
        astroResult = await astroProvider.getChart({
          dateISO: validatedBirthData.birthDate,
          time24: validatedBirthData.birthTime,
          timeUnknown: !validatedBirthData.birthTime,
          place: validatedBirthData.birthLocation ?? "Unknown",
          timezone: validatedBirthData.timezone,
          lat: validatedBirthData.latitude !== undefined ? parseFloat(String(validatedBirthData.latitude)) : undefined,
          lon: validatedBirthData.longitude !== undefined ? parseFloat(String(validatedBirthData.longitude)) : undefined,
          houseSystem: "equal",
        });

        // REUSE THE DATA - Don't recalculate!
        if (hasCompleteData) {
          // If the provider returned a result, use its underlying calculation if possible
          // In our local provider, we can just grab the data directly
          astrologyData = calculateAstrology({
            name: validatedBirthData.name,
            birthDate: validatedBirthData.birthDate,
            birthTime: validatedBirthData.birthTime!,
            birthLocation: validatedBirthData.birthLocation!,
            latitude: validatedBirthData.latitude!,
            longitude: validatedBirthData.longitude!,
            timezone: validatedBirthData.timezone!
          });
        } else {
          // Fallback for incomplete data
          astrologyData = astroResult;
        }
      } catch (error) {
        console.error("[SoulArchetype] Astrology calculation failed:", error);
      }

      // ── Normalize astrology to a single flat shape and never return silent null. ──
      // calculateAstrology() returns { sunSign, moonSign, risingSign, houses }.
      // The provider (astroResult) returns { sun, moon, rising } as STRING signs.
      // Fall back from the detailed calc to the provider chart, then flatten.
      const timeKnown = !!validatedBirthData.birthTime;
      if (!astrologyData && astroResult) {
        astrologyData = astroResult;
      }
      const usableSign = (value: unknown): string | undefined => {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        if (!trimmed || trimmed.toLowerCase() === "unknown") return undefined;
        return trimmed;
      };
      let astrologyStatus: { state: "full" | "partial" | "unavailable"; reason: string };
      if (astrologyData) {
        const a: any = astrologyData;
        const sunSign = usableSign(a.sunSign ?? a.sun);
        const moonSign = usableSign(a.moonSign ?? a.moon);
        // Honesty rule: Rising sign is ONLY valid with a resolved birth time.
        const risingSign = timeKnown ? usableSign(a.risingSign ?? a.rising) : undefined;
        const housesAvailable =
          timeKnown &&
          hasCompleteData &&
          (
            a.housesAvailable === true ||
            (Array.isArray(a.houses) && a.houses.length > 0)
          );

        if (!sunSign && !moonSign) {
          astrologyData = null;
          astrologyStatus = {
            state: "unavailable",
            reason: "No astrology placement is safely resolved from the available birth evidence. Add or correct birth time/timezone/location rather than estimating missing placements.",
          };
        } else {
          astrologyData = { ...a, sunSign, moonSign, risingSign, housesAvailable };
          if (!timeKnown) {
            astrologyStatus = {
              state: "partial",
              reason: "Birth time unknown — exact Moon/Rising and planetary degrees are withheld. A Sun sign is shown only when the birth date resolves unambiguously.",
            };
          } else if (!hasCompleteData) {
            astrologyStatus = {
              state: "partial",
              reason: "Birth location or timezone is incomplete — only placements supported by the available civil-time evidence are returned; Rising sign and houses stay withheld.",
            };
          } else {
            astrologyStatus = {
              state: "full",
              reason: "Full birth date, exact time, timezone, and coordinates are available for the calculated chart layer.",
            };
          }
        }
      } else {
        astrologyStatus = {
          state: "unavailable",
          reason: "Astrology could not be calculated. Provide a valid birth date (add birth time and location to unlock Rising sign and houses).",
        };
      }

      let numerologyData;
      try {
        numerologyData = calculateNumerology(validatedBirthData.name, validatedBirthData.birthDate);
      } catch (error) {
        console.error("[SoulArchetype] Numerology calculation failed:", error);
        return res.status(500).json({ message: "Failed to calculate numerology data" });
      }
      
      // Calculate Human Design if we have complete data
      let humanDesignData = null;
      if (hasCompleteData) {
        try {
          humanDesignData = calculateHumanDesign({
            name: validatedBirthData.name,
            birthDate: validatedBirthData.birthDate,
            birthTime: validatedBirthData.birthTime!,
            birthLocation: validatedBirthData.birthLocation!,
            latitude: String(validatedBirthData.latitude!),
            longitude: String(validatedBirthData.longitude!),
            timezone: validatedBirthData.timezone!
          });
        } catch (error) {
          console.error("[SoulArchetype] Human Design calculation failed:", error);
        }
      }
      
      // Legacy birth-derived personality/soul systems are quarantined.
      // They remain null until a governed evidence contract exists.
      const elementalMedicineData = null;
      const soulArchetypeData = null;
      const parentalInfluenceData = null;
      const soulCodexResult: any = null;

      // Moral Compass is an explicit user assessment only. Birth data,
      // numerology, and astrology must not manufacture moral traits.
      let moralCompassData = null;
      if (
        validatedBirthData.moralCompassAnswers &&
        validatedBirthData.moralCompassAnswers.familyValues &&
        validatedBirthData.moralCompassAnswers.neighborhoodType &&
        validatedBirthData.moralCompassAnswers.conflictResolution
      ) {
        moralCompassData = calculateMoralCompass(
          validatedBirthData.moralCompassAnswers,
        );
      }

      // Persist profile to database
      let userId = (req.user as any)?.id || null;
      let sessionId = req.sessionID || null;

      // Persist profile to database with timeout
      let savedProfile: any = null;
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database save timeout")), 8000)
        );

        savedProfile = await Promise.race([
          storage.createProfile({
            userId,
            sessionId,
            name: validatedBirthData.name,
            birthDate: validatedBirthData.birthDate,
            birthTime: validatedBirthData.birthTime || "",
            birthLocation: validatedBirthData.birthLocation || "",
            timezone: validatedBirthData.timezone || "",
            latitude: validatedBirthData.latitude?.toString() || "",
            longitude: validatedBirthData.longitude?.toString() || "",
            astrologyData,
            numerologyData,
            humanDesignData,
            soulArchetype: soulArchetypeData,
            elementalProfile: elementalMedicineData,
            personalityData: moralCompassData, // Using as personality data
            archetypeData: soulCodexResult,
            data: {
              parentalInfluenceData,
            },
          }),
          timeoutPromise
        ]);
        console.log(`[SoulArchetype] Profile saved with id: ${savedProfile?.id}`);
      } catch (e) {
        console.error("[SoulArchetype] Profile save failed or timed out:", (e as Error).message);
        // We still continue to return the response even if save fails, 
        // but we'll generate a temporary ID so the frontend doesn't crash
        savedProfile = { id: `temp_${Date.now()}` };
      }

      // Missing interpretation remains missing. Do not fill identity claims from
      // zodiac stereotypes or generic deterministic prose.
      const coreStrengths: string[] = [];
      const shadowAspects: string[] = [];

      // Build response in the format expected by frontend
      const response = {
        id: savedProfile?.id ?? null,
        profileId: savedProfile?.id ?? null,
        name: validatedBirthData.name,
        birthDate: validatedBirthData.birthDate,
        birthTime: validatedBirthData.birthTime || "",
        birthLocation: validatedBirthData.birthLocation || "",
        astrologyData: astrologyData ?? null,
        astrologyStatus,
        humanDesignData: humanDesignData ?? null,
        soul_frequency: null,
        who_i_am: null,
        core_strengths: coreStrengths,
        shadow_aspects: shadowAspects,
        purpose: null,
        soul_architecture: null,
        elementalMedicineData,
        moralCompassData,
        parentalInfluenceData,
        archetype: soulCodexResult?.profile.archetype ?? null,
        synthesis: soulCodexResult?.profile.synthesis ?? null,
        confidence,
        geo: resolvedGeo ? { lat: resolvedGeo.lat, lon: resolvedGeo.lon, normalizedPlace: resolvedGeo.normalizedPlace, provider: resolvedGeo.provider } : null,
      };
      
      console.log(`[SoulArchetype] Generated archetype for ${validatedBirthData.name}`);
      res.json(response);
    } catch (error) {
      return handleError(error, res, "SoulArchetype");
    }
  });

  // Get all profiles for the current user (authenticated or anonymous)
  app.get("/api/profiles", async (req, res) => {
    try {
      let profile;
      
      console.log(`[GetProfiles] Request sessionID: ${req.sessionID}, userId: ${req.user?.id || 'none'}`);
      
      // For authenticated users
      if ((req.user as any)?.id) {
        console.log(`[GetProfiles] Fetching by userId: ${(req.user as any).id}`);
        profile = await storage.getProfileByUserId((req.user as any).id);
      } 
        // For anonymous users (session-based)
      else if (req.sessionID) {
        // Query all profiles and filter by sessionId
        console.log(`[GetProfiles] Fetching by sessionId: ${req.sessionID}`);
        const allProfiles = await storage.getAllProfiles() || [];
        console.log(`[GetProfiles] Total profiles in DB: ${allProfiles.length}`);
        console.log(`[GetProfiles] Profile sessionIds: ${allProfiles.map(p => p.sessionId || 'none').join(', ')}`);
        profile = allProfiles.find(p => p.sessionId === req.sessionID);
        console.log(`[GetProfiles] Found profile: ${profile ? 'YES' : 'NO'}`);
      } 
      else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Return as an array for frontend compatibility
      return res.json(profile ? [profile] : []);
    } catch (error) {
      return handleError(error, res, "GetProfiles");
    }
  });
  
  // Capture email for leads
  app.post("/api/capture-email", async (req, res) => {
    try {
      const { email, profileId } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email required" });
      }
      
      console.log(`[EmailCapture] Captured email: ${email} for profile: ${profileId || 'unknown'}`);
      // Future integration: Save to Mailchimp/Resend or Leads table in Neon
      
      return res.json({ ok: true, success: true });
    } catch (error) {
      console.error("[EmailCapture] Error:", error);
      return res.status(500).json({ error: "Failed to save email" });
    }
  });

  // Create a soul profile
  app.post("/api/profiles", async (req, res) => {
    try {
      // Validate request body
      const birthData = birthDataSchema.parse(req.body);
      
      console.log(`[CreateProfile] Processing profile for: ${birthData.name}`);
      
      // Check if we have complete birth data (time + location) for advanced systems
      const hasCompleteData = !!(
        birthData.birthTime && 
        birthData.birthLocation && 
        birthData.timezone && 
        birthData.latitude && 
        birthData.longitude
      );
      
      console.log(`[CreateProfile] Complete birth data available: ${hasCompleteData}`);
      
      // Calculate all systems with individual error handling
      let astrologyData;
      if (hasCompleteData) {
        try {
          astrologyData = calculateAstrology({
            name: birthData.name,
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime!,
            birthLocation: birthData.birthLocation!,
            latitude: birthData.latitude!,
            longitude: birthData.longitude!,
            timezone: birthData.timezone!
          });
        } catch (error) {
          console.error("[CreateProfile] Astrology calculation failed:", error);
          astrologyData = null; // Graceful degradation instead of throwing
        }
      } else {
        console.log("[CreateProfile] Skipping astrology calculation - birth time/location not provided");
        astrologyData = null;
      }
      
      let numerologyData;
      try {
        numerologyData = calculateNumerology(birthData.name, birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Numerology calculation failed:", error);
        throw new Error("Failed to calculate numerology data. Please verify name and birth date.");
      }
      
      // Calculate Human Design (requires complete data)
      let humanDesignData;
      if (hasCompleteData) {
        try {
          humanDesignData = calculateHumanDesign({
            name: birthData.name,
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime!,
            birthLocation: birthData.birthLocation!,
            latitude: String(birthData.latitude!),
            longitude: String(birthData.longitude!),
            timezone: birthData.timezone!
          });
        } catch (error) {
          console.error("[CreateProfile] Human Design calculation failed:", error);
          humanDesignData = null;
        }
      } else {
        console.log("[CreateProfile] Skipping Human Design calculation - birth time/location not provided");
        humanDesignData = null;
      }
      
      // Calculate all new mystical systems (30+ total)
      // Systems below are present only as legacy code and are explicitly
      // unavailable in the production system registry. Preserve schema keys
      // as null so old clients/storage remain compatible without manufacturing
      // identity claims from ungoverned calculators.
      const vedicAstrologyData = null;
      const geneKeysData = null;
      const iChingData = null;
      const chineseAstrologyData = null;
      const kabbalahData = null;
      const mayanAstrologyData = null;
      const chakraData = null;
      const sacredGeometryData = null;
      const runesData = null;
      const sabianSymbolsData = null;
      const ayurvedaData = null;
      const biorhythmsData = null;
      const palmistryData = null;
      const asteroidsData = null;
      const arabicPartsData = null;
      const fixedStarsData = null;
      
      // Legacy elemental/soul/parental inference is quarantined.
      const elementalMedicineData = null;
      const soulArchetypeData = null;
      const parentalInfluenceData = null;

      // Moral Compass requires explicit assessment answers. Do not infer ethics
      // from birth date, numerology, or astrology.
      let moralCompassData = null;
      if (
        birthData.moralCompassAnswers &&
        birthData.moralCompassAnswers.familyValues &&
        birthData.moralCompassAnswers.neighborhoodType &&
        birthData.moralCompassAnswers.conflictResolution
      ) {
        const { calculateMoralCompass } = await import("./services/moral-compass");
        moralCompassData = calculateMoralCompass(
          birthData.moralCompassAnswers,
        );
      }
      
      // Basic archetype synthesis (will be enhanced with personality data)
      let baseArchetypeData;
      try {
        baseArchetypeData = synthesizeArchetype(astrologyData, numerologyData, {});
      } catch (error) {
        console.error("[CreateProfile] Archetype synthesis failed:", error);
        throw new Error("Failed to synthesize archetype. Please try again.");
      }
      
      // Generate comprehensive integration analysis and personalized insights
      let integrationAnalysis, personalizedInsights;
      try {
        integrationAnalysis = generateIntegrationAnalysis(astrologyData, numerologyData, {}, baseArchetypeData);
        personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, {}, baseArchetypeData);
      } catch (error) {
        console.error("[CreateProfile] Integration analysis failed:", error);
        // Provide defaults if analysis fails
        integrationAnalysis = "Your personality patterns reveal how you process the world and what drives your decisions.";
        personalizedInsights = "Your path is one of growth and self-discovery.";
      }
      
      // Combine all archetype data with integration and insights
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights: personalizedInsights
      };
      
      // Generate biography and guidance (AI-powered with ALL 30+ systems)
      const biography = await runWithTimeoutAndTiming(
        "Gemini Biography",
        TIMEOUT_VALUES.GEMINI_BIOGRAPHY,
        () => generateBiography({
          name: birthData.name,
          archetypeTitle: baseArchetypeData.title,
          astrologyData,
          numerologyData,
          personalityData: {},
          archetype: baseArchetypeData,
          // Legacy symbolic systems remain null and excluded from identity synthesis.
          humanDesignData,
          vedicAstrologyData,
          geneKeysData,
          iChingData,
          chineseAstrologyData,
          kabbalahData,
          mayanAstrologyData,
          chakraData,
          sacredGeometryData,
          runesData,
          sabianSymbolsData,
          ayurvedaData,
          biorhythmsData,
          asteroidsData,
          arabicPartsData,
          fixedStarsData
        }),
        "Your cosmic journey awaits..."
      );
      
      const dailyGuidance = await runWithTimeoutAndTiming(
        "Gemini Daily Guidance",
        TIMEOUT_VALUES.GEMINI_DAILY_GUIDANCE,
        () => generateDailyGuidance({
          name: birthData.name,
          archetypeTitle: baseArchetypeData.title,
          astrologyData,
          numerologyData,
          personalityData: {},
          archetype: baseArchetypeData,
          humanDesignData: humanDesignData || null,
          elementalMedicineData: elementalMedicineData || null
        }),
        "Trust your inner wisdom today."
      );
      
      // Determine userId or sessionId for profile ownership
      let userId = null;
      let sessionId = null;
      
      if (req.user?.id) {
        // Authenticated user
        userId = req.user.id;
      } else if (req.sessionID) {
        // Anonymous user
        sessionId = req.sessionID;
      }
      
      console.log(`[CreateProfile] Assigning profile to ${userId ? `userId: ${userId}` : `sessionId: ${sessionId}`}`);
      
      const insertProfile = {
        userId,
        sessionId,
        name: birthData.name,
        birthDate: birthData.birthDate,
        birthTime: birthData.birthTime || "",
        birthLocation: birthData.birthLocation || "",
        timezone: birthData.timezone || "",
        latitude: birthData.latitude || "",
        longitude: birthData.longitude || "",
        isPremium: true,
        astrologyData,
        numerologyData,
        personalityData: {},
        archetypeData,
        humanDesignData,
        vedicAstrologyData,
        geneKeysData,
        iChingData,
        chineseAstrologyData,
        kabbalahData,
        mayanAstrologyData,
        chakraData,
        sacredGeometryData,
        runesData,
        sabianSymbolsData,
        ayurvedaData,
        biorhythmsData,
        asteroidsData,
        arabicPartsData,
        fixedStarsData,
        palmistryData,
        elementalMedicineData,
        soulArchetypeData,
        moralCompassData,
        parentalInfluenceData,
        biography,
        dailyGuidance
      };
      const profile = await storage.createProfile(insertProfile as any);
      
      console.log(`[CreateProfile] Profile created successfully: ${profile.id}`);
      console.log(`[CreateProfile] Profile sessionId: ${profile.sessionId}, userId: ${profile.userId}`);
      res.json(profile);
    } catch (error) {
      return handleError(error, res, "CreateProfile");
    }
  });
  
  // Get a profile with auto-healing for legacy data
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profileId = req.params.id;
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      
      console.log(`[GetProfile] Fetching profile: ${profileId}`);
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        console.log(`[GetProfile] Profile not found: ${profileId}`);
        return res.status(404).json({ message: "Profile not found" });
      }

      // Auto-healing: Check for missing data fields
      let needsUpdate = false;
      let updatedData: any = {};
      
      // Check if profile has complete birth data
      const profileHasCompleteData = !!(
        profile.birthTime && 
        profile.birthLocation && 
        profile.timezone && 
        profile.latitude && 
        profile.longitude
      );

      // Check for missing humanDesignData (only if complete data available)
      if (!profile.humanDesignData && profileHasCompleteData) {
        console.log("Auto-healing: Missing humanDesignData for profile", req.params.id);
        try {
          const humanDesignData = calculateHumanDesign({
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime!,
            birthLocation: profile.birthLocation!,
            latitude: profile.latitude!,
            longitude: profile.longitude!,
            timezone: profile.timezone!
          });
          updatedData.humanDesignData = humanDesignData;
          needsUpdate = true;
        } catch (error) {
          console.error("Auto-healing: Failed to calculate Human Design", error);
        }
      }

      // Check for missing archetype strengths/shadows or incomplete archetypeData
      const archetypeData = profile.archetypeData as any;
      if (!archetypeData || !archetypeData.strengths?.length || !archetypeData.shadows?.length || !archetypeData.integration || !archetypeData.personalizedInsights) {
        console.log("Auto-healing: Missing or incomplete archetypeData for profile", req.params.id);
        
        // Ensure we have the required data to regenerate archetype
        let astrologyData = profile.astrologyData;
        let numerologyData = profile.numerologyData;

        // Re-calculate if missing basic astrology/numerology data (only if complete data available)
        if (!astrologyData && profileHasCompleteData) {
          try {
            astrologyData = calculateAstrology({
              name: profile.name,
              birthDate: profile.birthDate,
              birthTime: profile.birthTime!,
              birthLocation: profile.birthLocation!,
              latitude: profile.latitude!,
              longitude: profile.longitude!,
              timezone: profile.timezone!
            });
            updatedData.astrologyData = astrologyData;
            needsUpdate = true;
          } catch (error) {
            console.error("Auto-healing: Failed to calculate astrology", error);
          }
        }

        if (!numerologyData) {
          numerologyData = calculateNumerology(profile.name, profile.birthDate);
          updatedData.numerologyData = numerologyData;
          needsUpdate = true;
        }

        // Re-synthesize archetype with enhanced data
        const baseArchetypeData = synthesizeArchetype(astrologyData, numerologyData, profile.personalityData);
        
        // Generate comprehensive integration analysis and personalized insights
        const integrationAnalysis = generateIntegrationAnalysis(astrologyData, numerologyData, profile.personalityData, baseArchetypeData);
        const personalizedInsights = generatePersonalizedInsights(astrologyData, numerologyData, profile.personalityData, baseArchetypeData);
        
        // Combine all archetype data with integration and insights
        const enhancedArchetypeData = {
          archetype: baseArchetypeData.title,
          title: baseArchetypeData.title,
          description: baseArchetypeData.description,
          keywords: baseArchetypeData.themes,
          strengths: baseArchetypeData.strengths || [],
          shadows: baseArchetypeData.shadows || [],
          guidance: baseArchetypeData.guidance,
          integration: integrationAnalysis,
          personalizedInsights: personalizedInsights
        };
        
        updatedData.archetypeData = enhancedArchetypeData;
        needsUpdate = true;
      }

      // Check for enhanced astrology data (may have basic vs comprehensive data) - only if complete data available
      const astroData = profile.astrologyData as any;
      if ((!astroData || !astroData.interpretations) && profileHasCompleteData) {
        console.log("Auto-healing: Missing governed legacy astrologyData for profile", req.params.id);
        try {
          const enhancedAstrologyData = calculateAstrology({
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime!,
            birthLocation: profile.birthLocation!,
            latitude: profile.latitude!,
            longitude: profile.longitude!,
            timezone: profile.timezone!
          });
          updatedData.astrologyData = enhancedAstrologyData;
          needsUpdate = true;
        } catch (error) {
          console.error("Auto-healing: Failed to calculate enhanced astrology", error);
        }
      }

      // Check for comprehensive numerology data
      const numeroData = profile.numerologyData as any;
      if (!numeroData || !numeroData.interpretations) {
        console.log("Auto-healing: Missing enhanced numerologyData for profile", req.params.id);
        const enhancedNumerologyData = calculateNumerology(profile.name, profile.birthDate);
        updatedData.numerologyData = enhancedNumerologyData;
        needsUpdate = true;
      }

      // If we found missing data, update and persist the profile
      if (needsUpdate) {
        console.log(`[GetProfile] Auto-healing profile ${req.params.id} with missing data fields`);
        try {
          const healedProfile = await storage.updateProfile(req.params.id, updatedData);
          console.log(`[GetProfile] Profile healed successfully: ${req.params.id}`);
          res.json(healedProfile);
        } catch (updateError) {
          console.error(`[GetProfile] Failed to heal profile ${req.params.id}:`, updateError);
          // Return original profile even if healing fails
          res.json(profile);
        }
      } else {
        // Profile is already complete
        console.log(`[GetProfile] Profile retrieved successfully: ${req.params.id}`);
        res.json(profile);
      }
    } catch (error) {
      return handleError(error, res, "GetProfile");
    }
  });
  
  // Get personalized rituals and practices
  app.get("/api/profiles/:id/rituals", async (req, res) => {
    try {
      const profileId = req.params.id;
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      
      console.log(`[GetRituals] Fetching rituals for profile: ${profileId}`);
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        console.log(`[GetRituals] Profile not found: ${profileId}`);
        return res.status(404).json({ message: "Profile not found" });
      }

      const today = profileLocalDateKey(profile);
      const dailyInsightsRecord = await storage.getDailyInsight(profileId, today);
      
      const warnings: string[] = [];
      // Ayurveda is registry-disabled until an explicit governed assessment
      // exists. Preserve the response key for old clients but never surface
      // stored legacy/inferred dosha data as personalized guidance.
      const ayurvedaData = null;
      
      // Extract daily insights affirmations
      let affirmations: any[] = [];
      if (dailyInsightsRecord?.insightsData) {
        const insightsData = dailyInsightsRecord.insightsData as any;
        affirmations = insightsData.affirmations || [];
      } else {
        warnings.push("Daily insights not yet generated for today");
      }
      
      // Calculate transmutation techniques based on active transits
      let transmutation = {
        activeTransits: [] as any[],
        techniques: [] as any[],
        dominantTheme: null as string | null
      };
      
      // Check if profile has complete birth data for transit calculations
      const hasCompleteData = !!(
        profile.birthTime && 
        profile.birthLocation && 
        profile.timezone && 
        profile.latitude && 
        profile.longitude
      );
      
      if (hasCompleteData && profile.astrologyData) {
        try {
          // Extract natal positions from astrology data
          const natalPositions = extractNatalPositions(profile.astrologyData);
          
          if (natalPositions && Object.keys(natalPositions).length > 0) {
            // Calculate active transits
            const activeTransits = calculateActiveTransits(natalPositions, new Date());
            transmutation.activeTransits = activeTransits.transits || [];
            
            // Get relevant transmutation techniques
            if (transmutation.activeTransits.length > 0) {
              const techniques = getActiveTransmutationTechniques(transmutation.activeTransits);
              transmutation.techniques = techniques;
              
              // Determine dominant theme (highest intensity transit)
              const highIntensityTransits = transmutation.activeTransits.filter((t: any) => t.intensity === 'high');
              if (highIntensityTransits.length > 0) {
                transmutation.dominantTheme = `${highIntensityTransits[0].planet} ${highIntensityTransits[0].aspect} ${highIntensityTransits[0].natal}`;
              } else if (transmutation.activeTransits.length > 0) {
                transmutation.dominantTheme = `${transmutation.activeTransits[0].planet} influence`;
              }
            }
          } else {
            warnings.push("Unable to extract natal positions for transit calculations");
          }
        } catch (transitError) {
          console.error(`[GetRituals] Transit calculation failed:`, transitError);
          warnings.push("Transit calculation temporarily unavailable");
        }
      } else {
        warnings.push("Complete birth data (time, location) required for personalized transit practices");
      }
      
      // Build response
      const ritualsResponse = {
        affirmations,
        ayurveda: ayurvedaData,
        transmutation,
        meta: {
          profileId: profile.id,
          date: today,
          isPremium: !!profile.isPremium,
          warnings: warnings.length > 0 ? warnings : undefined
        }
      };
      
      console.log(`[GetRituals] Rituals retrieved successfully: ${profileId}`);
      res.json(ritualsResponse);
    } catch (error) {
      return handleError(error, res, "GetRituals");
    }
  });
  
  // Submit Enneagram assessment
  app.post("/api/profiles/:id/enneagram", async (req, res) => {
    try {
      const profileId = req.params.id;
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      
      // Validate assessment data
      const assessment = enneagramAssessmentSchema.parse(req.body);
      
      console.log(`[EnneagramAssessment] Processing assessment for profile: ${profileId}`);
      
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
      const baseArchetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      
      // Generate comprehensive analysis with new personality data
      const integrationAnalysis = generateIntegrationAnalysis(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const personalizedInsights = generatePersonalizedInsights(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights: personalizedInsights
      };
      
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData
      });
      
      console.log(`[EnneagramAssessment] Profile updated successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "EnneagramAssessment");
    }
  });
  
  // Submit MBTI assessment
  app.post("/api/profiles/:id/mbti", async (req, res) => {
    try {
      const profileId = req.params.id;
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      
      // Validate assessment data
      const assessment = mbtiAssessmentSchema.parse(req.body);
      
      console.log(`[MBTIAssessment] Processing assessment for profile: ${profileId}`);
      
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
      const baseArchetypeData = synthesizeArchetype(
        profile.astrologyData,
        profile.numerologyData,
        updatedPersonalityData
      );
      
      // Generate comprehensive analysis with new personality data
      const integrationAnalysis = generateIntegrationAnalysis(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      const personalizedInsights = generatePersonalizedInsights(profile.astrologyData, profile.numerologyData, updatedPersonalityData, baseArchetypeData);
      
      const archetypeData = {
        archetype: baseArchetypeData.title,
        title: baseArchetypeData.title,
        description: baseArchetypeData.description,
        keywords: baseArchetypeData.themes,
        strengths: baseArchetypeData.strengths || [],
        shadows: baseArchetypeData.shadows || [],
        guidance: baseArchetypeData.guidance,
        integration: integrationAnalysis,
        personalizedInsights: personalizedInsights
      };
      
      const updatedProfile = await storage.updateProfile(profileId, {
        personalityData: updatedPersonalityData,
        archetypeData
      });
      
      console.log(`[MBTIAssessment] Profile updated successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "MBTIAssessment");
    }
  });
  
  // Upgrade to premium
  app.post("/api/profiles/:id/upgrade", async (req, res) => {
    try {
      const profileId = req.params.id;
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }
      
      console.log(`[UpgradeProfile] Upgrading profile: ${profileId}`);
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (profile.isPremium) {
        return res.status(400).json({ message: "Profile is already premium" });
      }
      
      // In a real app, this would process payment first
      
      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true
      });
      
      console.log(`[UpgradeProfile] Profile upgraded successfully: ${profileId}`);
      res.json(updatedProfile);
    } catch (error) {
      return handleError(error, res, "UpgradeProfile");
    }
  });

  // Validate access code and upgrade profile to premium
  app.post("/api/access-codes/validate", async (req, res) => {
    try {
      const { code, profileId } = req.body;
      
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ message: "Valid code is required" });
      }
      
      const userId = req.user?.id;
      const sessionId = req.sessionID;

      if (!userId && !sessionId) {
        return res.status(400).json({ message: "No active session. Please refresh the page and try again." });
      }

      console.log(`[ValidateAccessCode] Validating code for user=${userId || 'anon'}, session=${sessionId}`);
      
      // Get the access code (case-insensitive)
      const normalizedCode = code.trim().toLowerCase();
      const accessCode = await storage.getAccessCode(normalizedCode);
      if (!accessCode) {
        console.log(`[ValidateAccessCode] Code not found: ${normalizedCode}`);
        return res.status(404).json({ message: "Invalid access code" });
      }
      
      // Validate code constraints
      if (!accessCode.isActive) {
        return res.status(400).json({ message: "Access code is inactive" });
      }
      
      if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
        return res.status(400).json({ message: "Access code has expired" });
      }
      
      if (accessCode.usesCount >= accessCode.maxUses) {
        return res.status(400).json({ message: "Access code has reached maximum uses" });
      }
      
      // Check if already redeemed by this user/session
      const existing = await storage.getActiveAccessCodesForUser({ userId, sessionId });
      if (existing.some(c => c.id === accessCode.id)) {
        return res.json({ success: true, message: "Premium access is already active!" });
      }

      // Create redemption record (also increments usage count)
      await storage.createAccessCodeRedemptionWithIncrement({
        accessCodeId: accessCode.id,
        userId: userId || undefined,
        sessionId: sessionId || undefined,
      });

      // Mark the session as premium so it persists across requests even if MemStorage resets
      if (req.session) {
        (req.session as any).isPremium = true;
        (req.session as any).premiumSource = 'access_code';
        (req.session as any).premiumCode = normalizedCode;
      }

      // Also try to upgrade the profile if it exists in storage
      if (profileId) {
        try {
          const profile = await storage.getProfile(profileId);
          if (profile) {
            await storage.updateProfile(profileId, { isPremium: true });
          }
        } catch (e) {
          // Non-blocking — premium is tracked via session + redemption
        }
      }

      // Clear the entire entitlement cache so the new status takes effect immediately
      entitlementService.clearCache();
      
      console.log(`[ValidateAccessCode] Code redeemed: ${normalizedCode} by user=${userId || 'anon'}, session=${sessionId}`);
      res.json({ 
        success: true, 
        message: "Premium access activated!",
      });
    } catch (error) {
      return handleError(error, res, "ValidateAccessCode");
    }
  });


  // Admin: Create access code
  app.post("/api/admin/access-codes", async (req, res) => {
    try {
      const { code, maxUses, expiresAt, adminPassword } = req.body;
      
      console.log("[CreateAccessCode] Processing request");
      
      // Simple password protection - requires ADMIN_PASSWORD env var
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[CreateAccessCode] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[CreateAccessCode] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return res.status(400).json({ message: "Valid code is required" });
      }
      
      if (maxUses !== undefined && (typeof maxUses !== 'number' || maxUses < 1)) {
        return res.status(400).json({ message: "maxUses must be a positive number" });
      }
      
      // Normalize code to lowercase for consistency
      const normalizedCode = code.trim().toLowerCase();
      
      // Check if code already exists
      const existing = await storage.getAccessCode(normalizedCode);
      if (existing) {
        return res.status(409).json({ message: "Code already exists" });
      }
      
      const accessCode = await storage.createAccessCode({
        code: normalizedCode,
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      });
      
      console.log(`[CreateAccessCode] Access code created: ${accessCode.code}`);
      res.json(accessCode);
    } catch (error) {
      return handleError(error, res, "CreateAccessCode");
    }
  });

  // Admin: Get all access codes
  app.get("/api/admin/access-codes", async (req, res) => {
    try {
      // Get password from Authorization header (safer than query param)
      const adminPassword = req.headers.authorization?.replace('Bearer ', '');
      
      console.log("[GetAccessCodes] Processing request");
      
      // Simple password protection - requires ADMIN_PASSWORD env var
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[GetAccessCodes] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[GetAccessCodes] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      
      const accessCodes = await storage.getAllAccessCodes();
      console.log(`[GetAccessCodes] Retrieved ${accessCodes.length} access codes`);
      res.json(accessCodes);
    } catch (error) {
      return handleError(error, res, "GetAccessCodes");
    }
  });

  // Admin: Update access code
  app.patch("/api/admin/access-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminPassword, ...updates } = req.body;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Valid access code ID is required" });
      }
      
      console.log(`[UpdateAccessCode] Updating access code: ${id}`);
      
      // Simple password protection - requires ADMIN_PASSWORD env var
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[UpdateAccessCode] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[UpdateAccessCode] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      
      const updatedCode = await storage.updateAccessCode(id, updates);
      console.log(`[UpdateAccessCode] Access code updated: ${id}`);
      res.json(updatedCode);
    } catch (error) {
      return handleError(error, res, "UpdateAccessCode");
    }
  });

  // Admin: Get analytics/statistics
  app.post("/api/admin/analytics", async (req, res) => {
    try {
      const { adminPassword } = req.body;
      
      console.log(`[GetAnalytics] Fetching analytics data`);
      
      // Simple password protection - requires ADMIN_PASSWORD env var
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        console.error("[GetAnalytics] ADMIN_PASSWORD environment variable not set");
        return res.status(500).json({ message: "Server configuration error: ADMIN_PASSWORD not set" });
      }
      if (!adminPassword || adminPassword !== expectedPassword) {
        console.warn("[GetAnalytics] Invalid admin password attempt");
        return res.status(403).json({ message: "Invalid admin password" });
      }
      
      // Fetch all profiles
      const allProfiles = await storage.getAllProfiles();
      
      // Aggregate statistics
      const stats = {
        totalProfiles: allProfiles.length,
        humanDesignTypes: {} as Record<string, number>,
        enneagramTypes: {} as Record<string, number>,
        mbtiTypes: {} as Record<string, number>,
        sunSigns: {} as Record<string, number>,
        calculateNumerologys: {} as Record<string, number>,
        premiumCount: 0,
      };
      
      allProfiles.forEach((profile: Profile) => {
        // Count premium profiles
        if (profile.isPremium) {
          stats.premiumCount++;
        }
        
        // Human Design types
        if (profile.humanDesignData && typeof profile.humanDesignData === 'object') {
          const hdData = profile.humanDesignData as any;
          if (hdData.type) {
            stats.humanDesignTypes[hdData.type] = (stats.humanDesignTypes[hdData.type] || 0) + 1;
          }
        }
        
        // Personality types
        if (profile.personalityData && typeof profile.personalityData === 'object') {
          const persData = profile.personalityData as any;
          if (persData.enneagram?.type) {
            stats.enneagramTypes[persData.enneagram.type] = (stats.enneagramTypes[persData.enneagram.type] || 0) + 1;
          }
          if (persData.mbti?.type) {
            stats.mbtiTypes[persData.mbti.type] = (stats.mbtiTypes[persData.mbti.type] || 0) + 1;
          }
        }
        
        // Sun signs
        if (profile.astrologyData && typeof profile.astrologyData === 'object') {
          const astroData = profile.astrologyData as any;
          if (astroData.sunSign) {
            stats.sunSigns[astroData.sunSign] = (stats.sunSigns[astroData.sunSign] || 0) + 1;
          }
        }
        
        // Life path numbers
        if (profile.numerologyData && typeof profile.numerologyData === 'object') {
          const numData = profile.numerologyData as any;
          if (numData.calculateNumerology) {
            const lpKey = String(numData.calculateNumerology);
            stats.calculateNumerologys[lpKey] = (stats.calculateNumerologys[lpKey] || 0) + 1;
          }
        }
      });
      
      console.log(`[GetAnalytics] Analytics calculated for ${allProfiles.length} profiles`);
      res.json(stats);
    } catch (error) {
      return handleError(error, res, "GetAnalytics");
    }
  });

  // Get daily insights for a profile
  app.get("/api/daily-insights/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Get the profile before resolving its local calendar date.
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const today = profileLocalDateKey(profile);
      console.log(`[GetDailyInsights] Fetching insights for profile ${profileId} on ${today}`);
      
      // Check if we already have insights for the profile-local day.
      let dailyInsight = await storage.getDailyInsight(profileId, today);
      
      if (dailyInsight) {
        console.log(`[GetDailyInsights] Returning cached insights for ${today}`);
        return res.json(dailyInsight.insightsData);
      }
      
      // Generate new insights
      console.log(`[GetDailyInsights] Generating new insights for ${today}`);
      const recentTemplateIds = await storage.getRecentTemplateIds(profileId, 7);
      const { data, templateIds, contentHash } = generateDailyInsights(profile, recentTemplateIds);
      
      // Store the insights
      dailyInsight = await storage.createDailyInsight({
        profileId,
        date: today,
        templateIds: templateIds as any,
        contentHash,
        insightsData: data as any,
      });
      
      console.log(`[GetDailyInsights] Generated and stored insights for ${today}`);
      res.json(data);
    } catch (error) {
      return handleError(error, res, "GetDailyInsights");
    }
  });

  app.get("/api/profiles/:id/daily-horoscope", async (req, res) => {
    try {
      const profileId = req.params.id;
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profile ID is required" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const horoscope = await generateDailyHoroscope(profile);
      res.json(horoscope);
    } catch (error) {
      return handleError(error, res, "GetDailyHoroscope");
    }
  });

  // Compatibility fallback route mirrors the canonical evidence boundary.
  // It must never accept naked caller-supplied verification claims.
  app.post("/api/compatibility/archetype-matches", async (req, res) => {
    try {
      const { profile, mode = "love" } = req.body ?? {};
      if (!profile || typeof profile !== "object") {
        return res.status(400).json({
          message: "A saved profile is required. Do not resubmit naked sign strings.",
        });
      }
      const safeMode: RelationshipMode =
        ["love", "attraction", "friendship", "growth"].includes(mode)
          ? mode as RelationshipMode
          : "love";
      const result = buildMatchResponse(profile, safeMode, {
        trustedEvidenceContext: false,
      });
      res.status(result.available ? 200 : 422).json(result);
    } catch (err: any) {
      res.status(500).json({ message: err?.message || "Compatibility match generation failed" });
    }
  });

  // Retired legacy aggregate compatibility endpoint.
  // The production UI uses the evidence-aware /api/compatibility/archetype-matches
  // and /api/compatibility/person contracts instead.
  app.post("/api/compatibility", (_req, res) => {
    return res.status(410).json({
      code: "legacy_compatibility_retired",
      message:
        "The legacy aggregate compatibility score is retired. Use the evidence-aware compatibility endpoints.",
      supportedEndpoints: [
        "/api/compatibility/archetype-matches",
        "/api/compatibility/person",
      ],
    });
  });

  // Get all compatibilities for a specific profile
  app.post("/api/compatibility/autopsy", async (req, res) => {
    try {
      const { profile1Id, profile2Id } = req.body;
      if (!profile1Id || !profile2Id) return res.status(400).json({ error: "IDs required" });

      const [p1, p2] = await Promise.all([
        storage.getProfile(profile1Id),
        storage.getProfile(profile2Id)
      ]);

      if (!p1 || !p2) return res.status(404).json({ error: "Profile not found" });

      const actor = {
        userId: (req.user as any)?.id ?? (req.session as any)?.userId ?? null,
        sessionId: req.sessionID ?? null,
      };
      if (
        !profileBelongsToActor(p1, actor) ||
        !profileBelongsToActor(p2, actor)
      ) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const autopsy = await generateRelationshipAutopsy(p1, p2);
      res.json({ ok: true, autopsy });
    } catch (error) {
      return handleError(error, res, "RelationshipAutopsy");
    }
  });

  // Cached aggregate compatibility records were produced by the retired
  // legacy scoring engine and must not be presented as current evidence-aware results.
  app.get("/api/compatibility/:profile1Id/:profile2Id", (_req, res) => {
    return res.status(410).json({
      code: "legacy_compatibility_retired",
      message:
        "Stored legacy aggregate compatibility scores are retired and are not served as current results.",
    });
  });

  app.get("/api/compatibility/:profileId", (_req, res) => {
    return res.status(410).json({
      code: "legacy_compatibility_retired",
      message:
        "Stored legacy aggregate compatibility scores are retired and are not served as current results.",
    });
  });

  // Push Notification Routes
  
  // Get VAPID public key for client subscription
  app.get("/api/push/vapid-public-key", (req, res) => {
    try {
      const publicKey = getVapidPublicKey();
      res.json({ publicKey });
    } catch (error) {
      return handleError(error, res, "GetVapidKey");
    }
  });
  
  // Subscribe to push notifications
  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const sessionId = req.session?.id;
      
      // Validate subscription data
      const { endpoint, keys } = req.body;
      
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }
      
      // Check if subscription already exists
      const existing = await storage.getPushSubscription(endpoint);
      if (existing) {
        return res.json({ message: "Subscription already exists", subscription: existing });
      }
      
      // Create new subscription
      const subscription = await storage.createPushSubscription({
        userId: userId || null,
        sessionId: sessionId || null,
        endpoint,
        p256dhKey: keys.p256dh,
        authKey: keys.auth,
        isActive: true,
      });
      
      console.log(`[PushSubscribe] New subscription created for ${userId ? `user ${userId}` : `session ${sessionId}`}`);
      res.json({ message: "Subscription successful", subscription });
    } catch (error) {
      return handleError(error, res, "PushSubscribe");
    }
  });
  
  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint is required" });
      }
      
      await storage.deletePushSubscription(endpoint);
      
      console.log(`[PushUnsubscribe] Subscription deleted: ${endpoint}`);
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      return handleError(error, res, "PushUnsubscribe");
    }
  });

  // Send test notification (authenticated users only)
  app.post("/api/push/test", async (req, res) => {
    try {
      // Validate request body
      const validated = sendTestNotificationSchema.parse(req.body);
      
      const userId = (req.user as any)?.id;
      const sessionId = req.sessionID;
      
      // Get user's subscriptions
      const subscriptions = userId 
        ? await storage.getPushSubscriptionsByUser(userId)
        : await storage.getPushSubscriptionsBySession(sessionId);
      
      if (subscriptions.length === 0) {
        return res.status(404).json({ message: "No active subscriptions found" });
      }
      
      // Send notification with automatic cleanup of expired subscriptions
      const { sendNotification } = await import('./services/notification-sender');
      const results = await Promise.all(
        subscriptions.map(sub => sendNotification(sub, { type: validated.type, context: validated.context }))
      );
      
      // Clean up expired subscriptions (maintain correct indices)
      const expiredSubs = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].expired) {
          expiredSubs.push(subscriptions[i]);
          await storage.deletePushSubscription(subscriptions[i].endpoint);
          console.log(`[TestNotification] Removed expired subscription: ${subscriptions[i].endpoint}`);
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      res.json({ 
        message: `Sent test notification to ${successCount}/${subscriptions.length} device(s)`,
        type: validated.type,
        sent: successCount,
        total: subscriptions.length,
        expired: expiredSubs.length
      });
    } catch (error) {
      return handleError(error, res, "TestNotification");
    }
  });

  // Send app install prompt notification (authenticated or session users)
  app.post("/api/push/send-install-prompt", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const sessionId = req.sessionID;
      
      const subscriptions = userId 
        ? await storage.getPushSubscriptionsByUser(userId)
        : await storage.getPushSubscriptionsBySession(sessionId);
      
      if (subscriptions.length === 0) {
        return res.status(404).json({ message: "No active subscriptions found" });
      }
      
      const { sendAppInstallPrompt } = await import('./services/notification-sender');
      const isMobile = req.headers['user-agent']?.includes('Mobile') || false;
      
      const results = await Promise.all(
        subscriptions.map(sub => sendAppInstallPrompt(sub, isMobile))
      );
      
      // Clean up expired subscriptions (maintain correct indices)
      const expiredSubs = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].expired) {
          expiredSubs.push(subscriptions[i]);
          await storage.deletePushSubscription(subscriptions[i].endpoint);
          console.log(`[AppInstallPrompt] Removed expired subscription: ${subscriptions[i].endpoint}`);
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      console.log(`[AppInstallPrompt] Sent to ${successCount}/${subscriptions.length} device(s), removed ${expiredSubs.length} expired`);
      res.json({ 
        message: `App install prompt sent to ${successCount} device(s)`,
        platform: isMobile ? 'mobile' : 'web',
        sent: successCount,
        expired: expiredSubs.length
      });
    } catch (error) {
      return handleError(error, res, "SendInstallPrompt");
    }
  });

  // Send premium upsell notification (authenticated or session users)
  app.post("/api/push/send-premium-upsell", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const sessionId = req.sessionID;
      
      const subscriptions = userId 
        ? await storage.getPushSubscriptionsByUser(userId)
        : await storage.getPushSubscriptionsBySession(sessionId);
      
      if (subscriptions.length === 0) {
        return res.status(404).json({ message: "No active subscriptions found" });
      }
      
      const { sendPremiumUpsell } = await import('./services/notification-sender');
      
      const results = await Promise.all(
        subscriptions.map(sub => sendPremiumUpsell(sub))
      );
      
      // Clean up expired subscriptions (maintain correct indices)
      const expiredSubs = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].expired) {
          expiredSubs.push(subscriptions[i]);
          await storage.deletePushSubscription(subscriptions[i].endpoint);
          console.log(`[PremiumUpsell] Removed expired subscription: ${subscriptions[i].endpoint}`);
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      
      console.log(`[PremiumUpsell] Sent to ${successCount}/${subscriptions.length} device(s), removed ${expiredSubs.length} expired`);
      res.json({ 
        message: `Premium upsell sent to ${successCount} device(s)`,
        sent: successCount,
        expired: expiredSubs.length
      });
    } catch (error) {
      return handleError(error, res, "SendPremiumUpsell");
    }
  });

  // Admin: Broadcast notification to all users (admin only)
  app.post("/api/push/broadcast", async (req, res) => {
    try {
      // Check if user is admin (password-protected for now)
      const adminPassword = process.env.ADMIN_PASSWORD;
      const providedPassword = req.headers['x-admin-password'];
      
      if (!adminPassword || providedPassword !== adminPassword) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Validate request body
      const validated = broadcastNotificationSchema.parse(req.body);
      
      // Get all active subscriptions or filter by targetUsers
      const allSubscriptions = await storage.getAllPushSubscriptions();
      const activeSubscriptions = allSubscriptions.filter((sub: any) => sub.isActive);
      
      if (activeSubscriptions.length === 0) {
        return res.status(404).json({ message: "No active subscriptions found" });
      }
      
      const { sendBulkNotifications } = await import('./services/notification-sender');
      
      // Send with automatic cleanup callback
      const results = await sendBulkNotifications(
        activeSubscriptions, 
        { type: validated.type, context: validated.context },
        async (expiredSub) => {
          await storage.deletePushSubscription(expiredSub.endpoint);
          console.log(`[Broadcast] Removed expired subscription: ${expiredSub.endpoint}`);
        }
      );
      
      console.log(`[Broadcast] Sent ${results.sent}/${activeSubscriptions.length} notifications, removed ${results.expired.length} expired`);
      res.json({ 
        message: `Broadcast sent to ${results.sent} device(s)`,
        type: validated.type,
        sent: results.sent,
        failed: results.failed,
        expired: results.expired.length,
        total: activeSubscriptions.length
      });
    } catch (error) {
      return handleError(error, res, "BroadcastNotification");
    }
  });

  // Life Current Tracker - Frequency Log Endpoints
  
  // Log emotional frequency
  app.post("/api/frequency/log", async (req, res) => {
    try {
      const userId = (req.user as any)?.id || null;
      
      if (!userId) {
        req.session.initialized = true;
      }
      
      const sessionId = req.sessionID;
      
      const { frequency, notes, notificationContext } = req.body;
      
      if (typeof frequency !== 'number' || frequency < 1 || frequency > 10) {
        return res.status(400).json({ message: "Frequency must be a number between 1 and 10" });
      }
      
      // Calculate active transits if user has a profile with astrology data
      let activeTransits = null;
      if (userId) {
        try {
          const profile = await storage.getProfileByUserId(userId);
          if (profile && profile.astrologyData) {
            const natalPositions = extractNatalPositions(profile.astrologyData);
            activeTransits = calculateActiveTransits(natalPositions, new Date());
            console.log(`[FrequencyLog] Calculated ${activeTransits.transits.length} active transits for user ${userId}`);
          }
        } catch (transitError) {
          console.error("[FrequencyLog] Failed to calculate transits:", transitError);
          // Continue without transits - non-critical
        }
      }
      
      const log = await storage.createFrequencyLog({
        userId: userId || null,
        sessionId: sessionId || null,
        frequency,
        notes: notes || null,
        notificationContext: notificationContext || null,
        activeTransits: activeTransits || null,
      });
      
      console.log(`[FrequencyLog] Created log for ${userId ? `user ${userId}` : `session ${sessionId}`}: frequency ${frequency}`);
      res.json({ message: "Frequency logged successfully", log });
    } catch (error) {
      return handleError(error, res, "LogFrequency");
    }
  });
  
  // Get user's frequency logs
  app.get("/api/frequency/logs", async (req, res) => {
    try {
      const userId = (req.user as any)?.id || null;
      const sessionId = req.sessionID;
      
      if (!userId && !sessionId) {
        return res.json({ logs: [] });
      }
      
      const logs = userId
        ? await storage.getFrequencyLogsByUser(userId)
        : await storage.getFrequencyLogsBySession(sessionId!);
      
      let userProfile: Profile | null = null;
      if (userId) {
        try {
          const profile = await storage.getProfileByUserId(userId);
          userProfile = profile || null;
        } catch {
          userProfile = null;
        }
      }
      
      const enrichedLogs = logs.map(log => {
        const logDate = new Date(log.loggedAt);
        
        const moonPhaseData = getMoonPhase(logDate);
        const moonSign = getMoonSign(logDate);
        const hdGateData = getCurrentHDGate(logDate);
        const universalDay = calculateUniversalDayNumber(logDate);
        const personalDay = userProfile?.birthDate 
          ? calculatePersonalDayNumber(userProfile.birthDate, logDate)
          : null;
        
        return {
          ...log,
          cosmicContext: {
            moonPhase: moonPhaseData.phase,
            moonSign,
            hdGate: hdGateData.gate,
            hdLine: hdGateData.line,
            universalDay,
            personalDay
          }
        };
      });
      
      res.json({ logs: enrichedLogs });
    } catch (error) {
      return handleError(error, res, "GetFrequencyLogs");
    }
  });
  
  // Get frequency logs in date range
  app.get("/api/frequency/logs/range", async (req, res) => {
    try {
      const userId = (req.user as any)?.id || null;
      const sessionId = req.session?.id || null;
      
      if (!userId && !sessionId) {
        return res.json({ logs: [] });
      }
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const logs = await storage.getFrequencyLogsInRange(userId, sessionId, start, end);
      
      res.json({ logs });
    } catch (error) {
      return handleError(error, res, "GetFrequencyLogsRange");
    }
  });

  // Transit Endpoints (Phase 2)
  
  // Get current active transits for logged-in user
  app.get("/api/transits/current", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user's profile with astrology data
      const profile = await storage.getProfileByUserId(userId);
      
      if (!profile || !profile.astrologyData) {
        return res.status(422).json({ 
          message: "Create your soul profile with birth data to unlock transit intelligence" 
        });
      }
      
      try {
        // Extract natal positions and calculate current transits
        const natalPositions = extractNatalPositions(profile.astrologyData);
        const activeTransits = calculateActiveTransits(natalPositions, new Date());
        
        // Check if we have any transits
        if (!activeTransits || !activeTransits.transits || activeTransits.transits.length === 0) {
          return res.json({
            transits: [],
            dominantTheme: null,
            transmutationTechniques: []
          });
        }
        
        // Get transmutation techniques for active transits
        const techniques = getActiveTransmutationTechniques(activeTransits.transits);
        
        console.log(`[CurrentTransits] User ${userId} has ${activeTransits.transits.length} active transits`);
        
        res.json({
          ...activeTransits,
          transmutationTechniques: techniques
        });
      } catch (transitError) {
        console.error("[CurrentTransits] Transit calculation error:", transitError);
        return res.status(500).json({ 
          message: transitError instanceof Error ? transitError.message : "Failed to calculate transits"
        });
      }
    } catch (error) {
      return handleError(error, res, "GetCurrentTransits");
    }
  });

  // Congruence Score Endpoints (Phase 3)
  
  // Get congruence score for logged-in user
  app.get("/api/congruence", async (req, res) => {
    try {
      const userId = (req.user as any)?.id || null;
      const sessionId = req.sessionID || null;

      // Anonymous users get a graceful empty state (no 401 — page must render)
      if (!userId && !sessionId) {
        return res.json({ score: 0, interpretation: "Start tracking to see your score.", purposeStatement: null });
      }

      // Get user's profile for purpose statement (only available for logged-in users)
      const profile = userId ? await storage.getProfileByUserId(userId) : null;
      const purposeStatement = profile?.purposeStatement || null;

      // Pull logs by user OR session — session-scoped logs work pre-signup
      const allLogs = userId
        ? await storage.getFrequencyLogsByUser(userId)
        : await storage.getFrequencyLogsBySession(sessionId!);
      
      // Calculate congruence score
      const congruenceScore = calculateCongruenceScore(allLogs, purposeStatement);

      console.log(`[CongruenceScore] ${userId ? `User ${userId}` : `Session ${sessionId}`} score: ${congruenceScore.score}`);
      
      res.json({
        ...congruenceScore,
        purposeStatement
      });
    } catch (error) {
      return handleError(error, res, "GetCongruenceScore");
    }
  });
  
  // Update user's purpose statement
  app.patch("/api/profile/purpose", async (req, res) => {
    try {
      const userId = (req.user as any)?.id || null;
      const sessionId = req.sessionID || null;

      const { purposeStatement } = req.body;

      if (typeof purposeStatement !== 'string') {
        return res.status(400).json({ message: "purposeStatement must be a string" });
      }

      // Find profile by user OR by anonymous session
      const profile = userId
        ? await storage.getProfileByUserId(userId)
        : sessionId ? await storage.getProfileBySessionId(sessionId) : null;

      if (!profile) {
        return res.status(404).json({ message: "Profile not found. Please create a profile first." });
      }
      
      // Update the profile's purpose statement
      const updatedProfile = await storage.updateProfile(profile.id, {
        purposeStatement: purposeStatement.trim() || null
      });
      
      console.log(`[UpdatePurpose] ${userId ? `User ${userId}` : `Session ${sessionId}`} updated purpose statement`);
      
      res.json({ 
        message: "Purpose statement updated successfully", 
        profile: updatedProfile 
      });
    } catch (error) {
      return handleError(error, res, "UpdatePurposeStatement");
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PREMIUM FEATURES: Journaling, Transits Calendar, Progressions, PDF, Shareable Links
  // ─────────────────────────────────────────────────────────────────────────────

  // Journaling Endpoints
  app.get("/api/journal/prompts", async (req, res) => {
    try {
      const { category, intensity } = req.query;
      
      let prompts;
      if (category) {
        prompts = getAllPrompts().filter(p => p.category === category);
      } else if (intensity) {
        prompts = getAllPrompts().filter(p => p.intensity === intensity);
      } else {
        prompts = getAllPrompts();
      }
      
      res.json({ prompts, total: prompts.length });
    } catch (error) {
      return handleError(error, res, "GetJournalPrompts");
    }
  });

  app.get("/api/journal/prompts/:id", async (req, res) => {
    try {
      const prompt = getPromptById(req.params.id);
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      return handleError(error, res, "GetJournalPrompt");
    }
  });

  app.get("/api/journal/prompts/category/:category", async (req, res) => {
    try {
      const prompts = getAllPrompts().filter(p => p.category === req.params.category);
      res.json({ prompts, total: prompts.length });
    } catch (error) {
      return handleError(error, res, "GetPromptsByCategory");
    }
  });

  app.post("/api/journal/entries", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { promptId, response, tags, mood, energyLevel, profileId } = req.body;
      
      if (!promptId || !response) {
        return res.status(400).json({ message: "promptId and response are required" });
      }

      const prompt = getPromptById(promptId);
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }

      // Get active transits if profile provided
      let transitContext = null;
      if (profileId) {
        try {
          const profile = await storage.getProfile(profileId);
          if (profile && profile.astrologyData) {
            const natalPositions = extractNatalPositions(profile.astrologyData);
            const activeTransits = calculateActiveTransits(natalPositions, new Date());
            transitContext = {
              activeTransits: activeTransits.transits.map(t => `${t.planet} ${t.aspect} ${t.natalPlanet}`),
              dominantTheme: activeTransits.dominantTheme
            };
          }
        } catch (error) {
          console.error("[Journal] Failed to get transits:", error);
        }
      }

      const entry = await storage.createJournalEntry({
        userId,
        profileId: profileId || null,
        date: new Date(),
        prompt: prompt,
        response,
        tags: tags || [],
        mood: mood || null,
        energyLevel: energyLevel || null,
        transitContext
      });

      res.json({ message: "Journal entry created", entry });
    } catch (error) {
      return handleError(error, res, "CreateJournalEntry");
    }
  });

  app.get("/api/journal/entries", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { profileId, startDate, endDate, category } = req.query;
      
      const entries = await storage.getJournalEntries({
        userId,
        profileId: profileId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        category: category as string | undefined
      });

      res.json({ entries, total: entries.length });
    } catch (error) {
      return handleError(error, res, "GetJournalEntries");
    }
  });

  // Transits Calendar Endpoints
  app.get("/api/transits/calendar", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const { startDate, endDate } = req.query;
      const start =
        typeof startDate === "string" && startDate.trim()
          ? startDate.trim()
          : new Date();
      const end =
        typeof endDate === "string" && endDate.trim()
          ? endDate.trim()
          : (() => {
              const e = new Date();
              e.setUTCMonth(e.getUTCMonth() + 1);
              return e;
            })();

      const calendar = generateTransitsCalendar(profile, start, end);
      res.json(calendar);
    } catch (error) {
      return handleError(error, res, "GetTransitsCalendar");
    }
  });

  app.get("/api/transits/upcoming", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const requestedDays = Number.parseInt(String(req.query.days ?? "30"), 10);
      if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 366) {
        return res.status(400).json({ message: "days must be an integer from 1 to 366" });
      }
      const days = requestedDays;
      const upcoming = getUpcomingSignificantTransits(profile, days);
      res.json({ transits: upcoming, days });
    } catch (error) {
      return handleError(error, res, "GetUpcomingTransits");
    }
  });

  // Progressions & Return Charts Endpoints
  const progressionsUnavailable = (_req: any, res: any) =>
    res.status(503).json({
      code: "progressions_not_production_governed",
      message:
        "Solar returns, lunar returns, and secondary progressions are unavailable until their astronomical calculation and verification contracts are approved.",
    });

  app.get("/api/progressions/solar-return", progressionsUnavailable);
  app.get("/api/progressions/lunar-return", progressionsUnavailable);
  app.get("/api/progressions/secondary", progressionsUnavailable);

  // PDF Generation Endpoints
  app.post("/api/pdf/profile", requirePremium, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      // Account users resolve by userId; session-premium (anonymous) users pass a profileId.
      const profile = userId
        ? await storage.getProfileByUserId(userId)
        : (req.body?.profileId ? await storage.getProfile(req.body.profileId) : null);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Re-use the canonical natal-report contract so PDF evidence policy
      // cannot drift from the verified report surface.
      const reportInput = buildNatalReportInput(profile);
      const isPremium = (req.user as any)?.subscriptionStatus === "premium";

      const pdfBuffer = await buildNatalReportPdf({
        ...reportInput,
        isPremium,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${profile.name}-soul-codex.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      return handleError(error, res, "GenerateProfilePDF");
    }
  });

  // ── Full Cosmic Blueprint — premium AI reading per modality ─────────────
  app.post("/api/blueprint/generate", async (req: any, res) => {
    try {
      const requestedProfileId = req.body?.profileId ?? req.body?.profile?.id;
      if (!requestedProfileId || typeof requestedProfileId !== "string") {
        return res.status(400).json({
          error: "saved_profile_required",
          message: "Blueprint generation requires an owned server-saved profile.",
        });
      }

      const trustedProfile = await storage.getProfile(requestedProfileId);
      const actor = {
        userId: req.user?.id ?? null,
        sessionId: req.sessionID ?? null,
      };
      if (!trustedProfile || !profileBelongsToActor(trustedProfile, actor)) {
        // Do not reveal whether another actor's profile ID exists.
        return res.status(404).json({ message: "Profile not found" });
      }

      // Premium gate: OWNER_PROFILE_ID bypass first (server-side only), then entitlement check
      const ownerProfileId = process.env.OWNER_PROFILE_ID;
      const userId    = req.user?.id;
      const sessionId = req.sessionID;
      let isPremium   = false;

      if (ownerProfileId && userId) {
        // Server-side profile lookup — never trust client-provided profile IDs
        try {
          const dbProfile = await storage.getProfileByUserId(userId);
          if (dbProfile?.id === ownerProfileId) isPremium = true;
        } catch (lookupErr) {
          console.warn("[blueprint] Owner profile lookup failed:", lookupErr);
        }
        if (!isPremium && userId === ownerProfileId) isPremium = true;
      }
      if (!isPremium && (userId || sessionId)) {
        try {
          const entStatus = await entitlementService.getUserPremiumStatus({ userId, sessionId });
          isPremium = entStatus.isPremium;
        } catch (entErr) {
          console.warn("[blueprint] Entitlement check failed:", entErr);
        }
      }

      if (!isPremium) {
        return res.status(403).json({ error: "premium_required" });
      }

      const name =
        typeof trustedProfile.name === "string" && trustedProfile.name.trim()
          ? trustedProfile.name.trim()
          : "the seeker";

      let lpNum: number | "unknown" = "unknown";
      try {
        if (typeof trustedProfile.birthDate === "string") {
          lpNum = calcLifePath(trustedProfile.birthDate);
        }
      } catch {
        lpNum = "unknown";
      }
      const lpArchetype =
        lpNum === "unknown"
          ? "unknown"
          : ({ 1:"Pioneer",2:"Diplomat",3:"Communicator",4:"Builder",5:"Explorer",6:"Nurturer",7:"Seeker",8:"Executive",9:"Humanitarian",11:"Intuitive",22:"Master Builder",33:"Teacher" }[lpNum] ?? "unknown");

      const verifiedAstrology = extractVerifiedAstrology(trustedProfile);
      const sun = verifiedAstrology.sun ?? "unknown";
      const moon = verifiedAstrology.moon ?? "unknown";
      const rising = verifiedAstrology.rising ?? "unknown";

      const hd = trustedProfile.humanDesignData as any;
      const hdResolved = hd?.status === "resolved";
      const hdType = hdResolved && typeof hd.type === "string" ? hd.type : "unknown";
      const hdAuth = hdResolved && typeof hd.authority === "string" ? hd.authority : "";
      const hdProf = hdResolved && typeof hd.profile === "string" ? hd.profile : "";

      const personality = trustedProfile.personalityData as any;
      const assessedEnneagram = personality?.enneagram;
      const ennType =
        assessedEnneagram &&
        (typeof assessedEnneagram.type === "number" || typeof assessedEnneagram.type === "string")
          ? assessedEnneagram.type
          : "unknown";

      // Registry-disabled or separately governed systems remain withheld here.
      const chirPl  = "unknown";
      const northN  = "unknown";
      const southN  = "unknown";
      const gkArr: string[] = [];

      // Planetary summary accepts only server-saved placements carrying the
      // verified evidence contract. Houses are omitted from this legacy route
      // until it consumes the verified house-assignment contract directly.
      const storedAstrology = trustedProfile.astrologyData as any;
      const planetEntries = Object.entries(storedAstrology?.planets ?? {}) as [string, Record<string, unknown>][];
      const verifiedPlanet = (p: Record<string, unknown>): boolean => {
        const status = p.verificationStatus ?? p.status;
        const evidence = (p.provenance ?? p.evidence) as any;
        return (
          status === "verified" &&
          typeof p.sign === "string" &&
          Boolean(evidence?.source && evidence?.engine && evidence?.calculatedAt)
        );
      };
      const planetSummary = planetEntries
        .filter(([, p]) => verifiedPlanet(p))
        .slice(0, 8)
        .map(([planet, p]) => `${planet} in ${String(p.sign)}`)
        .join(", ");

      const contextData = `
User Profile:
- Life Path: ${lpNum !== "unknown" ? `${lpNum} (${lpArchetype})` : "Omit"}
- Sun: ${sun !== "unknown" ? sun : "Omit"}
- Moon: ${moon !== "unknown" ? moon : "Omit"}
- Rising: ${rising !== "unknown" ? rising : "Omit"}
- Human Design: ${hdType !== "unknown" ? `${hdType} / ${hdAuth} / ${hdProf}` : "Omit"}
- Enneagram: ${ennType !== "unknown" ? ennType : "Omit"}
- Chiron: ${chirPl !== "unknown" ? chirPl : "Omit"}
- Nodes: ${northN !== "unknown" ? `${northN} / ${southN}` : "Omit"}
- Gene Keys: ${gkArr.length > 0 ? gkArr.join(", ") : "Omit"}
- Planetary Summary: ${planetSummary || "Omit"}
`;

      const sectionPrompt = `
You are the final synthesis layer of Soul Codex.
Your job is to expose a user's behavioral pattern with surgical accuracy, grounded realism, and zero system leakage.

Every output must feel:
- Specific
- Clean
- Internally consistent
- Immediately recognizable as true

---
## 🧬 IDENTITY RULES
Identity must be:
- Behavioral (what I DO)
- Observable (what others could notice)
- Pattern-based (repeated loop)

NOT:
- preferences ("I like", "I value")
- vague traits ("I am thoughtful")
- poetic filler

---
## structure (Return ONLY valid JSON)
{
  "lifePath": "I [behavior], then [reaction], and only stabilize when [pattern break].",
  "sun": "behavioral description of solar drive",
  "moon": "behavioral description of stress response (physical or fast)",
  "rising": "behavioral description of social loop",
  "humanDesign": "behavioral description of strategy/authority loop",
  "geneKeys": "behavioral description of contemplative pattern",
  "enneagram": "behavioral description of ego defense loop",
  "planets": "behavioral description of environmental interaction",
  "chiron": "behavioral description of escalation trigger",
  "nodes": "behavioral description of trust/distance loop",
  "lifeTheme": "ONE undeniable line that synthesizes the overarching pattern"
}

---
## 🧪 SANITIZATION & COMPLETENESS
- No placeholders ("unknown", "N/A").
- If data for a section is "Omit" → return an empty string "" for that key.
- NO system artifacts, raw variables, or symbols like "|".
- NO duplicated sentences.
- NO advice or "growth mindset" language.

Profile context for ${name}:
${contextData}
`;

      let sections: Record<string, string> = {};

      try {
        const aiResponse = await routeAIRequest({
          prompt: sectionPrompt,
          promptType: "biography",
          temperature: 0.78
        });
        const raw = aiResponse.content || "";
        if (raw) {
          try {
            const cleaned = raw.replace(/^```[a-z]*\n?/,"").replace(/```$/,"").trim();
            sections = JSON.parse(cleaned);
          } catch (parseErr) {
            console.error("[blueprint] Failed to parse AI JSON:", parseErr);
            sections = { lifeTheme: raw };
          }
        }
      } catch (err) {
        console.error("[blueprint] AI request failed:", err);
      }

      // Fallback logic adhering to the COMPLETENESS RULE: Omit if data is missing or AI returned placeholder
      const fallback = (key: string, val: any) => {
        const text = sections[key];
        if (typeof text === "string" && text.trim()) {
          return finalOutputGuard(text); // Hard Guard: Return "" if invalid
        }
        return ""; // Omit entirely if missing
      };

      sections = {
        lifePath:    fallback("lifePath", lpNum),
        sun:         fallback("sun", sun),
        moon:        fallback("moon", moon),
        rising:      fallback("rising", rising),
        humanDesign: fallback("humanDesign", hdType),
        // Registry-disabled/withheld systems stay structurally present for
        // compatibility but cannot be filled by model invention.
        geneKeys:    "",
        enneagram:   fallback("enneagram", ennType),
        planets:     fallback("planets", "planets"),
        chiron:      "",
        nodes:       "",
        lifeTheme:   fallback("lifeTheme", "lifeTheme"),
      };

      return res.json({ ok: true, sections, meta: { sun, moon, rising, lpNum, lpArchetype, hdType, hdAuth, hdProf, chirPl, northN, southN, ennType } });
    } catch (error) {
      return handleError(error, res, "BlueprintGenerate");
    }
  });

  // ── Natal Chart + Human Design PDF report ───────────────────────────────
  app.post("/api/natal-report", requirePremium, async (req, res) => {
    try {
      const requestedProfile = req.body?.profile;
      const requestedProfileId = req.body?.profileId ?? requestedProfile?.id;
      const actor = {
        userId: (req.user as any)?.id ?? null,
        sessionId: req.sessionID ?? null,
      };

      let reportProfile: any;

      if (requestedProfileId) {
        const savedProfile = await storage.getProfile(String(requestedProfileId));
        if (!savedProfile || !profileBelongsToActor(savedProfile, actor)) {
          return res.status(404).json({ error: "Profile not found or access denied" });
        }

        const savedDate = savedProfile.birthDate instanceof Date
          ? savedProfile.birthDate
          : new Date(savedProfile.birthDate as any);
        if (Number.isNaN(savedDate.getTime())) {
          return res.status(422).json({ error: "Saved profile birth date is invalid" });
        }
        const dateOnly = savedDate.toISOString().slice(0, 10);

        reportProfile = {
          ...savedProfile,
          birthDate: savedDate,
          // Deterministic numerology is recomputed from authoritative saved data.
          numerologyData: calculateNumerology(savedProfile.name, dateOnly),
          isPremium: true,
        };
      } else {
        // Backward-compatible request shape: basic metadata may render an
        // unresolved report, but request-body astrology/HD is never trusted.
        if (!requestedProfile?.name || !requestedProfile?.birthDate) {
          return res.status(400).json({ error: "profileId or profile name/birthDate required" });
        }

        const rawBirthDate = requestedProfile.birthDate;
        const dateOnly = rawBirthDate instanceof Date
          ? rawBirthDate.toISOString().slice(0, 10)
          : String(rawBirthDate).slice(0, 10);
        const birthDate = new Date(`${dateOnly}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) || Number.isNaN(birthDate.getTime())) {
          return res.status(400).json({ error: "birthDate must be a valid YYYY-MM-DD date" });
        }

        reportProfile = {
          name: String(requestedProfile.name).trim() || "User",
          birthDate,
          birthTime: requestedProfile.birthTime ?? null,
          birthLocation: requestedProfile.birthLocation ?? null,
          astrologyData: null,
          humanDesignData: null,
          numerologyData: calculateNumerology(String(requestedProfile.name), dateOnly),
          archetypeData: null,
          biography: null,
          dailyGuidance: null,
          isPremium: true,
        };
      }

      const reportInput = buildNatalReportInput(reportProfile);
      const pdfBuffer = await buildNatalReportPdf(reportInput);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${natalReportFilename(reportInput.name)}"`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      return handleError(error, res, "NatalReport");
    }
  });

  app.post("/api/pdf/compatibility", requirePremium, (_req, res) => {
    return res.status(410).json({
      code: "legacy_compatibility_pdf_retired",
      message:
        "Legacy aggregate compatibility PDFs are retired because their stored scores do not meet the current evidence-aware compatibility contract.",
    });
  });

  // Shareable Links Endpoints
  app.post("/api/share/create", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { profileId, settings } = req.body;
      if (!profileId) {
        return res.status(400).json({ message: "profileId is required" });
      }

      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(404).json({ message: "Profile not found or access denied" });
      }

      const shareableLink = await createShareableLink(storage, profileId, userId, settings);
      res.json({ message: "Shareable link created", link: shareableLink });
    } catch (error) {
      return handleError(error, res, "CreateShareableLink");
    }
  });

  app.get("/api/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.query;

      const shareableProfile = await getShareableProfile(storage, token, password as string | undefined);
      if (!shareableProfile) {
        return res.status(404).json({ message: "Shareable link not found or expired" });
      }

      res.json(shareableProfile);
    } catch (error) {
      if (error instanceof Error && error.message === 'Password required') {
        return res.status(401).json({ message: "Password required", requiresPassword: true });
      }
      if (error instanceof Error && error.message === 'Invalid password') {
        return res.status(401).json({ message: "Invalid password" });
      }
      return handleError(error, res, "GetShareableProfile");
    }
  });

  app.get("/api/share/links", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const links = await getUserShareableLinks(storage, userId);
      res.json({ links, total: links.length });
    } catch (error) {
      return handleError(error, res, "GetUserShareableLinks");
    }
  });

  app.put("/api/share/links/:id", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      const { settings } = req.body;

      const existingLink = await storage.getShareableLink(id);
      if (!existingLink || existingLink.userId !== userId) {
        return res.status(404).json({ message: "Shareable link not found" });
      }

      const updated = await updateShareableLink(storage, id, settings);
      res.json({ message: "Shareable link updated", link: updated });
    } catch (error) {
      return handleError(error, res, "UpdateShareableLink");
    }
  });

  app.delete("/api/share/links/:id", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      const existingLink = await storage.getShareableLink(id);
      if (!existingLink || existingLink.userId !== userId) {
        return res.status(404).json({ message: "Shareable link not found" });
      }

      await deactivateShareableLink(storage, id);
      res.json({ message: "Shareable link deactivated" });
    } catch (error) {
      return handleError(error, res, "DeactivateShareableLink");
    }
  });

  // Transit Notifications Endpoints
  app.post("/api/transits/check-notifications", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const count = await checkAndNotifySignificantTransits(profile, userId);
      res.json({ message: `Checked transits and sent ${count} notifications`, count });
    } catch (error) {
      return handleError(error, res, "CheckTransitNotifications");
    }
  });

  app.get("/api/transits/upcoming-notifications", async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const profile = await storage.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const requestedDays = Number.parseInt(String(req.query.days ?? "7"), 10);
      if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 366) {
        return res.status(400).json({ message: "days must be an integer from 1 to 366" });
      }
      const days = requestedDays;
      const upcoming = await getUpcomingTransitNotifications(profile, days);
      res.json({ notifications: upcoming, days });
    } catch (error) {
      return handleError(error, res, "GetUpcomingTransitNotifications");
    }
  });

  // Poster PNG render endpoint — owned saved-profile evidence only.
  app.post("/api/poster/render", async (req: any, res) => {
    try {
      const width = Math.min(parseInt(req.query.width as string) || 2048, 4096);
      const height = Math.round(width * 1350 / 1080);
      const profileId = req.body?.profileId;

      if (!profileId || typeof profileId !== "string") {
        return res.status(400).json({
          message: "An owned saved profileId is required for poster rendering.",
          code: "saved_profile_required",
        });
      }

      const storedProfile = await storage.getProfile(profileId);
      if (
        !storedProfile ||
        !profileBelongsToActor(storedProfile, {
          userId: req.user?.id ?? null,
          sessionId: req.sessionID ?? null,
        })
      ) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const verified = extractVerifiedAstrology(storedProfile);
      if (!verified.sun || !verified.moon) {
        return res.status(422).json({
          message:
            "Verified Sun and Moon placements are required before rendering a Soul Codex birth poster.",
          code: "verified_poster_evidence_required",
        });
      }

      let lifePathNumber: number;
      try {
        lifePathNumber = calcLifePath(storedProfile.birthDate);
      } catch {
        return res.status(422).json({
          message: "A valid stored birth date is required before rendering a Soul Codex birth poster.",
          code: "valid_birth_date_required",
        });
      }

      const astrology = storedProfile.astrologyData as any;
      const verifiedPlanets = Object.entries(astrology?.planets ?? {})
        .filter(([, placement]) => {
          const p = placement as any;
          const status = p?.verificationStatus ?? p?.status;
          const evidence = p?.provenance ?? p?.evidence;
          return (
            status === "verified" &&
            typeof p?.longitude === "number" &&
            Number.isFinite(p.longitude) &&
            Boolean(evidence?.source && evidence?.engine && evidence?.calculatedAt)
          );
        })
        .map(([name, placement]) => ({
          name,
          longitude: Number((placement as any).longitude),
        }));

      const data: PosterSvgData = {
        name: storedProfile.name ?? undefined,
        birthDate: storedProfile.birthDate,
        birthTime: storedProfile.birthTime || undefined,
        birthLocation: storedProfile.birthLocation || undefined,
        sunSign: verified.sun,
        moonSign: verified.moon,
        risingSign: verified.rising,
        lifePathNumber,
        masterNumber: [11, 22, 33].includes(lifePathNumber) ? lifePathNumber : undefined,
        planets: verifiedPlanets,
      };

      // Determine premium status (session flag, OWNER_PROFILE_ID bypass, or entitlement check)
      let isPremium = false;
      const ownerProfileId = process.env.OWNER_PROFILE_ID;
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      if ((req.session as any)?.isPremium) {
        isPremium = true;
      } else if (ownerProfileId && (userId === ownerProfileId || req.user?.profileId === ownerProfileId)) {
        isPremium = true;
      } else if (userId || sessionId) {
        try {
          const entStatus = await entitlementService.getUserPremiumStatus({ userId, sessionId });
          isPremium = entStatus.isPremium;
        } catch {}
      }

      const variant = isPremium ? "premium" : "free";
      const svg = buildPosterSvg(data, variant);
      const png = await sharp(Buffer.from(svg))
        .resize(width, height)
        .png()
        .toBuffer();

      res.set("Content-Type", "image/png");
      res.set("Content-Disposition", `attachment; filename="soul-codex-poster-${width}.png"`);
      res.send(png);
    } catch (error) {
      return handleError(error, res, "PosterRender");
    }
  });

  // Full chart endpoint — returns all planet longitudes, houses, and aspects
  app.post("/api/astro/fullchart", async (req, res) => {
    try {
      const { birthDate, birthTime, timeUnknown = false, birthLocation, houseSystem = "equal" } = req.body;

      if (!birthDate || !birthLocation) {
        return res.status(400).json({ ok: false, error: "birthDate and birthLocation are required" });
      }

      const geo = await resolveGeo(birthLocation);
      if (!geo) {
        return res.status(422).json({ ok: false, error: `Could not geocode location: ${birthLocation}` });
      }

      let timezone: string | undefined;
      try {
        const tzs = geoTz.find(geo.lat, geo.lon);
        if (tzs.length > 0) timezone = tzs[0];
      } catch (e) {
        console.warn("[FullChart] Timezone lookup failed:", e);
      }

      const astroProvider = getAstroProvider();
      const result = await astroProvider.getChart({
        dateISO: birthDate,
        time24: timeUnknown ? undefined : birthTime,
        timeUnknown: !!timeUnknown || !birthTime,
        place: geo.normalizedPlace,
        lat: geo.lat,
        lon: geo.lon,
        timezone,
        houseSystem,
      });

      return res.json({
        ok: true,
        sun: result.sun,
        moon: result.moon,
        rising: result.rising,
        planets: result.planets ?? {},
        houses: result.houses,
        aspects: result.aspects ?? [],
        notes: result.notes ?? [],
        geo: { lat: geo.lat, lon: geo.lon, normalizedPlace: geo.normalizedPlace, provider: geo.provider },
        timezone,
      });
    } catch (error) {
      return handleError(error, res, "FullChart");
    }
  });

  app.post("/api/today/card", async (req, res) => {
    try {
      const { profileId, profile, codexSynthesis } = req.body;

      let horoscopeData: any = null;

      if (profileId) {
        try {
          const storedProfile = await storage.getProfile(profileId);
          if (storedProfile) {
            const { generateDailyHoroscope } = await import("./services/horoscope");
            horoscopeData = await generateDailyHoroscope(storedProfile);
          }
        } catch (e) {
          console.warn("[TodayCard] horoscope gen failed:", e);
        }
      }

      if (!horoscopeData) {
        const today = new Date();
        const date = today.toISOString().slice(0, 10);
        let personalDayNumber: number | null = null;

        if (typeof profile?.birthDate === "string" && profile.birthDate.trim()) {
          try {
            personalDayNumber = calculatePersonalDayNumber(profile.birthDate, date);
          } catch {
            personalDayNumber = null;
          }
        }

        const moonPhase = getMoonPhase(today);

        horoscopeData = {
          date,
          personalDayNumber,
          moonPhase,
          personalTransits: [],
          alignments: [],
          horoscope: ""
        };
      }

      const card = buildTodayCard(horoscopeData, profile ?? {}, codexSynthesis);
      
      const cardStrengths = Array.isArray(card.strengths) ? card.strengths : [];
      const cardTriggers  = Array.isArray(card.triggers)  ? card.triggers  : [];
      const cardFocus     = Array.isArray(card.thisWeekFocus) ? card.thisWeekFocus : [];

      if (!card.narrative) {
        card.narrative = "Your cycle is calibrating. Focus on steady progress and internal alignment today.";
      }

      // AI personalisation — overwrite static fields if successful
      try {
        const aiCard = await generateTodayCardAI(card, profile ?? {}, horoscopeData, codexSynthesis);
        if (aiCard) Object.assign(card, aiCard);
      } catch (e) {
        console.warn("[TodayCard] AI personalisation failed, using static fallback:", e);
      }

      return res.json({ ok: true, card });
    } catch (error) {
      return handleError(error, res, "TodayCard");
    }
  });

  app.post("/api/today/render", async (req, res) => {
    try {
      const { card, format = "square" } = req.body;
      if (!card) return res.status(400).json({ ok: false, error: "card data required" });

      const svg = buildTodayCardSvg(card, format as "square" | "story");
      const sharp = (await import("sharp")).default;
      const W = 1080, H = format === "story" ? 1920 : 1080;

      const png = await sharp(Buffer.from(svg), { density: 150 })
        .resize(W, H)
        .png()
        .toBuffer();

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename="soul-codex-${format}-${card.date}.png"`);
      return res.send(png);
    } catch (error) {
      return handleError(error, res, "TodayRender");
    }
  });

  app.post("/api/codex30/generate", async (req: any, res) => {
    try {
      const { profile, fullChart, userInputs } = req.body;

      if (!profile && !userInputs) {
        return res.status(400).json({ ok: false, error: "profile and userInputs are required" });
      }

      // Premium gate: session flag, OWNER_PROFILE_ID bypass, then entitlement check
      const ownerProfileId = process.env.OWNER_PROFILE_ID;
      const userId    = req.user?.id;
      const sessionId = req.sessionID;
      let isPremium   = false;

      // Session-level premium (set by access code redemption)
      if ((req.session as any)?.isPremium) {
        isPremium = true;
      }

      if (!isPremium && ownerProfileId && userId) {
        try {
          const dbProfile = await storage.getProfileByUserId(userId);
          if (dbProfile?.id === ownerProfileId) isPremium = true;
        } catch (lookupErr) {
          console.warn("[codex30] Owner profile lookup failed:", lookupErr);
        }
        if (!isPremium && userId === ownerProfileId) isPremium = true;
      }
      if (!isPremium && (userId || sessionId)) {
        try {
          const entStatus = await entitlementService.getUserPremiumStatus({ userId, sessionId });
          isPremium = entStatus.isPremium;
        } catch (entErr) {
          console.warn("[codex30] Entitlement check failed:", entErr);
        }
      }

      const signals  = collectSignals({ 
        profile: profile ?? {}, 
        fullChart, 
        userInputs: {
          ...(userInputs ?? {}),
          seed: [
            profile?.birth?.name || userInputs?.birthData?.name,
            profile?.birth?.birthDate || userInputs?.birthData?.birthDate,
            userInputs?.reaction?.join(""),
            userInputs?.drain?.join(""),
          ].join("|")
        } 
      });
      const themes   = scoreThemes(signals);
      const deepThemeCodename = pickCodename(themes);
      const coreArchetype = profile?.archetype?.name;
      
      // Hybrid Double Naming (Option C built in code so it never fails)
      let codename = deepThemeCodename;
      if (coreArchetype && coreArchetype !== deepThemeCodename) {
        const strippedTheme = deepThemeCodename.replace(/^[Tt]he\s+/i, "");
        codename = `${coreArchetype}: The ${strippedTheme} Phase`;
      }
      const { strengths, shadows, triggers, prescriptions } = compileBulletLists(signals, themes);

      const anchors = signals.map(s => s.label).filter(Boolean).slice(0, 14);

      // Anti-generic enrichment (no output contract change)
      const agCtx: AntiGenericContext = {
        themeTags:     themes.slice(0, 8).map(t => t.tag),
        stressElement: userInputs?.stressElement,
        decisionStyle: userInputs?.decisionStyle,
        socialEnergy:  userInputs?.socialEnergy,
      };
      const contradictionHint    = getContradictionHint(agCtx);
      const behavioralStatements = getBehavioralStatements("pressure_pattern", agCtx, 3);

      let narrative = "";

      const prompt = narratorPrompt({
        codename,
        archetype: codename,
        themes: themes.slice(0, 6).map(t => ({ tag: t.tag, score: t.score })),
        strengths,
        shadows,
        triggers,
        prescriptions,
        anchors,
        contradictionHint,
        behavioralStatements,
        lifeConsequence: profile?.synthesis?.lifeConsequence,
        patternInterruption: profile?.synthesis?.patternInterruption,
        loopSentence: profile?.synthesis?.loopSentence,
      });

      try {
        const aiResponse = await routeAIRequest({
          prompt,
          promptType: "biography",
          temperature: 0.82
        });
        
        let parsed: any;
        try {
          let rawJson = (aiResponse.content || "").replace(/```json/gi, "").replace(/```/g, "").trim();
          parsed = JSON.parse(rawJson);
          if (!parsed.who_i_am || parsed.who_i_am.length < 10) {
            throw new Error("Parsed JSON lacked content");
          }
        } catch (parseErr) {
          console.error("[codex30] Narrative parse failed, using secondary fallback:", parseErr);
          parsed = {
            codename: codename,
            motto: "In alignment, I find my power.",
            who_i_am: `I am a ${coreArchetype || "Soul"}. I process reality through a lens of ${themes[0]?.tag || "clarity"}.`,
            how_i_move: "I move best when I follow my internal signal and protect my focus.",
            what_i_wont_tolerate: "I refuse to be defined by external noise or misaligned expectations.",
            what_im_building: "I am constructing a life of alignment and purpose."
          };
        }
        
        const buildNarrativeString = (p: any) => {
          const thisWeekArr = Array.isArray(p.this_week) ? p.this_week : [];
          
          // Enforce codename integrity: if AI tries to downgrade or change it, we ignore it.
          const finalCodename = codename; // Use the one we calculated, ignore AI's suggestion
          if (p.codename && p.codename !== codename) {
            console.warn(`[codex30] AI tried to change codename: ${codename} -> ${p.codename}. Ignoring.`);
          }

          return `CODENAME: ${finalCodename}
MOTTO: ${p.motto || "I build my truth in the silence of action."}

WHO I AM
${p.who_i_am || "Your blueprint is calibrating. Focus on steady progress today."}

HOW I MOVE UNDER PRESSURE
${p.how_i_move || "Under stress, I return to my core principles."}

WHAT I WON'T TOLERATE
${p.what_i_wont_tolerate || "I refuse to be defined by noise or external distractions."}

WHAT I'M BUILDING
${p.what_im_building || "I am constructing a life of alignment and purpose."}

THIS WEEK
${thisWeekArr.map((t: string) => (typeof t === 'string' && t.startsWith("-")) ? t : `- ${t}`).join("\n")}`;
        };

        narrative = buildNarrativeString(parsed);

      } catch (e) {
        console.warn("[codex30] AI JSON generation error, triggering rewrite fallback:", e);
      }

      if (!narrative || isGeneric(narrative)) {
        try {
          const rPrompt = rewritePrompt(narrative || "No output generated.", anchors);
          const aiResponseRewrite = await routeAIRequest({
            prompt: rPrompt,
            promptType: "biography",
            temperature: 0.88
          });
          let rawJsonRw = (aiResponseRewrite.content || "").replace(/```json/gi, "").replace(/```/g, "").trim();
          let parsedRw = JSON.parse(rawJsonRw);
          
          const thisWeekArrRw = Array.isArray(parsedRw.this_week) ? parsedRw.this_week : [];
          narrative = `CODENAME: ${parsedRw.codename || codename}
MOTTO: ${parsedRw.motto || "My path is carved by intention."}

WHO I AM
${parsedRw.who_i_am || "Aligning with the cosmic cycle."}

HOW I MOVE UNDER PRESSURE
${parsedRw.how_i_move || "Returning to the center."}

WHAT I WON'T TOLERATE
${parsedRw.what_i_wont_tolerate || "Static energy and noise."}

WHAT I'M BUILDING
${parsedRw.what_im_building || "A foundation for the eternal now."}

THIS WEEK
${thisWeekArrRw.map((t: string) => (typeof t === 'string' && t.startsWith("-")) ? t : `- ${t}`).join("\n")}`;

        } catch (e) {
          console.warn("[codex30] AI rewrite JSON error:", e);
        }
      }

      if (!narrative) {
        narrative = buildFallbackNarrative(codename, anchors, themes, strengths, triggers);
      }

      // Strip any raw signal-label artifacts the AI echoed back
      narrative = scrubNarrative(narrative);

      // Log any banned phrases that slipped through for audit (non-blocking)
      const langCheck = checkNarrative(narrative);
      if (!langCheck.pass) {
        console.warn("[anti-generic] Hard-reject phrases in narrative:", langCheck.hardRejects);
      }

      const conf = profile?.meta?.confidence ?? profile?.confidence;
      const badges = {
        confidenceLabel: conf?.label ?? conf?.badge ?? "Unverified",
        reason: conf?.reason ?? ""
      };

      if (!isPremium) {
        // Strip response for free users: keep codename, motto, top 3 themes (name+score only), first 2 sentences of WHO I AM
        const top3Themes = themes.slice(0, 3).map(t => ({ tag: t.tag, score: t.score }));

        // Extract MOTTO section (keep for free users per spec)
        const mottoMatch = narrative.match(/(MOTTO:[^\n]*(?:\n[^\n]+)*?)(?=\nWHO I AM|\nHOW I MOVE|\nWHAT I WON|\nWHAT I'M|\nTHIS WEEK|$)/i);
        const mottoSection = mottoMatch ? mottoMatch[1].trim() : "";

        // Extract first 2 sentences from the WHO I AM narrative section
        const whoIAmMatch = narrative.match(/WHO I AM[\s\S]*?(?:\n|$)([\s\S]*?)(?=HOW I MOVE|WHAT I WON|WHAT I'M|THIS WEEK|$)/i);
        let whoIAmTeaser = "";
        if (whoIAmMatch) {
          const whoIAmText = whoIAmMatch[1].trim();
          const sentences = whoIAmText.match(/[^.!?]+[.!?]+/g) ?? [];
          whoIAmTeaser = sentences.slice(0, 2).join(" ").trim();
        }

        // Rebuild a minimal narrative: MOTTO + WHO I AM teaser
        const teaserParts: string[] = [];
        if (mottoSection) teaserParts.push(mottoSection);
        if (whoIAmTeaser) teaserParts.push(`WHO I AM\n${whoIAmTeaser}`);
        const teaserNarrative = teaserParts.join("\n\n");

        return res.json({
          ok: true,
          synthesis: {
            codename,
            archetype: codename,
            badges,
            topThemes: top3Themes,
            strengths: [],
            shadows: [],
            triggers: [],
            prescriptions: [],
            narrative: teaserNarrative,
            isPremium: false,
          }
        });
      }

      return res.json({
        ok: true,
        synthesis: {
          codename,
          archetype: codename,
          badges,
          topThemes: themes,
          strengths,
          shadows,
          triggers,
          prescriptions,
          narrative,
          isPremium: true,
          debug: { signals, themeScores: themes }
        }
      });
    } catch (error) {
      console.error("[codex30] Generation error:", error);
      return handleError(error, res, "Codex30");
    }
  });

  // ── Soul Comparables — symbolic analogies from governed saved evidence ──────
  app.post("/api/soul-comparables", async (req, res) => {
    try {
      const requestedProfileId = req.body?.profileId ?? req.body?.profile?.id;
      if (!requestedProfileId) {
        return res.status(400).json({
          available: false,
          error: "profileId required; caller-supplied identity labels are not accepted",
        });
      }

      const savedProfile = await storage.getProfile(String(requestedProfileId));
      const actor = {
        userId: (req.user as any)?.id ?? null,
        sessionId: req.sessionID ?? null,
      };
      if (!savedProfile || !profileBelongsToActor(savedProfile, actor)) {
        return res.status(404).json({ available: false, error: "Profile not found or access denied" });
      }

      const verifiedAstrology = extractVerifiedAstrology({
        astrologyData: savedProfile.astrologyData,
      });
      const hd = (savedProfile.humanDesignData ?? {}) as any;
      const hdCandidate = hd?.status === "verified"
        ? (hd.candidate && typeof hd.candidate === "object" ? hd.candidate : hd)
        : {};
      const dateOnly = savedProfile.birthDate instanceof Date
        ? savedProfile.birthDate.toISOString().slice(0, 10)
        : String(savedProfile.birthDate).slice(0, 10);

      let lifePath: number | null = null;
      try {
        lifePath = calcLifePath(dateOnly);
      } catch {
        lifePath = null;
      }

      const evidenceLines = [
        verifiedAstrology.sun ? `- Verified Sun: ${verifiedAstrology.sun}` : null,
        verifiedAstrology.moon ? `- Verified Moon: ${verifiedAstrology.moon}` : null,
        verifiedAstrology.rising ? `- Verified Rising: ${verifiedAstrology.rising}` : null,
        lifePath !== null ? `- Life Path: ${lifePath} (deterministic numerology; symbolic interpretation only)` : null,
        typeof hdCandidate.type === "string" ? `- Verified HD Type: ${hdCandidate.type}` : null,
        typeof hdCandidate.authority === "string" ? `- Verified HD Authority: ${hdCandidate.authority}` : null,
        typeof hdCandidate.profile === "string" ? `- Verified HD Profile: ${hdCandidate.profile}` : null,
      ].filter(Boolean);

      if (evidenceLines.length === 0) {
        return res.status(422).json({
          available: false,
          reason: "No governed saved evidence is available for symbolic comparables.",
        });
      }

      const prompt = `
Create four OPTIONAL SYMBOLIC ANALOGIES for ${savedProfile.name}. These are reflective comparisons, not factual claims that the person resembles, equals, or shares the biography of the comparison target.

SUPPORTED EVIDENCE:
${evidenceLines.join("\n")}

Return ONLY valid JSON:
{
  "animal": { "name": "specific animal", "why": "1-2 sentences tied only to supported patterns" },
  "deity": { "name": "Deity - Pantheon", "why": "1-2 sentences explaining the symbolic domain match" },
  "historical": { "name": "Full name - identifier", "why": "1-2 sentences on a limited behavioral analogy, not personality certainty" },
  "icon": { "name": "Name - source", "why": "1-2 sentences on a limited archetypal analogy" }
}

Rules:
- Use only the supported evidence above.
- Do not infer trauma, motives, intelligence, morality, destiny, health, or biography.
- Do not invent unresolved astrology or Human Design.
- Treat numerology and Human Design meanings as symbolic lenses, not scientific measurements.
- No mystical filler or certainty language.
`.trim();

      try {
        const aiResponse = await routeAIRequest({
          prompt,
          promptType: "biography",
          temperature: 0.65,
        });
        const raw = aiResponse.content || "";
        const cleaned = raw.replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`\s*$/, "").trim();
        if (!cleaned) throw new Error("empty_comparables_response");
        const parsed = JSON.parse(cleaned);

        const comparables = {
          animal: {
            name: pureText(parsed.animal?.name),
            why: pureText(parsed.animal?.why),
          },
          deity: {
            name: pureText(parsed.deity?.name),
            why: pureText(parsed.deity?.why),
          },
          historical: {
            name: pureText(parsed.historical?.name),
            why: pureText(parsed.historical?.why),
          },
          icon: {
            name: pureText(parsed.icon?.name),
            why: pureText(parsed.icon?.why),
          },
        };

        return res.json({
          available: true,
          evidenceMode: "saved-governed",
          label: "Optional symbolic analogies",
          comparables,
        });
      } catch (aiErr) {
        console.warn("[SoulComparables] generation unavailable:", aiErr);
        return res.status(503).json({
          available: false,
          reason: "Symbolic comparables are temporarily unavailable; no fallback identities were substituted.",
        });
      }
    } catch (error) {
      console.error("[SoulComparables] Route error:", error);
      return res.status(500).json({ available: false, error: "Internal server error" });
    }
  });

  // Seed access codes on startup
  const seedCodes = [
    { code: "bj0990", maxUses: 1, isActive: true },
    { code: "guest123t", maxUses: 50, isActive: true },
  ];
  for (const seed of seedCodes) {
    const existing = await storage.getAccessCode(seed.code);
    if (!existing) {
      await storage.createAccessCode({
        code: seed.code,
        maxUses: seed.maxUses,
        isActive: seed.isActive,
        usesCount: 0,
        createdAt: new Date(),
      });
      console.log(`[Seed] Access code "${seed.code}" created (maxUses: ${seed.maxUses})`);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}

const DAY_ARCHETYPE: Record<number, string> = {
  1: "initiation — new cycle, first move, self-directed action",
  2: "partnership — cooperation, listening, patience",
  3: "expression — creativity, communication, visibility",
  4: "foundation — structure, discipline, unsexy work",
  5: "liberation — change, disruption, release of the old",
  6: "responsibility — tending relationships, home, health",
  7: "depth — introspection, research, inner refinement",
  8: "leverage — material ambition, power moves, big asks",
  9: "completion — closing loops, forgiveness, letting go",
};

/**
 * Global prompt data sanitizer.
 * Strips pipes, placeholders, and system artifacts before they reach the AI.
 */
function sanitizeForAI(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/\|/g, "")
    .replace(/unknown/gi, "")
    .replace(/chaos/gi, "")
    .replace(/fix/gi, "")
    .trim();
}

/**
 * Generates a personalized Today card using Gemini.
 * Returns partial TodayCardData fields, or null if generation fails.
 */
async function generateTodayCardAI(
  base: import("./server/todayRender").TodayCardData,
  profile: any,
  horoscopeData: any,
  codexSynthesis?: any
): Promise<Partial<import("./server/todayRender").TodayCardData> | null> {
  const profileId = profile?.id ?? profile?.profileId;
  let historyPrompt = "";
  
  if (profileId) {
    try {
      const history = await storage.getDailyInsightsHistory(profileId, 7);
      if (history.length > 0) {
        historyPrompt = "## RECENT BEHAVIORAL HISTORY\n" + 
          history.map(h => {
            const data = h.insightsData as any;
            return `- ${h.date}: ${data.recognitionMoment || data.focus || ""}`;
          }).join("\n") + "\n\n";
      }
    } catch (e) {
      console.warn("[TodayCardAI] History fetch failed:", e);
    }
  }

  const dayNum   = base.personalDayNumber;
  const archDesc = dayNum == null
    ? "personal-day evidence unavailable"
    : (DAY_ARCHETYPE[dayNum] ?? "focused work");
  const moon     = base.moonPhase;
  const codename = sanitizeForAI(base.codename);
  const themeList = (codexSynthesis?.topThemes ?? horoscopeData?.topThemes ?? [])
    .slice(0, 4).map((t: any) => t.tag ?? t).filter(Boolean);
  const themes   = sanitizeForAI(themeList.length ? themeList.join(", ") : (base.topTheme ?? ""));
  const decide   = sanitizeForAI(profile?.userInputs?.decisionStyle ?? profile?.signals?.decisionStyle ?? "");
  const pressure = sanitizeForAI(profile?.userInputs?.pressureStyle ?? profile?.signals?.pressureStyle ?? "");
  const transit  = sanitizeForAI(horoscopeData?.personalTransits?.[0]?.description ?? "");

    const prompt = `
You are the final synthesis layer of Soul Codex.
Your job is to expose ${codename}'s behavioral pattern today with surgical accuracy, grounded realism, and zero system leakage.

---
${historyPrompt}
## 🧬 IDENTITY DATA
- IDENTITY: ${codename}
- TOP THEMES: ${themes || "Unavailable — do not infer"}
- PERSONAL DAY: ${dayNum == null ? "Unavailable — do not infer" : `${dayNum} — ${archDesc}`}
- MOON PHASE: ${moon === "Unavailable" ? "Unavailable — do not infer" : moon}
- DECISION STYLE: ${decide || "Omit"}
- PRESSURE STYLE: ${pressure || "Omit"}
${transit ? `- ACTIVE TRANSIT: ${transit}` : ""}

---
${VOICE_LAWS}

---
## 🧪 CORE DIRECTIVE
- Write in FIRST PERSON (I/my/me).
- Expose the behavioral loop today. Focus on what I DO, what others notice, and the observable loop.
- CHECK FOR RECURRING LOOPS. If the same pattern is repeating from history, confront me directly. 
- Tone: Escalation. Day 1 is observation. Day 3 is confrontation. Day 7 is declaration of choice.
- No "I think," "I feel," "I try." Use direct verbs.

---
## OUTPUT FORMAT
RECOGNITION: [One blunt, uncomfortable behavioral confession. 12 words max.]
MEMORY: [If repeating a pattern from history, call it out. Otherwise omit.]
FOCUS: [One sentence exposing the core loop today.]
TOMORROW: [Expose the tension for tomorrow.]
DO:
- [behavioral action 1]
- [behavioral action 2]
- [behavioral action 3]
DONT:
- [trap to avoid 1]
- [trap to avoid 2]
- [trap to avoid 3]
WATCHOUT:
- [escalation trigger 1]
- [escalation trigger 2]
DECISION: [behavioral decision rule for today]
`.trim();

  const aiResponse = await routeAIRequest({
    prompt,
    promptType: "today_card",
    temperature: 0.78
  });
  const raw = aiResponse.content || "";
  if (!raw) return null;

  // Final Quality Firewall - Skip for deterministic fallback as it's pre-validated
  if (aiResponse.status !== 'fallback') {
    const score = scoreOutput(raw);
    if (!score.passed) {
      console.warn(`[TodayCardAI] Output score ${score.total.toFixed(1)} failed threshold. Rejecting AI card.`);
      return null;
    }
  }

  try {
    const recognitionMatch = raw.match(/^RECOGNITION:\s*(.+)/m);
    const memoryMatch    = raw.match(/^MEMORY:\s*(.+)/m);
    const focusMatch     = raw.match(/^FOCUS:\s*(.+)/m);
    const tomorrowMatch  = raw.match(/^TOMORROW:\s*(.+)/m);
    const doMatch        = raw.match(/DO:\n((?:- .+\n?){1,5})/);
    const dontMatch      = raw.match(/DONT:\n((?:- .+\n?){1,5})/);
    const watchMatch     = raw.match(/WATCHOUT:\n((?:- .+\n?){1,4})/);
    const decideMatch    = raw.match(/DECISION:\s*([\s\S]+?)(?:\n[A-Z]+:|$)/);

    const parseList = (block: string | undefined) =>
      (block ?? "").split("\n")
        .map(l => l.replace(/^-\s*/, "").trim())
        .filter(Boolean);

    const recognition = recognitionMatch?.[1]?.trim() ?? "";
    const memory      = memoryMatch?.[1]?.trim() ?? "";
    const focus       = focusMatch?.[1]?.trim() ?? "";
    const tomorrow    = tomorrowMatch?.[1]?.trim() ?? "";
    const doList      = parseList(doMatch?.[1]);
    const dontList    = parseList(dontMatch?.[1]);
    const watchouts   = parseList(watchMatch?.[1]);
    const decisionAdv = decideMatch?.[1]?.trim() ?? "";

    if (!focus || doList.length < 2 || dontList.length < 2) return null;

    return {
      recognitionMoment: recognition,
      memoryCallout: memory,
      focus,
      tomorrowTension: tomorrow,
      doList:       doList.slice(0, 3),
      dontList:     dontList.slice(0, 3),
      watchouts:    watchouts.slice(0, 2),
      decisionAdvice: decisionAdv || base.decisionAdvice,
    };
  } catch {
    return null;
  }
}

/**
 * Strips raw signal-label artifacts the AI sometimes echoes verbatim
 * instead of rephrasing them into first-person behavioral prose.
 */
function scrubNarrative(text: string): string {
  let out = text
    // Remove whole sentences like "When I look at Stress element: air, I see..."
    .replace(/[^.!?\n]*\b(?:Stress element|Decision style|Non-negotiable|My default pressure response|My strengths? (?:include|are)|Under stress|Evidence):[^.!?\n]*[.!?]?/gi, " ")
    // Remove any bare label+colon fragments the sentence-level pass missed
    .replace(/\bStress element:\s*\w+/gi, "")
    .replace(/\bDecision style:\s*[\w _]+/gi, "")
    .replace(/\bNon-negotiable:\s*/gi, "")
    .replace(/\bMy strengths? (?:include|are):\s*/gi, "")
    .replace(/\bMy default pressure response:\s*/gi, "")
    .replace(/\bUnder stress:\s*/gi, "")
    .replace(/\bEvidence:\s*/gi, "");

  // Fix double-spaces or sentences that now begin with lowercase after prefix removal
  out = out
    .replace(/  +/g, " ")
    // Trim leading space/comma at start of a sentence after removal
    .replace(/(^|\n) +/gm, "$1")
    .replace(/(^|\n)[,;] /gm, "$1");

  // Collapse triple+ newlines
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function buildFallbackNarrative(
  codename: string,
  anchors: string[],
  themes: { tag: string; score: number }[],
  strengths: string[],
  triggers: string[]
): string {
  const topTheme = themes[0]?.tag ?? "precision";
  const secondTheme = themes[1]?.tag ?? "discipline";
  const s1 = strengths[0] ?? "I protect my attention like a resource, because it is one.";
  const s2 = strengths[1] ?? "";
  const t1 = triggers[0] ?? "Sloppy work and vague promises.";
  const t2 = triggers[1] ?? "";

  return `CODENAME: ${codename}
MOTTO: I build what others talk about.

WHO I AM
I operate from a core of ${topTheme}. Everything I do — how I decide, how I rest, how I protect my attention — runs through that filter. The same pattern shows up across different contexts. I am not confused about what I value; I may not always know how to get there, but I know what I'm pointing at.

${s1}${s2 ? " " + s2 : ""} I have learned not to explain myself to people who aren't willing to understand. That came from lived experience, not theory.

HOW I MOVE UNDER PRESSURE
When things get hard, my system defaults to what it knows. I do not perform calm — I find it, or I go quiet until I do. Pressure is not inherently a problem. The problem is pressure combined with noise, with vague demands, with people who haven't done the work.

I have a limited tolerance for inefficiency under stress. I move toward what I can control and cut what I cannot. ${secondTheme.charAt(0).toUpperCase() + secondTheme.slice(1)} is a load-bearing part of how I function — not an accessory.

WHAT I WON'T TOLERATE
${t1}${t2 ? " " + t2 : ""} I do not negotiate with people who have already decided they won't change. I know the cost of letting that slide.

WHAT I'M BUILDING
I am in a longer build cycle than most people realize. I am not optimizing for applause. I am building something that will outlast the moment I'm in. The work is the signal.

THIS WEEK
- Complete one thing you've been circling. Completion is data.
- Reduce noise. Your best thinking requires space, not stimulation.
- Say no to one thing that belongs to someone else's urgency.`;
}
