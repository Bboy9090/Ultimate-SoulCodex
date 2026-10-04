import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Loader2, ShieldCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useProductAccess } from "@/hooks/useProductAccess";

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
    return (
      <BillingNotice>
        Native purchasing remains unavailable until StoreKit / Play Billing, restore, and server-verification gates pass. Web checkout is never opened from the bundled app.
      </BillingNotice>
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
