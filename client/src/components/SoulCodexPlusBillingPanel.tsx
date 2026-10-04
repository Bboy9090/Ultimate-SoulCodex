import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Loader2, ShieldCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useProductAccess } from "@/hooks/useProductAccess";
import {
  loadNativeBillingCatalog,
  loadNativeBillingProducts,
  purchaseNativeProduct,
  restoreNativePurchases,
  verifyNativeBillingEvidence,
  type NativeBillingCatalog,
  type NativeBillingProduct,
} from "@/lib/nativeBilling";

type CurrentUser = {
  id: string;
  email?: string | null;
  authProvider?: string;
};

type BillingStatus = {
  enabled: boolean;
  provider: "stripe_checkout";
  collectsCardDataOnSoulCodex: false;
  persistentEntitlements: boolean;
  subscriptionWebhookVerification: boolean;
  monthlyProductConfigured: boolean;
  annualProductConfigured: boolean;
  webCheckoutEnabled: boolean;
  manageSubscriptionEnabled: boolean;
  reason: "ready" | "not_configured" | "web_checkout_disabled";
};

type CatalogPlan = {
  plan: "monthly" | "annual";
  currency: string;
  unitAmount: number;
  interval: "month" | "year";
  intervalCount: number;
};

function formatPlanPrice(plan: CatalogPlan): string {
  const value = plan.unitAmount / 100;
  const currency = plan.currency.toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default function SoulCodexPlusBillingPanel() {
  const isNative = Capacitor.isNativePlatform();
  const handledReturn = useRef(false);
  const { access, refetch: refetchAccess } = useProductAccess();
  const [processingPlan, setProcessingPlan] = useState<"monthly" | "annual" | null>(null);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [nativeCatalog, setNativeCatalog] = useState<NativeBillingCatalog | null>(null);
  const [nativeProducts, setNativeProducts] = useState<NativeBillingProduct[]>([]);
  const [nativeBusy, setNativeBusy] = useState<"purchase" | "restore" | null>(null);

  const { data: currentUser, isLoading: userLoading } = useQuery<CurrentUser | null>({
    queryKey: ["/api/auth/user"],
    refetchOnMount: true,
  });

  const { data: billingStatus } = useQuery<BillingStatus>({
    queryKey: ["/api/billing/status"],
    enabled: !isNative,
    refetchOnMount: true,
  });

  const { data: catalog, isLoading: catalogLoading } = useQuery<{ plans: CatalogPlan[] }>({
    queryKey: ["/api/billing/catalog"],
    enabled: !isNative && Boolean(billingStatus?.enabled),
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!isNative || !currentUser) return;
    let cancelled = false;

    void loadNativeBillingCatalog().then(async (catalog) => {
      if (cancelled || !catalog) return;
      setNativeCatalog(catalog);
      if (!catalog.enabled) {
        setNativeProducts([]);
        return;
      }
      try {
        const products = await loadNativeBillingProducts(catalog);
        if (!cancelled) setNativeProducts(products);
      } catch {
        if (!cancelled) {
          setNativeProducts([]);
          setBillingMessage("The app-store subscription catalog is unavailable.");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isNative, currentUser]);

  useEffect(() => {
    if (isNative || handledReturn.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const result = params.get("checkout");
    if (result !== "success" && result !== "cancelled") return;

    handledReturn.current = true;
    params.delete("checkout");
    const nextSearch = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`,
    );

    if (result === "cancelled") {
      setBillingMessage("Checkout was cancelled. Your access was not changed.");
      return;
    }

    setBillingMessage("Payment returned successfully. Confirming verified Soul Codex+ access…");

    let cancelled = false;
    const verifyAccess = async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/access"] });

      for (let attempt = 1; attempt <= 8 && !cancelled; attempt += 1) {
        const refreshed = await refetchAccess();
        if (refreshed.data?.tier === "plus") {
          setBillingMessage("Soul Codex+ is verified and active.");
          return;
        }

        if (attempt < 8) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      }

      if (!cancelled) {
        setBillingMessage(
          "Payment returned, but Soul Codex+ is still awaiting verified provider evidence. Access stays Free until the signed billing event is confirmed.",
        );
      }
    };

    void verifyAccess();
    return () => {
      cancelled = true;
    };
  }, [isNative, refetchAccess]);

  const startCheckout = async (plan: "monthly" | "annual") => {
    if (processingPlan || isNative) return;
    setProcessingPlan(plan);
    setBillingMessage(null);
    try {
      const response = await apiRequest("POST", "/api/billing/checkout", { plan });
      const payload = await response.json() as { url?: string };
      if (!payload.url) throw new Error("Checkout did not return a secure destination.");
      window.location.assign(payload.url);
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "Soul Codex+ checkout is unavailable.");
      setProcessingPlan(null);
    }
  };

  const verifyNativeEvidence = async (evidence: Parameters<typeof verifyNativeBillingEvidence>[0]) => {
    await verifyNativeBillingEvidence(evidence);
    await queryClient.invalidateQueries({ queryKey: ["/api/access"] });
    const refreshed = await refetchAccess();
    if (refreshed.data?.tier !== "plus") {
      throw new Error("Store purchase verified without an active Soul Codex+ entitlement.");
    }
    setBillingMessage("Soul Codex+ is verified and active.");
  };

  const startNativePurchase = async (productId: string) => {
    if (!currentUser || nativeBusy) return;
    setNativeBusy("purchase");
    setBillingMessage(null);
    try {
      const evidence = await purchaseNativeProduct(productId, currentUser.id);
      await verifyNativeEvidence(evidence);
    } catch (error) {
      setBillingMessage(
        error instanceof Error ? error.message : "Native Soul Codex+ purchase could not be verified.",
      );
    } finally {
      setNativeBusy(null);
    }
  };

  const restoreNative = async () => {
    if (!currentUser || !nativeCatalog || nativeBusy) return;
    const productIds = [
      nativeCatalog.monthlyProductId,
      nativeCatalog.annualProductId,
    ].filter((value): value is string => Boolean(value));

    setNativeBusy("restore");
    setBillingMessage(null);
    try {
      const evidenceList = await restoreNativePurchases(productIds);
      if (!evidenceList.length) {
        setBillingMessage("No active Soul Codex+ store purchase was found to restore.");
        return;
      }

      let verified = false;
      for (const evidence of evidenceList) {
        try {
          await verifyNativeEvidence(evidence);
          verified = true;
        } catch {
          // Continue across restored transactions; only a verified current
          // entitlement may change access.
        }
      }

      if (!verified) {
        setBillingMessage("Store purchases were found, but none verified for this Soul Codex account.");
      }
    } catch (error) {
      setBillingMessage(
        error instanceof Error ? error.message : "Soul Codex+ restore could not be completed.",
      );
    } finally {
      setNativeBusy(null);
    }
  };

  const manageSubscription = async () => {
    setBillingMessage(null);
    try {
      const response = await apiRequest("POST", "/api/billing/manage");
      const payload = await response.json() as { url?: string };
      if (!payload.url) throw new Error("Subscription management did not return a secure destination.");
      window.location.assign(payload.url);
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "Subscription management is unavailable.");
    }
  };

  if (isNative) {
    const plusActive = access.tier === "plus";
    const nativeReady = Boolean(nativeCatalog?.enabled);
    const monthly = nativeProducts.find((product) => product.id === nativeCatalog?.monthlyProductId);
    const annual = nativeProducts.find((product) => product.id === nativeCatalog?.annualProductId);

    return (
      <div className="mt-auto space-y-3 pt-4">
        {billingMessage ? (
          <div className="rounded-xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)] p-4 text-sm leading-6 text-[var(--sc-ivory-soft)]" role="status">
            {billingMessage}
          </div>
        ) : null}

        {plusActive ? (
          <div className="rounded-xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)] p-4">
            <strong className="text-[var(--sc-ivory)]">
              Soul Codex+ active · {access.plan === "annual" ? "Annual" : "Monthly"}
            </strong>
            <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">
              Verified through {access.source === "apple" ? "Apple" : access.source === "google_play" ? "Google Play" : "web billing"}.
              {access.expiresAt ? ` Current period through ${new Date(access.expiresAt).toLocaleDateString()}.` : ""}
            </p>
          </div>
        ) : null}

        {!plusActive && !userLoading && !currentUser ? (
          <BillingNotice>
            Sign in before purchasing or restoring Soul Codex+ so the store transaction can be bound to this account across devices.
          </BillingNotice>
        ) : null}

        {!plusActive && currentUser && nativeReady && monthly && annual ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {[monthly, annual].map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className={product.id === annual.id ? "sc-button-primary" : "sc-button-secondary"}
                  disabled={Boolean(nativeBusy)}
                  onClick={() => void startNativePurchase(product.id)}
                >
                  {nativeBusy === "purchase" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                  ) : (
                    <>{product.id === annual.id ? "Annual" : "Monthly"} · {product.displayPrice}</>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="sc-button-secondary w-full"
              disabled={Boolean(nativeBusy)}
              onClick={() => void restoreNative()}
            >
              {nativeBusy === "restore" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Restoring…</>
              ) : (
                "Restore purchases"
              )}
            </button>
          </>
        ) : null}

        {!plusActive && currentUser && !nativeReady ? (
          <BillingNotice>
            Native Soul Codex+ purchasing is still gated on the verified app-store catalog and server verifier. Free remains fully available.
          </BillingNotice>
        ) : null}

        {!plusActive && currentUser && nativeReady && (!monthly || !annual) ? (
          <BillingNotice>
            The app-store subscription catalog did not return both qualified plans, so purchasing remains closed.
          </BillingNotice>
        ) : null}

        <div className="flex items-start gap-3 rounded-xl border border-[rgba(114,216,197,.14)] bg-[rgba(114,216,197,.035)] p-3 text-xs leading-5 text-[var(--sc-stone)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
          <span>Store success never grants Plus locally. Access changes only after the server verifies the signed StoreKit transaction or Google Play purchase token and writes the durable entitlement ledger.</span>
        </div>
      </div>
    );
  }

  const plusActive = access.tier === "plus";
  const webCheckoutReady = Boolean(billingStatus?.enabled);
  const plans = catalog?.plans ?? [];

  return (
    <div className="mt-auto space-y-3 pt-4">
      {billingMessage ? (
        <div className="rounded-xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)] p-4 text-sm leading-6 text-[var(--sc-ivory-soft)]" role="status">
          {billingMessage}
        </div>
      ) : null}

      {plusActive ? (
        <div className="rounded-xl border border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)] p-4">
          <strong className="text-[var(--sc-ivory)]">
            Soul Codex+ active · {access.plan === "annual" ? "Annual" : "Monthly"}
          </strong>
          <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">
            Verified through {access.source === "stripe" ? "web billing" : access.source === "apple" ? "Apple" : "Google Play"}.
            {access.expiresAt ? ` Current period through ${new Date(access.expiresAt).toLocaleDateString()}.` : ""}
          </p>
        </div>
      ) : null}

      {plusActive && access.source === "stripe" && billingStatus?.manageSubscriptionEnabled ? (
        <button type="button" className="sc-button-secondary w-full" onClick={() => void manageSubscription()}>
          Manage subscription
        </button>
      ) : null}

      {!plusActive && webCheckoutReady && !userLoading && currentUser ? (
        catalogLoading ? (
          <BillingNotice>Loading verified monthly and annual pricing…</BillingNotice>
        ) : plans.length === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <button
                type="button"
                key={plan.plan}
                className={plan.plan === "annual" ? "sc-button-primary" : "sc-button-secondary"}
                disabled={Boolean(processingPlan)}
                onClick={() => void startCheckout(plan.plan)}
              >
                {processingPlan === plan.plan ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Opening…</>
                ) : (
                  <>{plan.plan === "annual" ? "Annual" : "Monthly"} · {formatPlanPrice(plan)}/{plan.interval}</>
                )}
              </button>
            ))}
          </div>
        ) : (
          <BillingNotice>The verified subscription catalog is unavailable, so checkout remains closed.</BillingNotice>
        )
      ) : null}

      {!plusActive && webCheckoutReady && !userLoading && !currentUser ? (
        <BillingNotice>
          Soul Codex+ must attach to an authenticated account so access can restore across devices. Browser sign-in is not activated in this release, so checkout remains unavailable to unsigned web sessions.
        </BillingNotice>
      ) : null}

      {!plusActive && !webCheckoutReady ? (
        <BillingNotice>
          Soul Codex+ web purchase activation is still gated. Free remains fully available.
        </BillingNotice>
      ) : null}

      <div className="flex items-start gap-3 rounded-xl border border-[rgba(114,216,197,.14)] bg-[rgba(114,216,197,.035)] p-3 text-xs leading-5 text-[var(--sc-stone)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
        <span>A checkout return never grants Plus by itself. Access changes only after verified provider evidence reaches the durable entitlement ledger.</span>
      </div>
    </div>
  );
}

function BillingNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-sm leading-6 text-[var(--sc-stone)]">
      {children}
    </div>
  );
}
