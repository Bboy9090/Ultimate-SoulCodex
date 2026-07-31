import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "../components/navigation";
import CosmicLoader from "../components/CosmicLoader";
import { loadActiveProfile, getRecoveryMessage, type ProfileLoadStatus } from "../lib/ActiveProfileRepository";
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
import { pureText } from "../lib/sanitizer";

type Mode = "love" | "attraction" | "friendship" | "growth";
type MatchPickKey = "lifePartner" | "sexPartner" | "mindMatch" | "growthPartner" | "easiest" | "hardest";

interface SignMeta {
  name: string;
  element: string;
  modality: string;
  glyph: string;
  keywords: string[];
  rulingPlanet: string;
}

interface ArchetypeMatch {
  sign: SignMeta;
  score: number;
  scores: Record<Mode, number>;
  headline: string;
  why: string;
  tension?: string;
}

interface MatchResult {
  all?: ArchetypeMatch[];
  best: ArchetypeMatch[];
  challenging: ArchetypeMatch[];
  picks?: Partial<Record<MatchPickKey, ArchetypeMatch | null>>;
  formula?: { layers?: string[] };
}

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

const MODES: Array<{ key: Mode; label: string; short: string; icon: React.ComponentType<any>; description: string }> = [
  { key: "love", label: "Life Partner", short: "Life", icon: IconHeart, description: "Long-term emotional fit, trust, commitment, and staying power." },
  { key: "attraction", label: "Sex Partner", short: "Sex", icon: IconSparkles, description: "Chemistry, physical desire, magnetism, and energetic pull." },
  { key: "friendship", label: "Mind Match", short: "Mind", icon: IconCircle, description: "Conversation, friendship, trust, humor, and mental ease." },
  { key: "growth", label: "Growth Match", short: "Growth", icon: IconGrowth, description: "The connection that stretches you, exposes patterns, and develops maturity." },
];

const PICK_META: Array<{ key: MatchPickKey; label: string; note: string; mode?: Mode; icon: React.ComponentType<any> }> = [
  { key: "lifePartner", label: "Life Partner", note: "Best long-term emotional fit", mode: "love", icon: IconHeart },
  { key: "sexPartner", label: "Sex Partner", note: "Highest physical chemistry", mode: "attraction", icon: IconSparkles },
  { key: "mindMatch", label: "Mind Match", note: "Strongest mental ease", mode: "friendship", icon: IconDecisions },
  { key: "growthPartner", label: "Growth Match", note: "Most powerful growth trigger", mode: "growth", icon: IconGrowth },
  { key: "easiest", label: "Easiest Flow", note: "Best average across every relationship layer", icon: IconCircle },
  { key: "hardest", label: "Hardest Lesson", note: "Most demanding compatibility lesson", icon: IconAlert },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#f97316",
  Earth: "#84cc16",
  Air: "#38bdf8",
  Water: "#a78bfa",
};

const panel: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(25,15,9,.92), rgba(20,14,32,.9))",
  border: "1px solid rgba(212,168,95,.22)",
  borderRadius: 16,
  boxShadow: "0 18px 50px rgba(0,0,0,.24)",
};

function scoreLabel(score: number) {
  if (score >= 80) return { text: "Deep Resonance", color: "#22c55e" };
  if (score >= 65) return { text: "Strong Connection", color: "#22d3ee" };
  if (score >= 50) return { text: "Mixed but Workable", color: "#f59e0b" };
  return { text: "Friction-Heavy", color: "#ef4444" };
}

function matchScore(match: ArchetypeMatch, mode: Mode) {
  return match.scores?.[mode] ?? match.score ?? 0;
}

function averageScore(match: ArchetypeMatch) {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function SignIcon({ sign, size = 22, color }: { sign: string; size?: number; color?: string }) {
  const Glyph = SIGN_GLYPHS[sign];
  return Glyph ? <Glyph size={size} style={{ color }} /> : null;
}

function ScoreRing({ score, size = 78 }: { score: number; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#D4A85F" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - circumference * score / 100} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 800, color: "#f7f0e4" }}>{score}%</div>
    </div>
  );
}

function PickCard({ match, label, note, mode, icon: Icon }: { match?: ArchetypeMatch | null; label: string; note: string; mode?: Mode; icon: React.ComponentType<any> }) {
  if (!match) return null;
  const color = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
  const score = mode ? matchScore(match, mode) : averageScore(match);
  return (
    <motion.article whileHover={{ y: -3 }} style={{ ...panel, padding: 16, borderColor: `${color}44` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 13 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(246,241,232,.66)", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 11 }}><Icon size={14} style={{ color }} />{label}</span>
        <strong style={{ color }}>{score}%</strong>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}><SignIcon sign={match.sign.name} color={color} /><strong style={{ fontSize: 17 }}>{match.sign.name}</strong></div>
      <p style={{ color: "rgba(246,241,232,.64)", fontSize: 13, lineHeight: 1.55, margin: 0 }}>{note}</p>
    </motion.article>
  );
}

function MatchCard({ match, mode, rank }: { match: ArchetypeMatch; mode: Mode; rank: number }) {
  const [open, setOpen] = useState(false);
  const color = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
  const score = matchScore(match, mode);
  const status = scoreLabel(score);
  return (
    <motion.article whileHover={{ y: -4 }} onClick={() => setOpen((value) => !value)} style={{ ...panel, padding: 18, cursor: "pointer", borderTop: `4px solid ${color}`, position: "relative" }}>
      <span style={{ position: "absolute", right: 14, top: 12, color, fontSize: 11, fontWeight: 800 }}>#{rank}</span>
      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
        <ScoreRing score={score} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><SignIcon sign={match.sign.name} color={color} size={25} /><strong style={{ fontSize: 19 }}>{match.sign.name}</strong></div>
          <div style={{ color: status.color, fontSize: 12, fontWeight: 700, marginBottom: 7 }}>{status.text}</div>
          <p style={{ color: "rgba(246,241,232,.76)", lineHeight: 1.55, margin: 0, fontSize: 14 }}>{pureText(match.headline)}</p>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <p style={{ lineHeight: 1.7, color: "rgba(246,241,232,.86)" }}>{pureText(match.why)}</p>
          {match.tension && <div style={{ border: "1px solid rgba(245,158,11,.25)", background: "rgba(245,158,11,.08)", color: "#fbbf24", borderRadius: 10, padding: 12, lineHeight: 1.55 }}><strong>Watch point:</strong> {pureText(match.tension)}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 13 }}>
            {MODES.map((item) => <div key={item.key} style={{ textAlign: "center", borderRadius: 9, padding: 8, background: item.key === mode ? "rgba(212,168,95,.13)" : "rgba(255,255,255,.035)" }}><div style={{ fontSize: 9, color: "rgba(255,255,255,.45)", textTransform: "uppercase" }}>{item.short}</div><strong style={{ color: item.key === mode ? "#D4A85F" : "#f7f0e4" }}>{match.scores[item.key]}</strong></div>)}
          </div>
        </div>
      )}
    </motion.article>
  );
}

export default function CompatibilityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [mode, setMode] = useState<Mode>("love");
  const [matches, setMatches] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStatus, setProfileStatus] = useState<ProfileLoadStatus>("missing");
  const [recoveryMessage, setRecoveryMessage] = useState<any>(null);

  useEffect(() => {
    // Load profile from local storage (canonical repository)
    const result = loadActiveProfile();
    setProfile(result.profile);
    setProfileStatus(result.status);

    // Generate recovery message if needed
    if (result.status !== "loaded") {
      setRecoveryMessage(getRecoveryMessage(result));
    }

    if (!result.profile) {
      setLoading(false);
      if (result.status === "missing") {
        setError("No Soul Codex profile found in this browser or app context.");
      } else if (result.status === "corrupted") {
        setError("Your saved profile appears to be corrupted and needs repair.");
      } else if (result.status === "wrong-version") {
        setError("Your profile format needs to be updated.");
      }
    }
  }, []);

  const sunSign = profile?.sunSign ?? profile?.astrologyData?.sunSign;
  const lifePath = profile?.lifePathNumber ?? profile?.numerologyData?.lifePathNumber;
  const hdType = profile?.humanDesignType ?? profile?.humanDesignData?.type;
  const hdAuthority = profile?.humanDesignData?.authority;

  const loadMatches = useCallback(async () => {
    if (!sunSign) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/compatibility/archetype-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sunSign, lifePathNumber: lifePath ? Number(lifePath) : undefined, hdType, mode }),
      });
      if (!response.ok) throw new Error((await response.text()) || "Compatibility results could not be generated.");
      setMatches(await response.json());
    } catch (matchError) {
      setError(matchError instanceof Error ? matchError.message : "Compatibility results could not be generated.");
    } finally {
      setLoading(false);
    }
  }, [sunSign, lifePath, hdType, mode]);

  useEffect(() => { void loadMatches(); }, [loadMatches]);

  const activeMode = MODES.find((item) => item.key === mode)!;
  const ranked = useMemo(() => [...(matches?.all || [])].sort((a, b) => matchScore(b, mode) - matchScore(a, mode)), [matches, mode]);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%,rgba(78,42,16,.23),transparent 34%),#09070f", color: "#f7f0e4" }}>
      <Navigation />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "104px 16px 72px" }}>
        <header style={{ textAlign: "center", marginBottom: 27 }}>
          <div style={{ color: "#D4A85F", textTransform: "uppercase", letterSpacing: ".17em", fontSize: 11 }}>Soul Codex Relationship Intelligence</div>
          <h1 style={{ margin: "8px 0 8px", fontFamily: "var(--font-serif)", fontSize: "clamp(2.2rem,7vw,4.3rem)" }}>Compatibility</h1>
          <p style={{ color: "rgba(246,241,232,.65)", lineHeight: 1.6, margin: 0 }}>{sunSign ? `Your ${sunSign} blueprint ranked against all 12 signs.` : "Complete your Soul Codex to reveal your compatibility map."}</p>
        </header>

        {error && recoveryMessage && (
          <div style={{ ...panel, borderColor: "rgba(239,68,68,.35)", padding: 18, marginBottom: 18 }}>
            <div style={{ color: "#fca5a5", marginBottom: 12 }}>
              <strong>{recoveryMessage.title}</strong>
              <p style={{ color: "rgba(252,165,165,.85)", margin: "6px 0 0" }}>{recoveryMessage.description}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recoveryMessage.recovery.map((action: string) => (
                <button
                  key={action}
                  onClick={() => action.includes("Create") ? window.location.href = "/create" : null}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(212,168,95,.35)",
                    background: "rgba(212,168,95,.08)",
                    color: "#D4A85F",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {profile && (
          <section style={{ ...panel, padding: 18, marginBottom: 20, borderLeft: "3px solid #D4A85F" }}>
            <div style={{ display: "flex", gap: 14, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, marginBottom: 9 }}><IconIdentity size={17} style={{ color: "#D4A85F" }} />{profile.name || "My Blueprint"}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[sunSign && `Sun ${sunSign}`, lifePath && `Life Path ${lifePath}`, hdType && `HD ${hdType}`, hdAuthority && `Authority ${hdAuthority}`].filter(Boolean).map((item) => <span key={String(item)} style={{ border: "1px solid rgba(212,168,95,.24)", background: "rgba(212,168,95,.08)", borderRadius: 99, padding: "5px 10px", fontSize: 11 }}>{item}</span>)}
                </div>
              </div>
              <div style={{ color: "#22c55e", fontSize: 12 }}>● Blueprint loaded</div>
            </div>
          </section>
        )}

        {!sunSign && !loading ? (
          <section style={{ ...panel, padding: 38, textAlign: "center" }}><IconIdentity size={46} style={{ color: "#D4A85F", margin: "0 auto 12px" }} /><h2>Complete your Soul Codex first</h2><p style={{ color: "rgba(246,241,232,.65)" }}>Compatibility is generated automatically from your saved blueprint.</p><a href="/create" style={{ color: "#D4A85F" }}>Create your reading</a></section>
        ) : (
          <>
            <section style={{ marginBottom: 23 }}>
              <div style={{ color: "rgba(246,241,232,.48)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>Relationship context</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {MODES.map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.key;
                  return <button key={item.key} onClick={() => setMode(item.key)} style={{ padding: "12px 7px", borderRadius: 12, border: `1px solid ${active ? "rgba(212,168,95,.55)" : "rgba(212,168,95,.14)"}`, background: active ? "rgba(212,168,95,.16)" : "rgba(25,15,9,.7)", color: active ? "#D4A85F" : "rgba(246,241,232,.6)", cursor: "pointer", display: "grid", gap: 5, placeItems: "center", fontSize: 11 }}><Icon size={17} />{item.label}</button>;
                })}
              </div>
              <p style={{ textAlign: "center", color: "rgba(246,241,232,.55)", fontSize: 12, lineHeight: 1.55 }}>{activeMode.description}</p>
            </section>

            {loading ? <div style={{ padding: 80, textAlign: "center" }}><CosmicLoader label={`Building ${activeMode.label} compatibility...`} /></div> : matches && (
              <>
                <section style={{ marginBottom: 24 }}>
                  <h2 style={{ color: "#D4A85F", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em" }}>Your Role Matches</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>{PICK_META.map((item) => <PickCard key={item.key} match={matches.picks?.[item.key]} label={item.label} note={item.note} mode={item.mode} icon={item.icon} />)}</div>
                </section>

                <section style={{ ...panel, padding: 18, marginBottom: 24 }}>
                  <h2 style={{ color: "#D4A85F", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginTop: 0 }}>All 12 Sign Scores</h2>
                  <p style={{ color: "rgba(246,241,232,.56)", fontSize: 12 }}>The ranking changes when you switch between life partnership, attraction, mental connection, and growth.</p>
                  <div style={{ display: "grid", gap: 9, marginTop: 16 }}>
                    {ranked.map((match, index) => {
                      const color = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
                      const score = matchScore(match, mode);
                      return <div key={match.sign.name} style={{ display: "grid", gridTemplateColumns: "28px minmax(85px,1fr) minmax(110px,2fr) 38px", alignItems: "center", gap: 9 }}><span style={{ color: "rgba(255,255,255,.35)", fontSize: 10 }}>#{index + 1}</span><span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13 }}><SignIcon sign={match.sign.name} color={color} size={18} />{match.sign.name}</span><span style={{ height: 8, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${score}%`, background: color }} /></span><strong style={{ color, fontSize: 12 }}>{score}</strong></div>;
                    })}
                  </div>
                </section>

                <section style={{ marginBottom: 24 }}>
                  <h2 style={{ color: "#D4A85F", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em" }}>Best Matches in This Context</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 13 }}>{matches.best.map((match, index) => <MatchCard key={match.sign.name} match={match} mode={mode} rank={index + 1} />)}</div>
                </section>

                <section style={{ ...panel, padding: 18, marginBottom: 24, borderColor: "rgba(239,68,68,.2)" }}>
                  <h2 style={{ color: "#f87171", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginTop: 0 }}>Harder Lessons</h2>
                  <div style={{ display: "grid", gap: 10 }}>{matches.challenging.map((match) => <div key={match.sign.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 11, background: "rgba(239,68,68,.055)" }}><SignIcon sign={match.sign.name} color={ELEMENT_COLORS[match.sign.element]} size={22} /><div style={{ flex: 1 }}><strong>{match.sign.name}</strong><div style={{ color: "rgba(246,241,232,.6)", fontSize: 12, marginTop: 4 }}>{pureText(match.tension || match.headline)}</div></div><strong style={{ color: "#f87171" }}>{matchScore(match, mode)}%</strong></div>)}</div>
                </section>

                <section style={{ ...panel, padding: 18 }}>
                  <h2 style={{ color: "#D4A85F", fontSize: 12, textTransform: "uppercase", letterSpacing: ".14em", marginTop: 0 }}>How Your Result Was Built</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>{(matches.formula?.layers || ["Sun-sign pattern", "Ruling planet chemistry", "Life Path resonance", "Human Design type fit"]).map((layer) => <div key={layer} style={{ borderRadius: 11, background: "rgba(212,168,95,.065)", padding: 12, color: "rgba(246,241,232,.7)", fontSize: 12 }}>✦ {layer}</div>)}</div>
                  <p style={{ color: "rgba(246,241,232,.52)", lineHeight: 1.6, marginBottom: 0, fontSize: 12 }}>Human Design, numerology, and astrology feed one compatibility interpretation. They are not separate reports pasted together.</p>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
