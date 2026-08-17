import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, HeartHandshake, Sparkles } from "lucide-react";
import Navigation from "../components/navigation";
import EvidenceLimitations from "../components/EvidenceLimitations";
import AsyncFeatureState, { featureErrorMessage } from "../components/AsyncFeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { buildCompatibilityProfilePayload } from "../lib/compatibilityProfilePayload";
import { apiFetch } from "../lib/queryClient";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

type PersonComparisonResult = {
  available: boolean;
  evidenceMode: "verified" | "symbolic" | "unavailable";
  evidenceLabel?: string;
  reason?: string;
  person: { name: string; sunSign: string | null };
  dimensions: null | { romantic: number; chemistry: number; mentalFriendship: number; growth: number };
  interpretation: null | { headline: string; why: string; tension?: string | null };
  excludedLayers?: string[];
  formula?: { id?: string; layers?: string[]; inputs?: Record<string, unknown> };
};

const DIMENSIONS = [
  { key: "romantic", label: "Romantic connection", detail: "Partnership themes, trust, steadiness, and long-range symbolic flow." },
  { key: "chemistry", label: "Chemistry & attraction", detail: "Magnetism, activation, intensity, play, and attraction." },
  { key: "mentalFriendship", label: "Communication & friendship", detail: "Conversation, curiosity, humor, social ease, and daily rapport." },
  { key: "growth", label: "Growth & repair", detail: "Friction, adaptation, recurring lessons, and repair pressure." },
] as const;

function profileName(profile: any) {
  return profile?.name || profile?.firstName || profile?.codename || "Your saved Identity";
}

export default function CompatibilityPersonPage() {
  const { profile, isLoading: profileLoading } = useActiveProfile();
  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
  const [name, setName] = useState("");
  const [sunSign, setSunSign] = useState("");
  const [result, setResult] = useState<PersonComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runComparison() {
    if (!profile || !sunSign) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await apiFetch("/api/compatibility/person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: compatibilityProfile,
          otherPerson: { name: name.trim() || "This person", sunSign },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      const normalizedPayload = payload && typeof payload === "object"
        ? { ...payload, reason: payload.reason ?? payload.message }
        : payload;
      setResult(normalizedPayload as PersonComparisonResult);
      if (!response.ok && response.status !== 422) {
        setError(featureErrorMessage(response.status, payload?.message || "This comparison could not be generated."));
      }
    } catch (cause) {
      setError(featureErrorMessage(undefined, cause instanceof Error ? cause.message : undefined));
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runComparison();
  }

  if (profileLoading) {
    return <div className="sc-app-shell"><Navigation /><main className="sc-page pt-32"><div className="sc-panel p-8 text-center text-[var(--sc-stone)]">Loading saved Identity…</div></main></div>;
  }

  if (!profile) {
    return (
      <div className="sc-app-shell"><Navigation /><main className="sc-page max-w-3xl pt-32">
        <section className="sc-panel p-8 text-center"><HeartHandshake className="mx-auto h-10 w-10 text-[var(--sc-gold)]" /><h1 className="mt-5 font-serif text-4xl">Save your Identity first</h1><p className="mx-auto mt-3 max-w-xl text-[var(--sc-stone)]">Specific-person Compatibility reuses your saved profile. You should not have to re-enter your own birth data every time.</p><Link href="/create" className="sc-button-primary mt-6 inline-flex">Create profile</Link></section>
      </main></div>
    );
  }

  const dimensionScores = result?.dimensions ?? null;

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-5xl pt-28">
        <Link href="/compatibility" className="inline-flex items-center gap-2 text-sm text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]"><ArrowLeft size={16} /> Back to Compatibility</Link>
        <header className="mt-7 max-w-3xl">
          <p className="sc-eyebrow">Specific person</p>
          <h1 className="font-serif text-4xl font-medium md:text-6xl">Compare one person without rebuilding yourself.</h1>
          <p className="mt-4 text-base leading-7 text-[var(--sc-ivory-soft)] md:text-lg">{profileName(profile)} stays loaded. Enter only the other person’s name and symbolic Sun sign. Your deterministic Life Path is included when available.</p>
          <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">The request excludes your name, raw birth date, birth location, biography, Moon, Rising, houses, and Human Design.</p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={submit} className="sc-panel p-6" aria-label="Compare one person">
            <div className="flex items-center gap-3"><div className="sc-icon-well"><Sparkles size={20} /></div><div><p className="sc-eyebrow">Other person only</p><h2 className="text-xl font-semibold">Who are you comparing?</h2></div></div>
            <label className="mt-6 block text-sm font-semibold" htmlFor="compatibility-person-name">Name</label>
            <input id="compatibility-person-name" data-testid="compatibility-person-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Their name" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-ink)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)]" />
            <label className="mt-5 block text-sm font-semibold" htmlFor="compatibility-person-sun">Sun sign</label>
            <select id="compatibility-person-sun" data-testid="compatibility-person-sun" value={sunSign} onChange={(event) => setSunSign(event.target.value)} required className="mt-2 min-h-11 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-ink)] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-gold)]">
              <option value="">Choose their Sun sign</option>{SIGNS.map((sign) => <option value={sign} key={sign}>{sign}</option>)}
            </select>
            <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">Their Sun sign remains user-supplied symbolic data. It is never relabeled as independently verified astronomy.</p>
            <button type="submit" data-testid="compatibility-person-submit" disabled={loading || !sunSign} className="sc-button-primary mt-6 min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Comparing supported layers…" : "Build comparison"}</button>
          </form>

          <div className="min-w-0 space-y-5" aria-live="polite">
            {!result && !loading && !error && <section className="sc-panel border-dashed p-7"><p className="sc-eyebrow">What you will get</p><h2 className="font-serif text-2xl">Four dimensions, not one verdict.</h2><p className="mt-3 leading-7 text-[var(--sc-stone)]">Romantic connection, chemistry & attraction, communication & friendship, and growth & repair remain separate.</p></section>}
            {error && <AsyncFeatureState message={error} onRetry={() => void runComparison()} />}
            {result && !result.available && !error && <section data-testid="compatibility-person-unavailable" className="sc-panel border-[rgba(232,185,90,.3)] p-6"><p className="sc-eyebrow">Comparison unavailable</p><h2 className="font-serif text-2xl">This layer remains visible instead of guessing.</h2><p className="mt-3 text-[var(--sc-stone)]">{result.reason}</p></section>}

            {result?.available && dimensionScores && !error && (
              <>
                <section className="sc-panel border-[rgba(154,116,220,.25)] p-6"><p className="sc-eyebrow">Symbolic comparison</p><h2 className="font-serif text-2xl">{result.person.name} · {result.person.sunSign}</h2><p className="mt-3 text-sm text-[var(--sc-stone)]">{result.evidenceLabel}</p></section>
                <section className="grid gap-3 sm:grid-cols-2" aria-label="Compatibility dimensions">
                  {DIMENSIONS.map((dimension) => <article className="sc-panel min-w-0 p-5" key={dimension.key}><div className="flex items-start justify-between gap-4"><h3 className="font-semibold">{dimension.label}</h3><span className="rounded-full border border-[var(--sc-line-gold)] px-2.5 py-1 text-sm font-semibold text-[var(--sc-gold-bright)]" aria-label={`${dimension.label} symbolic score ${dimensionScores[dimension.key]}`}>{dimensionScores[dimension.key]}</span></div><p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{dimension.detail}</p></article>)}
                </section>
                {result.interpretation && <section className="sc-panel p-6"><p className="sc-eyebrow">Pattern to inspect</p><h2 className="font-serif text-2xl">{result.interpretation.headline}</h2><p className="mt-4 leading-7 text-[var(--sc-ivory-soft)]">{result.interpretation.why}</p>{result.interpretation.tension && <div className="mt-5 rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.05)] p-4"><strong className="text-[var(--sc-gold-bright)]">Watch point</strong><p className="mt-2 text-sm text-[var(--sc-stone)]">{result.interpretation.tension}</p></div>}</section>}
                <EvidenceLimitations evidenceLabel={result.evidenceLabel} layers={result.formula?.layers} excluded={result.excludedLayers} />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
