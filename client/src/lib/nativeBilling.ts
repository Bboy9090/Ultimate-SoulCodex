import { Capacitor, registerPlugin } from "@capacitor/core";
import { apiFetch } from "./queryClient";

export type NativeBillingPlatform = "ios" | "android";

export type NativeBillingCatalog = {
  enabled: boolean;
  platform: NativeBillingPlatform;
  monthlyProductId: string | null;
  annualProductId: string | null;
  verifierConfigured: boolean;
  lifecycleReady: boolean;
  accountToken: string | null;
  reason:
    | "ready"
    | "native_billing_disabled"
    | "catalog_not_configured"
    | "server_verifier_not_configured"
    | "lifecycle_notifications_not_ready";
};

export type NativeBillingProduct = {
  id: string;
  title: string;
  description: string;
  displayPrice: string;
  priceMicros?: number;
  currencyCode?: string;
};

export type NativeBillingEvidence = {
  platform: NativeBillingPlatform;
  productId: string;
  transactionId: string;
  signedTransaction?: string;
  purchaseToken?: string;
};

interface SoulCodexNativeBillingPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: NativeBillingProduct[] }>;
  purchase(options: { productId: string; appAccountToken?: string }): Promise<NativeBillingEvidence>;
  restore(options: { productIds: string[] }): Promise<{ transactions: NativeBillingEvidence[] }>;
}

const NativeBilling = registerPlugin<SoulCodexNativeBillingPlugin>("SoulCodexNativeBilling");

export function currentNativeBillingPlatform(): NativeBillingPlatform | null {
  const platform = Capacitor.getPlatform();
  if (platform === "ios" || platform === "android") return platform;
  return null;
}

export async function loadNativeBillingCatalog(): Promise<NativeBillingCatalog | null> {
  const platform = currentNativeBillingPlatform();
  if (!platform) return null;
  const response = await apiFetch(`/api/billing/native-catalog?platform=${platform}`);
  if (!response.ok) return null;
  return response.json();
}

export async function loadNativeBillingProducts(catalog: NativeBillingCatalog) {
  if (!catalog.enabled || !catalog.monthlyProductId || !catalog.annualProductId) {
    return [];
  }
  const { products } = await NativeBilling.getProducts({
    productIds: [catalog.monthlyProductId, catalog.annualProductId],
  });
  return products;
}

export async function purchaseNativeProduct(
  catalog: NativeBillingCatalog,
  productId: string,
): Promise<NativeBillingEvidence> {
  if (!catalog.enabled || !catalog.accountToken) {
    throw new Error("Native billing is not ready for this account.");
  }
  return NativeBilling.purchase({
    productId,
    appAccountToken: catalog.accountToken,
  });
}

export async function restoreNativePurchases(
  productIds: string[],
): Promise<NativeBillingEvidence[]> {
  const { transactions } = await NativeBilling.restore({ productIds });
  return transactions;
}


export async function verifyNativeBillingEvidence(
  evidence: NativeBillingEvidence,
): Promise<{
  verified: boolean;
  tier: "free" | "plus";
  source: "apple" | "google_play";
  plan: "monthly" | "annual" | null;
  status: string | null;
  expiresAt: string | null;
}> {
  const body =
    evidence.platform === "ios"
      ? {
          platform: "ios",
          signedTransaction: evidence.signedTransaction,
        }
      : {
          platform: "android",
          purchaseToken: evidence.purchaseToken,
          productId: evidence.productId,
        };

  const response = await apiFetch("/api/billing/native/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Native subscription verification failed.");
  }
  return response.json();
}

export async function verifyRestoredNativePurchases(
  productIds: string[],
): Promise<Array<Awaited<ReturnType<typeof verifyNativeBillingEvidence>>>> {
  const transactions = await restoreNativePurchases(productIds);
  const verified = [];
  for (const transaction of transactions) {
    verified.push(await verifyNativeBillingEvidence(transaction));
  }
  return verified;
}
