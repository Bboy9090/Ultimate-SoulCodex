import Stripe from "stripe";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import type { InsertProfile, User, Profile } from "./shared/schema";
import { entitlementService } from "./entitlement-service";

interface SubscriptionServiceConfig {
  storage: IStorage;
  stripeSecretKey: string;
  priceIds: {
    weekly: string;
    monthly: string;
    yearly: string;
  };
}

export class SubscriptionService {
  private stripe: Stripe;
  private storage: IStorage;
  private priceIds: Record<string, string>;

  constructor(config: SubscriptionServiceConfig) {
    this.stripe = new Stripe(config.stripeSecretKey);
    this.storage = config.storage;
    this.priceIds = config.priceIds;
  }

  /**
   * Get or create a Stripe customer for a user/session
   * Handles both authenticated users and anonymous sessions
   */
  async getOrCreateCustomer(params: {
    userId?: string;
    sessionId?: string;
    email?: string;
  }): Promise<string> {
    const { userId, sessionId, email } = params;
    
    // For authenticated users, check if they already have a Stripe customer
    if (userId) {
      const user = await this.storage.getUser(userId);
      if (user?.stripeCustomerId) {
        // Verify customer still exists in Stripe
        try {
          await this.stripe.customers.retrieve(user.stripeCustomerId);
          return user.stripeCustomerId;
        } catch (error) {
          console.log(`[SubscriptionService] Customer ${user.stripeCustomerId} not found, creating new one`);
        }
      }
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      email: email || undefined,
      metadata: {
        userId: userId || '',
        sessionId: sessionId || '',
      },
    });

    // Save customer ID to user record if authenticated
    if (userId) {
      await this.storage.upsertUser({
        id: userId,
        stripeCustomerId: customer.id,
      });
    }

    return customer.id;
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: {
    plan: 'weekly' | 'monthly' | 'yearly';
    userId?: string;
    sessionId?: string;
    email?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const { plan, userId, sessionId, email, successUrl, cancelUrl } = params;

    // Validate plan
    const priceId = this.priceIds[plan];
    if (!priceId) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    // Get or create Stripe customer
    const customerId = await this.getOrCreateCustomer({ userId, sessionId, email });

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId || '',
        sessionId: sessionId || '',
        plan,
      },
    });

    console.log(`[SubscriptionService] Created checkout session for ${userId || sessionId}, plan: ${plan}`);
    
    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  /**
   * Confirm subscription after successful checkout
   * Handles profile creation fallback if profile doesn't exist
   */
  async confirmSubscription(checkoutSessionId: string): Promise<{
    success: boolean;
    plan: string;
    profileId?: string;
  }> {
    // Retrieve session from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const { userId, sessionId, plan } = session.metadata || {};
    if (!userId && !sessionId) {
      throw new Error('User/Session ID not found in checkout session');
    }

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    // Update user with subscription info and premium status
    if (userId) {
      await this.storage.upsertUser({
        id: userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan || 'monthly',
        isPremium: true,
      });
    }

    // Get or create profile and upgrade to premium
    let profile = userId
      ? await this.storage.getProfileByUserId(userId)
      : await this.storage.getProfileBySessionId(sessionId!);

    if (!profile) {
      // Create fallback profile if user subscribed before creating one
      profile = await this.createFallbackProfile({
        userId,
        sessionId,
        email: session.customer_details?.email || undefined,
      });
      console.log(`[SubscriptionService] Created fallback profile ${profile.id} for ${userId || sessionId}`);
    }

    // Upgrade profile to premium (for backward compatibility)
    await this.storage.updateProfile(profile.id, {
      isPremium: true,
    });

    // Clear entitlement cache for immediate premium activation
    entitlementService.clearCache({ userId, sessionId });

    console.log(`[SubscriptionService] Confirmed subscription for ${userId || sessionId}, profile: ${profile.id}, plan: ${plan}`);

    return {
      success: true,
      plan: plan || 'monthly',
      profileId: profile.id,
    };
  }

  /**
   * Create a minimal fallback profile for users who subscribe before creating one
   */
  private async createFallbackProfile(params: {
    userId?: string;
    sessionId?: string;
    email?: string;
  }) {
    const { userId, sessionId, email } = params;
    
    const fallbackProfile: InsertProfile = {
      userId: userId || null,
      sessionId: sessionId || null,
      name: email ? email.split('@')[0] : 'Premium User',
      birthDate: new Date().toISOString().split('T')[0], // Default to today - user should update with actual birth date
      birthTime: null,
      birthLocation: null,
      timezone: null,
      latitude: null,
      longitude: null,
      isPremium: true, // Already premium since they just subscribed
    };

    return this.storage.createProfile(fallbackProfile);
  }

  /**
   * Webhook handler: checkout.session.completed
   * Activates premium after successful payment
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log(`[SubscriptionService] Webhook: checkout.session.completed for session ${session.id}`);
    
    if (session.payment_status !== 'paid') {
      console.log(`[SubscriptionService] Skipping non-paid session ${session.id}`);
      return;
    }

    const userId = session.metadata?.userId;
    const sessionId = session.metadata?.sessionId;
    const plan = session.metadata?.plan as 'weekly' | 'monthly' | 'yearly';
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!userId && !sessionId) {
      throw new Error('No userId or sessionId in checkout session metadata');
    }

    // Get or create user
    let user: User | undefined;
    if (userId) {
      user = await this.storage.getUser(userId);
    } else if (customerId) {
      user = await this.storage.getUserByStripeCustomerId(customerId);
    }

    // Update user with subscription info and premium status
    if (user) {
      await this.storage.upsertUser({
        id: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        isPremium: true,
      });
    } else {
      // Create new user for this Stripe customer (fallback)
      const newUserId = userId || randomUUID();
      await this.storage.upsertUser({
        id: newUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        isPremium: true,
      });
      user = await this.storage.getUser(newUserId);
    }

    // Update profile to premium (for backward compatibility)
    let profile: Profile | undefined;
    if (userId) {
      profile = await this.storage.getProfileByUserId(userId);
    } else if (sessionId) {
      profile = await this.storage.getProfileBySessionId(sessionId);
    }

    if (profile) {
      await this.storage.updateProfile(profile.id, { isPremium: true });
      console.log(`[SubscriptionService] Profile ${profile.id} upgraded to premium via webhook`);
    } else {
      console.warn(`[SubscriptionService] No profile found for userId=${userId} or sessionId=${sessionId}`);
    }

    entitlementService.clearCache({ userId: user?.id });
  }

  /**
   * Webhook handler: customer.subscription.updated
   * Handles subscription status changes (active, past_due, canceled, etc.)
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    console.log(`[SubscriptionService] Webhook: customer.subscription.updated for subscription ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    const user = await this.storage.getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.warn(`[SubscriptionService] No user found for Stripe customer ${customerId}`);
      return;
    }

    const newStatus = subscription.status;
    const planId = subscription.items.data[0]?.price.id;
    const plan = this.getPlanFromPriceId(planId);

    // Update user subscription status and premium access
    const periodEnd = (subscription as any).current_period_end;
    const isPremium = ['active', 'trialing'].includes(newStatus);
    await this.storage.upsertUser({
      id: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: newStatus,
      subscriptionPlan: plan || undefined,
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : undefined,
      isPremium,
    });

    // Update profile premium access (for backward compatibility)
    const profile = await this.storage.getProfileByUserId(user.id);
    if (profile) {
      await this.storage.updateProfile(profile.id, { isPremium });
      console.log(`[SubscriptionService] Profile ${profile.id} premium status: ${isPremium} (status: ${newStatus})`);
    }

    entitlementService.clearCache({ userId: user.id });
  }

  /**
   * Webhook handler: customer.subscription.deleted
   * Removes premium access on cancellation
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    console.log(`[SubscriptionService] Webhook: customer.subscription.deleted for subscription ${subscription.id}`);
    
    const customerId = subscription.customer as string;
    const user = await this.storage.getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.warn(`[SubscriptionService] No user found for Stripe customer ${customerId}`);
      return;
    }

    // Update user to canceled status and remove premium access
    const periodEnd = (subscription as any).current_period_end;
    await this.storage.upsertUser({
      id: user.id,
      subscriptionStatus: 'canceled',
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : undefined,
      isPremium: false,
    });

    // Remove profile premium access (for backward compatibility)
    const profile = await this.storage.getProfileByUserId(user.id);
    if (profile) {
      await this.storage.updateProfile(profile.id, { isPremium: false });
      console.log(`[SubscriptionService] Profile ${profile.id} downgraded to free (subscription canceled)`);
    }

    entitlementService.clearCache({ userId: user.id });
  }

  /**
   * Webhook handler: invoice.payment_failed
   * Marks subscription as past_due
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log(`[SubscriptionService] Webhook: invoice.payment_failed for invoice ${invoice.id}`);
    
    const customerId = invoice.customer as string;
    const user = await this.storage.getUserByStripeCustomerId(customerId);
    
    if (!user) {
      console.warn(`[SubscriptionService] No user found for Stripe customer ${customerId}`);
      return;
    }

    // Mark subscription as past_due (keep premium access for grace period)
    await this.storage.upsertUser({
      id: user.id,
      subscriptionStatus: 'past_due',
    });

    console.log(`[SubscriptionService] User ${user.id} subscription marked as past_due`);
  }

  /**
   * Helper: Map Stripe price ID to plan name
   */
  private getPlanFromPriceId(priceId?: string): 'weekly' | 'monthly' | 'yearly' | null {
    if (!priceId) return null;
    
    if (priceId === this.priceIds.weekly) return 'weekly';
    if (priceId === this.priceIds.monthly) return 'monthly';
    if (priceId === this.priceIds.yearly) return 'yearly';
    
    return null;
  }

}
