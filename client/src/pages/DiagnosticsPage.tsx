import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import FeatureState from "../components/FeatureState";
import { apiFetch } from "../lib/queryClient";
import { getClientReleaseIdentity } from "../lib/releaseIdentity";

type BackendIdentity = {
  status?: string;
  appVersion?: string;
  releaseSha?: string;
  apiContract?: string;
};

type CheckState = {
  loading: boolean;
  error: string;
  backend: BackendIdentity | null;
  compatibilityOk: boolean | null;
  checkedAt: string | null;
};

function shortSha(value?: string) {
  if (!value || value === "unknown") return "unknown";
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

export default function DiagnosticsPage() {
  const client = useMemo(() => getClientReleaseIdentity(), []);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<CheckState>({
    loading: true,
    error: "",
    backend: null,
    compatibilityOk: null,
    checkedAt: null,
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
              </dl>
            ) : (
              <p className="mt-5 text-sm text-[var(--sc-stone)]">No backend identity received.</p>
            )}
          </article>
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

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
