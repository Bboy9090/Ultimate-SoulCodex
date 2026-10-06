import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, HeartHandshake, Sparkles } from "lucide-react";
import Navigation from "../components/navigation";
import EvidenceLimitations from "../components/EvidenceLimitations";
import FeatureState from "../components/FeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";
import { buildCompatibilityProfilePayload } from "../lib/compatibilityProfilePayload";
import { connectionComparableSunSign, findConnectionById, loadConnections, placementLabel } from "../lib/connectionRepository";
import { personalAtlasPlacements } from "../lib/personalAstrologyAtlas";
import { personalPlacementMeaning, type AtlasSign } from "../lib/astrologyAtlas";
import { compareFriendCharts } from "../lib/friendChartCompatibility";
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

function symbolicBand(score: number): string {
  if (score >= 80) return "strong resonance";
  if (score >= 65) return "supportive resonance";
  if (score >= 50) return "mixed resonance";
  return "more adjustment";
}

function dimensionPunchline(
  key: (typeof DIMENSIONS)[number]["key"],
  score: number,
): string {
  const strong = score >= 80;
  const supportive = score >= 65;
  const mixed = score >= 50;
  const copy = {
    romantic: strong
      ? "This connection wants steadiness, trust, and room to deepen."
      : supportive
        ? "There is relationship potential here, but consistency matters."
        : mixed
          ? "The bond can work, but emotional rhythm may need negotiation."
          : "This pairing may ask for more adjustment than ease.",
    chemistry: strong
      ? "The pull is immediate. The question is whether intensity can stay grounded."
      : supportive
        ? "There is noticeable attraction without needing constant friction."
        : mixed
          ? "Chemistry may come in waves instead of staying constant."
          : "Attraction may need context, timing, or shared experience to build.",
    mentalFriendship: strong
      ? "Conversation can move fast here without losing the thread."
      : supportive
        ? "You can usually find common ground if both people stay curious."
        : mixed
          ? "Communication may click in some areas and miss in others."
          : "Different mental rhythms may require more translation than usual.",
    growth: strong
      ? "This connection can challenge both people without automatically destabilizing them."
      : supportive
        ? "There is useful friction here if repair stays mutual."
        : mixed
          ? "Growth is possible, but recurring pressure points may need explicit repair."
          : "This pairing may expose hard lessons faster than either person prefers.",
  } as const;
  return copy[key];
}

function placementComparisonLine(
  yours: { sign: AtlasSign; house?: number },
  theirs: { sign: AtlasSign; house: number },
): { label: string; text: string } {
  if (yours.sign === theirs.sign && yours.house === theirs.house) {
    return {
      label: "Instant familiarity",
      text: "Same style, same life area. This part of the connection may feel obvious before either person explains it.",
    };
  }
  if (yours.sign === theirs.sign) {
    return {
      label: "Same language, different stage",
      text: "You approach this planet in a similar style, but it gets activated in different parts of life.",
    };
  }
  if (yours.house === theirs.house) {
    return {
      label: "Same arena, different moves",
      text: "The same life area matters to both of you, but your instincts for handling it can be noticeably different.",
    };
  }
  return {
    label: "Contrast",
    text: "Different style, different arena. This can create fascination, confusion, or useful perspective depending on the moment.",
  };
}

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
  const initial = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const initialConnection = findConnectionById(loadConnections(), initial.get("connection"));
  const [name, setName] = useState(() => initialConnection?.name ?? "");
  const [sunSign, setSunSign] = useState(() => initialConnection ? connectionComparableSunSign(initialConnection) ?? "" : "");
  const [result, setResult] = useState<PersonComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dimensionScores = result?.dimensions ?? null;

  const yourPlacements = useMemo(
    () => personalAtlasPlacements((((profile as any)?.verifiedAstrologyData ?? profile?.astrologyData) ?? {}) as any),
    [profile],
  );
  const friendPlacements = initialConnection?.placements ?? [];
  const placementComparisons = yourPlacements
    .filter((placement) => placement.kind !== "angle" && placement.house)
    .flatMap((placement) => {
      const friend = friendPlacements.find((row) => row.key === placement.key);
      return friend ? [{ yours: placement, theirs: friend }] : [];
    });
  const friendChartComparison = compareFriendCharts(
    yourPlacements.filter((placement) => placement.kind !== "angle").map(({ key, sign, house }) => ({ key, sign, house })),
    friendPlacements,
  );

  const placementSignalCounts = placementComparisons.reduce<Record<string, number>>((counts, { yours, theirs }) => {
    const label = placementComparisonLine(yours, theirs).label;
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {});

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
            Two charts. Four relationship lenses. Your connection, in context.
          </h1>
          <p className="sc-lede mt-5">
            {profileName(profile)} stays loaded. Chart scores below use every planet, Node, and Chiron placement actually shared by both charts. The optional Sun-sign foundation adds four broad relationship lenses; it does not replace the full chart comparison. Aureon keeps the read grounded in what you both actually shared.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
            Your name, birth date, birth location, biography, Moon, Rising, and Human Design are not included in this Compatibility request.
          </p>
        </header>

        {initialConnection && friendPlacements.length > 0 ? (
          <section className="mt-8 sc-panel sc-panel-gold p-5 sm:p-6" data-testid="friend-placement-comparison">
            <div className="mb-5">
              <p className="sc-eyebrow">Aureon · Chart-to-chart</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">{profileName(profile)} + {initialConnection.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--sc-stone)]">
                Aureon’s read, chart to chart: see where your styles line up, where you move through different life areas, and what each placement brings. A planet points to what’s active; its sign gives the style; its house shows where it plays out. This uses only chart facts saved for both of you. Missing placements stay missing.
              </p>
            </div>

            {placementComparisons.length ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2" data-testid="friend-placement-snapshot">
                  <div className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Shared chart resonance</p>
                    <p className="mt-2 font-serif text-3xl text-[var(--sc-gold-bright)]">{friendChartComparison.overallScore === null ? "—" : `${friendChartComparison.overallScore}/100`}</p>
                    <p className="mt-1 text-xs text-[var(--sc-stone)]">{friendChartComparison.overallCoverage.matched} of {friendChartComparison.overallCoverage.available} chart placements overlap</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">Average of every matching saved planet, Node, or Chiron sign pattern, with a small same-house bonus. Symbolic reflection, not a relationship forecast.</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] p-4" data-testid="friendship-chart-score">
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Friendship resonance</p>
                    <p className="mt-2 font-serif text-3xl text-[var(--sc-gold-bright)]">{friendChartComparison.friendshipScore === null ? "—" : `${friendChartComparison.friendshipScore}/100`}</p>
                    <p className="mt-1 text-xs text-[var(--sc-stone)]">{friendChartComparison.friendshipCoverage.matched} of 4 friendship placements have matching saved data</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">Moon · emotional rhythm; Mercury · communication; Venus · affection and values; Jupiter · mutual growth. Only shared, saved placements count.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {friendChartComparison.friendshipMatches.map((match) => <span key={match.key} className="rounded-full border border-[var(--sc-line)] px-2.5 py-1 text-xs text-[var(--sc-ivory-soft)]">{placementLabel(match.key as Parameters<typeof placementLabel>[0])} · {match.score}/100</span>)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-stone)]">Connection pattern</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(placementSignalCounts).map(([label, count]) => (
                      <span key={label} className="rounded-full border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.035)] px-3 py-1.5 text-xs font-semibold text-[var(--sc-gold-bright)]">
                        {label} · {count}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">
                    Counts describe only the planet/sign/house rows present on both charts. They are not compatibility percentages or relationship predictions.
                  </p>
                </div>
                <p className="text-xs leading-5 text-[var(--sc-stone)]">Scoring key: same sign = 100; same element = 78; same mode = 65; other sign pattern = 48; same house adds 8 points (maximum 100). Scores average only the placements both people shared. Exact degree-based planetary aspects are not available in this privacy-limited chart share.</p>
                {placementComparisons.map(({ yours, theirs }) => {
                  const yourMeaning = personalPlacementMeaning(yours.key, yours.sign, yours.house!);
                  const theirMeaning = personalPlacementMeaning(theirs.key, theirs.sign, theirs.house);
                  const comparison = placementComparisonLine(yours, theirs);
                  const chartMatch = friendChartComparison.matches.find((match) => match.key === yours.key);
                  return (
                    <article key={yours.key} className="rounded-2xl border border-[var(--sc-line)] bg-black/10 p-4" data-testid={`friend-placement-${yours.key}`}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-serif text-xl text-[var(--sc-ivory)]">{placementLabel(theirs.key)}</h3>
                        <span className="rounded-full border border-[var(--sc-line-gold)] px-3 py-1 text-xs font-semibold text-[var(--sc-gold-bright)]">
                          {chartMatch ? `${chartMatch.score}/100 · ` : ""}{comparison.label}
                        </span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-[rgba(217,182,111,.18)] bg-[rgba(217,182,111,.035)] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-gold)]">You</p>
                          <h4 className="mt-1 font-serif text-lg">{yours.sign} · House {yours.house}</h4>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sc-gold)]">{yourMeaning.feedLabel}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--sc-ivory-soft)]">{yourMeaning.headline}</p>
                        </div>
                        <div className="rounded-xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.035)] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--sc-teal)]">{initialConnection.name}</p>
                          <h4 className="mt-1 font-serif text-lg">{theirs.sign} · House {theirs.house}</h4>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sc-teal)]">{theirMeaning.feedLabel}</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--sc-ivory-soft)]">{theirMeaning.headline}</p>
                        </div>
                      </div>
                      <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm leading-6 text-[var(--sc-stone)]">{comparison.text}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[var(--sc-stone)]">
                This friend has saved placements, but none overlap with your currently verified planet-and-house placements. Soul Codex will not invent the missing side just to fill the comparison.
              </p>
            )}
          </section>
        ) : null}

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
                  <div className="sc-eyebrow">Aureon · Sun-sign foundation</div>
                  <h2 className="mt-3 font-serif text-3xl font-semibold">{result.person.name} · {result.person.sunSign}</h2>
                  {result.evidenceLabel ? <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">{result.evidenceLabel}</p> : null}
                  <p className="mt-3 text-xs leading-5 text-[var(--sc-stone)]">These four 0–100 scores are the Sun-sign foundation. The shared chart resonance and friendship scores above use every matching saved placement and show their data coverage separately.</p>
                </section>

                <section className="grid gap-3 sm:grid-cols-2" aria-label="Compatibility dimensions">
                  {DIMENSIONS.map((dimension) => (
                    <article className="sc-panel min-w-0 p-5" key={dimension.key}>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="m-0 font-serif text-lg font-semibold">{dimension.label}</h3>
                        <span className="rounded-full border border-[rgba(217,182,111,.22)] px-2.5 py-1 text-sm font-semibold text-[var(--sc-gold-bright)]" aria-label={`${dimension.label} symbolic score ${dimensionScores[dimension.key]} out of 100, ${symbolicBand(dimensionScores[dimension.key])}`}>
                          {dimensionScores[dimension.key]}/100 · {symbolicBand(dimensionScores[dimension.key])}
                        </span>
                      </div>
                      <p className="mb-0 mt-3 text-base leading-7 text-[var(--sc-ivory-soft)]">{dimensionPunchline(dimension.key, dimensionScores[dimension.key])}</p>
                      <p className="mb-0 mt-2 text-xs leading-5 text-[var(--sc-stone)]">{dimension.detail}</p>
                    </article>
                  ))}
                </section>

                <details className="sc-panel p-5">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--sc-ivory)]">Inspect exact symbolic model values</summary>
                  <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">
                    These values only order this symbolic model. They are not percentages, probabilities, or measured relationship outcomes.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {DIMENSIONS.map((dimension) => (
                      <div key={`inspect-${dimension.key}`} className="flex items-center justify-between rounded-lg border border-white/[0.07] px-3 py-2 text-sm">
                        <span>{dimension.label}</span>
                        <span className="font-mono text-[var(--sc-stone)]">{dimensionScores[dimension.key]}</span>
                      </div>
                    ))}
                  </div>
                </details>

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
