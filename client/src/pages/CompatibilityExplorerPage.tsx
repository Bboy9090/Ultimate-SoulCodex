import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import { getVerifiedPlacement, placementDisplayStatus } from "../lib/placementVerification";
import { apiFetch } from "../lib/queryClient";

type Mode = "love" | "attraction" | "friendship" | "growth";
type EvidenceMode = "verified" | "symbolic" | "unavailable";

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
  evidenceMode?: EvidenceMode;
  evidenceLabel?: string;
  reason?: string;
  all: Match[];
  best: Match[];
  challenging: Match[];
  picks?: Record<string, Match | null>;
  unresolved?: { astrology?: string[]; humanDesign?: string[] };
  excludedLayers?: string[];
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

function EvidenceState({
  profile,
  result,
  loading,
  sunStatus,
}: {
  profile: any;
  result: Result | null;
  loading: boolean;
  sunStatus: string;
}) {
  if (loading && !result) {
    return (
      <section className="rounded-2xl border border-white/10 bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence mode</p>
        <h2 className="mt-2 text-xl font-semibold">Checking what this profile can support…</h2>
        <p className="mt-2 text-sm text-muted-foreground">Verified inputs are preferred. Supported symbolic inputs can remain useful without being relabeled as verified facts.</p>
      </section>
    );
  }

  if (result?.evidenceMode === "verified") {
    return (
      <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Verified input · symbolic model</p>
        <h2 className="mt-2 text-xl font-semibold">The Sun placement passed the independent evidence contract.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The birth input is verified; the compatibility interpretation remains a symbolic relationship model, not a prediction or scientific relationship assessment.</p>
      </section>
    );
  }

  if (result?.evidenceMode === "symbolic") {
    return (
      <section className="rounded-2xl border border-violet-400/25 bg-violet-400/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Symbolic compatibility</p>
        <h2 className="mt-2 text-xl font-semibold">Useful as reflection, lower certainty by design.</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The saved Sun sign is being used as a traditional symbolic input while independent verification is incomplete. Current Sun verification status: <strong>{sunStatus}</strong>. Unverified Moon, Rising, houses, and Human Design layers stay out of the score instead of being guessed.
        </p>
        <a href={profile.id ? `/profile/${profile.id}` : "/create"} className="mt-4 inline-flex rounded-lg border border-violet-400/30 px-4 py-2 text-sm font-semibold text-violet-200">
          Review or refresh identity evidence
        </a>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Compatibility unavailable</p>
      <h2 className="mt-2 text-xl font-semibold">A usable Sun input is still missing.</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Current Sun verification status: <strong>{sunStatus}</strong>. Soul Codex will not manufacture a placement to produce a result. Open Identity while online to refresh the saved birth data, or keep using the parts of the Codex that do not depend on this layer.
      </p>
      <a href={profile.id ? `/profile/${profile.id}` : "/create"} className="mt-4 inline-flex rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-semibold text-amber-500">
        Review identity evidence
      </a>
    </section>
  );
}

export default function CompatibilityExplorerPage() {
  const [profile, setProfile] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("love");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshProfile = () => {
      const loaded = loadActiveProfile();
      setProfile(loaded.profile ?? null);
      if (!loaded.profile) setLoading(false);
    };

    refreshProfile();
    window.addEventListener("soulcodex:profile-updated", refreshProfile);
    window.addEventListener("storage", refreshProfile);
    return () => {
      window.removeEventListener("soulcodex:profile-updated", refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
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
        const response = await apiFetch("/api/compatibility/archetype-matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        {profile && <EvidenceState profile={profile} result={result} loading={loading} sunStatus={verifiedSun ? "Verified" : sunStatus} />}

        {profile && (
          <section className="mt-8 grid gap-3 md:grid-cols-4">
            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
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
              {result.evidenceLabel && <p className="mt-4 text-sm font-medium text-foreground/80">Evidence mode: {result.evidenceLabel}</p>}
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(result.formula?.layers ?? []).map((layer) => <li key={layer}>• {layer}</li>)}
              </ul>
              {result.excludedLayers?.length ? (
                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm font-semibold text-amber-500">Excluded rather than guessed</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {result.excludedLayers.map((layer) => <li key={layer}>• {layer}</li>)}
                  </ul>
                </div>
              ) : null}
            </details>
          </>
        )}
      </main>
    </div>
  );
}
