/**
 * Soul Codex — PayPal Subscription Routes
 * Handles PayPal subscription creation, capture, and webhook verification.
 * Works with both authenticated users and anonymous sessions.
 */
import type { Express, Request, Response } from "express";
import { storage } from "../storage";

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || "";

// Plan IDs — set these in your .env after creating plans in PayPal dashboard
const PLAN_IDS: Record<string, string> = {
  monthly: process.env.PAYPAL_PLAN_MONTHLY || "PLAN_MONTHLY_PLACEHOLDER",
  yearly: process.env.PAYPAL_PLAN_YEARLY || "PLAN_YEARLY_PLACEHOLDER",
};

/** Get a PayPal OAuth2 access token */
async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

/** Create a PayPal subscription */
async function createSubscription(planId: string, returnUrl: string, cancelUrl: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "PayPal-Request-Id": `soul-codex-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      application_context: {
        brand_name: "Soul Codex",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal subscription creation failed: ${err}`);
  }
  return res.json();
}

/** Verify a PayPal webhook signature */
async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string
): Promise<boolean> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        client_id: PAYPAL_CLIENT_ID,
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export function registerPayPalRoutes(app: Express) {
  /**
   * GET /api/paypal/config
   * Returns the client-side PayPal config (client ID + plan IDs)
   */
  app.get("/api/paypal/config", (_req: Request, res: Response) => {
    res.json({
      clientId: PAYPAL_CLIENT_ID,
      plans: {
        monthly: { id: PLAN_IDS.monthly, price: "9.99", interval: "month" },
        yearly: { id: PLAN_IDS.yearly, price: "79.99", interval: "year" },
      },
      currency: "USD",
      sandboxMode: process.env.PAYPAL_ENV !== "live",
    });
  });

  /**
   * POST /api/paypal/create-subscription
   * Creates a PayPal subscription and returns the approval URL
   */
  app.post("/api/paypal/create-subscription", async (req: Request, res: Response) => {
    try {
      const { plan = "monthly" } = req.body || {};
      const planId = PLAN_IDS[plan as keyof typeof PLAN_IDS];
      if (!planId || planId.includes("PLACEHOLDER")) {
        return res.status(503).json({
          error: "PayPal not configured",
          message: "PayPal plan IDs are not set. Please configure PAYPAL_PLAN_MONTHLY and PAYPAL_PLAN_YEARLY.",
        });
      }
      const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const subscription = await createSubscription(
        planId,
        `${origin}/upgrade?success=true`,
        `${origin}/upgrade?cancelled=true`
      );
      const approveLink = subscription.links?.find((l: any) => l.rel === "approve")?.href;
      res.json({
        subscriptionId: subscription.id,
        approveUrl: approveLink,
        status: subscription.status,
      });
    } catch (error) {
      console.error("[PayPal] create-subscription error:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  /**
   * POST /api/paypal/activate
   * Called after user approves the subscription on PayPal.
   * Marks the user/session as premium in storage.
   */
  app.post("/api/paypal/activate", async (req: Request, res: Response) => {
    try {
      const { subscriptionId, plan = "monthly" } = req.body || {};
      if (!subscriptionId) {
        return res.status(400).json({ error: "subscriptionId required" });
      }

      // Verify the subscription is active with PayPal
      const token = await getAccessToken();
      const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });

      if (!subRes.ok) {
        return res.status(400).json({ error: "Could not verify subscription with PayPal" });
      }

      const subData = await subRes.json();
      const isActive = subData.status === "ACTIVE" || subData.status === "APPROVED";

      if (!isActive) {
        return res.status(400).json({ error: "Subscription is not active", status: subData.status });
      }

      // Store premium status
      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionID;

      if (userId) {
        await storage.updateUser(userId, {
          stripeSubscriptionId: subscriptionId, // reusing field for PayPal sub ID
          subscriptionStatus: "active",
          subscriptionPlan: plan,
          subscriptionEndsAt: null,
        }).catch(() => {}); // non-fatal if user storage not available
      }

      // Always set session-level premium flag for anonymous users
      if ((req as any).session) {
        (req as any).session.isPremium = true;
        (req as any).session.premiumPlan = plan;
        (req as any).session.paypalSubscriptionId = subscriptionId;
      }

      res.json({
        success: true,
        isPremium: true,
        plan,
        subscriptionId,
        message: "Welcome to Soul Codex Premium ✨",
      });
    } catch (error) {
      console.error("[PayPal] activate error:", error);
      res.status(500).json({ error: "Failed to activate subscription" });
    }
  });

  /**
   * GET /api/paypal/status
   * Returns the current user's premium status
   */
  app.get("/api/paypal/status", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const sessionId = (req as any).sessionID;
      const sessionPremium = (req as any).session?.isPremium;

      // Check session first (works for anonymous users)
      if (sessionPremium) {
        return res.json({
          isPremium: true,
          plan: (req as any).session?.premiumPlan || "monthly",
          source: "session",
        });
      }

      // Check user record
      if (userId) {
        const user = await storage.getUser(userId).catch(() => null);
        if (user?.subscriptionStatus === "active") {
          return res.json({
            isPremium: true,
            plan: user.subscriptionPlan || "monthly",
            source: "user",
          });
        }
      }

      res.json({ isPremium: false, plan: null, source: "none" });
    } catch (error) {
      console.error("[PayPal] status error:", error);
      res.json({ isPremium: false, plan: null, source: "error" });
    }
  });

  /**
   * POST /api/paypal/webhook
   * Handles PayPal IPN/webhook events (subscription activated, cancelled, etc.)
   */
  app.post("/api/paypal/webhook", async (req: Request, res: Response) => {
    try {
      const webhookId = process.env.PAYPAL_WEBHOOK_ID || "";
      const rawBody = JSON.stringify(req.body);

      if (webhookId) {
        const isValid = await verifyWebhookSignature(
          req.headers as Record<string, string>,
          rawBody,
          webhookId
        );
        if (!isValid) {
          console.warn("[PayPal Webhook] Invalid signature");
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }

      const event = req.body;
      const eventType = event.event_type;
      console.log(`[PayPal Webhook] Event: ${eventType}`);

      switch (eventType) {
        case "BILLING.SUBSCRIPTION.ACTIVATED":
        case "BILLING.SUBSCRIPTION.RENEWED": {
          const subId = event.resource?.id;
          const subscriberEmail = event.resource?.subscriber?.email_address;
          console.log(`[PayPal Webhook] Subscription ${subId} activated for ${subscriberEmail}`);
          // Could look up user by email and update their record here
          break;
        }
        case "BILLING.SUBSCRIPTION.CANCELLED":
        case "BILLING.SUBSCRIPTION.EXPIRED": {
          const subId = event.resource?.id;
          console.log(`[PayPal Webhook] Subscription ${subId} cancelled/expired`);
          // Could revoke premium status here
          break;
        }
        case "PAYMENT.SALE.COMPLETED": {
          console.log("[PayPal Webhook] Payment completed");
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[PayPal Webhook] Error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
