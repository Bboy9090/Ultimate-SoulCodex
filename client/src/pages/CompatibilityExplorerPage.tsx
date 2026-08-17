import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import Navigation from "../components/navigation";
import EvidenceLimitations from "../components/EvidenceLimitations";
import FeatureState from "../components/FeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { buildCompatibilityProfilePayload } from "../lib/compatibilityProfilePayload";
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
  { key: "love", label: "Romantic connection", description: "Partnership themes, emotional fit, trust, steadiness, and symbolic relationship flow." },
  { key: "attraction", label: "Chemistry & attraction", description: "Symbolic magnetism, activation, intensity, and attraction." },
  { key: "friendship", label: "Communication & friendship", description: "Conversation, mental rhythm, social ease, curiosity, and day-to-day rapport." },
  { key: "growth", label: "Growth & repair", description: "Friction, adaptation, recurring lessons, boundaries, and repair pressure." },
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

function apiErrorMessage(status: number, payload: any) {
  if (status === 404 || status === 410) {
    return "Compatibility API contract mismatch. This app is connected to a backend that does not expose the required Compatibility route.";
  }
  if (status >= 500) return "Compatibility is temporarily unavailable on the server.";
  return payload?.message || "Compatibility could not be generated.";
}

function EvidenceState({ result, sunStatus }: { result: Result | null; sunStatus: string }) {
  if (result?.evidenceMode === "verified") {
    return (
      <section className="sc-panel border-[rgba(114,216,197,.22)] p-5">
        <div className="sc-eyebrow text-[var(--sc-teal)]">Verified input · symbolic model</div>
        <h2 className="mt-3 font-serif text-2xl font-semibold">The saved Sun placement passed the evidence contract.</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">The input is verified astronomy; the Compatibility interpretation remains symbolic relationship reflection.</p>
      </section>
    );
  }

  if (result?.evidenceMode === "symbolic") {
    return (
      <section className="sc-panel border-[rgba(154,116,220,.25)] p-5">
        <div className="sc-eyebrow text-[var(--sc-violet)]">Symbolic input</div>
        <h2 className="mt-3 font-serif text-2xl font-semibold">Reflection is available at lower evidence coverage.</h2>
        <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">Saved Sun status: <strong className="text-[var(--sc-ivory-soft)]">{sunStatus}</strong>. Moon, Rising, houses, and Human Design stay out of this formula rather than being guessed.</p>
      </section>
    );
  }

  return (
    <section className="sc-panel border-amber-500/25 p-5">
      <div className="sc-eyebrow text-amber-400">Compatibility unavailable</div>
      <h2 className="mt-3 font-serif text-2xl font-semibold">A usable Sun input is still missing.</h2>
      <p className="mb-0 mt-2 text-sm leading-6 text-[var(--sc-stone)]">Current Sun status: <strong>{sunStatus}</strong>. Soul Codex leaves this unresolved instead of manufacturing a placement.</p>
    </section>
  );
}

export default function CompatibilityExplorerPage() {
  const { profile, isLoading: profileLoading, isCorrupted, reason: profileError } = useActiveProfile();
  const [mode, setMode] = useState<Mode>("love");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestRevision, setRequestRevision] = useState(0);

  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
  const verifiedSun = useMemo(() => getVerifiedPlacement(placementCandidate(profile, "sun")), [profile]);
  const sunStatus = placementDisplayStatus(placementCandidate(profile, "sun"));

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      setResult(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch("/api/compatibility/archetype-matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: compatibilityProfile, mode }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!cancelled) {
          setResult(payload);
          if (!response.ok && response.status !== 422) {
            setError(apiErrorMessage(response.status, payload));
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof TypeError
              ? "Compatibility could not reach the server. Check your connection and try again."
              : cause instanceof Error
                ? cause.message
                : "Compatibility could not be generated.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [profile, compatibilityProfile, mode, requestRevision]);

  const ranked = useMemo(
    () => [...(result?.all ?? [])].sort((a, b) => matchScore(b, mode) - matchScore(a, mode)),
    [result, mode],
  );

  if (profileLoading) {
    return (
      <div className="sc-app-shell">
        <Navigation />
        <main className="sc-page"><FeatureState kind="loading" title="Loading Identity" description="Opening the saved profile used by Compatibility." /></main>
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

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page max-w-7xl">
        <header className="mx-auto mb-8 max-w-4xl text-center">
          <div className="sc-eyebrow">Relationship intelligence</div>
          <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5.5rem)] font-medium leading-[.97] tracking-[-.04em] text-[var(--sc-ivory)]">{profileName(profile)} Compatibility map</h1>
          <p className="sc-lede mx-auto mt-5 max-w-3xl">
            Compare the active Identity with all twelve Sun-sign archetypes across four bounded symbolic dimensions.
          </p>
          {profile ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
              The request sends only supported Sun evidence and deterministic Life Path. Name, raw birth date, birth location, biography, Moon, Rising, and Human Design stay out of this request.
            </p>
          ) : null}
        </header>

        {!profile ? (
          <section className="sc-panel sc-panel-gold mx-auto max-w-3xl p-7 text-center">
            <h2 className="font-serif text-3xl font-semibold">Create one profile first</h2>
            <p className="mt-3 text-[var(--sc-stone)]">Compatibility reuses the same Identity as the rest of Soul Codex.</p>
            <Link href="/create" className="sc-button-primary mt-5">Create profile</Link>
          </section>
        ) : null}

        {profile && !loading && !error ? <EvidenceState result={result} sunStatus={verifiedSun ? "Verified" : sunStatus} /> : null}

        {profile ? (
          <section className="mt-6 grid gap-3 md:grid-cols-4" aria-label="Compatibility dimensions">
            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                aria-pressed={mode === item.key}
                className={`sc-panel p-4 text-left transition ${mode === item.key ? "border-[rgba(217,182,111,.32)] bg-[rgba(217,182,111,.07)]" : "hover:border-[rgba(217,182,111,.22)]"}`}
              >
                <strong className="font-serif text-lg text-[var(--sc-ivory)]">{item.label}</strong>
                <span className="mt-2 block text-sm leading-5 text-[var(--sc-stone)]">{item.description}</span>
              </button>
            ))}
          </section>
        ) : null}

        {loading && profile ? (
          <FeatureState className="mt-6" kind="loading" title="Building Compatibility map" description="Calculating the selected symbolic dimension from supported inputs only." />
        ) : null}

        {error ? (
          <FeatureState
            className="mt-6"
            kind="error"
            title="Compatibility is unavailable"
            description={error}
            actionLabel="Retry"
            onAction={() => setRequestRevision((value) => value + 1)}
          />
        ) : null}

        {result && !result.available && !loading && !error ? (
          <FeatureState
            className="mt-6"
            kind="empty"
            title="This Compatibility layer cannot be supported yet"
            description={result.reason || "Required evidence is unavailable, so Soul Codex is leaving the result unresolved."}
          />
        ) : null}

        {result?.available && !loading && !error ? (
          <>
            <section className="mt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="sc-eyebrow">Highest symbolic fit</div>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">{MODES.find((item) => item.key === mode)?.label}</h2>
                </div>
                <span className="text-sm text-[var(--sc-stone)]">Internal symbolic ranking · not relationship probability</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {ranked.slice(0, 4).map((match, index) => (
                  <article key={match.sign.name} className="sc-panel p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-[var(--sc-stone)]">#{index + 1}</span>
                        <h3 className="m-0 mt-1 font-serif text-2xl font-semibold">{match.sign.name}</h3>
                      </div>
                      <span className="text-right">
                        <strong className="block text-2xl text-[var(--sc-gold-bright)]" aria-label={`${match.sign.name} symbolic model score ${matchScore(match, mode)}`}>{matchScore(match, mode)}</strong>
                        <small className="text-[10px] uppercase tracking-wider text-[var(--sc-stone)]">symbolic score</small>
                      </span>
                    </div>
                    <p className="mt-4 font-medium">{match.headline}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{match.why}</p>
                    {match.tension ? <p className="mt-4 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 text-sm"><strong>Watch point:</strong> {match.tension}</p> : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="sc-panel mt-8 p-6">
              <div className="sc-eyebrow">Highest symbolic friction</div>
              <h2 className="mt-2 font-serif text-3xl font-semibold">Where the model expects more adjustment</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {(result.challenging ?? []).map((match) => (
                  <article key={match.sign.name} className="rounded-xl border border-white/[0.07] p-4">
                    <div className="flex justify-between gap-3"><strong>{match.sign.name}</strong><span aria-label={`${match.sign.name} symbolic friction score ${matchScore(match, mode)}`}>{matchScore(match, mode)}</span></div>
                    <p className="mb-0 mt-3 text-sm text-[var(--sc-stone)]">{match.tension || match.why}</p>
                  </article>
                ))}
              </div>
            </section>

            <EvidenceLimitations
              className="mt-6"
              evidenceLabel={result.evidenceLabel}
              layers={result.formula?.layers ?? []}
              excludedLayers={result.excludedLayers ?? []}
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
