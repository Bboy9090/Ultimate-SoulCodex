import { useId, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "../components/navigation";
import EvidenceLimitations from "../components/EvidenceLimitations";
import AsyncFeatureState, { featureErrorMessage } from "../components/AsyncFeatureState";
import { useActiveProfile } from "../hooks/useActiveProfile";
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
type MatchPickKey =
  | "romanticConnection"
  | "chemistryAttraction"
  | "communicationFriendship"
  | "growthRepair"
  | "lifePartner"
  | "sexPartner"
  | "mindMatch"
  | "growthPartner"
  | "easiest"
  | "hardest";

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
  excludedLayers?: string[];
  formula?: { id?: string; layers?: string[]; inputs?: Record<string, unknown> };
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

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#e8845a",
  Earth: "#8fae5a",
  Air: "#5aa9d6",
  Water: "#a68adf",
};

const MODES: Array<{
  key: Mode;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<any>;
}> = [
  { key: "love", label: "Romantic connection", shortLabel: "Romantic", description: "Partnership themes, trust, steadiness, and long-range symbolic flow.", icon: IconHeart },
  { key: "attraction", label: "Chemistry & attraction", shortLabel: "Chemistry", description: "Magnetism, activation, intensity, play, and attraction in the symbolic model.", icon: IconSparkles },
  { key: "friendship", label: "Communication & friendship", shortLabel: "Communication", description: "Conversation, curiosity, social ease, humor, and day-to-day rapport.", icon: IconDecisions },
  { key: "growth", label: "Growth & repair", shortLabel: "Growth", description: "Friction, adaptation, recurring lessons, repair pressure, and development themes.", icon: IconGrowth },
];

const PICK_META: Array<{
  key: MatchPickKey;
  fallbackKey?: MatchPickKey;
  label: string;
  note: string;
  mode?: Mode;
  icon: React.ComponentType<any>;
}> = [
  { key: "romanticConnection", fallbackKey: "lifePartner", label: "Romantic connection", note: "Highest romantic-connection signal", mode: "love", icon: IconHeart },
  { key: "chemistryAttraction", fallbackKey: "sexPartner", label: "Chemistry & attraction", note: "Highest attraction signal", mode: "attraction", icon: IconSparkles },
  { key: "communicationFriendship", fallbackKey: "mindMatch", label: "Communication & friendship", note: "Strongest mental and social flow", mode: "friendship", icon: IconDecisions },
  { key: "growthRepair", fallbackKey: "growthPartner", label: "Growth & repair", note: "Strongest growth and repair pressure", mode: "growth", icon: IconGrowth },
  { key: "easiest", label: "Easiest flow", note: "Highest average symbolic flow", icon: IconCircle },
  { key: "hardest", label: "Hardest lesson", note: "Most demanding symbolic friction", icon: IconAlert },
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

function SignIcon({ sign, size = 22, color }: { sign: string; size?: number; color?: string }) {
  const Glyph = SIGN_GLYPHS[sign];
  return Glyph ? <Glyph size={size} style={{ color }} /> : null;
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const gradientId = useId();
  const size = 76;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="sce-ring" role="img" aria-label={`${label} symbolic score ${score}`}>
      <svg width={size} height={size} viewBox="0 0 76 76">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f6dfa8" />
            <stop offset="100%" stopColor="#b58743" />
          </linearGradient>
        </defs>
        <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(217,182,111,.12)" strokeWidth="5" />
        <circle cx="38" cy="38" r={radius} fill="none" stroke={`url(#${gradientId})`} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * score) / 100} transform="rotate(-90 38 38)" />
      </svg>
      <strong>{score}<small>%</small></strong>
    </div>
  );
}

function MatchCard({ match, mode, rank }: { match: Match; mode: Mode; rank: number }) {
  const [open, setOpen] = useState(false);
  const score = matchScore(match, mode);
  const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
  return (
    <motion.article whileHover={{ y: -3 }} className="sce-foil-frame" style={{ ["--sce-accent" as any]: color }}>
      <button type="button" className="sce-match-card" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="sce-rank">#{rank}</span>
        <ScoreRing score={score} label={match.sign.name} />
        <div className="sce-match-copy">
          <div className="sce-sign"><SignIcon sign={match.sign.name} color={color} /><strong>{match.sign.name}</strong></div>
          <p>{pureText(match.headline)}</p>
        </div>
        <span className="sce-chevron" aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div className="sce-match-detail">
          <p>{pureText(match.why)}</p>
          {match.tension && <p className="sce-watch"><strong>Watch point:</strong> {pureText(match.tension)}</p>}
        </div>
      )}
    </motion.article>
  );
}

export default function CompatibilityExplorerPage() {
  const { profile, isLoading: profileLoading } = useActiveProfile();
  const [mode, setMode] = useState<Mode>("love");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryNonce, setRetryNonce] = useState(0);

  const compatibilityProfile = useMemo(() => buildCompatibilityProfilePayload(profile), [profile]);
  const verifiedSun = useMemo(() => getVerifiedPlacement(placementCandidate(profile, "sun")), [profile]);
  const sunStatus = profile ? placementDisplayStatus(placementCandidate(profile, "sun")) : "Unavailable";

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
        if (cancelled) return;
        setResult(payload as Result);
        if (!response.ok && response.status !== 422) {
          setError(featureErrorMessage(response.status, payload?.message || "Compatibility could not be generated."));
        }
      } catch (cause) {
        if (!cancelled) setError(featureErrorMessage(undefined, cause instanceof Error ? cause.message : undefined));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [profile, compatibilityProfile, mode, retryNonce]);

  const ranked = useMemo(
    () => [...(result?.all ?? [])].sort((a, b) => matchScore(b, mode) - matchScore(a, mode)),
    [result, mode],
  );
  const activeMode = MODES.find((item) => item.key === mode)!;
  const lifePath = profile?.lifePathNumber ?? profile?.numerologyData?.lifePathNumber ?? profile?.numerologyData?.lifePath;

  return (
    <div className="sce-shell">
      <Navigation />
      <main className="sce-main">
        <header className="sce-header">
          <p className="sce-eyebrow">Relationship Intelligence</p>
          <h1>{profileName(profile)} Compatibility Map</h1>
          <p>One saved Identity powers a bounded symbolic model. No second onboarding, no invented synastry, and no universal relationship verdict.</p>
        </header>

        {!profileLoading && !profile && (
          <section className="sce-panel sce-empty">
            <h2>Create profile first</h2>
            <p>Compatibility reuses the supported parts of your saved Identity.</p>
            <a href="/create" className="sc-button-primary mt-4 inline-flex">Create profile</a>
          </section>
        )}

        {profile && (
          <>
            <section className="sce-panel sce-identity-bar">
              <div className="sce-identity-name"><span className="sce-icon-well"><IconIdentity size={17} /></span>{profileName(profile)}</div>
              <div className="sce-pills">
                <span>{verifiedSun?.sign ? `${verifiedSun.sign} Sun` : `Sun: ${sunStatus}`}</span>
                {lifePath ? <span>Life Path {lifePath}</span> : null}
              </div>
              <small>Moon, Rising, houses, and Human Design are not used in Foundation Compatibility.</small>
            </section>

            <section className="sce-mode-select" aria-label="Compatibility dimension">
              {MODES.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setMode(key)} className={mode === key ? "active" : ""}>
                  <Icon size={18} /><span>{label}</span>
                </button>
              ))}
            </section>
            <p className="sce-mode-description">{activeMode.description}</p>

            {loading && <p className="sce-loading">Building the evidence-cleared compatibility map…</p>}
            {error && <AsyncFeatureState message={error} onRetry={() => setRetryNonce((value) => value + 1)} />}

            {result && !result.available && !loading && !error && (
              <section className="sce-panel sce-unavailable">
                <p className="sce-eyebrow">Compatibility unavailable</p>
                <h2>This layer stays unavailable instead of guessing.</h2>
                <p>{result.reason}</p>
              </section>
            )}

            {result?.available && !loading && !error && (
              <>
                <section className="sce-section">
                  <p className="sce-eyebrow">Dimension leaders</p>
                  <div className="sce-picks-grid">
                    {PICK_META.map((item) => {
                      const match = result.picks?.[item.key] ?? (item.fallbackKey ? result.picks?.[item.fallbackKey] : null);
                      if (!match) return null;
                      const score = item.mode ? matchScore(match, item.mode) : averageScore(match);
                      const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
                      return (
                        <article className="sce-pick" key={item.key}>
                          <span style={{ color }}><item.icon size={15} /> {item.label}</span>
                          <div><SignIcon sign={match.sign.name} color={color} /><strong>{match.sign.name}</strong><b style={{ color }} aria-label={`${match.sign.name} symbolic score ${score}`}>{score}%</b></div>
                          <p>{item.note}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section className="sce-panel sce-section">
                  <p className="sce-eyebrow">All 12 sign scores</p>
                  <h2>Ranked for {activeMode.label}</h2>
                  <div className="sce-bars">
                    {ranked.map((match, index) => {
                      const score = matchScore(match, mode);
                      const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
                      return (
                        <div className="sce-bar" key={match.sign.name}>
                          <span>#{index + 1}</span><span><SignIcon sign={match.sign.name} color={color} size={17} />{match.sign.name}</span>
                          <i><i style={{ width: `${score}%`, background: color }} /></i>
                          <strong style={{ color }} aria-label={`${match.sign.name} symbolic score ${score}`}>{score}</strong>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="sce-section">
                  <div className="sce-section-head"><div><p className="sce-eyebrow">Highest symbolic fit</p><h2>{activeMode.label}</h2></div><span>Internal symbolic score, not relationship probability</span></div>
                  <div className="sce-match-grid">
                    {result.best.map((match, index) => <MatchCard key={match.sign.name} match={match} mode={mode} rank={index + 1} />)}
                  </div>
                </section>

                <section className="sce-panel sce-section sce-friction-panel">
                  <p className="sce-eyebrow sce-friction-eyebrow">Highest symbolic friction</p>
                  <h2>Where this model expects more effort or tension</h2>
                  <div className="sce-friction-grid">
                    {(result.challenging ?? []).map((match) => {
                      const score = matchScore(match, mode);
                      const color = ELEMENT_COLORS[match.sign.element] || "var(--sc-gold)";
                      return (
                        <article key={match.sign.name}>
                          <div><SignIcon sign={match.sign.name} color={color} /><strong>{match.sign.name}</strong><b aria-label={`${match.sign.name} symbolic friction score ${score}`}>{score}</b></div>
                          <p>{pureText(match.tension || match.why)}</p>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <EvidenceLimitations evidenceLabel={result.evidenceLabel} layers={result.formula?.layers} excluded={result.excludedLayers} />
              </>
            )}
          </>
        )}
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.sce-shell{min-height:100vh;color:var(--sc-ivory);background:radial-gradient(circle at 72% 4%,rgba(154,116,220,.14),transparent 30%),radial-gradient(circle at 10% 26%,rgba(100,151,217,.09),transparent 26%),linear-gradient(180deg,var(--sc-void),#0b0810 50%,#07060a)}
.sce-main{width:min(1160px,calc(100% - 32px));margin:auto;padding:7.2rem 0 6rem}.sce-header{text-align:center;max-width:760px;margin:0 auto 2rem}.sce-eyebrow{margin:0 0 .55rem;color:var(--sc-gold);font-size:.68rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.sce-header h1{margin:.2rem 0 .8rem;font-family:var(--font-serif);font-size:clamp(2.5rem,6vw,4.8rem);font-weight:500;line-height:1}.sce-header>p:last-child,.sce-panel>p{color:var(--sc-stone);line-height:1.7}
.sce-panel{border:1px solid var(--sc-line);border-radius:1.35rem;background:linear-gradient(145deg,rgba(28,21,39,.88),rgba(12,9,18,.94));box-shadow:var(--sc-shadow-soft);padding:1.5rem}.sce-empty{text-align:center}.sce-identity-bar{display:grid;grid-template-columns:auto 1fr;gap:.7rem 1rem;align-items:center}.sce-identity-name{display:flex;align-items:center;gap:.6rem;font-weight:750}.sce-icon-well{display:grid;place-items:center;width:2.2rem;height:2.2rem;border:1px solid var(--sc-line-gold);border-radius:.7rem;color:var(--sc-gold-bright);background:rgba(217,182,111,.08)}.sce-pills{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:flex-end}.sce-pills span{padding:.4rem .72rem;border:1px solid var(--sc-line-gold);border-radius:999px;color:#ead9b9;font-size:.72rem}.sce-identity-bar small{grid-column:1/-1;color:var(--sc-stone)}
.sce-mode-select{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin-top:1.3rem}.sce-mode-select button{min-height:64px;border:1px solid var(--sc-line);border-radius:.9rem;background:rgba(20,16,29,.72);color:var(--sc-stone);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;font:inherit;font-size:.76rem;cursor:pointer}.sce-mode-select button.active{border-color:rgba(217,182,111,.5);background:linear-gradient(145deg,rgba(217,182,111,.16),rgba(154,116,220,.06));color:var(--sc-gold-bright)}.sce-mode-description,.sce-loading{text-align:center;color:var(--sc-stone);font-size:.84rem;margin:.75rem 0}.sce-unavailable{margin-top:1.5rem}.sce-section{margin-top:2.4rem}.sce-section h2{margin:.2rem 0;font-family:var(--font-serif);font-size:1.65rem}.sce-picks-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:.8rem}.sce-pick,.sce-foil-frame{padding:1px;border-radius:1.1rem;background:linear-gradient(140deg,rgba(217,182,111,.48),rgba(154,116,220,.2),rgba(255,255,255,.03))}.sce-pick{padding:1rem;border:1px solid var(--sc-line-gold);background:linear-gradient(155deg,rgba(26,20,37,.95),rgba(11,8,16,.98))}.sce-pick>span{display:flex;gap:.35rem;align-items:center;font-size:.67rem;text-transform:uppercase;letter-spacing:.08em}.sce-pick>div{display:flex;align-items:center;gap:.45rem;margin:.75rem 0 .35rem}.sce-pick b{margin-left:auto}.sce-pick p{margin:0;color:var(--sc-stone);font-size:.78rem}
.sce-bars{display:grid;gap:.65rem;margin-top:1rem}.sce-bar{display:grid;grid-template-columns:28px minmax(110px,1fr) minmax(100px,2fr) 34px;gap:.65rem;align-items:center;font-size:.82rem}.sce-bar>span:nth-child(2){display:flex;gap:.4rem;align-items:center}.sce-bar>i{height:8px;border-radius:999px;background:#050407;overflow:hidden}.sce-bar>i>i{display:block;height:100%;border-radius:999px}.sce-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap}.sce-section-head>span{color:var(--sc-stone);font-size:.78rem}.sce-match-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.9rem}.sce-foil-frame{--sce-accent:var(--sc-gold)}.sce-match-card{width:100%;display:flex;gap:.9rem;align-items:center;position:relative;border:0;border-radius:calc(1.1rem - 1px);padding:1rem;background:linear-gradient(155deg,rgba(26,20,37,.96),rgba(11,8,16,.98));color:inherit;text-align:left;cursor:pointer}.sce-rank{position:absolute;right:1rem;top:.65rem;color:var(--sce-accent);font-size:.68rem}.sce-ring{position:relative;width:76px;height:76px;flex:none}.sce-ring strong{position:absolute;inset:0;display:grid;place-items:center;font-size:.95rem}.sce-ring small{font-size:.65em}.sce-match-copy{min-width:0;flex:1}.sce-sign{display:flex;align-items:center;gap:.45rem}.sce-match-copy p{margin:.4rem 0 0;color:var(--sc-ivory-soft);font-size:.84rem;line-height:1.5}.sce-chevron{color:var(--sc-gold)}.sce-match-detail{margin-top:-1px;padding:1rem;border:1px solid var(--sc-line);border-top:0;border-radius:0 0 1rem 1rem;background:rgba(11,8,16,.96);color:var(--sc-ivory-soft);line-height:1.65}.sce-watch{padding:.7rem;border:1px solid var(--sc-line-gold);border-radius:.7rem;background:rgba(217,182,111,.06)}
.sce-friction-panel{border-color:rgba(232,138,90,.22);background:linear-gradient(145deg,rgba(232,138,90,.05),rgba(12,9,18,.94))}.sce-friction-eyebrow{color:#e8b95a}.sce-friction-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem;margin-top:1rem}.sce-friction-grid article{border:1px solid rgba(232,138,90,.14);border-radius:.9rem;background:rgba(232,138,90,.04);padding:.9rem}.sce-friction-grid article>div{display:flex;align-items:center;gap:.45rem}.sce-friction-grid b{margin-left:auto;color:#e88a8a}.sce-friction-grid p{margin:.55rem 0 0;color:var(--sc-stone);font-size:.8rem;line-height:1.55}
@media(max-width:820px){.sce-mode-select{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.sce-main{width:min(100% - 22px,1160px);padding-top:6.2rem}.sce-identity-bar{grid-template-columns:1fr}.sce-pills{justify-content:flex-start}.sce-bar{grid-template-columns:24px 110px 1fr 30px}}
`;
