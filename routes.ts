import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { birthDataSchema, enneagramAssessmentSchema, mbtiAssessmentSchema, type Profile, signupSchema, loginSchema } from "@shared/schema";
import { sendTestNotificationSchema, broadcastNotificationSchema } from "@shared/notification-schemas";
import { calculateAstrology, getTarotBirthCards } from "./services/astrology";
import { calculateNumerology } from "./services/numerology";
import { calculateEnneagram, calculateMBTI } from "./services/personality";
import { synthesizeArchetype, generateIntegrationAnalysis, generatePersonalizedInsights } from "./services/archetype";
import { generateBiography, generateDailyGuidance } from "./services/openai";
import { calculateHumanDesign } from "./services/human-design";
import { generateDailyInsights } from "./services/daily-insights";
import { calculateCompatibility } from "./services/compatibility";
import { generateCompatibilityInsights } from "./services/compatibility-insights";
import { getMoonPhase, getMoonSign, getCurrentHDGate, calculateUniversalDayNumber, calculatePersonalDayNumber } from "./services/daily-context";
import { calculateVedicAstrology } from "./services/vedic-astrology";
import { calculateGeneKeys } from "./services/gene-keys";
import { calculateIChing } from "./services/i-ching";
import { calculateChineseAstrology } from "./services/chinese-astrology";
import { calculateKabbalah } from "./services/kabbalah";
import { calculateMayanAstrology } from "./services/mayan-astrology";
import { calculateChakraSystem } from "./services/chakra-system";
import { calculateSacredGeometry } from "./services/sacred-geometry";
import { calculateRunes } from "./services/runes";
import { calculateSabianSymbols } from "./services/sabian-symbols";
import { calculateAyurveda } from "./services/ayurveda";
import { calculateBiorhythms } from "./services/biorhythms";
import { calculateAsteroids } from "./services/asteroids";
import { calculateArabicParts } from "./services/arabic-parts";
import { calculateFixedStars } from "./services/fixed-stars";
import { generatePalmReading } from "./services/palmistry";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { hashPassword, verifyPassword } from "./auth/passwordUtils";
import { randomUUID } from "crypto";
import { calculateActiveTransits, extractNatalPositions } from "./services/transits";
import { getActiveTransmutationTechniques } from "./services/transmutation";
import { calculateCongruenceScore } from "./services/congruence";
import { registerChatRoutes } from "./routes/chat";
import Stripe from "stripe";
import { SubscriptionService } from "./services/subscription-service";
import { entitlementService } from "./services/entitlement-service";
import { runWithTimeoutAndTiming, TIMEOUT_VALUES } from "./utils/timeout";

// Initialize SubscriptionService (if Stripe is configured)
let subscriptionService: SubscriptionService | null = null;
if (process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_PRICE_WEEKLY && 
    process.env.STRIPE_PRICE_MONTHLY && 
    process.env.STRIPE_PRICE_YEARLY) {
  subscriptionService = new SubscriptionService({
    storage,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    priceIds: {
      weekly: process.env.STRIPE_PRICE_WEEKLY,
      monthly: process.env.STRIPE_PRICE_MONTHLY,
      yearly: process.env.STRIPE_PRICE_YEARLY,
    },
  });
  console.log("[SubscriptionService] Initialized successfully");
} else {
  console.warn("[SubscriptionService] Not initialized - missing Stripe configuration");
}

// Utility function for consistent error responses
function handleError(error: unknown, res: any, context: string) {
  console.error(`[${context}] Error:`, error);
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
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

import compatibilityRoutes from "./routes/compatibility";
import { getVapidPublicKey } from "./services/push-notifications";
import { insertPushSubscriptionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  // Stripe webhook endpoint (MUST be registered before express.json() middleware)
  // Uses raw body for signature verification
  app.post('/api/stripe/webhook', 
    (req: any, res: any, next: any) => {
      // Parse raw body for Stripe signature verification
      const rawMiddleware = require('express').raw({ type: 'application/json' });
      rawMiddleware(req, res, next);
    },
    async (req: any, res: any) => {
      try {
        // Check if Stripe is configured
        if (!subscriptionService) {
          console.error('[StripeWebhook] SubscriptionService not initialized');
          return res.status(503).json({ error: 'Webhook handler not configured' });
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
          return res.status(503).json({ error: 'Webhook secret not configured' });
        }

        // Get signature from headers
        const signature = req.headers['stripe-signature'];
        if (!signature) {
          console.warn('[StripeWebhook] Missing stripe-signature header');
          return res.status(400).json({ error: 'Missing signature' });
        }

        // Verify webhook signature and construct event
        let event: Stripe.Event;
        try {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
          event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        } catch (err: any) {
          console.warn('[StripeWebhook] Signature verification failed:', {
            error: err.message,
            ip: req.ip,
            timestamp: new Date().toISOString(),
          });
          return res.status(400).json({ error: 'Invalid signature' });
        }

        console.log(`[StripeWebhook] Received event: ${event.type} (${event.id})`);

        // Idempotency check: Has this event already been processed?
        const existingEvent = await storage.getWebhookEventByStripeId(event.id);
        if (existingEvent) {
          console.log(`[StripeWebhook] Event ${event.id} already processed, skipping`);
          return res.status(200).json({ result: 'skipped', message: 'Event already processed' });
        }

        // Route event to appropriate handler
        let result: 'success' | 'error' | 'skipped' = 'success';
        let metadata: any = { eventType: event.type, receivedAt: new Date().toISOString() };

        try {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object as Stripe.Checkout.Session;
              await subscriptionService.handleCheckoutCompleted(session);
              metadata.customerId = session.customer;
              metadata.subscriptionId = session.subscription;
              break;
            }

            case 'customer.subscription.updated': {
              const subscription = event.data.object as Stripe.Subscription;
              await subscriptionService.handleSubscriptionUpdated(subscription);
              metadata.customerId = subscription.customer;
              metadata.subscriptionId = subscription.id;
              break;
            }

            case 'customer.subscription.deleted': {
              const subscription = event.data.object as Stripe.Subscription;
              await subscriptionService.handleSubscriptionDeleted(subscription);
              metadata.customerId = subscription.customer;
              metadata.subscriptionId = subscription.id;
              break;
            }

            case 'invoice.payment_failed': {
              const invoice = event.data.object as Stripe.Invoice;
              await subscriptionService.handlePaymentFailed(invoice);
              metadata.customerId = invoice.customer;
              metadata.invoiceId = invoice.id;
              break;
            }

            default:
              console.log(`[StripeWebhook] Unknown event type: ${event.type}, skipping`);
              result = 'skipped';
              break;
          }

          // Store webhook event for idempotency (after successful processing)
          try {
            await storage.createWebhookEvent({
              stripeEventId: event.id,
              type: event.type,
              result,
              metadata,
            });
          } catch (createErr: any) {
            // Catch unique constraint violations (race condition - event processed by another instance)
            if (createErr.code === '23505' || createErr.message?.includes('unique')) {
              console.log(`[StripeWebhook] Unique constraint violation for ${event.id}, treating as already processed`);
              return res.status(200).json({ result: 'skipped', message: 'Event already processed' });
            }
            throw createErr; // Re-throw other errors
          }

          return res.status(200).json({ result, message: 'Webhook processed successfully' });

        } catch (handlerErr: any) {
          console.error('[StripeWebhook] Handler error:', {
            eventId: event.id,
            eventType: event.type,
            error: handlerErr.message,
            stack: handlerErr.stack,
          });

          // Store error event
          try {
            await storage.createWebhookEvent({
              stripeEventId: event.id,
              type: event.type,
              result: 'error',
              metadata: { ...metadata, error: handlerErr.message },
            });
          } catch (err) {
            console.error('[StripeWebhook] Failed to store error event:', err);
          }

          // Return 500 to trigger Stripe retry
          return res.status(500).json({ error: 'Webhook processing failed' });
        }

      } catch (err: any) {
        console.error('[StripeWebhook] Fatal error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  );
  
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

  // Get current user (works for both Replit Auth and local auth)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Allow anonymous users - return null instead of 401
      if (!req.isAuthenticated() || !req.user) {
        return res.json(null);
      }
      
      // For Replit Auth users
      if (req.user.claims) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      // For local auth users
      if (req.user.id) {
        const user = await storage.getUser(req.user.id);
        return res.json({ ...user, authProvider: req.user.authProvider });
      }
      
      // Fallback for edge cases
      res.json(null);
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

  // Get user entitlement status (premium access)
  app.get('/api/entitlements', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionID;

      if (!userId && !sessionId) {
        return res.status(401).json({ message: "Unauthorized - no user or session found" });
      }

      const status = await entitlementService.getUserPremiumStatus({ userId, sessionId });
      res.json(status);
    } catch (error) {
      handleError(error, res, "GetEntitlements");
    }
  });
  
  // Get all profiles for the current user (authenticated or anonymous)
  app.get("/api/profiles", async (req, res) => {
    try {
      let profile;
      
      console.log(`[GetProfiles] Request sessionID: ${req.sessionID}, userId: ${req.user?.id || 'none'}`);
      
      // For authenticated users
      if (req.user?.id) {
        console.log(`[GetProfiles] Fetching by userId: ${req.user.id}`);
        profile = await storage.getProfileByUserId(req.user.id);
      } 
      // For anonymous users (session-based)
      else if (req.sessionID) {
        // Query all profiles and filter by sessionId
        console.log(`[GetProfiles] Fetching by sessionId: ${req.sessionID}`);
        const allProfiles = await storage.getAllProfiles();
        console.log(`[GetProfiles] Total profiles in DB: ${allProfiles.length}`);
        console.log(`[GetProfiles] Profile sessionIds: ${allProfiles.map(p => p.sessionId).join(', ')}`);
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
            latitude: birthData.latitude!,
            longitude: birthData.longitude!,
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
      
      // Get Tarot birth cards
      let tarotCards;
      try {
        tarotCards = getTarotBirthCards(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Tarot calculation failed:", error);
        tarotCards = []; // Non-critical, can continue without tarot cards
      }
      
      // Calculate all new mystical systems (30+ total)
      let vedicAstrologyData, geneKeysData, iChingData, chineseAstrologyData;
      let kabbalahData, mayanAstrologyData, chakraData, sacredGeometryData;
      let runesData, sabianSymbolsData, ayurvedaData, biorhythmsData;
      let asteroidsData, arabicPartsData, fixedStarsData;
      
      // Vedic Astrology (requires complete data)
      if (hasCompleteData) {
        try {
          vedicAstrologyData = calculateVedicAstrology({
            birthDate: birthData.birthDate,
            birthTime: birthData.birthTime!,
            latitude: parseFloat(birthData.latitude!),
            longitude: parseFloat(birthData.longitude!),
            timezone: birthData.timezone!
          });
        } catch (error) {
          console.error("[CreateProfile] Vedic Astrology calculation failed:", error);
          vedicAstrologyData = null;
        }
      } else {
        vedicAstrologyData = null;
      }
      
      // Gene Keys (requires complete data for HD gates)
      if (hasCompleteData && astrologyData && humanDesignData) {
        try {
          const sunGate = humanDesignData.activations.conscious.sun.gate;
          const earthGate = humanDesignData.activations.conscious.earth.gate;
          const moonGate = humanDesignData.activations.conscious.moon.gate;
          geneKeysData = calculateGeneKeys(sunGate, earthGate, moonGate);
        } catch (error) {
          console.error("[CreateProfile] Gene Keys calculation failed:", error);
          geneKeysData = null;
        }
      } else {
        geneKeysData = null;
      }
      
      // I Ching (works with just birth date)
      try {
        iChingData = calculateIChing(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] I Ching calculation failed:", error);
        iChingData = null;
      }
      
      // Chinese Astrology (works with just birth date)
      try {
        chineseAstrologyData = calculateChineseAstrology(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Chinese Astrology calculation failed:", error);
        chineseAstrologyData = null;
      }
      
      // Kabbalah (works with name + birth date + numerology)
      try {
        kabbalahData = calculateKabbalah(birthData.name, birthData.birthDate, numerologyData.lifePath);
      } catch (error) {
        console.error("[CreateProfile] Kabbalah calculation failed:", error);
        kabbalahData = null;
      }
      
      // Mayan Astrology (works with just birth date)
      try {
        mayanAstrologyData = calculateMayanAstrology(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Mayan Astrology calculation failed:", error);
        mayanAstrologyData = null;
      }
      
      // Chakra System (works with birth date + numerology)
      try {
        chakraData = calculateChakraSystem(birthData.birthDate, numerologyData.lifePath, astrologyData);
      } catch (error) {
        console.error("[CreateProfile] Chakra System calculation failed:", error);
        chakraData = null;
      }
      
      // Sacred Geometry (works with birth date + numerology)
      try {
        sacredGeometryData = calculateSacredGeometry(birthData.birthDate, numerologyData.lifePath, birthData.name);
      } catch (error) {
        console.error("[CreateProfile] Sacred Geometry calculation failed:", error);
        sacredGeometryData = null;
      }
      
      // Runes (works with name + birth date + numerology)
      try {
        runesData = calculateRunes(birthData.name, birthData.birthDate, numerologyData.lifePath);
      } catch (error) {
        console.error("[CreateProfile] Runes calculation failed:", error);
        runesData = null;
      }
      
      // Sabian Symbols (requires complete data for planetary longitudes)
      if (hasCompleteData && astrologyData) {
        const sunLongitude = (astrologyData.planets.sun.house - 1) * 30 + astrologyData.planets.sun.degree;
        const moonLongitude = (astrologyData.planets.moon.house - 1) * 30 + astrologyData.planets.moon.degree;
        const ascendantLongitude = astrologyData.houses[0].degree;
        sabianSymbolsData = await runWithTimeoutAndTiming(
          "Sabian Symbols",
          TIMEOUT_VALUES.SABIAN_SYMBOLS,
          () => calculateSabianSymbols(sunLongitude, moonLongitude, ascendantLongitude),
          null
        );
      } else {
        sabianSymbolsData = null;
      }
      
      // Ayurveda (works with birth date, enhanced with astrology)
      try {
        ayurvedaData = calculateAyurveda(birthData.birthDate, astrologyData, undefined);
      } catch (error) {
        console.error("[CreateProfile] Ayurveda calculation failed:", error);
        ayurvedaData = null;
      }
      
      // Biorhythms (works with just birth date)
      try {
        biorhythmsData = calculateBiorhythms(birthData.birthDate);
      } catch (error) {
        console.error("[CreateProfile] Biorhythms calculation failed:", error);
        biorhythmsData = null;
      }
      
      // Palmistry (works with birth date + numerology life path)
      let palmistryData;
      try {
        palmistryData = generatePalmReading(birthData.birthDate, numerologyData.lifePath);
        console.log("[CreateProfile] Palm reading generated successfully");
      } catch (error) {
        console.error("[CreateProfile] Palmistry calculation failed:", error);
        palmistryData = null;
      }
      
      // Asteroids (requires complete data for planetary positions)
      if (hasCompleteData && astrologyData) {
        try {
          const ascendantLongitude = astrologyData.houses[0].degree;
          asteroidsData = calculateAsteroids(
            birthData.birthDate,
            birthData.birthTime!,
            birthData.timezone!,
            ascendantLongitude
          );
        } catch (error) {
          console.error("[CreateProfile] Asteroids calculation failed:", error);
          asteroidsData = null;
        }
      } else {
        asteroidsData = null;
      }
      
      // Arabic Parts (requires complete data for ascendant)
      if (hasCompleteData && astrologyData) {
        try {
          const ascendantLongitude = astrologyData.houses[0].degree;
          arabicPartsData = calculateArabicParts(
            ascendantLongitude,
            astrologyData.planets.sun.degree,
            astrologyData.planets.moon.degree,
            astrologyData.planets.venus.degree,
            astrologyData.planets.jupiter.degree,
            astrologyData.planets.saturn.degree,
            true // isDayBirth - simplified
          );
        } catch (error) {
          console.error("[CreateProfile] Arabic Parts calculation failed:", error);
          arabicPartsData = null;
        }
      } else {
        arabicPartsData = null;
      }
      
      // Fixed Stars (requires planetary longitudes)
      if (hasCompleteData && astrologyData) {
        try {
          const planetLongitudes = {
            sun: astrologyData.planets.sun.degree,
            moon: astrologyData.planets.moon.degree,
            mercury: astrologyData.planets.mercury.degree,
            venus: astrologyData.planets.venus.degree,
            mars: astrologyData.planets.mars.degree,
            jupiter: astrologyData.planets.jupiter.degree,
            saturn: astrologyData.planets.saturn.degree
          };
          fixedStarsData = calculateFixedStars(planetLongitudes);
        } catch (error) {
          console.error("[CreateProfile] Fixed Stars calculation failed:", error);
          fixedStarsData = null;
        }
      } else {
        fixedStarsData = null;
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
        integrationAnalysis = "Your unique cosmic blueprint reveals deep insights into your soul's journey.";
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
        personalizedInsights: personalizedInsights,
        tarotCards
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
          // All 15 new advanced systems + tarot for COMPLETE synthesis (30+ systems total)
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
          tarotCards // Tarot birth cards
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
          archetype: baseArchetypeData
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
      console.log(`[CreateProfile] req.sessionID: ${req.sessionID}, req.user: ${JSON.stringify(req.user)}`);
      
      // Create profile with all 30+ systems
      const profile = await storage.createProfile({
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
        biography,
        dailyGuidance
      });
      
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
        
        // Get Tarot birth cards if not present
        const tarotCards = getTarotBirthCards(profile.birthDate);
        
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
          personalizedInsights: personalizedInsights,
          tarotCards: tarotCards
        };
        
        updatedData.archetypeData = enhancedArchetypeData;
        needsUpdate = true;
      }

      // Check for enhanced astrology data (may have basic vs comprehensive data) - only if complete data available
      const astroData = profile.astrologyData as any;
      if ((!astroData || !astroData.interpretations || !astroData.northNode || !astroData.southNode || !astroData.chiron) && profileHasCompleteData) {
        console.log("Auto-healing: Missing enhanced astrologyData for profile", req.params.id);
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
      
      const today = new Date().toISOString().split('T')[0];
      
      // Parallel fetch of profile and daily insights
      const [profile, dailyInsightsRecord] = await Promise.all([
        storage.getProfile(profileId),
        storage.getDailyInsight(profileId, today)
      ]);
      
      if (!profile) {
        console.log(`[GetRituals] Profile not found: ${profileId}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const warnings: string[] = [];
      const ayurvedaData = profile.ayurvedaData;
      
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
        personalizedInsights: personalizedInsights,
        tarotCards: (profile.archetypeData as any)?.tarotCards
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
        personalizedInsights: personalizedInsights,
        tarotCards: (profile.archetypeData as any)?.tarotCards
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
      
      if (!profileId || typeof profileId !== 'string') {
        return res.status(400).json({ message: "Valid profileId is required" });
      }
      
      console.log(`[ValidateAccessCode] Validating code for profile: ${profileId}`);
      
      // Get the access code (case-insensitive)
      const normalizedCode = code.trim().toLowerCase();
      const accessCode = await storage.getAccessCode(normalizedCode);
      if (!accessCode) {
        console.log(`[ValidateAccessCode] Code not found: ${normalizedCode}`);
        return res.status(404).json({ message: "Invalid access code" });
      }
      
      // Validate code constraints WITHOUT incrementing yet
      if (!accessCode.isActive) {
        return res.status(400).json({ message: "Access code is inactive" });
      }
      
      if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
        return res.status(400).json({ message: "Access code has expired" });
      }
      
      if (accessCode.usesCount >= accessCode.maxUses) {
        return res.status(400).json({ message: "Access code has reached maximum uses" });
      }
      
      // Verify profile exists BEFORE incrementing usage
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Upgrade profile to premium
      const updatedProfile = await storage.updateProfile(profileId, {
        isPremium: true
      });
      
      // Only increment usage after successful upgrade
      await storage.incrementAccessCodeUse(normalizedCode);
      
      console.log(`[ValidateAccessCode] Code validated and profile upgraded: ${profileId}`);
      res.json({ 
        success: true, 
        message: "Premium access activated!",
        profile: updatedProfile 
      });
    } catch (error) {
      return handleError(error, res, "ValidateAccessCode");
    }
  });

  // Create Stripe subscription checkout session
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!subscriptionService) {
        console.error("[CreateSubscription] SubscriptionService not initialized");
        return res.status(503).json({ error: "Payment system temporarily unavailable. Please try again later or contact support." });
      }

      const { plan } = req.body;
      
      if (!plan || !['weekly', 'monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan selected" });
      }
      
      // Get user ID and email from session (authenticated or anonymous)
      const userId = (req.session as any).userId;
      const sessionId = req.sessionID;
      const email = (req.user as any)?.email || (req.session as any).email;
      
      // Create checkout session using the subscription service
      const result = await subscriptionService.createCheckoutSession({
        plan: plan as 'weekly' | 'monthly' | 'yearly',
        userId,
        sessionId: !userId ? sessionId : undefined,
        email,
        successUrl: `${req.headers.origin || 'http://localhost:5000'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${req.headers.origin || 'http://localhost:5000'}/pricing`,
      });
      
      console.log(`[CreateSubscription] Session created for ${userId || sessionId}, plan: ${plan}`);
      res.json({ url: result.url, sessionId: result.sessionId });
    } catch (error: any) {
      return handleError(error, res, "CreateSubscription");
    }
  });

  // Verify and confirm subscription after Stripe checkout
  app.post("/api/confirm-subscription", async (req, res) => {
    try {
      if (!subscriptionService) {
        console.error("[ConfirmSubscription] SubscriptionService not initialized");
        return res.status(500).json({ error: "Payment system not configured" });
      }

      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      // Confirm subscription using the service (handles profile fallback and proper user/session lookup)
      const result = await subscriptionService.confirmSubscription(sessionId);
      
      console.log(`[ConfirmSubscription] Subscription confirmed for profile ${result.profileId}, plan: ${result.plan}`);
      
      res.json({ 
        success: result.success, 
        message: "Subscription confirmed and activated",
        plan: result.plan,
        profileId: result.profileId
      });
    } catch (error: any) {
      return handleError(error, res, "ConfirmSubscription");
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
        lifePaths: {} as Record<string, number>,
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
          if (numData.lifePath) {
            const lpKey = String(numData.lifePath);
            stats.lifePaths[lpKey] = (stats.lifePaths[lpKey] || 0) + 1;
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
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`[GetDailyInsights] Fetching insights for profile ${profileId} on ${today}`);
      
      // Get the profile
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check if we already have insights for today
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

  // Calculate compatibility between two profiles
  app.post("/api/compatibility", async (req, res) => {
    try {
      const { profile1Id, profile2Id } = req.body;
      
      if (!profile1Id || !profile2Id) {
        return res.status(400).json({ message: "Both profile1Id and profile2Id are required" });
      }
      
      if (profile1Id === profile2Id) {
        return res.status(400).json({ message: "Cannot calculate compatibility with the same profile" });
      }
      
      console.log(`[CalculateCompatibility] Calculating compatibility between ${profile1Id} and ${profile2Id}`);
      
      // Check if we already have this compatibility calculated
      const existingCompatibility = await storage.getCompatibility(profile1Id, profile2Id);
      if (existingCompatibility) {
        console.log(`[CalculateCompatibility] Returning cached compatibility`);
        return res.json(existingCompatibility);
      }
      
      // Get both profiles
      const [profile1, profile2] = await Promise.all([
        storage.getProfile(profile1Id),
        storage.getProfile(profile2Id)
      ]);
      
      if (!profile1) {
        return res.status(404).json({ message: `Profile ${profile1Id} not found` });
      }
      if (!profile2) {
        return res.status(404).json({ message: `Profile ${profile2Id} not found` });
      }
      
      // Calculate compatibility
      console.log(`[CalculateCompatibility] Running compatibility analysis`);
      const compatibilityResult = calculateCompatibility(profile1, profile2);
      
      // Store the result
      const savedCompatibility = await storage.createCompatibility({
        profile1Id,
        profile2Id,
        overallScore: compatibilityResult.overallScore,
        compatibilityData: compatibilityResult as any,
      });
      
      // Add profile data to response
      const astro1 = profile1.astrologyData as any;
      const astro2 = profile2.astrologyData as any;
      const num1 = profile1.numerologyData as any;
      const num2 = profile2.numerologyData as any;
      const hd1 = profile1.humanDesignData as any;
      const hd2 = profile2.humanDesignData as any;
      const pers1 = profile1.personalityData as any;
      const pers2 = profile2.personalityData as any;
      
      const response = {
        ...savedCompatibility,
        profile1: {
          name: profile1.name,
          sunSign: astro1?.sunSign,
          moonSign: astro1?.moonSign,
          risingSign: astro1?.risingSign,
          lifePath: num1?.lifePath,
          hdType: hd1?.type,
          enneagramType: pers1?.enneagram?.type,
          mbtiType: pers1?.mbti?.type
        },
        profile2: {
          name: profile2.name,
          sunSign: astro2?.sunSign,
          moonSign: astro2?.moonSign,
          risingSign: astro2?.risingSign,
          lifePath: num2?.lifePath,
          hdType: hd2?.type,
          enneagramType: pers2?.enneagram?.type,
          mbtiType: pers2?.mbti?.type
        }
      };
      
      console.log(`[CalculateCompatibility] Compatibility calculated: ${compatibilityResult.overallScore}%`);
      res.json(response);
    } catch (error) {
      return handleError(error, res, "CalculateCompatibility");
    }
  });

  // Get all compatibilities for a specific profile
  app.get("/api/compatibility/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      console.log(`[GetCompatibilities] Fetching compatibilities for profile ${profileId}`);
      
      const profile = await storage.getProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const compatibilities = await storage.getProfileCompatibilities(profileId);
      
      console.log(`[GetCompatibilities] Found ${compatibilities.length} compatibility analyses`);
      res.json(compatibilities);
    } catch (error) {
      return handleError(error, res, "GetCompatibilities");
    }
  });

  // Get specific compatibility between two profiles
  app.get("/api/compatibility/:profile1Id/:profile2Id", async (req, res) => {
    try {
      const { profile1Id, profile2Id } = req.params;
      
      console.log(`[GetCompatibility] Fetching compatibility between ${profile1Id} and ${profile2Id}`);
      
      const compatibility = await storage.getCompatibility(profile1Id, profile2Id);
      
      if (!compatibility) {
        return res.status(404).json({ message: "Compatibility analysis not found. Please calculate it first." });
      }
      
      // Get profile data to include in response
      const [profile1, profile2] = await Promise.all([
        compatibility.profile1Id ? storage.getProfile(compatibility.profile1Id) : Promise.resolve(null),
        compatibility.profile2Id ? storage.getProfile(compatibility.profile2Id) : Promise.resolve(null)
      ]);
      
      if (!profile1 || !profile2) {
        return res.status(404).json({ message: "One or both profiles not found" });
      }
      
      const astro1 = profile1.astrologyData as any;
      const astro2 = profile2.astrologyData as any;
      const num1 = profile1.numerologyData as any;
      const num2 = profile2.numerologyData as any;
      const hd1 = profile1.humanDesignData as any;
      const hd2 = profile2.humanDesignData as any;
      const pers1 = profile1.personalityData as any;
      const pers2 = profile2.personalityData as any;
      
      // Check premium status to determine what data to return
      const userId = (req.user as any)?.id;
      const sessionId = req.session?.id;
      const { isPremium } = await entitlementService.getUserPremiumStatus({ userId, sessionId });
      
      // Build base response with profile info
      let response: any = {
        profile1Id: compatibility.profile1Id,
        profile2Id: compatibility.profile2Id,
        overallScore: compatibility.overallScore,
        profile1: {
          name: profile1.name,
          sunSign: astro1?.sunSign,
          moonSign: astro1?.moonSign,
          risingSign: astro1?.risingSign,
          lifePath: num1?.lifePath,
          hdType: hd1?.type,
          enneagramType: pers1?.enneagram?.type,
          mbtiType: pers1?.mbti?.type
        },
        profile2: {
          name: profile2.name,
          sunSign: astro2?.sunSign,
          moonSign: astro2?.moonSign,
          risingSign: astro2?.risingSign,
          lifePath: num2?.lifePath,
          hdType: hd2?.type,
          enneagramType: pers2?.enneagram?.type,
          mbtiType: pers2?.mbti?.type
        },
        compatibilityData: {} as any
      };
      
      const fullData = compatibility.compatibilityData as any;
      
      if (isPremium) {
        // Premium users get full compatibility data
        response.compatibilityData = fullData;
        console.log(`[GetCompatibility] Premium user - returning full data`);
      } else {
        // Free users get overview (strengths/challenges/growth) but no detailed category breakdowns
        response.compatibilityData = {
          overallScore: fullData.overallScore || compatibility.overallScore,
          strengths: fullData.strengths || [],
          challenges: fullData.challenges || [],
          growthOpportunities: fullData.growthOpportunities || [],
          relationshipDynamics: fullData.relationshipDynamics || "",
          categories: {} // Empty - no premium category breakdowns (astrology, numerology, etc.)
        };
        console.log(`[GetCompatibility] Free user - returning overview only (no category details)`);
      }
      
      res.json(response);
    } catch (error) {
      return handleError(error, res, "GetCompatibility");
    }
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
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get user's profile for purpose statement
      const profile = await storage.getProfileByUserId(userId);
      const purposeStatement = profile?.purposeStatement || null;
      
      // Get all frequency logs for user (last 30 days is the default in calculateCongruenceScore)
      const allLogs = await storage.getFrequencyLogsByUser(userId);
      
      // Calculate congruence score
      const congruenceScore = calculateCongruenceScore(allLogs, purposeStatement);
      
      console.log(`[CongruenceScore] User ${userId} score: ${congruenceScore.score}`);
      
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
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { purposeStatement } = req.body;
      
      if (typeof purposeStatement !== 'string') {
        return res.status(400).json({ message: "purposeStatement must be a string" });
      }
      
      // Get user's profile
      const profile = await storage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found. Please create a profile first." });
      }
      
      // Update the profile's purpose statement
      const updatedProfile = await storage.updateProfile(profile.id, {
        purposeStatement: purposeStatement.trim() || null
      });
      
      console.log(`[UpdatePurpose] User ${userId} updated purpose statement`);
      
      res.json({ 
        message: "Purpose statement updated successfully", 
        profile: updatedProfile 
      });
    } catch (error) {
      return handleError(error, res, "UpdatePurposeStatement");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
