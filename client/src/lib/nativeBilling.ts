import { Capacitor, registerPlugin } from "@capacitor/core";
import { apiFetch } from "./queryClient";

export type NativeBillingPlatform = "ios" | "android";

export type NativeBillingCatalog = {
  enabled: boolean;
  platform: NativeBillingPlatform;
  monthlyProductId: string | null;
  annualProductId: string | null;
  verifierConfigured: boolean;
  reason:
    | "ready"
    | "native_billing_disabled"
    | "catalog_not_configured"
    | "server_verifier_not_configured";
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
  productId: string,
  appAccountToken?: string,
): Promise<NativeBillingEvidence> {
  return NativeBilling.purchase({ productId, appAccountToken });
}

export async function restoreNativePurchases(
  productIds: string[],
): Promise<NativeBillingEvidence[]> {
  const { transactions } = await NativeBilling.restore({ productIds });
  return transactions;
}
