import express, { type Express, type Request } from "express";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { z } from "zod";
import { createHash } from "node:crypto";
import { storage } from "./storage";
import { profileBelongsToActor } from "./lib/profile-ownership";
import { PREMIUM_LIFETIME_CAPABILITY } from "@shared/billing-entitlements";

const checkoutRequestSchema = z
  .object({
    profileId: z.string().trim().min(8).max(128),
  })
  .strict();

const RAW_PAYMENT_FIELD_NAMES = Object.freeze([
  "cardNumber",
  "card_number",
  "cvv",
  "cvc",
  "expiryDate",
  "expiry",
]);

export interface BillingStatus {
  enabled: boolean;
  provider: "stripe_checkout";
  collectsCardDataOnSoulCodex: false;
  persistentEntitlements: boolean;
  reason?: "not_configured";
}

function stripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  return secretKey ? new Stripe(secretKey) : null;
}

function configuredPublicAppUrl(): string | null {
  const raw = process.env.PUBLIC_APP_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function persistentStorageConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() &&
      process.env.BILLING_ENTITLEMENTS_V1_ENABLED === "true",
  );
}

export function getBillingStatus(): BillingStatus {
  const persistentEntitlements = persistentStorageConfigured();
  const enabled = Boolean(
    persistentEntitlements &&
      process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_ID?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      configuredPublicAppUrl(),
  );

  return enabled
    ? {
        enabled: true,
        provider: "stripe_checkout",
        collectsCardDataOnSoulCodex: false,
        persistentEntitlements: true,
      }
    : {
        enabled: false,
        provider: "stripe_checkout",
        collectsCardDataOnSoulCodex: false,
        persistentEntitlements,
        reason: "not_configured",
      };
}

export function parseCheckoutRequest(input: unknown): { profileId: string } {
  return checkoutRequestSchema.parse(input);
}

export function containsRawPaymentFields(input: unknown): boolean {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const keys = new Set(Object.keys(input));
  return RAW_PAYMENT_FIELD_NAMES.some((field) => keys.has(field));
}

async function grantPremiumFromCheckoutSession(
  session: Stripe.Checkout.Session,
  event: Stripe.Event,
  payloadDigest: string,
): Promise<void> {
  if (session.payment_status !== "paid") return;

  const userId = session.metadata?.userId;
  const productId = session.metadata?.productId;
  const capability = session.metadata?.capability;
  if (!userId || !productId || capability !== PREMIUM_LIFETIME_CAPABILITY) {
    throw new Error("stripe_checkout_entitlement_metadata_missing");
  }
  await storage.recordVerifiedEntitlement({
    userId,
    provider: "stripe_checkout",
    environment: event.livemode ? "production" : "sandbox",
    externalTransactionId: session.id,
    originalTransactionId:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    productId,
    providerEventId: event.id,
    eventType: event.type,
    capability,
    purchasedAt: new Date(session.created * 1000),
    expiresAt: null,
    payloadDigest,
    verifier: "stripe-webhook-signature-v1",
  });
}

/**
 * Register routes that must execute before express.json(). Stripe signatures
 * are calculated over the exact raw request bytes, and the retired direct-card
 * endpoint must be rejected without parsing or accepting card fields.
 */
export function registerBillingRawRoutes(app: Express): void {
  app.post("/api/profiles/:id/upgrade", (_req, res) => {
    res.status(410).json({
      message:
        "Direct card entry has been retired. Soul Codex only uses hosted Stripe Checkout.",
      code: "direct_card_collection_retired",
    });
  });

  app.post(
    "/api/billing/webhook",
    express.raw({ type: "application/json", limit: "256kb" }),
    async (req, res) => {
      const stripe = stripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
      const signature = req.headers["stripe-signature"];
      const billingStatus = getBillingStatus();

      if (!stripe || !webhookSecret || !billingStatus.enabled) {
        return res.status(503).json({
          message: "Billing webhook is not configured",
          code: "billing_not_configured",
        });
      }

      if (!signature || Array.isArray(signature)) {
        return res.status(400).json({
          message: "Stripe signature is required",
          code: "stripe_signature_missing",
        });
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          signature,
          webhookSecret,
        );
      } catch {
        return res.status(400).json({
          message: "Stripe signature verification failed",
          code: "stripe_signature_invalid",
        });
      }

      try {
        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          await grantPremiumFromCheckoutSession(
            event.data.object as Stripe.Checkout.Session,
            event,
            createHash("sha256").update(req.body as Buffer).digest("hex"),
          );
        }

        return res.status(200).json({ received: true });
      } catch (error) {
        console.error("[billing-webhook] fulfillment failed", {
          eventId: event.id,
          eventType: event.type,
          error: error instanceof Error ? error.message : "unknown_error",
        });
        return res.status(500).json({
          message: "Billing fulfillment failed",
          code: "billing_fulfillment_failed",
        });
      }
    },
  );
}

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many checkout attempts. Please try again later.",
    code: "checkout_rate_limited",
  },
});

/** Register parsed JSON billing routes after express.json(). */
export function registerBillingRoutes(app: Express): void {
  app.get("/api/billing/status", (_req, res) => {
    res.status(200).json(getBillingStatus());
  });

  app.post("/api/billing/checkout", checkoutLimiter, async (req, res) => {
    if (containsRawPaymentFields(req.body)) {
      return res.status(400).json({
        message:
          "Do not send card numbers, security codes, or expiration dates to Soul Codex.",
        code: "raw_payment_data_rejected",
      });
    }

    const parsed = checkoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "A valid profile ID is required",
        code: "checkout_request_invalid",
      });
    }

    const { profileId } = parsed.data;
    const userId = (req.session as { userId?: string } | undefined)?.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Sign in is required before purchasing premium access",
        code: "billing_account_required",
      });
    }

    const status = getBillingStatus();
    if (!status.enabled) {
      return res.status(503).json({
        message: status.persistentEntitlements
          ? "Secure checkout is temporarily unavailable"
          : "Secure checkout requires persistent profile storage",
        code: "billing_not_configured",
      });
    }

    const profile = await storage.getProfile(profileId);
    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
        code: "profile_not_found",
      });
    }

    if (!profileBelongsToActor(profile, { userId, sessionId: req.sessionID })) {
      return res.status(404).json({ message: "Profile not found", code: "profile_not_found" });
    }

    if (profile.isPremium) {
      return res.status(200).json({ alreadyPremium: true });
    }

    const stripe = stripeClient();
    const priceId = process.env.STRIPE_PRICE_ID!.trim();
    const appUrl = configuredPublicAppUrl()!;

    try {
      const session = await stripe!.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: profileId,
        metadata: {
          profileId,
          userId,
          productId: priceId,
          capability: PREMIUM_LIFETIME_CAPABILITY,
        },
        success_url: `${appUrl}/profile/${encodeURIComponent(profileId)}?checkout=success`,
        cancel_url: `${appUrl}/profile/${encodeURIComponent(profileId)}?checkout=cancelled`,
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new Error("stripe_checkout_url_missing");
      }

      return res.status(200).json({
        url: session.url,
        provider: "stripe_checkout",
      });
    } catch (error) {
      console.error("[billing-checkout] session creation failed", {
        profileId,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(502).json({
        message: "Secure checkout could not be started",
        code: "checkout_session_failed",
      });
    }
  });
}
