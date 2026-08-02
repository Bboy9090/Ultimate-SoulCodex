import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import { getVerifiedPlacement, placementDisplayStatus } from "../lib/placementVerification";

type Mode = "love" | "attraction" | "friendship" | "growth";

type Match = {
  sign: { name: string; element: string };
  score: number;
  scores: Record<Mode, number>;
  headline: string;
  why: string;
  tension?: string;
};

type Result = {
  available: boolean;
  reason?: string;
  all: Match[];
  best: Match[];
  challenging: Match[];
  picks?: Record<string, Match | null>;
  unresolved?: { astrology?: string[]; humanDesign?: string[] };
  formula?: { layers?: string[]; inputs?: Record<string, unknown> };
};

const MODES: Array<{ key: Mode; label: string; description: string }> = [
  { key: "love", label: "Life Partner", description: "Emotional fit, trust, commitment, and long-term stability." },
  { key: "attraction", label: "Sexual Chemistry", description: "Physical magnetism, desire, intensity, and energetic pull." },
  { key: "friendship", label: "Intellectual Match", description: "Conversation, humor, mental ease, trust, and friendship." },
  { key: "growth", label: "Growth Potential", description: "The connection most likely to expose patterns and develop maturity." },
];

function profileName(profile: any): string {
  return profile?.name || profile?.firstName || profile?.codename || "Your";
}

function placementCandidate(profile: any, key: "sun" | "moon" | "rising") {
  return profile?.astrologyData?.[key] ?? profile?.astrology?.[key] ?? profile?.natalChart?.[key] ?? profile?.chart?.[key];
}

function matchScore(match: Match, mode: Mode) {
  return match.scores?.[mode] ?? match.score ?? 0;
}

export default function CompatibilityExplorerPage() {
  const [profile, setProfile] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("love");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loaded = loadActiveProfile();
    setProfile(loaded.profile ?? null);
    if (!loaded.profile) setLoading(false);
  }, []);

  const verifiedSun = useMemo(() => getVerifiedPlacement(placementCandidate(profile, "sun")), [profile]);
  const sunStatus = placementDisplayStatus(placementCandidate(profile, "sun"));

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/compatibility/archetype-matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ profile, mode }),
        });
        const payload = await response.json();
        if (!cancelled) {
          setResult(payload);
          if (!response.ok && response.status !== 422) setError(payload?.message || "Compatibility could not be generated.");
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Compatibility could not be generated.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [profile, mode]);

  const ranked = useMemo(
    () => [...(result?.all ?? [])].sort((a, b) => matchScore(b, mode) - matchScore(a, mode)),
    [result, mode]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Relationship Intelligence</p>
          <h1 className="mt-3 text-4xl font-bold md:text-6xl">{profileName(profile)} Compatibility Map</h1>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
            Your saved Soul Profile is reused here. No second onboarding, no repeated birthday form, and no placement is treated as fact without verification evidence.
          </p>
        </header>

        {!profile && (
          <section className="rounded-2xl border bg-card p-6 text-center">
            <h2 className="text-xl font-semibold">Create your Soul Profile once</h2>
            <p className="mt-2 text-muted-foreground">Compatibility will automatically use it across every relationship layer.</p>
            <a href="/create" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">Create profile</a>
          </section>
        )}

        {profile && !verifiedSun && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Interpretation paused</p>
            <h2 className="mt-2 text-2xl font-semibold">Verified Sun placement required</h2>
            <p className="mt-3 text-muted-foreground">
              Current status: <strong>{sunStatus}</strong>. Your saved profile remains active, but the sign-ranking engine will not convert a legacy or approximate sign into relationship advice.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Numerology and other supported layers remain preserved for the future multi-system compatibility engine.</p>
          </section>
        )}

        {profile && (
          <section className="mt-8 grid gap-3 md:grid-cols-4">
            {MODES.map((item) => (
              <button
                key={item.key}
                onClick={() => setMode(item.key)}
                className={`rounded-2xl border p-4 text-left transition ${mode === item.key ? "border-primary bg-primary/10" : "bg-card hover:border-primary/40"}`}
              >
                <strong>{item.label}</strong>
                <span className="mt-2 block text-sm text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </section>
        )}

        {loading && profile && <p className="mt-8 text-center text-muted-foreground">Building the evidence-cleared compatibility map…</p>}
        {error && <p className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive">{error}</p>}

        {result?.available && !loading && (
          <>
            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Best natural matches</p>
                  <h2 className="mt-1 text-3xl font-bold">{MODES.find((item) => item.key === mode)?.label}</h2>
                </div>
                <span className="text-sm text-muted-foreground">Ranked across all 12 signs</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {ranked.slice(0, 4).map((match, index) => (
                  <article key={match.sign.name} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <h3 className="text-2xl font-semibold">{match.sign.name}</h3>
                      </div>
                      <strong className="text-2xl text-primary">{matchScore(match, mode)}</strong>
                    </div>
                    <p className="mt-4 font-medium">{match.headline}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{match.why}</p>
                    {match.tension && <p className="mt-4 rounded-lg bg-muted p-3 text-sm"><strong>Watch point:</strong> {match.tension}</p>}
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-2xl border bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Hardest matches</p>
              <h2 className="mt-2 text-2xl font-bold">Highest friction and strongest lessons</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(result.challenging ?? []).map((match) => (
                  <article key={match.sign.name} className="rounded-xl border p-4">
                    <div className="flex justify-between gap-3"><strong>{match.sign.name}</strong><span>{matchScore(match, mode)}</span></div>
                    <p className="mt-3 text-sm text-muted-foreground">{match.tension || match.why}</p>
                  </article>
                ))}
              </div>
            </section>

            <details className="mt-8 rounded-2xl border bg-card p-5">
              <summary className="cursor-pointer font-semibold">Why the app reached these conclusions</summary>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(result.formula?.layers ?? []).map((layer) => <li key={layer}>• {layer}</li>)}
              </ul>
              {(result.unresolved?.astrology?.length || result.unresolved?.humanDesign?.length) ? (
                <p className="mt-4 text-sm text-amber-600">Unresolved layers were excluded rather than guessed.</p>
              ) : null}
            </details>
          </>
        )}
      </main>
    </div>
  );
}
