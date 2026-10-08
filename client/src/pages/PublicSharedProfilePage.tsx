import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Sparkles, ShieldCheck, UserRoundPlus } from "lucide-react";
import Navigation from "@/components/navigation";
import { compatibilityLink, sanitizeConnectionPlacements, saveConnection, type SavedConnection } from "@/lib/connectionRepository";

type PublicProjection = {
  version: 1;
  fields: Partial<Record<
    "displayName" | "sunSign" | "moonSign" | "risingSign" | "lifePath" | "archetypeTitle",
    string | number
  >> & { comparisonChart?: Array<{ key: string; sign: string; house: number }> };
};

export default function PublicSharedProfilePage() {
  const { token } = useParams();
  const [savedConnection, setSavedConnection] = useState<SavedConnection | null>(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = existing?.content ?? null;
    const meta = existing ?? document.createElement("meta");
    if (!existing) {
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex,nofollow,noarchive";

    return () => {
      if (existing && previous !== null) existing.content = previous;
      else meta.remove();
    };
  }, []);
  const { data, isLoading, error } = useQuery<PublicProjection>({
    queryKey: ["public-share", token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/public-shares/${encodeURIComponent(String(token))}`, {
        credentials: "omit",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("public_share_unavailable");
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="sc-app-shell"><Navigation /><main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4"><p className="text-[var(--sc-stone)]">Opening shared Soul Codex card…</p></main></div>;
  }

  if (error || !data) {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4">
          <div className="sc-panel p-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[var(--sc-stone)]" />
            <h1 className="font-serif text-2xl text-[var(--sc-ivory)]">
              {offline ? "Connection required" : "Shared card unavailable"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
              {offline
                ? "Public Soul Codex cards are deliberately not cached with private app data. Reconnect to verify this link and load its sanitized snapshot."
                : "This link may have been revoked, mistyped, or never created."}
            </p>
            <Link href="/" className="sc-button-primary mt-5 inline-flex"><ArrowLeft className="mr-2 h-4 w-4" /> Soul Codex home</Link>
          </div>
        </main>
      </div>
    );
  }

  const fields = data.fields;
  const comparisonChart = sanitizeConnectionPlacements(fields.comparisonChart);
  const sharedSun = comparisonChart.find(placement => placement.key === "sun")?.sign;
  const saveSharedConnection = () => {
    setSaveError("");
    try {
      const name = typeof fields.displayName === "string" ? fields.displayName : "Shared Soul Codex";
      const next = saveConnection({
        name,
        relationship: "friend",
        sunSign: sharedSun ?? "",
        placements: comparisonChart,
      });
      setSavedConnection(next[0] ?? null);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "This shared card could not be saved.");
    }
  };
  const rows = [
    ["Sun", fields.sunSign],
    ["Moon", fields.moonSign],
    ["Rising", fields.risingSign],
    ["Life Path", fields.lifePath],
    ["Archetype", fields.archetypeTitle],
  ].filter(([, value]) => value !== undefined && value !== null);

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
        <section className="sc-panel sc-panel-gold overflow-hidden p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--sc-teal)]" />
              <p className="sc-eyebrow m-0">Public Soul Codex card</p>
            </div>
            <span className="rounded-full border border-[var(--sc-line)] bg-white/[0.025] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--sc-stone)]">Sanitized snapshot</span>
          </div>
          <h1 className="mt-4 font-serif text-4xl text-[var(--sc-ivory)]">
            {typeof fields.displayName === "string" ? fields.displayName : "Shared Soul Codex"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
            This is a sanitized snapshot created by the profile owner. It does not expose birth inputs, coordinates, assessment answers, private profile identifiers, or verification internals.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">{String(label)}</p>
                <p className="mt-2 font-serif text-2xl text-[var(--sc-gold-bright)]">{String(value)}</p>
              </div>
            ))}
          </div>

          {comparisonChart.length > 0 && (
            <section className="mt-6 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] p-4" data-testid="shared-comparison-chart">
              <p className="sc-eyebrow">Shared for comparison</p>
              <h2 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">{comparisonChart.length} verified chart placement{comparisonChart.length === 1 ? "" : "s"}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">Only sign and house rows deliberately included by the profile owner are available. Exact birth data, degrees, evidence receipts, and private interpretations remain hidden.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {comparisonChart.map(placement => <span key={placement.key} className="rounded-full border border-[var(--sc-line)] px-3 py-1.5 text-xs text-[var(--sc-ivory-soft)]">{placement.key} · {placement.sign} · H{placement.house}</span>)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!savedConnection ? <button type="button" className="sc-button-primary" onClick={saveSharedConnection}><UserRoundPlus className="mr-2 h-4 w-4"/>Save to Connections</button> : <Link href={compatibilityLink(savedConnection)} className="sc-button-primary">Compare our charts</Link>}
                <Link href="/connections" className="sc-button-secondary">Open Connections</Link>
              </div>
              {saveError && <p role="alert" className="mt-3 text-sm text-[var(--sc-danger)]">{saveError}</p>}
            </section>
          )}

          <div className="mt-6 rounded-xl border border-[var(--sc-line)] bg-black/10 p-4 text-xs leading-5 text-[var(--sc-stone)]">
            Astrology appears here only when the stored placement passed the app’s verified-evidence boundary. Numerology arithmetic may be deterministic while its interpretation remains symbolic.
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sc-line)] pt-5">
            <p className="max-w-md text-xs leading-5 text-[var(--sc-stone)]">Want your own private reading? Create a profile first, then choose exactly what—if anything—you want to make public.</p>
            <Link href="/create" className="sc-button-primary inline-flex items-center">
              <Sparkles className="mr-2 h-4 w-4" /> Create your Soul Codex
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
