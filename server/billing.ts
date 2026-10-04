import { createHash } from "node:crypto";
import express, { type Express, type Request } from "express";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { z } from "zod";
import { storage } from "./storage";
import {
  SOUL_CODEX_PLUS_CAPABILITY,
  recordVerifiedBillingEvent,
  resolveProductEntitlementForUser,
  type VerifiedBillingEvent,
} from "./lib/product-entitlement";

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
  "pan",
]);

const NATIVE_APP_ORIGINS = new Set([
  "soulcodex://localhost",
  "capacitor://localhost",
  "https://localhost",
]);

export type SoulCodexPlusPlan = "monthly" | "annual";

export interface BillingStatus {
  enabled: boolean;
  provider: "stripe_checkout";
  collectsCardDataOnSoulCodex: false;
  persistentEntitlements: boolean;
  subscriptionWebhookVerification: boolean;
  monthlyProductConfigured: boolean;
  annualProductConfigured: boolean;
  webCheckoutEnabled: boolean;
  manageSubscriptionEnabled: boolean;
  reason:
    | "ready"
    | "not_configured"
    | "web_checkout_disabled";
}

export type BillingCatalogPlan = {
  plan: SoulCodexPlusPlan;
  currency: string;
  unitAmount: number;
  interval: "month" | "year";
  intervalCount: number;
};

function stripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  return secretKey ? new Stripe(secretKey) : null;
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

function persistentStorageConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function webCheckoutFlagEnabled(): boolean {
  return process.env.SOUL_CODEX_PLUS_WEB_CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}

function nativeBillingFlagEnabled(): boolean {
  return process.env.SOUL_CODEX_PLUS_NATIVE_BILLING_ENABLED?.trim().toLowerCase() === "true";
}

function appleMonthlyProductId(): string | null {
  return process.env.APPLE_PLUS_MONTHLY_PRODUCT_ID?.trim() || null;
}

function appleAnnualProductId(): string | null {
  return process.env.APPLE_PLUS_ANNUAL_PRODUCT_ID?.trim() || null;
}

function googleMonthlyProductId(): string | null {
  return process.env.GOOGLE_PLAY_PLUS_MONTHLY_PRODUCT_ID?.trim() || null;
}

function googleAnnualProductId(): string | null {
  return process.env.GOOGLE_PLAY_PLUS_ANNUAL_PRODUCT_ID?.trim() || null;
}

function appleNativeVerifierConfigured(): boolean {
  return Boolean(
    process.env.APPLE_IAP_ROOT_CERTS_BASE64?.trim() &&
      process.env.APPLE_APP_ID?.trim() &&
      process.env.APPLE_CLIENT_ID?.trim(),
  );
}

function googleNativeVerifierConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim() &&
      process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim(),
  );
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
      stripeMonthlyPriceId() &&
      stripeAnnualPriceId(),
  );
}

function stripeManagementConfigured(): boolean {
  return Boolean(
    persistentStorageConfigured() &&
      process.env.STRIPE_SECRET_KEY?.trim() &&
      configuredPublicAppUrl(),
  );
}

function webCheckoutConfigured(): boolean {
  return Boolean(
    webCheckoutFlagEnabled() &&
      stripeWebhookConfigured() &&
      configuredPublicAppUrl(),
  );
}

export function getBillingStatus(): BillingStatus {
  const monthlyProductConfigured = Boolean(stripeMonthlyPriceId());
  const annualProductConfigured = Boolean(stripeAnnualPriceId());
  const subscriptionWebhookVerification = stripeWebhookConfigured();
  const enabled = webCheckoutConfigured();

  return {
    enabled,
    provider: "stripe_checkout",
    collectsCardDataOnSoulCodex: false,
    persistentEntitlements: persistentStorageConfigured(),
    subscriptionWebhookVerification,
    monthlyProductConfigured,
    annualProductConfigured,
    webCheckoutEnabled: enabled,
    manageSubscriptionEnabled: stripeManagementConfigured(),
    reason: enabled
      ? "ready"
      : subscriptionWebhookVerification && configuredPublicAppUrl()
        ? "web_checkout_disabled"
        : "not_configured",
  };
}

export function parseCheckoutRequest(input: unknown): { plan: SoulCodexPlusPlan } {
  return checkoutRequestSchema.parse(input);
}

export function containsRawPaymentFields(input: unknown): boolean {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const keys = new Set(Object.keys(input));
  return RAW_PAYMENT_FIELD_NAMES.some((field) => keys.has(field));
}

export function isNativeAppOrigin(origin: string | undefined): boolean {
  return Boolean(origin && NATIVE_APP_ORIGINS.has(origin));
}

function requestOrigin(req: Request): string | undefined {
  const value = req.headers.origin;
  return Array.isArray(value) ? value[0] : value;
}

function planPriceId(plan: SoulCodexPlusPlan): string | null {
  return plan === "annual" ? stripeAnnualPriceId() : stripeMonthlyPriceId();
}

function planForStripePriceId(
  priceId: string | null | undefined,
): SoulCodexPlusPlan | null {
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

async function stripeCatalogPlan(
  stripe: Stripe,
  plan: SoulCodexPlusPlan,
): Promise<BillingCatalogPlan> {
  const priceId = planPriceId(plan);
  if (!priceId) throw new Error("billing_product_not_configured");

  const price = await stripe.prices.retrieve(priceId);
  const expectedInterval = plan === "monthly" ? "month" : "year";

  if (
    !price.active ||
    price.type !== "recurring" ||
    !price.recurring ||
    price.recurring.interval !== expectedInterval ||
    (price.recurring.interval_count ?? 1) !== 1 ||
    typeof price.unit_amount !== "number"
  ) {
    throw new Error("billing_product_catalog_mismatch");
  }

  return {
    plan,
    currency: price.currency,
    unitAmount: price.unit_amount,
    interval: expectedInterval,
    intervalCount: price.recurring.interval_count ?? 1,
  };
}

async function createWebCheckoutSession(
  stripe: Stripe,
  user: Awaited<ReturnType<typeof storage.getUser>>,
  plan: SoulCodexPlusPlan,
): Promise<Stripe.Checkout.Session> {
  if (!user) throw new Error("billing_user_not_found");
  const appUrl = configuredPublicAppUrl();
  if (!appUrl) throw new Error("billing_not_configured");

  const validatedPlan = await stripeCatalogPlan(stripe, plan);
  const priceId = planPriceId(plan);
  if (!priceId || validatedPlan.intervalCount !== 1) {
    throw new Error("billing_product_catalog_mismatch");
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email?.trim() || undefined,
    metadata: {
      soulCodexUserId: user.id,
      soulCodexPlan: plan,
    },
    subscription_data: {
      metadata: {
        soulCodexUserId: user.id,
        soulCodexPlan: plan,
      },
    },
    success_url: `${appUrl}/pricing?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
  });
}

async function createStripePortalSession(
  stripe: Stripe,
  userId: string,
): Promise<Stripe.BillingPortal.Session> {
  const appUrl = configuredPublicAppUrl();
  if (!appUrl) throw new Error("billing_not_configured");

  const grant = await storage.getLatestEntitlementGrant(
    userId,
    SOUL_CODEX_PLUS_CAPABILITY,
  );
  if (!grant || grant.sourceProvider !== "stripe") {
    throw new Error("stripe_subscription_not_found");
  }

  const transaction = await storage.getBillingTransactionEventById(
    grant.sourceTransactionEventId,
  );
  const subscriptionId = transaction?.providerTransactionId;
  if (!subscriptionId) throw new Error("stripe_subscription_not_found");

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const customer =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customer) throw new Error("stripe_customer_not_found");

  const configuration =
    process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID?.trim() || undefined;

  return stripe.billingPortal.sessions.create({
    customer,
    return_url: `${appUrl}/pricing`,
    ...(configuration ? { configuration } : {}),
  });
}

/**
 * Routes here execute before express.json(): Stripe signatures are verified
 * against the exact raw bytes. Direct-card collection remains retired.
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

        await recordVerifiedBillingEvent(storage, verifiedEvent);

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

/** Register parsed billing routes only after session middleware is installed. */
export function registerBillingRoutes(app: Express): void {
  app.get("/api/billing/status", (_req, res) => {
    res.status(200).json(getBillingStatus());
  });
  app.get("/api/billing/native-catalog", (req: any, res) => {
    const platform = String(req.query?.platform ?? "").trim().toLowerCase();
    const enabled = nativeBillingFlagEnabled();

    if (platform !== "ios" && platform !== "android") {
      return res.status(400).json({
        message: "platform must be ios or android",
        code: "native_billing_platform_invalid",
      });
    }

    const monthlyProductId =
      platform === "ios" ? appleMonthlyProductId() : googleMonthlyProductId();
    const annualProductId =
      platform === "ios" ? appleAnnualProductId() : googleAnnualProductId();

    const configured = Boolean(monthlyProductId && annualProductId);
    const verifierConfigured =
      platform === "ios"
        ? appleNativeVerifierConfigured()
        : googleNativeVerifierConfigured();
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    return res.status(200).json({
      enabled: enabled && configured && verifierConfigured,
      platform,
      monthlyProductId: configured ? monthlyProductId : null,
      annualProductId: configured ? annualProductId : null,
      verifierConfigured,
      reason: !enabled
        ? "native_billing_disabled"
        : !configured
          ? "catalog_not_configured"
          : !verifierConfigured
            ? "server_verifier_not_configured"
            : "ready",
    });
  });


  app.get("/api/billing/catalog", async (_req, res) => {
    const status = getBillingStatus();
    const stripe = stripeClient();

    if (!status.enabled || !stripe) {
      return res.status(503).json({
        message: "Soul Codex+ web checkout is not enabled",
        code: "web_checkout_disabled",
      });
    }

    try {
      const plans = await Promise.all([
        stripeCatalogPlan(stripe, "monthly"),
        stripeCatalogPlan(stripe, "annual"),
      ]);
      return res.status(200).json({ plans });
    } catch (error) {
      console.error("[billing-catalog] failed", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(503).json({
        message: "Soul Codex+ product catalog is unavailable",
        code: "billing_catalog_unavailable",
      });
    }
  });

  app.post("/api/billing/checkout", checkoutLimiter, async (req: any, res) => {
    if (containsRawPaymentFields(req.body)) {
      return res.status(400).json({
        message:
          "Do not send card numbers, security codes, or expiration dates to Soul Codex.",
        code: "raw_payment_data_rejected",
      });
    }

    if (isNativeAppOrigin(requestOrigin(req))) {
      return res.status(409).json({
        message: "Use the native app store purchase flow for digital Soul Codex+ access.",
        code: "native_store_billing_required",
      });
    }

    const parsed = checkoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Choose a valid Soul Codex+ plan",
        code: "checkout_request_invalid",
      });
    }

    const status = getBillingStatus();
    if (!status.enabled) {
      return res.status(503).json({
        message: "Soul Codex+ web checkout is not enabled",
        code: "web_checkout_disabled",
      });
    }

    const userId = req.session?.userId ?? null;
    if (!userId) {
      return res.status(401).json({
        message: "Sign in before starting Soul Codex+ checkout",
        code: "authentication_required",
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({
        message: "Your account session is no longer valid",
        code: "authentication_required",
      });
    }

    const currentAccess = await resolveProductEntitlementForUser(storage, userId);
    if (currentAccess.tier === "plus") {
      return res.status(409).json({
        message: "Soul Codex+ is already active for this account",
        code: "already_plus",
        access: currentAccess,
      });
    }

    const stripe = stripeClient();
    if (!stripe) {
      return res.status(503).json({
        message: "Soul Codex+ web checkout is not configured",
        code: "billing_not_configured",
      });
    }

    try {
      const session = await createWebCheckoutSession(
        stripe,
        user,
        parsed.data.plan,
      );
      if (!session.url) throw new Error("stripe_checkout_url_missing");

      return res.status(200).json({
        url: session.url,
        provider: "stripe_checkout",
        plan: parsed.data.plan,
      });
    } catch (error) {
      console.error("[billing-checkout] failed", {
        userId,
        plan: parsed.data.plan,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(502).json({
        message: "Soul Codex+ checkout could not be started",
        code: "checkout_session_failed",
      });
    }
  });

  app.post("/api/billing/manage", checkoutLimiter, async (req: any, res) => {
    if (isNativeAppOrigin(requestOrigin(req))) {
      return res.status(409).json({
        message: "Manage native subscriptions through the app store purchase flow.",
        code: "native_store_billing_required",
      });
    }

    const userId = req.session?.userId ?? null;
    if (!userId) {
      return res.status(401).json({
        message: "Sign in to manage Soul Codex+",
        code: "authentication_required",
      });
    }

    const currentAccess = await resolveProductEntitlementForUser(storage, userId);
    if (currentAccess.source !== "stripe") {
      return res.status(409).json({
        message: "No web-managed Soul Codex+ subscription is associated with this account",
        code: "stripe_subscription_not_found",
      });
    }

    const stripe = stripeClient();
    if (!stripe || !stripeManagementConfigured()) {
      return res.status(503).json({
        message: "Subscription management is unavailable",
        code: "billing_management_unavailable",
      });
    }

    try {
      const portal = await createStripePortalSession(stripe, userId);
      return res.status(200).json({
        url: portal.url,
        provider: "stripe_billing_portal",
      });
    } catch (error) {
      console.error("[billing-manage] failed", {
        userId,
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return res.status(502).json({
        message: "Subscription management could not be opened",
        code: "billing_management_failed",
      });
    }
  });
}
