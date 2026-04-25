import { randomUUID } from "crypto";
import type { IStorage } from "../storage";
import type { InsertProfile, User, Profile } from "../shared/schema";
import { entitlementService } from "./entitlement-service";

/**
 * MOCK Subscription Service (STRIPE REMOVED)
 * This service replaces the original Stripe-based subscription service
 * for App Store submission compliance. All users are treated as having 
 * valid access or managed via internal access codes.
 */
export class SubscriptionService {
  private storage: IStorage;

  constructor(config: { storage: IStorage }) {
    this.storage = config.storage;
    console.log("[SubscriptionService] INITIALIZED (Stripe Removed Mode)");
  }

  async getOrCreateCustomer(params: any): Promise<string> {
    return "legacy_customer_id";
  }

  async createCheckoutSession(params: any): Promise<{ url: string; sessionId: string }> {
    console.warn("[SubscriptionService] Checkout blocked - Stripe is disabled.");
    return {
      url: params.successUrl,
      sessionId: "mock_session_" + Date.now(),
    };
  }

  async confirmSubscription(checkoutSessionId: string): Promise<{
    success: boolean;
    plan: string;
    profileId?: string;
  }> {
    return {
      success: true,
      plan: 'eternal',
    };
  }

  // All webhook handlers become no-ops
  async handleCheckoutCompleted(session: any): Promise<void> {}
  async handleSubscriptionUpdated(subscription: any): Promise<void> {}
  async handleSubscriptionDeleted(subscription: any): Promise<void> {}
  async handlePaymentFailed(invoice: any): Promise<void> {}

  private getPlanFromPriceId(priceId?: string): string | null {
    return 'eternal';
  }

  private async createFallbackProfile(params: any) {
    const { userId, sessionId, email } = params;
    
    const fallbackProfile: InsertProfile = {
      userId: userId || null,
      sessionId: sessionId || null,
      name: email ? email.split('@')[0] : 'Premium User',
      birthDate: new Date().toISOString().split('T')[0],
      birthTime: null,
      birthLocation: null,
      timezone: null,
      latitude: null,
      longitude: null,
      isPremium: true,
    };

    return this.storage.createProfile(fallbackProfile);
  }
}
