import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Activity, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Navigation from "../components/navigation";
import { apiFetch } from "../lib/queryClient";
import { getClientReleaseIdentity } from "../lib/releaseIdentity";

type Health = {
  status?: string;
  appVersion?: string;
  releaseSha?: string;
  apiContract?: string;
};

type State = {
  loading: boolean;
  health?: Health;
  compatibility?: { ok?: boolean; contract?: string };
  error?: string;
};

export default function DiagnosticsPage() {
  const client = getClientReleaseIdentity();
  const [state, setState] = useState<State>({ loading: true });

  async function probe() {
    setState({ loading: true });
    try {
      const healthResponse = await apiFetch("/health", { cache: "no-store" });
      const health = await healthResponse.json().catch(() => ({}));
      if (!healthResponse.ok) throw new Error(`Health probe returned HTTP ${healthResponse.status}`);

      const compatibilityResponse = await apiFetch("/api/compatibility/ping", { cache: "no-store" });
      const compatibility = await compatibilityResponse.json().catch(() => ({}));
      setState({
        loading: false,
        health,
        compatibility: compatibilityResponse.ok ? compatibility : { ok: false },
        error: compatibilityResponse.ok ? undefined : `Compatibility contract returned HTTP ${compatibilityResponse.status}`,
      });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Probe failed" });
    }
  }

  useEffect(() => { void probe(); }, []);

  const contractMatches = state.health?.apiContract === client.expectedApiContract;
  const compatibilityOk = state.compatibility?.ok === true;

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-4xl pt-28">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-[var(--sc-stone)]"><ArrowLeft size={16} /> Back to Settings</Link>
        <header className="mt-7"><p className="sc-eyebrow">Release truth</p><h1 className="font-serif text-4xl font-medium md:text-6xl">Diagnostics</h1><p className="mt-3 max-w-2xl text-[var(--sc-stone)]">Non-sensitive build and API identity for TestFlight, Play Internal Testing, staging, and support. No birth data or account secrets appear here.</p></header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <DiagnosticCard title="Client" rows={[
            ["Version", client.appVersion],
            ["Release SHA", client.releaseSha],
            ["Expected API", client.expectedApiContract],
            ["API base", client.apiBase],
          ]} />
          <DiagnosticCard title="Backend" rows={[
            ["Version", state.health?.appVersion || (state.loading ? "Checking…" : "Unavailable")],
            ["Release SHA", state.health?.releaseSha || (state.loading ? "Checking…" : "Unavailable")],
            ["API contract", state.health?.apiContract || (state.loading ? "Checking…" : "Unavailable")],
            ["Health", state.health?.status || (state.loading ? "Checking…" : "Unavailable")],
          ]} />
        </section>

        <section className="sc-panel mt-4 p-6">
          <div className="flex items-center justify-between gap-4"><div><p className="sc-eyebrow">Contract status</p><h2 className="font-serif text-2xl">Client ↔ backend compatibility</h2></div><Activity className="text-[var(--sc-gold)]" /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatusRow ok={contractMatches} label="API contract" detail={state.loading ? "Checking…" : contractMatches ? "Expected contract is present" : "Client and backend contract differ"} />
            <StatusRow ok={compatibilityOk} label="Compatibility API" detail={state.loading ? "Checking…" : compatibilityOk ? state.compatibility?.contract || "Route available" : "Required route unavailable"} />
          </div>
          {state.error && <p className="mt-4 rounded-xl border border-[rgba(232,138,90,.3)] bg-[rgba(232,138,90,.06)] p-4 text-sm text-[#f0b198]">{state.error}</p>}
          <button type="button" onClick={() => void probe()} disabled={state.loading} className="sc-button-secondary mt-5">{state.loading ? "Checking…" : "Run checks again"}</button>
        </section>
      </main>
    </div>
  );
}

function DiagnosticCard({ title, rows }: { title: string; rows: string[][] }) {
  return <section className="sc-panel p-6"><p className="sc-eyebrow">{title}</p><dl className="mt-4 space-y-3">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 border-b border-[var(--sc-line)] pb-3 last:border-0"><dt className="text-sm text-[var(--sc-stone)]">{label}</dt><dd className="m-0 break-all font-mono text-xs text-[var(--sc-ivory-soft)]">{value}</dd></div>)}</dl></section>;
}

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return <div className={`rounded-xl border p-4 ${ok ? "border-[rgba(114,216,183,.25)] bg-[rgba(114,216,183,.05)]" : "border-[rgba(232,138,90,.25)] bg-[rgba(232,138,90,.05)]"}`}><div className="flex items-center gap-2">{ok ? <CheckCircle2 className="h-4 w-4 text-[#72d6b7]" /> : <XCircle className="h-4 w-4 text-[#e88a8a]" />}<strong>{label}</strong></div><p className="mt-2 text-sm text-[var(--sc-stone)]">{detail}</p></div>;
}
