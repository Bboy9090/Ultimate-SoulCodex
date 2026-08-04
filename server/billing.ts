import express, { type Express, type Request } from "express";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { z } from "zod";
import { storage } from "./storage";

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

export function getBillingStatus(): BillingStatus {
  const enabled = Boolean(
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
      }
    : {
        enabled: false,
        provider: "stripe_checkout",
        collectsCardDataOnSoulCodex: false,
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

export function isProfileCapabilityAuthorized(
  authorizationHeader: string | undefined,
  profileId: string,
): boolean {
  return authorizationHeader === `Bearer ${profileId}`;
}

function requestAuthorization(req: Request): string | undefined {
  const value = req.headers.authorization;
  return Array.isArray(value) ? value[0] : value;
}

async function grantPremiumFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;

  const profileId = session.metadata?.profileId ?? session.client_reference_id;
  if (!profileId) {
    throw new Error("stripe_checkout_profile_id_missing");
  }

  const profile = await storage.getProfile(profileId);
  if (!profile) {
    throw new Error("stripe_checkout_profile_not_found");
  }

  await storage.updateProfile(profileId, { isPremium: true });
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

      if (!stripe || !webhookSecret) {
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
    if (!isProfileCapabilityAuthorized(requestAuthorization(req), profileId)) {
      return res.status(401).json({
        message: "Profile authorization is required",
        code: "profile_authorization_required",
      });
    }

    const status = getBillingStatus();
    if (!status.enabled) {
      return res.status(503).json({
        message: "Secure checkout is temporarily unavailable",
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
        metadata: { profileId },
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
