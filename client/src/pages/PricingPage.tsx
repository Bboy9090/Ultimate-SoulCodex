import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";
import { Check, Crown, ShieldCheck } from "lucide-react";
import Navigation from "@/components/navigation";
import { apiFetch, publicApiErrorMessage } from "../lib/queryClient";
import { useProductAccess } from "../hooks/useProductAccess";

const foundationFeatures = [
  "One active profile with your supported Big 3",
  "Life Path and date-based numerology",
  "A limited daily synthesis with up to three qualified influences",
  "Basic Connections and one bounded relationship comparison",
  "Why am I seeing this? evidence and uncertainty",
  "Diamond Way clarity, depth, and one next move",
];

const plannedPremiumFeatures = [
  "Everything in Free",
  "Full governed numerology: Expression, Soul Urge, Personality, and Maturity when a complete birth name is available",
  "Verified Human Design Type, Strategy, Authority, and Profile",
  "Daily synthesis with up to five qualified current influences",
  "Evidence-aware downloadable natal PDF report",
];

const roadmapFeatures = [
  "Full natal chart premium surface: all qualified planets, houses, aspects, Midheaven, Nodes, and Chiron",
  "Human Design centers, channels, and deeper interaction synthesis",
  "Advanced transits and Timeline history",
  "Five-dimension multi-system Connections",
  "Premium personalized tarot/card generation",
];

export default function PricingPage() {
  const isNative = Capacitor.isNativePlatform();
  const { access, refetch: refetchAccess } = useProductAccess();
  const [checkoutPlan, setCheckoutPlan] = useState<"monthly" | "annual" | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { data: billingStatus } = useQuery({
    queryKey: ["/api/billing/status"],
    queryFn: async () => {
      const response = await apiFetch("/api/billing/status");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 30_000,
  });
  const { data: billingCatalog } = useQuery({
    queryKey: ["/api/billing/catalog"],
    queryFn: async () => {
      const response = await apiFetch("/api/billing/catalog");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 30_000,
  });
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await apiFetch("/api/auth/user");
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 30_000,
  });

  const webCheckoutReady = !isNative && Boolean(billingStatus?.enabled);
  const plusActive = access.tier === "plus";

  const checkoutReturn =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("checkout") === "return";

  const catalogByPlan = useMemo(() => {
    const entries = Array.isArray(billingCatalog?.plans) ? billingCatalog.plans : [];
    return Object.fromEntries(entries.map((entry: any) => [entry.plan, entry])) as Record<
      "monthly" | "annual",
      { currency: string; unitAmount: number; interval: "month" | "year" } | undefined
    >;
  }, [billingCatalog]);

  const formatPlanPrice = (plan: "monthly" | "annual") => {
    const entry = catalogByPlan[plan];
    if (!entry) return null;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: entry.currency.toUpperCase(),
      }).format(entry.unitAmount / 100);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!checkoutReturn || plusActive) return;
    let attempts = 0;
    const verify = async () => {
      attempts += 1;
      const result = await refetchAccess();
      if (result.data?.tier === "plus" || attempts >= 8) {
        window.clearInterval(timer);
      }
    };
    void verify();
    const timer = window.setInterval(() => void verify(), 1500);
    return () => window.clearInterval(timer);
  }, [checkoutReturn, plusActive, refetchAccess]);

  const startCheckout = async (plan: "monthly" | "annual") => {
    if (!webCheckoutReady || plusActive || checkoutPlan) return;
    setCheckoutPlan(plan);
    setCheckoutError(null);
    try {
      const response = await apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) {
        setCheckoutError(await publicApiErrorMessage(response));
        return;
      }
      const payload = await response.json();
      if (typeof payload?.url !== "string" || !payload.url.startsWith("https://")) {
        setCheckoutError("Secure checkout did not return a valid hosted URL.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setCheckoutError("Secure checkout could not be started.");
    } finally {
      setCheckoutPlan(null);
    }
  };

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-6xl">
        <header className="mx-auto max-w-4xl text-center">
          <div className="sc-eyebrow">Access</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,5.5rem)] font-medium leading-[.97] tracking-[-.04em] text-[var(--sc-ivory)]">
            Start with the Foundation.
          </h1>
          <p className="sc-lede mx-auto mt-5 max-w-3xl">
            Free gives you a real Soul Codex experience. Soul Codex+ unlocks the additional qualified capabilities listed below without changing the accuracy standard.
          </p>
        </header>

        {checkoutReturn && !plusActive ? (
          <section className="mt-6 rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4 text-sm text-[var(--sc-stone)]" aria-live="polite">
            <strong className="text-[var(--sc-ivory)]">Verifying your Soul Codex+ subscription…</strong>
            <span className="ml-2">Access activates only after the signed subscription event reaches the server.</span>
          </section>
        ) : checkoutReturn && plusActive ? (
          <section className="mt-6 rounded-2xl border border-[rgba(114,216,197,.22)] bg-[rgba(114,216,197,.06)] p-4 text-sm text-[var(--sc-teal)]" aria-live="polite">
            Soul Codex+ is verified and active on this account.
          </section>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="sc-panel sc-panel-gold flex flex-col p-6 sm:p-8">
            <div className="sc-eyebrow">Core clarity</div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Free</h2>
            <div className="mt-4 text-3xl font-semibold text-[var(--sc-gold-bright)]">Free</div>
            <FeatureList features={foundationFeatures} />
            <Link href="/create" className="sc-button-primary mt-auto w-full">
              Create profile
            </Link>
          </article>

          <article className="sc-panel flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <div className="sc-eyebrow">Deeper intelligence</div>
              <Crown className="h-4 w-4 text-[var(--sc-gold)]" aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold">Soul Codex+</h2>
            <p className="mt-4 text-sm leading-6 text-[var(--sc-stone)]">
              {isNative
                ? "Monthly and annual Soul Codex+ access will activate here only after StoreKit / Play Billing and durable entitlement verification pass release gates."
                : webCheckoutReady
                  ? "Monthly and annual subscriptions use Stripe-hosted checkout. Soul Codex does not receive raw card details, and Plus activates only after the signed subscription event is verified by the server."
                  : "Monthly and annual web plans appear here only when the verified subscription catalog and webhook path are configured."}
            </p>
            <FeatureList features={plannedPremiumFeatures} />
            {plusActive ? (
              <div className="mt-auto rounded-xl border border-[rgba(114,216,197,.22)] bg-[rgba(114,216,197,.06)] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-teal)]">
                Soul Codex+ active · {access.plan ?? "verified plan"}
              </div>
            ) : isNative ? (
              <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-stone)]">
                Native purchase activation pending StoreKit / Play Billing certification
              </div>
            ) : webCheckoutReady ? (
              <div className="mt-auto space-y-3">
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      className="sc-button-primary w-full"
                      disabled={checkoutPlan !== null}
                      onClick={() => void startCheckout("monthly")}
                    >
                      {checkoutPlan === "monthly"
                        ? "Opening secure checkout…"
                        : `Choose Monthly${formatPlanPrice("monthly") ? ` · ${formatPlanPrice("monthly")}/month` : ""}`}
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-[var(--sc-line-gold)] px-4 py-3 text-sm font-semibold text-[var(--sc-gold-bright)]"
                      disabled={checkoutPlan !== null}
                      onClick={() => void startCheckout("annual")}
                    >
                      {checkoutPlan === "annual"
                        ? "Opening secure checkout…"
                        : `Choose Annual${formatPlanPrice("annual") ? ` · ${formatPlanPrice("annual")}/year` : ""}`}
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm text-[var(--sc-stone)]">
                    Sign in to subscribe. Your subscription belongs to your account so it can be restored across devices.
                  </div>
                )}
                {checkoutError ? (
                  <p role="alert" className="m-0 text-center text-sm text-red-300">{checkoutError}</p>
                ) : null}
              </div>
            ) : (
              <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-stone)]">
                Soul Codex+ web checkout is not configured yet
              </div>
            )}
          </article>
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Roadmap · not sold yet</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Planned, not included in the current paid promise</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
            These features stay outside Soul Codex+ until their complete UI, evidence boundary, entitlement gate, and regression coverage are live.
          </p>
          <FeatureList features={roadmapFeatures} />
        </section>

        <section className="sc-panel mt-4 p-6 sm:p-8">
          <div className="sc-eyebrow">Clear answers</div>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Access FAQ</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Faq question="Do I need to recreate my profile?" answer="No. Identity, Reading, Timeline, and Compatibility reuse the same saved profile." />
            <Faq question="What does Soul Codex+ actually unlock?" answer="Only the capabilities listed as included now: full-name numerology, verified Human Design core, up to five qualified Daily influences, and the evidence-aware natal PDF report. Roadmap features are shown separately and are not sold yet. Accuracy is never paywalled." />
            <Faq question="Where would card details be entered?" answer="Soul Codex does not contain raw card-number, expiration, CVC, or CVV fields. The server also rejects those fields if they are sent to retired or hosted-checkout boundaries." />
            <Faq question="How does purchase activation work?" answer={isNative ? "This native release candidate exposes no purchase action until StoreKit / Play Billing, restore, revocation, and durable entitlement verification pass." : "Web checkout uses a hosted subscription page only when the billing catalog is configured. Returning from checkout does not grant Plus by itself; the server waits for a verified subscription event."} />
          </div>
        </section>

        <section className="mt-4 flex gap-3 rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.05)] p-4 text-sm text-[var(--sc-stone)]">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sc-teal)]" />
          <p className="m-0 leading-6">
            <strong className="text-[var(--sc-ivory-soft)]">Billing boundary:</strong> premium entitlement may only follow a verified paid event through an approved purchase path. A client-side success screen never grants premium by itself.
          </p>
        </section>
      </main>
    </div>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="my-6 space-y-3 text-sm text-[var(--sc-stone)]">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" />
          <span className="leading-6">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <h3 className="m-0 font-serif text-lg font-semibold text-[var(--sc-ivory)]">{question}</h3>
      <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">{answer}</p>
    </article>
  );
}
