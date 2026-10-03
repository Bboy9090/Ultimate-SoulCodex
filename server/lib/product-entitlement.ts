import type { User } from "@shared/schema";
import type { SoulCodexTier } from "@shared/product-access";

export type ProductEntitlementSource =
  | "free"
  | "stripe_subscription";

export type ProductEntitlement = {
  tier: SoulCodexTier;
  source: ProductEntitlementSource;
  verified: boolean;
  expiresAt: string | null;
};

function subscriptionStillValid(user: User, now: Date): boolean {
  if (!user.stripeSubscriptionId) return false;
  if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing") return false;
  if (user.subscriptionEndsAt && user.subscriptionEndsAt.getTime() <= now.getTime()) return false;
  return true;
}

export function resolveProductEntitlement(
  user: User | null | undefined,
  now = new Date(),
): ProductEntitlement {
  if (user && subscriptionStillValid(user, now)) {
    return {
      tier: "plus",
      source: "stripe_subscription",
      verified: true,
      expiresAt: user.subscriptionEndsAt?.toISOString() ?? null,
    };
  }

  return {
    tier: "free",
    source: "free",
    verified: true,
    expiresAt: null,
  };
}
