import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "../components/navigation";
import { loadActiveProfile } from "../lib/ActiveProfileRepository";
import { buildCompatibilityProfilePayload } from "../lib/compatibilityProfilePayload";
import { getVerifiedPlacement, placementDisplayStatus } from "../lib/placementVerification";
import { apiFetch } from "../lib/queryClient";
import { pureText } from "../lib/sanitizer";
import {
  IconAlert,
  IconCircle,
  IconDecisions,
  IconGrowth,
  IconHeart,
  IconIdentity,
  IconSparkles,
  IconZodiacAquarius,
  IconZodiacAries,
  IconZodiacCancer,
  IconZodiacCapricorn,
  IconZodiacGemini,
  IconZodiacLeo,
  IconZodiacLibra,
  IconZodiacPisces,
  IconZodiacSagittarius,
  IconZodiacScorpio,
  IconZodiacTaurus,
  IconZodiacVirgo,
} from "../components/Icons";

type Mode = "love" | "attraction" | "friendship" | "growth";
type EvidenceMode = "verified" | "symbolic" | "unavailable";
type MatchPickKey = "lifePartner" | "sexPartner" | "mindMatch" | "growthPartner" | "easiest" | "hardest";

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
  picks?: Partial<Record<MatchPickKey, Match | null>>;
  unresolved?: { astrology?: string[]; humanDesign?: string[] };
  excludedLayers?: string[];
  formula?: { layers?: string[]; inputs?: Record<string, unknown> };
};

const SIGN_GLYPHS: Record<string, React.ComponentType<any>> = {
  Aries: IconZodiacAries,
  Taurus: IconZodiacTaurus,
  Gemini: IconZodiacGemini,
  Cancer: IconZodiacCancer,
  Leo: IconZodiacLeo,
  Virgo: IconZodiacVirgo,
  Libra: IconZodiacLibra,
  Scorpio: IconZodiacScorpio,
  Sagittarius: IconZodiacSagittarius,
  Capricorn: IconZodiacCapricorn,
  Aquarius: IconZodiacAquarius,
  Pisces: IconZodiacPisces,
};

// Deep jewel-tone reads for each element, tuned to sit on the app's near-black
// glass panels without turning neon. Text pairing stays on ink/ivory tokens —
// these carry identity on the mark only, per the app's chart-color contract.
const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#e8845a",
  Earth: "#8fae5a",
  Air: "#5aa9d6",
  Water: "#a68adf",
};

const MODES: Array<{ key: Mode; label: string; description: string; icon: React.ComponentType<any> }> = [
  { key: "love", label: "Life Partner", description: "Emotional fit, trust, commitment, and long-term stability.", icon: IconHeart },
  { key: "attraction", label: "Sexual Chemistry", description: "Physical magnetism, desire, intensity, and energetic pull.", icon: IconSparkles },
  { key: "friendship", label: "Intellectual Match", description: "Conversation, humor, mental ease, trust, and friendship.", icon: IconCircle },
  { key: "growth", label: "Growth Potential", description: "The connection most likely to expose patterns and develop maturity.", icon: IconGrowth },
];

const PICK_META: Array<{ key: MatchPickKey; label: string; note: string; mode?: Mode; icon: React.ComponentType<any> }> = [
  { key: "lifePartner", label: "Life Partner", note: "Best long-term emotional fit", mode: "love", icon: IconHeart },
  { key: "sexPartner", label: "Sexual Chemistry", note: "Highest physical chemistry", mode: "attraction", icon: IconSparkles },
  { key: "mindMatch", label: "Intellectual Match", note: "Strongest mental ease", mode: "friendship", icon: IconDecisions },
  { key: "growthPartner", label: "Growth Potential", note: "Most powerful growth trigger", mode: "growth", icon: IconGrowth },
  { key: "easiest", label: "Easiest Flow", note: "Best average across every relationship layer", icon: IconCircle },
  { key: "hardest", label: "Hardest Lesson", note: "Most demanding compatibility lesson", icon: IconAlert },
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

function averageScore(match: Match) {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function scoreLabel(score: number) {
  if (score >= 80) return { text: "Deep Resonance", color: "#7fd8a8" };
  if (score >= 65) return { text: "Strong Connection", color: "#6fc9dd" };
  if (score >= 50) return { text: "Mixed but Workable", color: "#e8b95a" };
  return { text: "Friction-Heavy", color: "#e88a8a" };
}

function SignIcon({ sign, size = 22, color }: { sign: string; size?: number; color?: string }) {
  const Glyph = SIGN_GLYPHS[sign];
  return Glyph ? <Glyph size={size} style={{ color }} /> : null;
}

function ScoreRing({ score, size = 76, label }: { score: number; size?: number; label?: string }) {
  const gradientId = useId();
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="sce-ring relative flex-shrink-0" style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f6dfa8" />
            <stop offset="55%" stopColor="#d9b66f" />
            <stop offset="100%" stopColor="#a97f3c" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(217,182,111,.12)" strokeWidth="5" strokeDasharray="1 3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * score) / 100}
          style={{ filter: "drop-shadow(0 0 6px rgba(217,182,111,.45))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="sce-ring-value">{score}<small>%</small></span>
      </div>
    </div>
  );
}

function PickCard({
  match,
  label,
  note,
  mode,
  icon: Icon,
}: {
  match?: Match | null;
  label: string;
  note: string;
  mode?: Mode;
  icon: React.ComponentType<any>;
}) {
  if (!match) return null;
  const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
  const score = mode ? matchScore(match, mode) : averageScore(match);
  return (
    <motion.article whileHover={{ y: -4 }} className="sce-foil-frame">
      <div className="sce-foil-inner sce-pick-card">
        <div className="sce-pick-head">
          <span className="sce-pick-label" style={{ color }}>
            <Icon size={14} />
            {label}
          </span>
          <strong className="sce-pick-score" style={{ color }} aria-label={`${match.sign.name} symbolic model score ${score}`}>{score}%</strong>
        </div>
        <div className="sce-pick-sign">
          <SignIcon sign={match.sign.name} color={color} />
          <strong>{match.sign.name}</strong>
        </div>
        <p>{note}</p>
      </div>
    </motion.article>
  );
}

function MatchCard({ match, mode, rank }: { match: Match; mode: Mode; rank: number }) {
  const [open, setOpen] = useState(false);
  const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
  const score = matchScore(match, mode);
  const status = scoreLabel(score);
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      onClick={() => setOpen((value) => !value)}
      className="sce-foil-frame sce-match-frame"
      style={{ ["--sce-accent" as any]: color }}
    >
      <div className="sce-foil-inner sce-match-card">
        <span className="sce-match-rank">#{rank}</span>
        <div className="sce-match-top">
          <ScoreRing score={score} label={`${match.sign.name} symbolic model score ${score}`} />
          <div className="sce-match-meta">
            <div className="sce-match-sign">
              <SignIcon sign={match.sign.name} color={color} size={22} />
              <strong>{match.sign.name}</strong>
            </div>
            <div className="sce-match-status" style={{ color: status.color }}>{status.text}</div>
            <p>{pureText(match.headline)}</p>
          </div>
          <span className={`sce-chevron ${open ? "sce-chevron-open" : ""}`} aria-hidden="true">⌄</span>
        </div>
        {open && (
          <div className="sce-match-detail">
            <p>{pureText(match.why)}</p>
            {match.tension && (
              <div className="sce-watch-point">
                <strong>Watch point:</strong> {pureText(match.tension)}
              </div>
            )}
            <div className="sce-mode-grid">
              {MODES.map((item) => (
                <div key={item.key} className={`sce-mode-cell ${item.key === mode ? "sce-mode-cell-active" : ""}`}>
                  <div>{item.label.split(" ")[0]}</div>
                  <strong>{match.scores[item.key]}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
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
      <section className="sce-panel sce-evidence sce-evidence-neutral">
        <p className="sce-eyebrow">Evidence mode</p>
        <h2>Checking what this profile can support…</h2>
        <p className="sce-muted">Verified inputs are preferred. Supported symbolic inputs can remain useful without being relabeled as verified facts.</p>
      </section>
    );
  }

  if (result?.evidenceMode === "verified") {
    return (
      <section className="sce-panel sce-evidence sce-evidence-verified">
        <p className="sce-eyebrow">Verified input · symbolic model</p>
        <h2>The Sun placement passed the independent evidence contract.</h2>
        <p className="sce-muted">The birth input is verified; the compatibility interpretation remains a symbolic relationship model, not a prediction or scientific relationship assessment.</p>
      </section>
    );
  }

  if (result?.evidenceMode === "symbolic") {
    return (
      <section className="sce-panel sce-evidence sce-evidence-symbolic">
        <p className="sce-eyebrow">Symbolic compatibility</p>
        <h2>Useful as reflection, lower certainty by design.</h2>
        <p className="sce-muted">
          The saved Sun sign is being used as a traditional symbolic input while independent verification is incomplete. Current Sun verification status: <strong>{sunStatus}</strong>. Unverified Moon, Rising, houses, and Human Design layers stay out of the model instead of being guessed.
        </p>
        <a href={profile.id ? `/profile/${profile.id}` : "/create"} className="sce-link-chip">Review or refresh identity evidence</a>
      </section>
    );
  }

  return (
    <section className="sce-panel sce-evidence sce-evidence-unavailable">
      <p className="sce-eyebrow">Compatibility unavailable</p>
      <h2>A usable Sun input is still missing.</h2>
      <p className="sce-muted">
        Current Sun verification status: <strong>{sunStatus}</strong>. Soul Codex will not manufacture a placement to produce a result. Review Identity and explicitly request verification if you want supported online evidence added to the saved profile.
      </p>
      <a href={profile.id ? `/profile/${profile.id}` : "/create"} className="sce-link-chip">Review identity evidence</a>
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

  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
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
          body: JSON.stringify({ profile: compatibilityProfile, mode }),
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
  }, [profile, compatibilityProfile, mode]);

  const ranked = useMemo(
    () => [...(result?.all ?? [])].sort((a, b) => matchScore(b, mode) - matchScore(a, mode)),
    [result, mode]
  );

  const activeMode = MODES.find((item) => item.key === mode)!;
  const lifePath = profile?.lifePathNumber ?? profile?.numerologyData?.lifePathNumber ?? profile?.numerologyData?.lifePath;
  const hdType = profile?.humanDesignType ?? profile?.humanDesignData?.type;

  return (
    <div className="sce-shell">
      <Navigation />
      <main className="sce-main">
        <header className="sce-header">
          <p className="sce-eyebrow sce-eyebrow-center">Relationship Intelligence</p>
          <h1 className="sce-display">{profileName(profile)} Compatibility Map</h1>
          <p className="sce-lede">
            Your saved Soul Profile is reused here. No second onboarding, no repeated birthday form, and no placement is treated as fact without verification evidence.
          </p>
          {profile && (
            <p className="sce-lede" style={{ marginTop: ".6rem", fontSize: ".88rem" }}>
              The compatibility request sends only the saved Sun evidence and deterministic Life Path needed by this Foundation model. Name, birth date, birth location, biography, Moon, Rising, and Human Design stay on the device and out of this request.
            </p>
          )}
        </header>

        {!profile && (
          <section className="sce-panel sce-empty">
            <h2>Create your Soul Profile once</h2>
            <p className="sce-muted">Compatibility will reuse the supported parts of that one saved identity without another onboarding form.</p>
            <a href="/create" className="sce-button-primary">Create profile</a>
          </section>
        )}

        {profile && <EvidenceState profile={profile} result={result} loading={loading} sunStatus={verifiedSun ? "Verified" : sunStatus} />}

        {profile && (
          <section className="sce-panel sce-identity-bar">
            <div className="sce-identity-name">
              <span className="sce-icon-well"><IconIdentity size={17} /></span>
              {profileName(profile)}
            </div>
            <div className="sce-identity-pills">
              {[
                verifiedSun ? `${verifiedSun.sign} Sun` : null,
                lifePath ? `Life Path ${lifePath}` : null,
                hdType ? `HD ${hdType}` : null,
              ].filter(Boolean).map((item) => (
                <span key={String(item)}>{item}</span>
              ))}
            </div>
          </section>
        )}

        {profile && (
          <section className="sce-mode-select" aria-label="Relationship context">
            {MODES.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setMode(key)} className={`sce-mode-btn ${mode === key ? "sce-mode-btn-active" : ""}`}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </section>
        )}
        {profile && <p className="sce-mode-description">{activeMode.description}</p>}

        {loading && profile && <p className="sce-loading">Building the evidence-cleared compatibility map…</p>}
        {error && <p className="sce-error">{error}</p>}

        {result?.available && !loading && (
          <>
            <section className="sce-section">
              <p className="sce-eyebrow">Your role matches</p>
              <div className="sce-picks-grid">
                {PICK_META.map((item) => (
                  <PickCard key={item.key} match={result.picks?.[item.key]} label={item.label} note={item.note} mode={item.mode} icon={item.icon} />
                ))}
              </div>
            </section>

            <section className="sce-panel sce-section sce-bars-panel">
              <p className="sce-eyebrow">All 12 sign scores</p>
              <h2 className="sce-h2">Ranked for {activeMode.label}</h2>
              <p className="sce-muted">The ranking changes when you switch between life partnership, attraction, mental connection, and growth.</p>
              <div className="sce-bar-list">
                {ranked.map((match, index) => {
                  const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
                  const score = matchScore(match, mode);
                  return (
                    <div key={match.sign.name} className="sce-bar-row" title={`${match.sign.name} — ${score}% for ${activeMode.label}`}>
                      <span className="sce-bar-rank">#{index + 1}</span>
                      <span className="sce-bar-sign"><SignIcon sign={match.sign.name} color={color} size={18} />{match.sign.name}</span>
                      <span className="sce-bar-track">
                        <span className="sce-bar-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
                      </span>
                      <strong className="sce-bar-value" style={{ color }}>{score}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="sce-section">
              <div className="sce-section-head">
                <div>
                  <p className="sce-eyebrow">Highest symbolic fit</p>
                  <h2 className="sce-h2 sce-h2-large">{activeMode.label}</h2>
                </div>
                <span className="sce-muted sce-hint">Ranked symbolic model · not relationship probability</span>
              </div>
              <div className="sce-match-grid">
                {result.best.map((match, index) => (
                  <MatchCard key={match.sign.name} match={match} mode={mode} rank={index + 1} />
                ))}
              </div>
            </section>

            <section className="sce-panel sce-section sce-hardest-panel">
              <p className="sce-eyebrow sce-eyebrow-danger">Highest symbolic friction</p>
              <h2 className="sce-h2">Where this model expects more effort or tension</h2>
              <div className="sce-hardest-grid">
                {(result.challenging ?? []).map((match) => {
                  const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
                  return (
                    <div key={match.sign.name} className="sce-hardest-row">
                      <SignIcon sign={match.sign.name} color={color} size={22} />
                      <div className="sce-hardest-body">
                        <strong>{match.sign.name}</strong>
                        <div>{pureText(match.tension || match.headline)}</div>
                      </div>
                      <strong className="sce-hardest-score" aria-label={`${match.sign.name} symbolic friction score ${matchScore(match, mode)}`}>{matchScore(match, mode)}%</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <details className="sce-panel sce-details">
              <summary>Why the app reached these conclusions</summary>
              {result.evidenceLabel && <p className="sce-evidence-label">Evidence mode: {result.evidenceLabel}</p>}
              <p className="sce-muted" style={{ marginTop: ".6rem" }}>Displayed scores are internal symbolic ranking values for this model. They are not measured odds of relationship success, health, destiny, or compatibility in scientific terms.</p>
              <div className="sce-formula-grid">
                {(result.formula?.layers ?? []).map((layer) => (
                  <div key={layer} className="sce-formula-chip">✦ {layer}</div>
                ))}
              </div>
              {result.excludedLayers?.length ? (
                <div className="sce-excluded">
                  <p>Excluded rather than guessed</p>
                  <ul>
                    {result.excludedLayers.map((layer) => <li key={layer}>{layer}</li>)}
                  </ul>
                </div>
              ) : null}
            </details>
          </>
        )}
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .sce-shell{min-height:100vh;color:var(--sc-ivory);background:radial-gradient(circle at 72% 4%,rgba(154,116,220,.14),transparent 30%),radial-gradient(circle at 10% 26%,rgba(100,151,217,.09),transparent 26%),linear-gradient(180deg,var(--sc-void) 0%,#0b0810 50%,#07060a 100%)}
  .sce-main{position:relative;z-index:1;width:min(1160px,calc(100% - 32px));margin:0 auto;padding:7.2rem 0 6rem}
  .sce-eyebrow{margin:0 0 .6rem;display:inline-flex;align-items:center;gap:.5rem;color:var(--sc-gold);font-size:.68rem;font-weight:750;letter-spacing:.18em;text-transform:uppercase}
  .sce-eyebrow-center{display:flex;justify-content:center;width:100%}
  .sce-eyebrow-danger{color:#e88a8a}
  .sce-header{text-align:center;margin-bottom:2.2rem}
  .sce-display{margin:.4rem 0 .8rem;font-family:var(--font-serif);font-weight:500;font-size:clamp(2.4rem,6.4vw,4.6rem);line-height:1.02;letter-spacing:-.03em;background:linear-gradient(112deg,var(--sc-ivory) 0%,#f5e9d7 46%,var(--sc-gold-bright) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sce-lede{max-width:640px;margin:0 auto;color:color-mix(in srgb,var(--sc-ivory) 66%,transparent);font-size:clamp(.95rem,1.6vw,1.06rem);line-height:1.75}
  .sce-muted{color:color-mix(in srgb,var(--sc-ivory) 62%,transparent);font-size:.92rem;line-height:1.65;margin:0}

  .sce-panel{position:relative;border:1px solid var(--sc-line);border-radius:1.35rem;background:linear-gradient(145deg,rgba(28,21,39,.86),rgba(12,9,18,.9));box-shadow:var(--sc-shadow-soft);backdrop-filter:blur(20px) saturate(125%);-webkit-backdrop-filter:blur(20px) saturate(125%);padding:1.6rem}
  .sce-panel::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.035),transparent 32%)}

  .sce-empty{text-align:center;padding:2.6rem 1.6rem}
  .sce-empty h2{margin:0 0 .5rem;font-family:var(--font-serif);font-size:1.6rem}

  .sce-evidence h2{margin:.5rem 0 .6rem;font-size:1.3rem;font-weight:650;font-family:var(--font-serif)}
  .sce-evidence-neutral{border-color:var(--sc-line)}
  .sce-evidence-verified{border-color:rgba(127,216,168,.28);background:linear-gradient(145deg,rgba(127,216,168,.07),rgba(12,9,18,.92))}
  .sce-evidence-verified .sce-eyebrow{color:#7fd8a8}
  .sce-evidence-symbolic{border-color:rgba(166,138,223,.3);background:linear-gradient(145deg,rgba(166,138,223,.08),rgba(12,9,18,.92))}
  .sce-evidence-symbolic .sce-eyebrow{color:#c3aef2}
  .sce-evidence-unavailable{border-color:rgba(232,138,90,.32);background:linear-gradient(145deg,rgba(232,138,90,.08),rgba(12,9,18,.92))}
  .sce-evidence-unavailable .sce-eyebrow{color:#e8b95a}
  .sce-link-chip{display:inline-flex;margin-top:1rem;padding:.62rem 1.05rem;border-radius:.85rem;border:1px solid var(--sc-line-gold);background:rgba(217,182,111,.08);color:var(--sc-gold-bright);font-size:.85rem;font-weight:650;text-decoration:none;transition:border-color 160ms ease,background 160ms ease}
  .sce-link-chip:hover{border-color:rgba(217,182,111,.42);background:rgba(217,182,111,.14)}

  .sce-identity-bar{margin-top:1.4rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.1rem 1.4rem}
  .sce-identity-name{display:flex;align-items:center;gap:.65rem;font-weight:750}
  .sce-icon-well{display:inline-grid;place-items:center;width:2.2rem;height:2.2rem;border-radius:.7rem;border:1px solid rgba(217,182,111,.2);background:linear-gradient(145deg,rgba(217,182,111,.14),rgba(154,116,220,.08));color:var(--sc-gold-bright)}
  .sce-identity-pills{display:flex;flex-wrap:wrap;gap:.5rem}
  .sce-identity-pills span{padding:.4rem .75rem;border-radius:999px;border:1px solid var(--sc-line-gold);background:rgba(217,182,111,.07);color:#ead9b9;font-size:.72rem;font-weight:600}

  .sce-mode-select{margin-top:1.4rem;display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem}
  .sce-mode-btn{display:grid;place-items:center;gap:.4rem;padding:.85rem .4rem;border-radius:.9rem;border:1px solid var(--sc-line);background:rgba(20,16,29,.7);color:color-mix(in srgb,var(--sc-ivory) 62%,transparent);font-size:.72rem;cursor:pointer;transition:border-color 160ms ease,background 160ms ease,color 160ms ease,box-shadow 160ms ease}
  .sce-mode-btn:hover{border-color:rgba(217,182,111,.3)}
  .sce-mode-btn-active{border-color:rgba(217,182,111,.55);background:linear-gradient(145deg,rgba(217,182,111,.16),rgba(154,116,220,.06));color:var(--sc-gold-bright);box-shadow:0 10px 28px rgba(217,182,111,.12)}
  .sce-mode-description{margin:.85rem 0 0;text-align:center;color:color-mix(in srgb,var(--sc-ivory) 58%,transparent);font-size:.82rem}

  .sce-loading,.sce-error{margin-top:2rem;text-align:center;color:color-mix(in srgb,var(--sc-ivory) 62%,transparent)}
  .sce-error{padding:1rem;border-radius:1rem;border:1px solid rgba(232,138,90,.3);background:rgba(232,138,90,.06);color:#f0b198}

  .sce-section{margin-top:2.6rem}
  .sce-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1.2rem;flex-wrap:wrap}
  .sce-hint{font-size:.82rem}
  .sce-h2{margin:.2rem 0 0;font-family:var(--font-serif);font-size:1.5rem;font-weight:600}
  .sce-h2-large{font-size:clamp(1.8rem,3.4vw,2.5rem)}

  .sce-foil-frame{border-radius:1.15rem;padding:1px;background:linear-gradient(140deg,var(--sce-accent,rgba(217,182,111,.55)) 0%,rgba(255,255,255,.05) 45%,rgba(255,255,255,.02) 100%);cursor:default}
  .sce-foil-inner{position:relative;border-radius:calc(1.15rem - 1px);background:linear-gradient(155deg,rgba(26,20,37,.94),rgba(11,8,16,.96));overflow:hidden}
  .sce-foil-inner::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,.05),transparent 34%)}

  .sce-picks-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.85rem}
  .sce-pick-card{padding:1.05rem;cursor:pointer}
  .sce-pick-head{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.85rem}
  .sce-pick-label{display:flex;align-items:center;gap:.4rem;font-size:.68rem;text-transform:uppercase;letter-spacing:.09em;color:color-mix(in srgb,var(--sc-ivory) 60%,transparent)}
  .sce-pick-score{font-size:1rem}
  .sce-pick-sign{display:flex;align-items:center;gap:.55rem;margin-bottom:.4rem}
  .sce-pick-sign strong{font-size:1.1rem;font-family:var(--font-serif)}
  .sce-pick-card p{margin:0;color:color-mix(in srgb,var(--sc-ivory) 58%,transparent);font-size:.82rem;line-height:1.55}

  .sce-ring-value{font-variant-numeric:tabular-nums;font-weight:800;font-size:.98rem;color:var(--sc-ivory);text-shadow:0 0 12px rgba(217,182,111,.25)}
  .sce-ring-value small{font-size:.62em;font-weight:700;opacity:.8;margin-left:1px}

  .sce-match-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
  .sce-match-frame{cursor:pointer}
  .sce-match-card{padding:1.15rem}
  .sce-match-rank{position:absolute;right:1.1rem;top:.85rem;font-size:.72rem;font-weight:800;color:var(--sce-accent,var(--sc-gold))}
  .sce-match-top{display:flex;gap:1rem;align-items:center}
  .sce-match-meta{flex:1;min-width:0}
  .sce-match-sign{display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem}
  .sce-match-sign strong{font-size:1.15rem;font-family:var(--font-serif)}
  .sce-match-status{font-size:.72rem;font-weight:750;margin-bottom:.4rem}
  .sce-match-meta p{margin:0;color:color-mix(in srgb,var(--sc-ivory) 78%,transparent);font-size:.88rem;line-height:1.55}
  .sce-chevron{align-self:flex-start;color:color-mix(in srgb,var(--sc-ivory) 40%,transparent);font-size:1.1rem;transition:transform 200ms ease}
  .sce-chevron-open{transform:rotate(180deg);color:var(--sc-gold-bright)}
  .sce-match-detail{margin-top:1rem;padding-top:1rem;border-top:1px solid var(--sc-line)}
  .sce-match-detail>p{margin:0 0 .8rem;color:color-mix(in srgb,var(--sc-ivory) 85%,transparent);line-height:1.72}
  .sce-watch-point{border:1px solid rgba(217,182,111,.28);background:rgba(217,182,111,.07);color:#ead9b9;border-radius:.7rem;padding:.7rem .85rem;font-size:.85rem;line-height:1.55;margin-bottom:.9rem}
  .sce-mode-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem}
  .sce-mode-cell{text-align:center;border-radius:.6rem;padding:.5rem .3rem;background:rgba(255,255,255,.03)}
  .sce-mode-cell div{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:color-mix(in srgb,var(--sc-ivory) 45%,transparent);margin-bottom:.15rem}
  .sce-mode-cell strong{font-variant-numeric:tabular-nums}
  .sce-mode-cell-active{background:linear-gradient(145deg,rgba(217,182,111,.16),rgba(154,116,220,.05))}
  .sce-mode-cell-active strong{color:var(--sc-gold-bright)}

  .sce-bars-panel{padding:1.6rem}
  .sce-bar-list{margin-top:1.3rem;display:grid;gap:.7rem}
  .sce-bar-row{display:grid;grid-template-columns:26px minmax(90px,1fr) minmax(120px,2fr) 40px;align-items:center;gap:.7rem}
  .sce-bar-rank{font-size:.66rem;color:color-mix(in srgb,var(--sc-ivory) 35%,transparent)}
  .sce-bar-sign{display:flex;align-items:center;gap:.4rem;font-size:.86rem}
  .sce-bar-track{height:9px;border-radius:999px;background:rgba(0,0,0,.42);box-shadow:inset 0 1px 3px rgba(0,0,0,.5);overflow:hidden}
  .sce-bar-fill{display:block;height:100%;border-radius:999px;box-shadow:0 0 8px rgba(217,182,111,.25)}
  .sce-bar-value{font-size:.78rem;font-variant-numeric:tabular-nums}

  .sce-hardest-panel{border-color:rgba(232,138,90,.2);background:linear-gradient(145deg,rgba(232,138,90,.05),rgba(12,9,18,.92))}
  .sce-hardest-grid{margin-top:1.2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.7rem}
  .sce-hardest-row{display:flex;align-items:center;gap:.8rem;padding:.85rem;border-radius:.9rem;background:rgba(232,138,90,.05);border:1px solid rgba(232,138,90,.14)}
  .sce-hardest-body{flex:1;min-width:0}
  .sce-hardest-body div{color:color-mix(in srgb,var(--sc-ivory) 62%,transparent);font-size:.78rem;margin-top:.2rem;line-height:1.5}
  .sce-hardest-score{color:#e88a8a}

  .sce-details{margin-top:1.8rem}
  .sce-details summary{cursor:pointer;font-weight:650;font-size:.95rem}
  .sce-evidence-label{margin:.9rem 0 0;font-size:.85rem;font-weight:600;color:color-mix(in srgb,var(--sc-ivory) 80%,transparent)}
  .sce-formula-grid{margin-top:.9rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.55rem}
  .sce-formula-chip{border-radius:.65rem;background:rgba(217,182,111,.06);padding:.65rem .8rem;color:color-mix(in srgb,var(--sc-ivory) 64%,transparent);font-size:.8rem}
  .sce-excluded{margin-top:1.1rem;border:1px solid rgba(232,185,90,.22);background:rgba(232,185,90,.06);border-radius:.85rem;padding:.9rem 1rem}
  .sce-excluded p{margin:0 0 .4rem;font-size:.85rem;font-weight:700;color:#e8b95a}
  .sce-excluded ul{margin:0;padding-left:1.1rem;color:color-mix(in srgb,var(--sc-ivory) 60%,transparent);font-size:.82rem;line-height:1.6}

  .sce-button-primary{display:inline-flex;margin-top:1.2rem;padding:.76rem 1.3rem;border-radius:.9rem;border:1px solid rgba(239,208,141,.34);background:linear-gradient(135deg,#efd08d 0%,#d1a85a 100%);color:#170f07;font-weight:750;text-decoration:none;box-shadow:0 12px 34px rgba(217,182,111,.17)}

  @media(max-width:820px){.sce-mode-select{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:640px){.sce-main{padding-top:6.2rem}.sce-match-top{flex-wrap:wrap}.sce-chevron{position:absolute;right:1.1rem;bottom:1rem}}
`;
