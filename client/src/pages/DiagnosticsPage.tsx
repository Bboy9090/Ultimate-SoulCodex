import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ArrowLeft, Check, CheckCircle2, Copy, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import FeatureState from "../components/FeatureState";
import { apiFetch } from "../lib/queryClient";
import { getClientReleaseIdentity } from "../lib/releaseIdentity";
import { buildSafeDiagnosticBundle } from "../lib/safeDiagnosticBundle";
import { useProductAccess } from "../hooks/useProductAccess";
import {
  loadNativeBillingCatalog,
  loadNativeBillingProducts,
  type NativeBillingProduct,
} from "../lib/nativeBilling";

type BackendIdentity = {
  status?: string;
  appVersion?: string;
  releaseSha?: string;
  apiContract?: string;
  persistence?: {
    mode?: "postgres" | "memory";
    durable?: boolean;
    durableFeaturesAvailable?: boolean;
  };
};

type CheckState = {
  loading: boolean;
  error: string;
  backend: BackendIdentity | null;
  compatibilityOk: boolean | null;
  checkedAt: string | null;
};

type BillingDiagnosticState = {
  loading: boolean;
  error: string;
  platform: "ios" | "android" | "web";
  enabled: boolean | null;
  verifierConfigured: boolean | null;
  monthlyProductId: string | null;
  annualProductId: string | null;
  monthlyDisplayPrice: string | null;
  annualDisplayPrice: string | null;
  reason: string | null;
  qualificationMode: boolean;
};

function shortSha(value?: string) {
  if (!value || value === "unknown") return "unknown";
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

export default function DiagnosticsPage() {
  const client = useMemo(() => getClientReleaseIdentity(), []);
  const { access } = useProductAccess();
  const nativePlatform = Capacitor.getPlatform();
  const billingPlatform: BillingDiagnosticState["platform"] =
    nativePlatform === "ios" || nativePlatform === "android" ? nativePlatform : "web";
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [state, setState] = useState<CheckState>({
    loading: true,
    error: "",
    backend: null,
    compatibilityOk: null,
    checkedAt: null,
  });
  const [billing, setBilling] = useState<BillingDiagnosticState>({
    loading: true,
    error: "",
    platform: billingPlatform,
    enabled: null,
    verifierConfigured: null,
    monthlyProductId: null,
    annualProductId: null,
    monthlyDisplayPrice: null,
    annualDisplayPrice: null,
    reason: null,
    qualificationMode: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState((previous) => ({ ...previous, loading: true, error: "" }));
      try {
        const healthResponse = await apiFetch("/health", { cache: "no-store" });
        const health = await healthResponse.json().catch(() => ({}));
        if (!healthResponse.ok) throw new Error(`Health check failed with HTTP ${healthResponse.status}.`);

        const pingResponse = await apiFetch("/api/compatibility/ping", { cache: "no-store" });
        const ping = await pingResponse.json().catch(() => ({}));
        const compatibilityOk = pingResponse.ok
          && ping?.ok === true
          && ping?.apiContract === client.expectedApiContract;

        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            backend: health,
            compatibilityOk,
            checkedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error instanceof Error ? error.message : "Diagnostics could not reach the configured API.",
            checkedAt: new Date().toISOString(),
          }));
        }
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [client.expectedApiContract, revision]);

  useEffect(() => {
    let cancelled = false;

    async function runBillingDiagnostics() {
      setBilling((previous) => ({ ...previous, loading: true, error: "", platform: billingPlatform }));
      try {
        if (billingPlatform === "ios" || billingPlatform === "android") {
          const catalog = await loadNativeBillingCatalog();
          if (!catalog) throw new Error("Native billing catalog endpoint did not return a result.");

          let products: NativeBillingProduct[] = [];
          if (catalog.enabled) {
            products = await loadNativeBillingProducts(catalog);
          }

          const monthly = products.find((product) => product.id === catalog.monthlyProductId) ?? null;
          const annual = products.find((product) => product.id === catalog.annualProductId) ?? null;
          if (!cancelled) {
            setBilling({
              loading: false,
              error: "",
              platform: billingPlatform,
              enabled: catalog.enabled,
              verifierConfigured: catalog.verifierConfigured,
              monthlyProductId: catalog.monthlyProductId,
              annualProductId: catalog.annualProductId,
              monthlyDisplayPrice: monthly?.displayPrice ?? null,
              annualDisplayPrice: annual?.displayPrice ?? null,
              reason: catalog.reason,
              qualificationMode: Boolean(catalog.qualificationMode),
            });
          }
          return;
        }

        const response = await apiFetch("/api/billing/status", { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(`Billing status failed with HTTP ${response.status}.`);
        if (!cancelled) {
          setBilling({
            loading: false,
            error: "",
            platform: "web",
            enabled: Boolean(payload.enabled),
            verifierConfigured: Boolean(payload.subscriptionWebhookVerification),
            monthlyProductId: payload.monthlyProductConfigured ? "configured" : null,
            annualProductId: payload.annualProductConfigured ? "configured" : null,
            monthlyDisplayPrice: null,
            annualDisplayPrice: null,
            reason: typeof payload.reason === "string" ? payload.reason : null,
            qualificationMode: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setBilling((previous) => ({
            ...previous,
            loading: false,
            error: error instanceof Error ? error.message : "Billing diagnostics unavailable.",
          }));
        }
      }
    }

    void runBillingDiagnostics();
    return () => {
      cancelled = true;
    };
  }, [billingPlatform, revision]);

  const contractMatches = Boolean(
    state.backend?.apiContract
    && state.backend.apiContract === client.expectedApiContract,
  );
  const exactShaMatches = Boolean(
    client.releaseSha !== "unknown"
    && state.backend?.releaseSha
    && state.backend.releaseSha !== "unknown"
    && client.releaseSha === state.backend.releaseSha,
  );

  const safeSummary = useMemo(
    () => buildSafeDiagnosticBundle({
      checkedAt: state.checkedAt,
      client,
      backend: state.backend,
      contractMatches,
      exactShaMatches,
      compatibilityOk: state.compatibilityOk,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
    }),
    [client, contractMatches, exactShaMatches, state.backend, state.checkedAt, state.compatibilityOk],
  );

  const copySafeSummary = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(safeSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Clipboard access was blocked. You can still read the release values above and send only those facts to support.");
    }
  };

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-5xl">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]">
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </Link>

        <header className="mt-7 max-w-3xl">
          <div className="sc-eyebrow">About & diagnostics</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5rem)] font-medium leading-[.98] tracking-[-.04em] text-[var(--sc-ivory)]">
            Release truth, without the guessing game.
          </h1>
          <p className="sc-lede mt-5">
            These values contain build and connectivity information only. Birth data, profile content, account secrets, and payment data are not shown here.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="sc-panel p-6">
            <div className="sc-eyebrow">Client</div>
            <dl className="mt-5 space-y-4 text-sm">
              <Row label="App version" value={client.appVersion} />
              <Row label="Release SHA" value={shortSha(client.releaseSha)} mono />
              <Row label="Expected API contract" value={client.expectedApiContract} mono />
              <Row label="API base" value={client.apiBase} mono />
            </dl>
          </article>

          <article className="sc-panel p-6">
            <div className="sc-eyebrow">Backend</div>
            {state.loading ? (
              <div className="mt-5 text-sm text-[var(--sc-stone)]">Checking configured API…</div>
            ) : state.backend ? (
              <dl className="mt-5 space-y-4 text-sm">
                <Row label="Status" value={state.backend.status || "unknown"} />
                <Row label="App version" value={state.backend.appVersion || "unknown"} />
                <Row label="Release SHA" value={shortSha(state.backend.releaseSha)} mono />
                <Row label="API contract" value={state.backend.apiContract || "unknown"} mono />
                <Row
                  label="Server persistence"
                  value={
                    state.backend.persistence?.durable
                      ? "durable (Postgres)"
                      : state.backend.persistence?.mode === "memory"
                        ? "ephemeral (memory)"
                        : "unknown"
                  }
                />
              </dl>
            ) : (
              <p className="mt-5 text-sm text-[var(--sc-stone)]">No backend identity received.</p>
            )}
          </article>
        </section>

        <section className="sc-panel mt-4 p-6" data-testid="billing-qualification-diagnostics">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="sc-eyebrow">Billing qualification</div>
              <h2 className="mt-2 font-serif text-2xl font-semibold">Provider readiness without payment secrets</h2>
              <p className="mb-0 mt-2 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
                This view exposes catalog/readiness and durable entitlement state only. Transaction IDs, purchase tokens, signed payloads, card data, and provider secrets are never rendered here.
              </p>
            </div>
            <button type="button" className="sc-button-secondary" onClick={() => setRevision((value) => value + 1)}>
              <RefreshCw className="h-4 w-4" /> Recheck
            </button>
          </div>

          {billing.loading ? (
            <p className="mt-5 text-sm text-[var(--sc-stone)]">Checking billing provider readiness…</p>
          ) : billing.error ? (
            <p role="alert" className="mt-5 text-sm text-amber-300">{billing.error}</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatusCard
                ok={billing.enabled === true}
                label={`Provider · ${billing.platform}`}
                detail={billing.enabled ? "purchase surface enabled in this environment" : `disabled · ${billing.reason ?? "not ready"}`}
              />
              <StatusCard
                ok={billing.verifierConfigured === true}
                label="Server verifier"
                detail={billing.verifierConfigured ? "configured" : "not configured"}
              />
              {billing.platform === "ios" ? (
                <StatusCard
                  ok={billing.qualificationMode}
                  label="Qualification path"
                  detail={billing.qualificationMode ? "TestFlight sandbox qualification active" : "normal production path"}
                />
              ) : null}
              <StatusCard
                ok={Boolean(billing.monthlyProductId && (billing.platform === "web" || billing.monthlyDisplayPrice))}
                label="Monthly catalog"
                detail={
                  billing.platform === "web"
                    ? billing.monthlyProductId ? "configured server-side" : "not configured"
                    : billing.monthlyProductId
                      ? `${billing.monthlyProductId}${billing.monthlyDisplayPrice ? ` · ${billing.monthlyDisplayPrice}` : " · product not returned"}`
                      : "not configured"
                }
              />
              <StatusCard
                ok={Boolean(billing.annualProductId && (billing.platform === "web" || billing.annualDisplayPrice))}
                label="Annual catalog"
                detail={
                  billing.platform === "web"
                    ? billing.annualProductId ? "configured server-side" : "not configured"
                    : billing.annualProductId
                      ? `${billing.annualProductId}${billing.annualDisplayPrice ? ` · ${billing.annualDisplayPrice}` : " · product not returned"}`
                      : "not configured"
                }
              />
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              ok={access.tier === "plus" && access.verified}
              label="Paid entitlement evidence"
              detail={
                access.tier === "plus"
                  ? access.verified ? "verified by server" : "Plus claim not verified"
                  : "Free baseline · no paid entitlement"
              }
            />
            <StatusCard ok={access.tier === "plus"} label="Current tier" detail={access.tier} />
            <StatusCard ok={access.source !== "free"} label="Entitlement source" detail={access.source} />
            <StatusCard ok={Boolean(access.lastVerifiedAt)} label="Last verification" detail={access.lastVerifiedAt ?? "none"} />
          </div>
          <p className="mb-0 mt-4 text-xs leading-5 text-[var(--sc-stone)]">
            A green catalog/verifier card is configuration evidence only. Provider purchase, restore, lifecycle, reinstall, second-device, cancellation/expiry, and revocation still require real sandbox/TestFlight/internal-test evidence before production activation.
          </p>
        </section>

        {state.error ? (
          <FeatureState
            className="mt-4"
            kind="error"
            title="Configured API could not be verified"
            description={state.error}
            actionLabel="Run checks again"
            onAction={() => setRevision((value) => value + 1)}
          />
        ) : null}

        {!state.loading && !state.error ? (
          <section className="sc-panel mt-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="sc-eyebrow">Compatibility contract</div>
                <h2 className="mt-2 font-serif text-2xl font-semibold">Client ↔ backend alignment</h2>
              </div>
              <button type="button" className="sc-button-secondary" onClick={() => setRevision((value) => value + 1)}>
                <RefreshCw className="h-4 w-4" /> Recheck
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatusCard
                ok={contractMatches}
                label="API contract"
                detail={contractMatches ? "matches" : "mismatch or unavailable"}
              />
              <StatusCard
                ok={state.compatibilityOk === true}
                label="Compatibility route"
                detail={state.compatibilityOk ? "responding" : "missing or incompatible"}
              />
              <StatusCard
                ok={state.backend?.persistence?.durable === true}
                label="Server persistence"
                detail={
                  state.backend?.persistence?.durable === true
                    ? "durable"
                    : state.backend?.persistence?.mode === "memory"
                      ? "ephemeral; durable account/share features are unavailable"
                      : "unknown"
                }
              />
              <StatusCard
                ok={exactShaMatches}
                label="Exact release SHA"
                detail={
                  exactShaMatches
                    ? "matches"
                    : client.releaseSha === "unknown" || state.backend?.releaseSha === "unknown"
                      ? "not embedded / not reported"
                      : "different releases"
                }
              />
            </div>

            <p className="mb-0 mt-5 text-xs leading-5 text-[var(--sc-stone)]">
              A healthy server is not automatically the right server. Release qualification requires the expected API contract and, when exact-SHA validation is claimed, matching non-unknown release SHAs.
            </p>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong className="text-sm text-[var(--sc-ivory)]">Safe support summary</strong>
                  <p className="mb-0 mt-1 max-w-2xl text-xs leading-5 text-[var(--sc-stone)]">
                    Copies release and connectivity facts only. Birth data, profile content, account identifiers, assessment answers, payment data, and share tokens are excluded.
                  </p>
                </div>
                <button type="button" className="sc-button-secondary min-h-11" onClick={() => void copySafeSummary()}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy safe summary"}
                </button>
              </div>
              {copyError ? <p role="alert" className="mb-0 mt-3 text-xs leading-5 text-amber-300">{copyError}</p> : null}
            </div>

            {state.checkedAt ? <p className="mb-0 mt-2 font-mono text-[10px] text-[var(--sc-stone)]">Checked {state.checkedAt}</p> : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <dt className="text-[var(--sc-stone)]">{label}</dt>
      <dd className={`m-0 break-all text-right text-[var(--sc-ivory-soft)] ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function StatusCard({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-[rgba(114,216,197,.2)] bg-[rgba(114,216,197,.05)]" : "border-amber-500/20 bg-amber-500/5"}`}>
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 className="h-4 w-4 text-[var(--sc-teal)]" /> : <TriangleAlert className="h-4 w-4 text-amber-400" />}
        <strong className="text-sm">{label}</strong>
      </div>
      <p className="mb-0 mt-2 text-xs text-[var(--sc-stone)]">{detail}</p>
    </div>
  );
}
