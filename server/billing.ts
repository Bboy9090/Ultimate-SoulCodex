import { createHash } from "node:crypto";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { z } from "zod";
import {
  recordVerifiedBillingEvent,
  type VerifiedBillingEvent,
} from "./lib/product-entitlement";

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
  enabled: false;
  provider: "stripe_checkout";
  collectsCardDataOnSoulCodex: false;
  persistentEntitlements: boolean;
  subscriptionWebhookVerification: boolean;
  monthlyProductConfigured: boolean;
  annualProductConfigured: boolean;
  reason:
    | "not_configured"
    | "subscription_checkout_not_qualified";
}

function stripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  return secretKey ? new Stripe(secretKey) : null;
}

function persistentStorageConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function stripeMonthlyPriceId(): string | null {
  return process.env.STRIPE_PLUS_MONTHLY_PRICE_ID?.trim() || null;
}

function stripeAnnualPriceId(): string | null {
  return process.env.STRIPE_PLUS_ANNUAL_PRICE_ID?.trim() || null;
}

function stripeWebhookConfigured(): boolean {
  return Boolean(
    persistentStorageConfigured() &&
      process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      (stripeMonthlyPriceId() || stripeAnnualPriceId()),
  );
}

export function getBillingStatus(): BillingStatus {
  const monthlyProductConfigured = Boolean(stripeMonthlyPriceId());
  const annualProductConfigured = Boolean(stripeAnnualPriceId());
  const subscriptionWebhookVerification = stripeWebhookConfigured();

  return {
    enabled: false,
    provider: "stripe_checkout",
    collectsCardDataOnSoulCodex: false,
    persistentEntitlements: persistentStorageConfigured(),
    subscriptionWebhookVerification,
    monthlyProductConfigured,
    annualProductConfigured,
    reason: subscriptionWebhookVerification
      ? "subscription_checkout_not_qualified"
      : "not_configured",
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

function planForStripePriceId(
  priceId: string | null | undefined,
): "monthly" | "annual" | null {
  if (!priceId) return null;
  if (priceId === stripeMonthlyPriceId()) return "monthly";
  if (priceId === stripeAnnualPriceId()) return "annual";
  return null;
}

function secondsToDate(value: unknown): Date | null {
  const seconds = typeof value === "number" ? value : Number(value);
  return Number.isFinite(seconds) && seconds > 0
    ? new Date(seconds * 1000)
    : null;
}

function stripeSubscriptionAccessStatus(subscription: any): VerifiedBillingEvent["accessStatus"] {
  if (
    subscription?.cancel_at_period_end === true &&
    (subscription?.status === "active" || subscription?.status === "trialing")
  ) {
    return "canceled_pending_expiry";
  }

  switch (subscription?.status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "grace_period";
    case "canceled":
    case "incomplete_expired":
      return "expired";
    case "unpaid":
    case "paused":
    case "incomplete":
      return "account_hold";
    default:
      return "account_hold";
  }
}

export function verifiedStripeSubscriptionEvent(
  event: Stripe.Event,
  rawBody: Buffer,
  verifiedAt = new Date(),
): VerifiedBillingEvent | null {
  if (!event.type.startsWith("customer.subscription.")) return null;

  const subscription = event.data.object as any;
  const userId =
    typeof subscription?.metadata?.soulCodexUserId === "string"
      ? subscription.metadata.soulCodexUserId.trim()
      : "";
  if (!userId) return null;

  const firstItem = subscription?.items?.data?.[0];
  const priceId =
    typeof firstItem?.price?.id === "string"
      ? firstItem.price.id
      : null;
  const plan = planForStripePriceId(priceId);
  if (!plan || !priceId) return null;

  const currentPeriodEnd =
    secondsToDate(subscription?.current_period_end) ??
    secondsToDate(firstItem?.current_period_end);
  const purchasedAt =
    secondsToDate(subscription?.start_date) ??
    secondsToDate(subscription?.created);

  return {
    userId,
    provider: "stripe",
    providerEventId: event.id,
    providerTransactionId:
      typeof subscription?.id === "string" ? subscription.id : null,
    productId: priceId,
    plan,
    environment: event.livemode ? "production" : "sandbox",
    eventType: event.type,
    occurredAt: secondsToDate((event as any).created) ?? verifiedAt,
    verificationState: "verified",
    accessStatus: stripeSubscriptionAccessStatus(subscription),
    purchasedAt,
    expiresAt: currentPeriodEnd,
    verifiedAt,
    evidenceDigest: createHash("sha256").update(rawBody).digest("hex"),
    diagnosticMetadata: {
      webhookType: event.type,
      livemode: Boolean(event.livemode),
      stripeStatus:
        typeof subscription?.status === "string"
          ? subscription.status
          : "unknown",
      cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
      objectType:
        typeof subscription?.object === "string"
          ? subscription.object
          : "subscription",
    },
  };
}

/**
 * Routes here execute before express.json(): Stripe signatures are verified
 * against the exact raw bytes. The legacy direct-card and one-time checkout
 * products remain retired while recurring purchase initiation is qualified.
 */
export function registerBillingRawRoutes(app: Express): void {
  app.post("/api/profiles/:id/upgrade", (_req, res) => {
    res.status(410).json({
      message:
        "Direct card entry has been retired. Soul Codex+ uses verified store or subscription entitlements.",
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

      if (!stripe || !webhookSecret || !stripeWebhookConfigured()) {
        return res.status(503).json({
          message: "Subscription webhook verification is not configured",
          code: "billing_webhook_not_configured",
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
        const verifiedEvent = verifiedStripeSubscriptionEvent(
          event,
          req.body as Buffer,
        );

        if (!verifiedEvent) {
          return res.status(200).json({
            received: true,
            applied: false,
            reason: "unsupported_or_unbound_subscription_event",
          });
        }

        await recordVerifiedBillingEvent(
          (await import("./storage")).storage,
          verifiedEvent,
        );

        return res.status(200).json({
          received: true,
          applied: true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown_error";
        console.error("[billing-webhook] verified event application failed", {
          eventId: event.id,
          eventType: event.type,
          error: message,
        });

        if (message === "billing_event_replay_mismatch") {
          return res.status(409).json({
            message: "Billing event replay did not match stored evidence",
            code: "billing_event_replay_mismatch",
          });
        }

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

    return res.status(410).json({
      message:
        "The legacy one-time checkout is retired. Soul Codex+ purchasing will activate only through the qualified monthly/annual entitlement flow.",
      code: "legacy_checkout_retired",
    });
  });
}
