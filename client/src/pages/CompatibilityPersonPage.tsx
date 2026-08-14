import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
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
  { key: "romantic", label: "Romantic", detail: "Bonding, trust, steadiness, and long-range relationship flow." },
  { key: "chemistry", label: "Chemistry", detail: "Attraction, polarity, intensity, and symbolic magnetism." },
  { key: "mentalFriendship", label: "Mental & friendship", detail: "Conversation, ease, curiosity, and day-to-day rapport." },
  { key: "growth", label: "Growth", detail: "Where friction may stretch both people or expose a recurring lesson." },
] as const;

function profileName(profile: any) {
  return profile?.name || profile?.firstName || profile?.codename || "Your saved profile";
}

export default function CompatibilityPersonPage() {
  const profile = useMemo(() => loadActiveProfile().profile ?? null, []);
  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
  const [name, setName] = useState("");
  const [sunSign, setSunSign] = useState("");
  const [result, setResult] = useState<PersonComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const payload = await response.json();
      setResult(payload);
      if (!response.ok && response.status !== 422) {
        setError(payload?.message || "This comparison could not be generated.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This comparison could not be generated.");
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="mx-auto max-w-3xl px-4 pb-20 pt-28">
          <section className="rounded-3xl border bg-card p-8 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-5 text-3xl font-bold">Save your identity first</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Specific-person compatibility reuses your saved Soul Profile. You should not have to re-enter your own birth data every time you compare someone.
            </p>
            <Link href="/create" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
              Create your Soul Profile
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-28">
        <Link href="/compatibility" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to Compatibility
        </Link>

        <header className="mt-7 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Specific person</p>
          <h1 className="mt-3 text-4xl font-bold md:text-6xl">Compare one person without rebuilding yourself.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            {profileName(profile)} stays loaded. Enter only the other person's details. This Foundation comparison uses a bounded Sun-sign model plus your deterministic Life Path when available, and it refuses to invent missing synastry layers.
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The request sends only the saved Sun evidence and Life Path needed by this model. Your name, birth date, birth location, biography, Moon, Rising, and Human Design are not included in the compatibility payload.
          </p>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <form onSubmit={submit} className="rounded-3xl border bg-card p-6" aria-label="Compare one person">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other person only</p>
                <h2 className="text-xl font-semibold">Who are you comparing?</h2>
              </div>
            </div>

            <label className="mt-6 block text-sm font-semibold" htmlFor="compatibility-person-name">Name</label>
            <input
              id="compatibility-person-name"
              data-testid="compatibility-person-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              placeholder="Their name"
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

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Their Sun sign is treated as user-supplied symbolic data. It is not relabeled as independently verified astronomy.
            </p>

            <button
              type="submit"
              data-testid="compatibility-person-submit"
              disabled={loading || !sunSign}
              className="mt-6 min-h-11 w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Comparing supported layers…" : "Build comparison"}
            </button>
          </form>

          <div className="min-w-0 space-y-5" aria-live="polite">
            {!result && !loading && !error && (
              <section className="rounded-3xl border border-dashed bg-card/40 p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What you will get</p>
                <h2 className="mt-2 text-2xl font-semibold">Four dimensions, not one verdict.</h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Romantic flow, chemistry, mental/friendship ease, and growth pressure stay separate so one loud signal cannot impersonate the whole relationship.
                </p>
              </section>
            )}

            {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</p>}

            {result && !result.available && (
              <section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Comparison unavailable</p>
                <h2 className="mt-2 text-2xl font-semibold">This layer remains visible instead of guessing.</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{result.reason}</p>
              </section>
            )}

            {result?.available && result.dimensions && (
              <>
                <section className="rounded-3xl border border-violet-400/25 bg-violet-400/5 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Symbolic comparison</p>
                  <h2 className="mt-2 text-2xl font-semibold">{result.person.name} · {result.person.sunSign}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.evidenceLabel}</p>
                </section>

                <section className="grid gap-3 sm:grid-cols-2" aria-label="Compatibility dimensions">
                  {DIMENSIONS.map((dimension) => (
                    <article className="min-w-0 rounded-2xl border bg-card p-5" key={dimension.key}>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold">{dimension.label}</h3>
                        <span className="rounded-full border px-2.5 py-1 text-sm font-semibold text-primary" aria-label={`${dimension.label} symbolic model score ${result.dimensions?.[dimension.key]}`}>{result.dimensions[dimension.key]}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{dimension.detail}</p>
                    </article>
                  ))}
                </section>

                {result.interpretation && (
                  <section className="rounded-3xl border bg-card p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pattern to inspect</p>
                    <h2 className="mt-2 text-2xl font-semibold">{result.interpretation.headline}</h2>
                    <p className="mt-4 leading-7 text-muted-foreground">{result.interpretation.why}</p>
                    {result.interpretation.tension && (
                      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <strong className="text-amber-500">Watch point</strong>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.interpretation.tension}</p>
                      </div>
                    )}
                  </section>
                )}

                <details className="rounded-3xl border bg-card p-6">
                  <summary className="cursor-pointer font-semibold">Evidence, limits, and excluded layers</summary>
                  <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
                    <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                    <p className="leading-6 text-muted-foreground">
                      These numbers are product-level symbolic scores, not measured relationship probabilities. Your lived experience can confirm, refine, or reject the interpretation.
                    </p>
                  </div>
                  {result.formula?.layers?.length ? (
                    <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                      {result.formula.layers.map((layer) => <li key={layer}>• {layer}</li>)}
                    </ul>
                  ) : null}
                  {result.excludedLayers?.length ? (
                    <div className="mt-5">
                      <p className="text-sm font-semibold">Excluded rather than guessed</p>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {result.excludedLayers.map((layer) => <li key={layer}>• {layer}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </details>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
