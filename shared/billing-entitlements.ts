export const PREMIUM_LIFETIME_CAPABILITY = "premium_lifetime" as const;

export type BillingProvider = "apple_app_store" | "google_play" | "stripe_checkout";
export type BillingEnvironment = "sandbox" | "production";
export type EntitlementStatus = "active" | "expired" | "revoked";

export interface EntitlementState {
  status: EntitlementStatus;
  startsAt: Date;
  endsAt: Date | null;
  revokedAt: Date | null;
  lastVerifiedAt: Date;
}

export interface NativeProductCatalogEntry {
  provider: Exclude<BillingProvider, "stripe_checkout">;
  capability: typeof PREMIUM_LIFETIME_CAPABILITY;
  productId: string;
}

const APPLE_PRODUCT_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{2,254}$/;
const GOOGLE_PRODUCT_ID = /^[a-z][a-z0-9._]{2,254}$/;

export function resolveNativeProductCatalog(
  values: Record<string, string | undefined>,
): NativeProductCatalogEntry[] {
  const apple = values.APPLE_PREMIUM_LIFETIME_PRODUCT_ID?.trim();
  const google = values.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID?.trim();
  const catalog: NativeProductCatalogEntry[] = [];

  if (apple && APPLE_PRODUCT_ID.test(apple)) {
    catalog.push({
      provider: "apple_app_store",
      capability: PREMIUM_LIFETIME_CAPABILITY,
      productId: apple,
    });
  }
  if (google && GOOGLE_PRODUCT_ID.test(google)) {
    catalog.push({
      provider: "google_play",
      capability: PREMIUM_LIFETIME_CAPABILITY,
      productId: google,
    });
  }

  return catalog;
}

export function entitlementIsActive(
  entitlement: EntitlementState | null | undefined,
  now = new Date(),
): boolean {
  if (!entitlement || entitlement.status !== "active" || entitlement.revokedAt) return false;
  if (entitlement.startsAt.getTime() > now.getTime()) return false;
  if (entitlement.endsAt && entitlement.endsAt.getTime() <= now.getTime()) return false;
  return Number.isFinite(entitlement.lastVerifiedAt.getTime());
}

export function assertProviderEnvironment(
  provider: BillingProvider,
  environment: BillingEnvironment,
): void {
  if (provider === "stripe_checkout" && !["sandbox", "production"].includes(environment)) {
    throw new Error("billing_environment_invalid");
  }
}
