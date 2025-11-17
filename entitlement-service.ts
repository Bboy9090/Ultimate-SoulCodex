import memoize from 'memoizee';
import { storage } from '../storage';

export interface PremiumStatus {
  isPremium: boolean;
  source: 'manual_override' | 'stripe_subscription' | 'access_code' | 'legacy_flag' | 'none';
  details?: {
    accessCode?: string;
    expiresAt?: Date;
    subscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
  };
}

class EntitlementService {
  private getUserPremiumStatusUncached = async (params: {
    userId?: string;
    sessionId?: string;
  }): Promise<PremiumStatus> => {
    if (!params.userId && !params.sessionId) {
      throw new Error('userId or sessionId required');
    }

    const user = params.userId ? await storage.getUser(params.userId) : null;

    if (user?.manualPremiumOverride) {
      return {
        isPremium: true,
        source: 'manual_override',
      };
    }

    if (user?.stripeSubscriptionId && user?.subscriptionStatus) {
      const status = user.subscriptionStatus;
      
      if (status === 'active' || status === 'trialing') {
        return {
          isPremium: true,
          source: 'stripe_subscription',
          details: {
            subscriptionId: user.stripeSubscriptionId,
            subscriptionStatus: status,
            subscriptionPlan: user.subscriptionPlan || undefined,
          },
        };
      }
    }

    const activeCodes = await storage.getActiveAccessCodesForUser({
      userId: params.userId,
      sessionId: params.sessionId,
    });

    if (activeCodes.length > 0) {
      const code = activeCodes[0];
      return {
        isPremium: true,
        source: 'access_code',
        details: {
          accessCode: code.code,
          expiresAt: code.expiresAt || undefined,
        },
      };
    }

    if (user?.isPremium) {
      return {
        isPremium: true,
        source: 'legacy_flag',
      };
    }

    return {
      isPremium: false,
      source: 'none',
    };
  };

  getUserPremiumStatus = memoize(this.getUserPremiumStatusUncached, {
    maxAge: 5 * 60 * 1000,
    normalizer: (args) => {
      const [params] = args;
      return `${params.userId || 'anon'}:${params.sessionId || 'none'}`;
    },
    promise: true,
  });

  clearCache(params?: { userId?: string; sessionId?: string }): void {
    if (!params) {
      this.getUserPremiumStatus.clear();
      return;
    }

    this.getUserPremiumStatus.delete(params);
  }
}

export const entitlementService = new EntitlementService();
