import { createHash } from "node:crypto";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { z } from "zod";
import {
  recordVerifiedBillingEvent,
  resolveProductEntitlementForUser,
  type VerifiedBillingEvent,
} from "./lib/product-entitlement";
import { storage, type IStorage } from "./storage";

const checkoutRequestSchema = z
  .object({
    plan: z.enum(["monthly", "annual"]),
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
  subscriptionWebhookVerification: boolean;
  monthlyProductConfigured: boolean;
  annualProductConfigured: boolean;
  reason?: "not_configured";
}

function stripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  return secretKey ? new Stripe(secretKey) : null;
}

function persistentStorageConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function configuredPublicAppUrl(): string | null {
  const raw = process.env.PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    return url.origin;
  } catch {
    return null;
  }
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

function stripeCheckoutConfigured(): boolean {
  return Boolean(
    stripeWebhookConfigured() &&
      stripeMonthlyPriceId() &&
      stripeAnnualPriceId() &&
      configuredPublicAppUrl(),
  );
}

function priceIdForPlan(plan: "monthly" | "annual"): string | null {
  return plan === "annual" ? stripeAnnualPriceId() : stripeMonthlyPriceId();
}

export type SubscriptionCatalogPlan = {
  plan: "monthly" | "annual";
  currency: string;
  unitAmount: number;
  interval: "month" | "year";
};

function expectedInterval(plan: "monthly" | "annual"): "month" | "year" {
  return plan === "annual" ? "year" : "month";
}

async function resolveStripePlan(
  stripe: Stripe,
  plan: "monthly" | "annual",
): Promise<{ priceId: string; catalog: SubscriptionCatalogPlan } | null> {
  const priceId = priceIdForPlan(plan);
  if (!priceId) return null;

  const price = await stripe.prices.retrieve(priceId);
  const interval = price.recurring?.interval;
  const intervalCount = price.recurring?.interval_count ?? 1;

  if (
    !price.active ||
    price.type !== "recurring" ||
    price.unit_amount === null ||
    interval !== expectedInterval(plan) ||
    intervalCount !== 1
  ) {
    return null;
  }

  return {
    priceId,
    catalog: {
      plan,
      currency: price.currency,
      unitAmount: price.unit_amount,
      interval,
    },
  };
}

export async function loadSubscriptionCatalog(): Promise<SubscriptionCatalogPlan[] | null> {
  const stripe = stripeClient();
  if (!stripe || !stripeCheckoutConfigured()) return null;

  try {
    const [monthly, annual] = await Promise.all([
      resolveStripePlan(stripe, "monthly"),
      resolveStripePlan(stripe, "annual"),
    ]);
    if (!monthly || !annual) return null;
    return [monthly.catalog, annual.catalog];
  } catch (error) {
    console.error("[subscription-catalog] Stripe catalog resolution failed", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return null;
  }
}

export function getBillingStatus(): BillingStatus {
  const monthlyProductConfigured = Boolean(stripeMonthlyPriceId());
  const annualProductConfigured = Boolean(stripeAnnualPriceId());
  const subscriptionWebhookVerification = stripeWebhookConfigured();
  const enabled = stripeCheckoutConfigured();

  return {
    enabled,
    provider: "stripe_checkout",
    collectsCardDataOnSoulCodex: false,
    persistentEntitlements: persistentStorageConfigured(),
    subscriptionWebhookVerification,
    monthlyProductConfigured,
    annualProductConfigured,
    ...(enabled ? {} : { reason: "not_configured" as const }),
  };
}

export function parseCheckoutRequest(input: unknown): { plan: "monthly" | "annual" } {
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

/** Register parsed JSON billing routes after session middleware. */
export function registerBillingRoutes(
  app: Express,
  deps: { storage: IStorage } = { storage },
): void {
  app.get("/api/billing/status", (_req, res) => {
    res.status(200).json(getBillingStatus());
  });

  app.get("/api/billing/catalog", async (_req, res) => {
    const catalog = await loadSubscriptionCatalog();
    if (!catalog) {
      return res.status(503).json({
        message: "Soul Codex+ catalog is not available.",
        code: "subscription_catalog_unavailable",
      });
    }
    return res.status(200).json({ plans: catalog });
  });

  app.post("/api/billing/checkout", checkoutLimiter, async (req: any, res) => {
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
        message: "Choose a valid monthly or annual Soul Codex+ plan.",
        code: "checkout_request_invalid",
      });
    }

    const userId = req.session?.userId ?? null;
    if (!userId) {
      return res.status(401).json({
        message: "Sign in before starting a Soul Codex+ subscription.",
        code: "authentication_required",
      });
    }

    const currentAccess = await resolveProductEntitlementForUser(deps.storage, userId);
    if (currentAccess.tier === "plus") {
      return res.status(409).json({
        message: "Soul Codex+ is already active for this account.",
        code: "subscription_already_active",
        access: currentAccess,
      });
    }

    const status = getBillingStatus();
    const stripe = stripeClient();
    const appUrl = configuredPublicAppUrl();
    if (!status.enabled || !stripe || !appUrl) {
      return res.status(503).json({
        message: "Soul Codex+ checkout is not configured.",
        code: "subscription_checkout_not_configured",
      });
    }

    const resolvedPlan = await resolveStripePlan(stripe, parsed.data.plan);
    if (!resolvedPlan) {
      return res.status(503).json({
        message: "The selected Soul Codex+ plan is not available.",
        code: "subscription_plan_unavailable",
      });
    }
    const priceId = resolvedPlan.priceId;

    const user = await deps.storage.getUser(userId);
    if (!user) {
      return res.status(401).json({
        message: "Sign in again before starting checkout.",
        code: "account_not_found",
      });
    }

    await deps.storage.getOrCreateBillingSubject(user.id);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: user.id,
        customer: user.stripeCustomerId || undefined,
        customer_email: user.stripeCustomerId ? undefined : user.email || undefined,
        subscription_data: {
          metadata: {
            soulCodexUserId: user.id,
            soulCodexPlan: parsed.data.plan,
          },
        },
        metadata: {
          soulCodexUserId: user.id,
          soulCodexPlan: parsed.data.plan,
        },
        success_url: `${appUrl}/pricing?checkout=return`,
        cancel_url: `${appUrl}/pricing?checkout=cancelled`,
        allow_promotion_codes: true,
      });

      if (!session.url) throw new Error("stripe_checkout_url_missing");

      return res.status(200).json({
        url: session.url,
        provider: "stripe_checkout",
        plan: parsed.data.plan,
      });
    } catch (error) {
      console.error("[subscription-checkout] session creation failed", {
        userId,
        plan: parsed.data.plan,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(502).json({
        message: "Secure subscription checkout could not be started.",
        code: "subscription_checkout_failed",
      });
    }
  });
}
