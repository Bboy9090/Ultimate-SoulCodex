import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, HeartHandshake, Sparkles } from "lucide-react";
import Navigation from "../components/navigation";
import EvidenceLimitations from "../components/EvidenceLimitations";
import FeatureState from "../components/FeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { buildCompatibilityProfilePayload } from "../lib/compatibilityProfilePayload";
import { apiFetch } from "../lib/queryClient";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

type PersonComparisonResult = {
  available: boolean;
  evidenceMode: "verified" | "symbolic" | "unavailable";
  savedSunEvidenceMode?: "verified" | "symbolic" | "unavailable";
  evidenceLabel?: string;
  reason?: string;
  person: { name: string; sunSign: string | null };
  dimensions: null | {
    romantic: number;
    chemistry: number;
    mentalFriendship: number;
    growth: number;
  };
  interpretation: null | {
    headline: string;
    why: string;
    tension?: string | null;
  };
  excludedLayers?: string[];
  formula?: {
    layers?: string[];
    inputs?: Record<string, unknown>;
  };
};

const DIMENSIONS = [
  { key: "romantic", label: "Romantic connection", detail: "Partnership themes, emotional fit, trust, steadiness, and symbolic relationship flow." },
  { key: "chemistry", label: "Chemistry & attraction", detail: "Symbolic magnetism, activation, intensity, and attraction." },
  { key: "mentalFriendship", label: "Communication & friendship", detail: "Conversation, mental rhythm, social ease, curiosity, and day-to-day rapport." },
  { key: "growth", label: "Growth & repair", detail: "Friction, adaptation, recurring lessons, boundaries, and repair pressure." },
] as const;

function profileName(profile: any) {
  return profile?.name || profile?.firstName || profile?.codename || "Your saved Identity";
}

function apiErrorMessage(status: number, payload: any) {
  if (status === 404 || status === 410) {
    return "Compatibility API contract mismatch. This app is connected to a backend that does not expose the required comparison route.";
  }
  if (status >= 500) return "Compatibility is temporarily unavailable on the server.";
  return payload?.message || "This comparison could not be generated.";
}

export default function CompatibilityPersonPage() {
  const { profile, isLoading: profileLoading, isCorrupted, reason: profileError } = useActiveProfile();
  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
  const [name, setName] = useState("");
  const [sunSign, setSunSign] = useState("");
  const [result, setResult] = useState<PersonComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dimensionScores = result?.dimensions ?? null;

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
          otherPerson: {
            name: name.trim() || "This person",
            sunSign,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      const normalizedPayload = payload && typeof payload === "object"
        ? { ...payload, reason: payload.reason ?? payload.message }
        : payload;
      setResult(normalizedPayload);
      if (!response.ok && response.status !== 422) {
        setError(apiErrorMessage(response.status, payload));
      }
    } catch (cause) {
      setError(
        cause instanceof TypeError
          ? "Compatibility could not reach the server. Check your connection and try again."
          : cause instanceof Error
            ? cause.message
            : "This comparison could not be generated.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runComparison();
  }

  if (profileLoading) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page">
          <FeatureState kind="loading" title="Loading Identity" description="Opening the saved profile used by Compatibility." />
        </main>
      </div>
    );
  }

  if (isCorrupted) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page">
          <FeatureState kind="error" title="Your saved profile needs attention" description={profileError || "Compatibility will not guess from a corrupted profile."} />
          <Link href="/create" className="sc-button-primary mt-4">Create profile</Link>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page max-w-3xl">
          <section className="sc-panel sc-panel-gold p-8 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-[var(--sc-gold)]" />
            <h1 className="mt-5 font-serif text-4xl font-semibold">Create your Identity first</h1>
            <p className="mx-auto mt-3 max-w-xl text-[var(--sc-stone)]">
              Compare-a-person reuses the same saved profile as the rest of Soul Codex. You should never have to re-enter your own birth data here.
            </p>
            <Link href="/create" className="sc-button-primary mt-6">Create profile</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-6xl">
        <Link href="/compatibility" className="inline-flex items-center gap-2 text-sm text-[var(--sc-stone)] hover:text-[var(--sc-ivory)]">
          <ArrowLeft size={16} /> Back to Compatibility
        </Link>

        <header className="mt-7 max-w-4xl">
          <div className="sc-eyebrow">Compare a person</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5.5rem)] font-medium leading-[.97] tracking-[-.04em] text-[var(--sc-ivory)]">
            One person. Four signals. No universal verdict.
          </h1>
          <p className="sc-lede mt-5">
            {profileName(profile)} stays loaded. Add only the other person’s symbolic Sun sign. The current Foundation model uses your supported Sun evidence and deterministic Life Path when available.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
            Your name, birth date, birth location, biography, Moon, Rising, and Human Design are not included in this Compatibility request.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={submit} className="sc-panel p-6" aria-label="Compare a person">
            <div className="flex items-center gap-3">
              <span className="sc-icon-well"><Sparkles size={20} /></span>
              <div>
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--sc-stone)]">Other person only</p>
                <h2 className="m-0 mt-1 font-serif text-xl font-semibold">Who are you comparing?</h2>
              </div>
            </div>

            <label className="mt-6 block text-sm font-semibold" htmlFor="compatibility-person-name">Name or label</label>
            <input
              id="compatibility-person-name"
              data-testid="compatibility-person-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Optional"
              className="mt-2 min-h-11 w-full rounded-xl border bg-background px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />

            <label className="mt-5 block text-sm font-semibold" htmlFor="compatibility-person-sun">Sun sign</label>
            <select
              id="compatibility-person-sun"
              data-testid="compatibility-person-sun"
              value={sunSign}
              onChange={(event) => setSunSign(event.target.value)}
              required
              className="mt-2 min-h-11 w-full rounded-xl border bg-background px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">Choose their Sun sign</option>
              {SIGNS.map((sign) => <option value={sign} key={sign}>{sign}</option>)}
            </select>

            <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">
              Their Sun sign remains user-supplied symbolic data. It is never relabeled as verified astronomy.
            </p>

            <button
              type="submit"
              data-testid="compatibility-person-submit"
              disabled={loading || !sunSign}
              className="sc-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Building comparison…" : "Build comparison"}
            </button>
          </form>

          <div className="min-w-0 space-y-5" aria-live="polite">
            {!result && !loading && !error ? (
              <section className="sc-panel p-7">
                <div className="sc-eyebrow">What you will get</div>
                <h2 className="mt-3 font-serif text-3xl font-semibold">Four dimensions, not one verdict.</h2>
                <p className="mt-3 leading-7 text-[var(--sc-stone)]">
                  Romantic connection, chemistry & attraction, communication & friendship, and growth & repair stay separate so one loud signal cannot impersonate the whole relationship.
                </p>
              </section>
            ) : null}

            {loading ? (
              <FeatureState kind="loading" title="Building comparison" description="Calculating only the layers supported by the current Foundation model." />
            ) : null}

            {error ? (
              <FeatureState
                kind="error"
                title="Compatibility is unavailable"
                description={error}
                actionLabel="Retry comparison"
                onAction={() => void runComparison()}
              />
            ) : null}

            {result && !result.available && !error ? (
              <FeatureState
                kind="empty"
                title="This comparison cannot be supported yet"
                description={result.reason || "Required evidence is unavailable, so Soul Codex is leaving the result unresolved."}
              />
            ) : null}

            {result?.available && dimensionScores && !error ? (
              <>
                <section className="sc-panel sc-panel-gold p-6">
                  <div className="sc-eyebrow">Symbolic comparison</div>
                  <h2 className="mt-3 font-serif text-3xl font-semibold">{result.person.name} · {result.person.sunSign}</h2>
                  {result.evidenceLabel ? <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{result.evidenceLabel}</p> : null}
                </section>

                <section className="grid gap-3 sm:grid-cols-2" aria-label="Compatibility dimensions">
                  {DIMENSIONS.map((dimension) => (
                    <article className="sc-panel min-w-0 p-5" key={dimension.key}>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="m-0 font-serif text-lg font-semibold">{dimension.label}</h3>
                        <span className="rounded-full border border-[rgba(217,182,111,.22)] px-2.5 py-1 text-sm font-semibold text-[var(--sc-gold-bright)]" aria-label={`${dimension.label} symbolic model score ${dimensionScores[dimension.key]}`}>
                          {dimensionScores[dimension.key]}
                        </span>
                      </div>
                      <p className="mb-0 mt-3 text-sm leading-6 text-[var(--sc-stone)]">{dimension.detail}</p>
                    </article>
                  ))}
                </section>

                {result.interpretation ? (
                  <section className="sc-panel p-6">
                    <div className="sc-eyebrow">Pattern to inspect</div>
                    <h2 className="mt-3 font-serif text-3xl font-semibold">{result.interpretation.headline}</h2>
                    <p className="mt-4 leading-7 text-[var(--sc-stone)]">{result.interpretation.why}</p>
                    {result.interpretation.tension ? (
                      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <strong className="text-amber-400">Watch point</strong>
                        <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">{result.interpretation.tension}</p>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <EvidenceLimitations
                  evidenceLabel={result.evidenceLabel}
                  layers={result.formula?.layers ?? []}
                  excludedLayers={result.excludedLayers ?? []}
                />
              </>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
