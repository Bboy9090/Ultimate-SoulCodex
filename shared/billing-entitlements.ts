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

export interface NativeVerificationRequest {
  provider: Exclude<BillingProvider, "stripe_checkout">;
  environment: BillingEnvironment;
  productId: string;
  externalTransactionId: string;
  originalTransactionId: string | null;
  signedPayload: string;
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

/**
 * Normalize the client hand-off without treating client claims as verified.
 * Cryptographic verification must happen server-side before this request can
 * be written to the entitlement tables.
 */
export function parseNativeVerificationRequest(
  input: unknown,
  catalog: NativeProductCatalogEntry[],
): NativeVerificationRequest {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("native_billing_request_invalid");
  }
  const value = input as Record<string, unknown>;
  const provider = value.provider;
  const environment = value.environment;
  const productId = typeof value.productId === "string" ? value.productId.trim() : "";
  const externalTransactionId = typeof value.externalTransactionId === "string"
    ? value.externalTransactionId.trim()
    : "";
  const originalTransactionId = value.originalTransactionId == null
    ? null
    : typeof value.originalTransactionId === "string"
      ? value.originalTransactionId.trim() || null
      : "invalid";
  const signedPayload = typeof value.signedPayload === "string" ? value.signedPayload.trim() : "";
  if (
    (provider !== "apple_app_store" && provider !== "google_play") ||
    (environment !== "sandbox" && environment !== "production") ||
    !productId || !externalTransactionId || !signedPayload || originalTransactionId === "invalid"
  ) {
    throw new Error("native_billing_request_invalid");
  }
  const allowed = catalog.some((entry) => entry.provider === provider && entry.productId === productId);
  if (!allowed) throw new Error("native_billing_product_not_configured");
  return {
    provider,
    environment,
    productId,
    externalTransactionId,
    originalTransactionId,
    signedPayload,
  };
}

export function nativeBillingVerificationEnabled(values: Record<string, string | undefined>): boolean {
  return values.NATIVE_BILLING_VERIFICATION_ENABLED === "true" &&
    Boolean(values.APPLE_PREMIUM_LIFETIME_PRODUCT_ID?.trim() || values.GOOGLE_PREMIUM_LIFETIME_PRODUCT_ID?.trim());
}

export function entitlementIsActive(
  entitlement: (Omit<EntitlementState, "status"> & { status: string }) | null | undefined,
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
