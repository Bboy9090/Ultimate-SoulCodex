import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { apiRequest, apiFetch } from "../lib/queryClient";
import ConfidenceBadge from "../components/ConfidenceBadge";
import CosmicLoader from "../components/CosmicLoader";
import ScButton from "../components/ScButton";
import {
  IconAlert,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconCircle,
  IconDecisions,
  IconGrowth,
  IconHashtag,
  IconHeart,
  IconIdentity,
  IconMoon,
  IconRising,
  IconSparkles,
  IconSquare,
  IconStress,
  IconSun,
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
  formula?: {
    layers?: string[];
  };
}

interface Person {
  id: string;
  name: string;
  birthDate: string;
}

interface CompatibilityResult {
  overallScore: number;
  dimensions: { identity: number; stress: number; values: number; decisions: number };
  friction: string[];
  synergy: string[];
  growthOpportunities: string[];
  profile1Name?: string;
  profile2Name?: string;
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

const MODES: { key: Mode; label: string; short: string; glyph: React.ComponentType<any>; desc: string }[] = [
  { key: "love", label: "Life Partner", short: "Life", glyph: IconHeart, desc: "Long-term emotional fit and staying power." },
  { key: "attraction", label: "Sex Partner", short: "Sex", glyph: IconSparkles, desc: "Chemistry, desire, and physical pull." },
  { key: "friendship", label: "Mind Match", short: "Mind", glyph: IconCircle, desc: "Conversation, trust, and mental ease." },
  { key: "growth", label: "Growth Match", short: "Growth", glyph: IconGrowth, desc: "The person who stretches you the most." },
];

const PICK_META: { key: MatchPickKey; label: string; mode?: Mode; icon: React.ComponentType<any>; note: string }[] = [
  { key: "lifePartner", label: "Life Partner", mode: "love", icon: IconHeart, note: "Best long-term emotional fit" },
  { key: "sexPartner", label: "Sex Partner", mode: "attraction", icon: IconSparkles, note: "Highest physical chemistry" },
  { key: "mindMatch", label: "Mind Match", mode: "friendship", icon: IconDecisions, note: "Best mental ease" },
  { key: "growthPartner", label: "Growth Match", mode: "growth", icon: IconGrowth, note: "Strongest growth trigger" },
  { key: "easiest", label: "Easiest Flow", icon: IconCircle, note: "Best average across all scores" },
  { key: "hardest", label: "Hardest Lesson", icon: IconAlert, note: "Lowest average across all scores" },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#f97316",
  Earth: "#84cc16",
  Air: "#38bdf8",
  Water: "#a78bfa",
};

const DIM_CONFIG = {
  identity: { glyph: IconIdentity, color: "#D4A85F", label: "Identity" },
  stress: { glyph: IconStress, color: "#f59e0b", label: "Under Pressure" },
  values: { glyph: IconCircle, color: "#f472b6", label: "Values" },
  decisions: { glyph: IconDecisions, color: "#22d3ee", label: "Decisions" },
};

const FREE_LIMIT = 5;

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Deep Resonance", color: "#22c55e" };
  if (score >= 65) return { text: "Strong Connection", color: "#22d3ee" };
  if (score >= 50) return { text: "Mixed But Workable", color: "#f59e0b" };
  return { text: "Friction-Heavy", color: "#ef4444" };
}

function averageScore(match: ArchetypeMatch): number {
  return Math.round((match.scores.love + match.scores.attraction + match.scores.friendship + match.scores.growth) / 4);
}

function matchScore(match: ArchetypeMatch, mode: Mode): number {
  return match.scores?.[mode] ?? match.score ?? 0;
}

function SignIcon({ sign, size = 22, color }: { sign: string; size?: number; color?: string }) {
  const Glyph = SIGN_GLYPHS[sign];
  return Glyph ? <Glyph size={size} style={{ color }} /> : null;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const circ = 2 * Math.PI * (size / 2 - 4);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke="var(--sc-gold)"
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * displayScore) / 100}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)", filter: "drop-shadow(0 0 4px var(--sc-gold))" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>{displayScore}</span>
        <span style={{ fontSize: size * 0.11, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>%</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, glyph: Glyph, color, score }: { label: string; glyph: React.ComponentType<any>; color: string; score: number }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Glyph size={12} style={{ color }} />{label}
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color }}>{score}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function PickCard({ match, label, note, icon: Icon, mode }: { match?: ArchetypeMatch | null; label: string; note: string; icon: React.ComponentType<any>; mode?: Mode }) {
  if (!match) return null;
  const elColor = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
  const score = mode ? matchScore(match, mode) : averageScore(match);

  return (
    <div style={{ background: "rgba(26,14,8,0.72)", border: `1px solid ${elColor}33`, borderRadius: 12, padding: "1rem", minHeight: 126 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", fontWeight: 700 }}>
          <Icon size={13} style={{ color: elColor }} /> {label}
        </div>
        <span style={{ color: elColor, fontWeight: 800, fontSize: "0.9rem" }}>{score}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.4rem" }}>
        <SignIcon sign={match.sign.name} color={elColor} />
        <strong style={{ color: "var(--sc-ivory)", fontSize: "1rem" }}>{match.sign.name}</strong>
      </div>
      <p style={{ color: "rgba(234,234,245,0.68)", fontSize: "0.76rem", lineHeight: 1.45, margin: 0 }}>{note}</p>
    </div>
  );
}

function PicksGrid({ picks }: { picks?: MatchResult["picks"] }) {
  if (!picks) return null;
  return (
    <section style={{ marginBottom: "1.75rem" }}>
      <h2 style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4A85F", marginBottom: "0.8rem" }}>Role Matches</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        {PICK_META.map((item) => <PickCard key={item.key} match={picks[item.key]} label={item.label} note={item.note} icon={item.icon} mode={item.mode} />)}
      </div>
    </section>
  );
}

function CompatibilityChart({ matches, mode }: { matches?: ArchetypeMatch[]; mode: Mode }) {
  if (!matches || matches.length === 0) return null;
  const ranked = [...matches].sort((a, b) => matchScore(b, mode) - matchScore(a, mode));
  const high = ranked[0]?.sign.name;
  const low = ranked[ranked.length - 1]?.sign.name;

  return (
    <section style={{ marginBottom: "2rem", background: "rgba(18,11,5,0.72)", border: "1px solid rgba(212,168,95,0.18)", borderRadius: 16, padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.9rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4A85F", marginBottom: "0.25rem" }}>All 12 Sign Scores</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.76rem", margin: 0 }}>Highest: {high}. Lowest: {low}. The numbers change with each relationship context.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        {ranked.map((match, index) => {
          const elColor = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
          const activeScore = matchScore(match, mode);
          return (
            <div key={match.sign.name} style={{ display: "grid", gridTemplateColumns: "32px minmax(92px, 1fr) minmax(120px, 2fr) 44px", gap: "0.6rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textAlign: "right" }}>#{index + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
                <SignIcon sign={match.sign.name} color={elColor} size={18} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--sc-ivory)", overflow: "hidden", textOverflow: "ellipsis" }}>{match.sign.name}</span>
              </div>
              <div style={{ height: 9, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ width: `${activeScore}%`, height: "100%", background: elColor, borderRadius: 99 }} />
              </div>
              <span style={{ color: elColor, fontWeight: 800, fontSize: "0.82rem", textAlign: "right" }}>{activeScore}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
        {MODES.map((m) => {
          const Icon = m.glyph;
          return (
            <div key={m.key} style={{ background: mode === m.key ? "rgba(212,168,95,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${mode === m.key ? "rgba(212,168,95,0.28)" : "rgba(255,255,255,0.04)"}`, borderRadius: 10, padding: "0.55rem 0.3rem", textAlign: "center" }}>
              <Icon size={13} style={{ color: mode === m.key ? "#D4A85F" : "var(--muted-foreground)", margin: "0 auto 0.25rem" }} />
              <div style={{ color: "var(--muted-foreground)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.short}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MatchCard({ match, mode, rank }: { match: ArchetypeMatch; mode: Mode; rank?: number }) {
  const [open, setOpen] = useState(false);
  const elColor = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
  const score = matchScore(match, mode);
  const { color: scoreColor, text: scoreText } = scoreLabel(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: elColor + "80", boxShadow: `0 20px 40px -15px ${elColor}44` }}
      onClick={() => setOpen((o) => !o)}
      style={{ background: "rgba(28, 22, 53, 0.65)", backdropFilter: "blur(20px)", border: `1px solid ${elColor}33`, borderTop: `4px solid ${elColor}`, borderRadius: 16, padding: "1.3rem", cursor: "pointer", transition: "all 0.2s", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
    >
      {rank !== undefined && <div style={{ position: "absolute", top: "0.85rem", right: "0.85rem", fontSize: "0.65rem", color: elColor, fontWeight: 800, background: `${elColor}15`, borderRadius: 99, padding: "0.2rem 0.6rem", letterSpacing: "0.1em", border: `1px solid ${elColor}33` }}>#{rank + 1}</div>}
      <div style={{ display: "flex", gap: "1.1rem", alignItems: "center" }}>
        <ScoreRing score={score} size={76} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <SignIcon sign={match.sign.name} color={elColor} size={24} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--sc-ivory)" }}>{match.sign.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem", background: `${elColor}18`, border: `1px solid ${elColor}40`, borderRadius: 4, color: elColor, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{match.sign.element}</span>
            <span style={{ fontSize: "0.75rem", color: scoreColor, fontWeight: 700 }}>{scoreText}</span>
          </div>
          <p style={{ fontSize: "0.86rem", color: "rgba(234, 234, 245, 0.8)", margin: 0, lineHeight: 1.55 }}>{pureText(match.headline)}</p>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <p style={{ fontSize: "0.88rem", color: "rgba(234, 234, 245, 0.92)", lineHeight: 1.65, marginBottom: "1rem" }}>{pureText(match.why)}</p>
            {match.tension && <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "0.85rem", marginBottom: "1rem", color: "#f59e0b", fontSize: "0.8rem", lineHeight: 1.55 }}><strong>Watch point:</strong> {pureText(match.tension)}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.55rem" }}>
              {MODES.map((m) => (
                <div key={m.key} style={{ textAlign: "center", padding: "0.55rem 0.2rem", background: m.key === mode ? "rgba(212,168,95,0.12)" : "rgba(255,255,255,0.03)", borderRadius: 9, border: `1px solid ${m.key === mode ? "rgba(212,168,95,0.3)" : "transparent"}` }}>
                  <div style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.44)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{m.short}</div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: m.key === mode ? "#D4A85F" : "var(--sc-ivory)" }}>{match.scores[m.key]}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}><IconChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} /></div>}
    </motion.div>
  );
}

function ChallengeCard({ match, mode }: { match: ArchetypeMatch; mode: Mode }) {
  const elColor = ELEMENT_COLORS[match.sign.element] || "#ef4444";
  const score = matchScore(match, mode);
  return (
    <div style={{ background: "rgba(26,14,8,0.7)", border: "1px solid rgba(239,68,68,0.18)", borderLeft: "3px solid rgba(239,68,68,0.45)", borderRadius: 12, padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.85rem" }}>
      <div style={{ textAlign: "center", flexShrink: 0 }}><SignIcon sign={match.sign.name} color={elColor} size={24} /><div style={{ fontSize: "0.58rem", color: elColor, marginTop: "0.1rem" }}>{match.sign.element}</div></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem" }}>{match.sign.name}</div>
        <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 600, marginBottom: "0.2rem" }}>{score}% - {scoreLabel(score).text}</div>
        {match.tension && <div style={{ fontSize: "0.75rem", color: "rgba(255,200,150,0.7)", lineHeight: 1.5 }}>{pureText(match.tension)}</div>}
      </div>
    </div>
  );
}

export default function CompatibilityPage() {
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [myConfidence, setMyConfidence] = useState<any>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [mode, setMode] = useState<Mode>("love");
  const [matches, setMatches] = useState<MatchResult | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthLocation: "" });

  const flash = (fn: (v: string | null) => void, msg: string) => {
    fn(msg);
    setTimeout(() => fn(null), 3500);
  };

  useEffect(() => {
    const saved = localStorage.getItem("soulProfile") || localStorage.getItem("soulGuestProfile");
    let parsed: any = null;
    if (saved) { try { parsed = JSON.parse(saved); } catch {} }
    if (parsed) setMyProfile(parsed);

    const savedId = localStorage.getItem("soulMyProfileId");
    if (savedId) setMyProfileId(savedId);

    const savedPersons = localStorage.getItem("soulPersons");
    if (savedPersons) {
      try {
        const p = JSON.parse(savedPersons);
        setPersons(p);
        if (p.length > 0) setCompareOpen(true);
      } catch {}
    }

    const savedConf = localStorage.getItem("soulConfidence") || localStorage.getItem("soulGuestConfidence");
    if (savedConf) { try { setMyConfidence(JSON.parse(savedConf)); } catch {} }

    const hasSigns = parsed?.sunSign || parsed?.astrologyData?.sunSign;
    if (!hasSigns) {
      apiFetch("/api/profiles")
        .then((r) => r.ok ? r.json() : null)
        .then((profiles: any[]) => {
          if (!profiles || profiles.length === 0) return;
          const p = profiles[0];
          setMyProfile(p);
          if (p.id) setMyProfileId(String(p.id));
          try { localStorage.setItem("soulProfile", JSON.stringify(p)); } catch {}
        })
        .catch(() => {});
    }
  }, []);

  const sunSign = myProfile?.sunSign ?? myProfile?.astrologyData?.sunSign ?? myProfile?.astrology?.sun ?? myProfile?.astrology?.sunSign;
  const moonSign = myProfile?.moonSign ?? myProfile?.astrologyData?.moonSign ?? myProfile?.astrology?.moon ?? myProfile?.astrology?.moonSign;
  const rising = myProfile?.risingSign ?? myProfile?.astrologyData?.risingSign ?? myProfile?.astrology?.rising ?? myProfile?.astrology?.risingSign;
  const rawLifePath = myProfile?.numerology?.lifePath ?? myProfile?.numerologyData?.lifePathNumber ?? Number(myProfile?.soul_architecture?.expression);
  const lifePath = rawLifePath || undefined;
  const hdType = myProfile?.humanDesign?.type ?? myProfile?.humanDesignData?.type;
  const modeInfo = MODES.find((m) => m.key === mode)!;
  const ModeIcon = modeInfo.glyph;
  const nearLimit = persons.length >= FREE_LIMIT - 1 && persons.length < FREE_LIMIT;
  const atLimit = persons.length >= FREE_LIMIT;

  const archetypeMatchMutation = useMutation({
    mutationFn: async (data: { sunSign: string; lifePathNumber?: number; hdType?: string; mode: Mode }) => apiRequest("/api/compatibility/archetype-matches", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => setMatches(data),
    onError: (err: any) => console.warn("[archetype-matches]", err.message),
  });

  const fetchMatches = useCallback(() => {
    if (!sunSign) return;
    archetypeMatchMutation.mutate({ sunSign, lifePathNumber: lifePath, hdType, mode });
  }, [sunSign, lifePath, hdType, mode]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const saveMyProfileMutation = useMutation({
    mutationFn: async () => {
      const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
      let name: string | undefined;
      let birthDate: string | undefined;
      let birthTime: string | undefined;
      let birthLocation: string | undefined;
      if (rawInputs) {
        const inputs = JSON.parse(rawInputs);
        name = inputs.name; birthDate = inputs.birthDate; birthTime = inputs.birthTime; birthLocation = inputs.birthLocation;
      }
      const p = myProfile;
      if (!name) name = p?.name;
      if (!birthDate) birthDate = p?.birthDate ?? p?.dob;
      if (!birthTime) birthTime = p?.birthTime;
      if (!birthLocation) birthLocation = p?.birthLocation ?? p?.location ?? p?.city;
      if (!name || !birthDate) throw new Error("Complete onboarding first.");
      return apiRequest("/api/profiles", { method: "POST", body: JSON.stringify({ name, birthDate, birthTime: birthTime || undefined, birthLocation: birthLocation || undefined }) });
    },
    onSuccess: (data: any) => {
      const id = data.id?.toString();
      localStorage.setItem("soulMyProfileId", id);
      setMyProfileId(id);
    },
    onError: (err: any) => console.warn("[save-profile]", err.message),
  });

  useEffect(() => {
    if (myProfile && !myProfileId && myProfile.name && (myProfile.birthDate || myProfile.dob)) saveMyProfileMutation.mutate();
  }, [myProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPersonMutation = useMutation({
    mutationFn: async (data: typeof form) => apiRequest("/api/profiles", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      const newPerson = { id: data.id, name: form.name, birthDate: form.birthDate };
      const updated = [...persons, newPerson];
      setPersons(updated);
      localStorage.setItem("soulPersons", JSON.stringify(updated));
      setIsAddOpen(false);
      setForm({ name: "", birthDate: "", birthTime: "", birthLocation: "" });
      flash(setSuccess, `${newPerson.name} added`);
    },
    onError: () => flash(setError, "Failed to add person"),
  });

  const compareMutation = useMutation({
    mutationFn: async (personId: string) => {
      if (!myProfileId) throw new Error("Save your profile first");
      return apiRequest("/api/compatibility", { method: "POST", body: JSON.stringify({ profile1Id: myProfileId, profile2Id: personId }) });
    },
    onSuccess: (data: any) => {
      const cd = data.compatibilityData || {};
      const dims = cd.dimensions || {};
      setResult({
        overallScore: data.overallScore ?? cd.overall ?? 0,
        dimensions: {
          identity: dims.identity?.score ?? dims.identity ?? 0,
          stress: dims.stress?.score ?? dims.stress ?? 0,
          values: dims.values?.score ?? dims.values ?? 0,
          decisions: dims.decisions?.score ?? dims.decisions ?? 0,
        },
        friction: cd.friction || [],
        synergy: cd.synergy || [],
        growthOpportunities: cd.growthOpportunities || [],
        profile1Name: data.profile1?.name,
        profile2Name: data.profile2?.name,
      });
      setCompareOpen(true);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    },
    onError: (err: any) => flash(setError, err.message || "Comparison failed"),
  });

  const profileBadges = useMemo(() => [
    [IconSun, "Sun", sunSign],
    [IconMoon, "Moon", moonSign],
    [IconRising, "Rising", rising],
    [IconHashtag, "LP", lifePath],
    [IconGrowth, "HD", hdType],
  ] as [React.ComponentType<any>, string, string | number | undefined][], [sunSign, moonSign, rising, lifePath, hdType]);

  return (
    <div style={{ padding: "2rem 1rem 5rem", maxWidth: 860, margin: "0 auto" }}>
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem,5vw,2.25rem)" }}>Compatibility</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.88rem", marginTop: "0.35rem" }}>{sunSign ? `Your ${sunSign} blueprint ranked against all 12 signs` : "Complete your soul profile to see your matches"}</p>
      </section>

      {error && <div style={{ padding: "0.7rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#ef4444", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}
      {success && <div style={{ padding: "0.7rem 1rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, color: "#22c55e", marginBottom: "1rem", fontSize: "0.85rem" }}>{success}</div>}

      {myProfile && (
        <div style={{ background: "rgba(26,14,8,0.72)", border: "1px solid rgba(212,168,95,0.2)", borderLeft: "3px solid #D4A85F", borderRadius: 14, padding: "1.1rem 1.4rem", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <IconIdentity size={14} style={{ color: "#D4A85F" }} /> {myProfile?.name || "My Blueprint"}
              {myConfidence && <ConfidenceBadge badge={myConfidence.badge} reason={myConfidence.reason} size="sm" />}
            </div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {profileBadges.filter(([, , value]) => value).map(([Icon, label, val]) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.18rem 0.6rem", background: "rgba(212,168,95,0.1)", border: "1px solid rgba(212,168,95,0.22)", borderRadius: 99, fontSize: "0.68rem", color: "rgba(246,241,232,0.8)" }}>
                  <Icon size={12} style={{ color: "#D4A85F" }} />
                  <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </span>
              ))}
            </div>
          </div>
          {!myProfileId ? <ScButton onClick={() => saveMyProfileMutation.mutate()} loading={saveMyProfileMutation.isPending} size="sm" className="flex-shrink-0">Link Profile</ScButton> : <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#22c55e", flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Linked</div>}
        </div>
      )}

      {!sunSign ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: "rgba(28, 22, 53, 0.72)", border: "1px solid rgba(212,168,95,0.25)", borderRadius: 14 }}>
          <IconIdentity size={48} style={{ margin: "0 auto 0.75rem", color: "#D4A85F", opacity: 0.6 }} />
          <p style={{ color: "rgba(234,234,245,0.7)", fontSize: "0.88rem", marginBottom: "1rem" }}>Complete your soul profile to unlock compatibility analysis.</p>
          <a href="/start" style={{ textDecoration: "none" }}><button className="btn btn-primary">Complete Profile</button></a>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>Relationship context</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
              {MODES.map((m) => {
                const Icon = m.glyph;
                return (
                  <button key={m.key} onClick={() => setMode(m.key)} style={{ padding: "0.72rem 0.45rem", background: mode === m.key ? "rgba(212,168,95,0.18)" : "rgba(26,14,8,0.65)", border: `1px solid ${mode === m.key ? "rgba(212,168,95,0.55)" : "rgba(212,168,95,0.14)"}`, borderRadius: 12, cursor: "pointer", color: mode === m.key ? "#D4A85F" : "var(--muted-foreground)", fontSize: "0.68rem", fontWeight: mode === m.key ? 700 : 500, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                    <Icon size={16} /> {m.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.6rem", textAlign: "center" }}>{modeInfo.desc}</p>
          </div>

          {archetypeMatchMutation.isPending ? (
            <div style={{ padding: "4rem 0", textAlign: "center" }}><CosmicLoader label={`Building ${modeInfo.label} scores...`} /></div>
          ) : (
            <>
              <PicksGrid picks={matches?.picks} />
              <CompatibilityChart matches={matches?.all} mode={mode} />

              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4A85F", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><ModeIcon size={14} /> Best Matches for {modeInfo.label}</h2>
                {matches?.best?.length ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                    <AnimatePresence>{matches.best.map((m, i) => <MatchCard key={m.sign.name} match={m} mode={mode} rank={i} />)}</AnimatePresence>
                  </div>
                ) : <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No matches found for this configuration.</p>}
              </div>

              {matches?.challenging?.length ? (
                <div style={{ marginBottom: "2.5rem" }}>
                  <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#ef4444", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><IconAlert size={14} /> Lowest Scores for {modeInfo.label}</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>{matches.challenging.map((m) => <ChallengeCard key={m.sign.name} match={m} mode={mode} />)}</div>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.75rem", lineHeight: 1.6 }}>Low score does not mean impossible. It means this match takes more patience, clearer boundaries, and better communication.</p>
                </div>
              ) : null}
            </>
          )}

          <div style={{ background: "rgba(18,11,5,0.72)", border: "1px solid rgba(212,168,95,0.18)", borderRadius: 16, overflow: "hidden", marginBottom: "1.5rem" }}>
            <button onClick={() => setCompareOpen((o) => !o)} style={{ width: "100%", padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "var(--foreground)", fontSize: "0.9rem", fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><IconCircle size={14} style={{ color: "var(--cosmic-pink)" }} />Compare a Specific Person</span>
              <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>{compareOpen ? <><IconChevronUp size={12} /> Collapse</> : <><IconChevronDown size={12} /> Expand</>}</span>
            </button>

            {compareOpen && (
              <div style={{ padding: "0 1.4rem 1.4rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.25rem", lineHeight: 1.6 }}>Enter someone's birth details to compare your two blueprints directly.</p>
                {(nearLimit || atLimit) && <div style={{ padding: "0.75rem 1.1rem", marginBottom: "1rem", background: "rgba(212,168,95,0.07)", border: "1px solid rgba(212,168,95,0.28)", borderRadius: 10, fontSize: "0.82rem", color: "rgba(246,241,232,0.68)" }}>{atLimit ? `Free limit reached (${FREE_LIMIT} people).` : `${FREE_LIMIT - persons.length} slot remaining.`}</div>}

                {!atLimit && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <ScButton variant="secondary" size="sm" className="mb-4" onClick={() => setIsAddOpen(!isAddOpen)}>{isAddOpen ? "Cancel" : "+ Add Person"}</ScButton>
                    {isAddOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ background: "rgba(15,20,40,0.65)", border: "1px dashed rgba(212,168,95,0.35)", borderRadius: 12, padding: "1.25rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.85rem", marginBottom: "1rem" }}>
                          {([["Name", "text", "name", "Name"], ["Birth Date", "date", "birthDate", ""], ["Birth Time", "time", "birthTime", ""], ["Location", "text", "birthLocation", "City"]] as [string, string, keyof typeof form, string][]).map(([label, type, key, ph]) => (
                            <div key={key} className="form-group" style={{ marginBottom: 0 }}><label className="label" style={{ fontSize: "0.72rem" }}>{label}</label><input className="input" type={type} placeholder={ph} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></div>
                          ))}
                        </div>
                        <ScButton className="w-full" onClick={() => addPersonMutation.mutate(form)} disabled={!form.name || !form.birthDate} loading={addPersonMutation.isPending}>Add and Analyze</ScButton>
                      </motion.div>
                    )}
                  </div>
                )}

                {persons.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "1.5rem", border: "1px dashed rgba(212,168,95,0.18)", borderRadius: 10, fontSize: "0.82rem" }}>No people added yet.</div> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>{persons.map((person) => <div key={person.id} style={{ background: "rgba(15,20,40,0.55)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: 12, padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}><div><p style={{ fontWeight: 600, margin: 0, fontSize: "0.88rem" }}>{person.name}</p><p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", margin: 0 }}>{person.birthDate}</p></div><ScButton variant="secondary" size="sm" onClick={() => compareMutation.mutate(person.id)} loading={compareMutation.isPending && compareMutation.variables === person.id}>Compare</ScButton></div>)}</div>
                )}

                {result && (
                  <div style={{ marginTop: "2rem", background: "rgba(15,20,40,0.7)", border: "1px solid rgba(212,168,95,0.22)", borderRadius: 16, padding: "1.75rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}><h3 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", marginBottom: "0.3rem" }}>Synastry Reading</h3>{(result.profile1Name || result.profile2Name) && <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{result.profile1Name} x {result.profile2Name}</p>}</div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}><ScoreRing score={result.overallScore} size={120} /><span style={{ display: "inline-block", marginTop: "0.75rem", padding: "0.22rem 0.85rem", background: `${scoreLabel(result.overallScore).color}15`, border: `1px solid ${scoreLabel(result.overallScore).color}35`, borderRadius: 99, fontSize: "0.76rem", fontWeight: 600, color: scoreLabel(result.overallScore).color }}>{scoreLabel(result.overallScore).text}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.1rem", marginBottom: "1.5rem" }}>{(Object.entries(DIM_CONFIG) as [keyof typeof DIM_CONFIG, typeof DIM_CONFIG[keyof typeof DIM_CONFIG]][]).map(([key, cfg]) => <DimensionBar key={key} label={cfg.label} glyph={cfg.glyph} color={cfg.color} score={result.dimensions[key]} />)}</div>
                    {result.synergy.length > 0 && <ResultList title="Where You Flow" icon={IconSparkles} color="#22c55e" items={result.synergy} />}
                    {result.growthOpportunities.length > 0 && <ResultList title="What This Can Build" icon={IconGrowth} color="#D4A85F" items={result.growthOpportunities} />}
                    {result.friction.length > 0 && <ResultList title="Watch Points" icon={IconSquare} color="#f59e0b" items={result.friction} />}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ResultList({ title, icon: Icon, color, items }: { title: string; icon: React.ComponentType<any>; color: string; items: string[] }) {
  return (
    <div style={{ background: `${color}0D`, border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: "0.85rem" }}>
      <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color, textTransform: "uppercase", marginBottom: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}><Icon size={12} /> {title}</p>
      {items.map((item, i) => <p key={i} style={{ fontSize: "0.83rem", color: "rgba(234,234,245,0.82)", marginBottom: "0.28rem", lineHeight: 1.65, display: "flex", alignItems: "center", gap: "0.4rem" }}><IconArrowRight size={12} style={{ color, flexShrink: 0 }} />{pureText(item)}</p>)}
    </div>
  );
}