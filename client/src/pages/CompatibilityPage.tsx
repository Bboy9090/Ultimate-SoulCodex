import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, apiFetch } from "../lib/queryClient";
import ConfidenceBadge from "../components/ConfidenceBadge";
import CosmicLoader from "../components/CosmicLoader";
import ScButton from "../components/ScButton";
import { 
  IconHeart, IconSparkles, IconCircle, IconGrowth, 
  IconIdentity, IconStress, IconDecisions, IconSun, 
  IconMoon, IconRising, IconHashtag, IconAlert,
  IconArrowRight, IconSquare, IconChevronDown, IconChevronUp,
  IconZodiacAries, IconZodiacTaurus, IconZodiacGemini, 
  IconZodiacCancer, IconZodiacLeo, IconZodiacVirgo, 
  IconZodiacLibra, IconZodiacScorpio, IconZodiacSagittarius, 
  IconZodiacCapricorn, IconZodiacAquarius, IconZodiacPisces
} from "../components/Icons";

const SIGN_GLYPHS: Record<string, React.ComponentType<any>> = {
  Aries: IconZodiacAries, Taurus: IconZodiacTaurus, Gemini: IconZodiacGemini, Cancer: IconZodiacCancer, 
  Leo: IconZodiacLeo, Virgo: IconZodiacVirgo, Libra: IconZodiacLibra, Scorpio: IconZodiacScorpio, 
  Sagittarius: IconZodiacSagittarius, Capricorn: IconZodiacCapricorn, Aquarius: IconZodiacAquarius, Pisces: IconZodiacPisces,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "love" | "attraction" | "friendship" | "growth";

interface SignMeta {
  name: string; element: string; modality: string;
  glyph: string; keywords: string[]; rulingPlanet: string;
}
interface ArchetypeMatch {
  sign: SignMeta; score: number;
  scores: { love: number; attraction: number; friendship: number; growth: number };
  headline: string; why: string; tension?: string;
}
interface MatchResult {
  best: ArchetypeMatch[];
  challenging: ArchetypeMatch[];
}

interface Person { id: string; name: string; birthDate: string; }
interface CompatibilityResult {
  overallScore: number;
  dimensions: { identity: number; stress: number; values: number; decisions: number };
  friction: string[]; synergy: string[]; growthOpportunities: string[];
  profile1Name?: string; profile2Name?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES: { key: Mode; label: string; glyph: React.ComponentType<any>; desc: string }[] = [
  { key: "love",       label: "Love",       glyph: IconHeart, desc: "Romantic depth & emotional resonance" },
  { key: "attraction", label: "Attraction", glyph: IconSparkles, desc: "Chemistry, desire & magnetic pull" },
  { key: "friendship", label: "Friendship", glyph: IconCircle, desc: "Ease, trust & long-term bond" },
  { key: "growth",     label: "Growth",     glyph: IconGrowth, desc: "Complementary gifts & evolution" },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "#f97316", Earth: "#84cc16", Air: "#38bdf8", Water: "#a78bfa",
};

const DIM_CONFIG = {
  identity:  { glyph: IconIdentity, color: "#D4A85F", label: "Identity" },
  stress:    { glyph: IconStress,   color: "#f59e0b", label: "Under Pressure" },
  values:    { glyph: IconCircle,   color: "#f472b6", label: "Values" },
  decisions: { glyph: IconDecisions,color: "#22d3ee", label: "Decisions" },
};

const FREE_LIMIT = 5;

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Deep Resonance",    color: "#22c55e" };
  if (score >= 65) return { text: "Strong Connection", color: "#22d3ee" };
  if (score >= 50) return { text: "Complex Dynamic",   color: "#f59e0b" };
  return                  { text: "Friction-Heavy",    color: "#ef4444" };
}

// ─── Small components ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const { color } = scoreLabel(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ - (circ * score) / 100}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>{score}</span>
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

function MatchCard({ match, mode, rank }: { match: ArchetypeMatch; mode: Mode; rank?: number }) {
  const [open, setOpen] = useState(false);
  const elColor = ELEMENT_COLORS[match.sign.element] || "#D4A85F";
  const { color: scoreColor, text: scoreText } = scoreLabel(match.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: elColor + "60", boxShadow: `0 12px 32px -12px ${elColor}33` }}
      onClick={() => setOpen(o => !o)}
      style={{
        background: "rgba(26,18,10,0.75)", border: `1px solid ${elColor}28`,
        borderTop: `3px solid ${elColor}`,
        borderRadius: "14px", padding: "1.25rem",
        cursor: "pointer", transition: "border-color 0.2s",
        position: "relative",
      }}
    >
      {rank !== undefined && (
        <div style={{
          position: "absolute", top: "0.75rem", right: "0.75rem",
          fontSize: "0.6rem", color: "var(--muted-foreground)",
          background: "rgba(255,255,255,0.06)", borderRadius: "99px",
          padding: "0.15rem 0.5rem", letterSpacing: "0.08em",
        }}>
          #{rank + 1}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <ScoreRing score={match.score} size={72} />
        <div style={{ flex: 1, minWidth: 0 }}>
            {(() => {
              const Glyph = SIGN_GLYPHS[match.sign.name];
              return Glyph ? <Glyph size={24} style={{ color: elColor }} /> : null;
            })()}
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--foreground)" }}>{match.sign.name}</span>
            <span style={{
              fontSize: "0.6rem", padding: "0.1rem 0.5rem",
              background: `${elColor}18`, border: `1px solid ${elColor}40`,
              borderRadius: "99px", color: elColor, letterSpacing: "0.07em",
            }}>{match.sign.element}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: scoreColor, fontWeight: 600, marginBottom: "0.35rem" }}>{scoreText}</div>
          <p style={{ fontSize: "0.8rem", color: "rgba(246,241,232,0.72)", margin: 0, lineHeight: 1.5 }}>{match.headline}</p>
        </div>
      </div>

      {/* Keywords */}
      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.85rem", flexWrap: "wrap" }}>
        {match.sign.keywords.map(k => (
          <span key={k} style={{
            fontSize: "0.62rem", padding: "0.15rem 0.55rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "99px", color: "var(--muted-foreground)",
          }}>{k}</span>
        ))}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "0.82rem", color: "rgba(246,241,232,0.82)", lineHeight: 1.7, marginBottom: "0.75rem" }}>{match.why}</p>
          {match.tension && (
            <p style={{ fontSize: "0.76rem", color: "#f59e0b", lineHeight: 1.6 }}>
              <span style={{ marginRight: "0.35rem" }}>⚠</span>{match.tension}
            </p>
          )}
          {/* Mini score grid by mode */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
            {(Object.entries(match.scores) as [Mode, number][]).map(([m, s]) => (
              <div key={m} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.2rem" }}>{m}</div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: m === mode ? "#D4A85F" : "var(--foreground)" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ChallengeCard({ match, mode }: { match: ArchetypeMatch; mode: Mode }) {
  const elColor = ELEMENT_COLORS[match.sign.element] || "#ef4444";
  return (
    <div style={{
      background: "rgba(26,14,8,0.7)", border: "1px solid rgba(239,68,68,0.18)",
      borderLeft: "3px solid rgba(239,68,68,0.45)", borderRadius: "12px",
      padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.85rem",
    }}>
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        {(() => {
          const Glyph = SIGN_GLYPHS[match.sign.name];
          return Glyph ? <Glyph size={24} style={{ color: elColor }} /> : null;
        })()}
        <div style={{ fontSize: "0.58rem", color: elColor, marginTop: "0.1rem" }}>{match.sign.element}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.2rem" }}>{match.sign.name}</div>
        <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 600, marginBottom: "0.2rem" }}>{match.score}% — {scoreLabel(match.score).text}</div>
        {match.tension && (
          <div style={{ fontSize: "0.75rem", color: "rgba(255,200,150,0.7)", lineHeight: 1.5 }}>{match.tension}</div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CompatibilityPage() {
  const [myProfile, setMyProfile]       = useState<any>(null);
  const [myProfileId, setMyProfileId]   = useState<string | null>(null);
  const [myConfidence, setMyConfidence] = useState<any>(null);
  const [persons, setPersons]           = useState<Person[]>([]);

  const [mode, setMode]             = useState<Mode>("love");
  const [matches, setMatches]       = useState<MatchResult | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [isAddOpen, setIsAddOpen]   = useState(false);
  const [result, setResult]         = useState<CompatibilityResult | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "", birthLocation: "" });

  const flash = (fn: (v: string | null) => void, msg: string) => {
    fn(msg); setTimeout(() => fn(null), 3500);
  };

  // Load profile from localStorage, then hydrate from server if signs missing
  useEffect(() => {
    const saved = localStorage.getItem("soulProfile");
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
    const savedConf = localStorage.getItem("soulConfidence");
    if (savedConf) { try { setMyConfidence(JSON.parse(savedConf)); } catch {} }

    // If localStorage profile is missing or lacks astrology signs, fetch from server
    const hasSigns = parsed?.sunSign || parsed?.astrologyData?.sunSign;
    if (!hasSigns) {
      apiFetch("/api/profiles")
        .then(r => r.ok ? r.json() : null)
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

  // Auto-save profile to backend when needed
  useEffect(() => {
    if (myProfile && !myProfileId && myProfile.name && (myProfile.birthDate || myProfile.dob)) {
      saveMyProfileMutation.mutate();
    }
  }, [myProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch archetype matches whenever profile or mode changes
  const fetchMatches = useCallback(() => {
    if (!myProfile) return;
    const sunSign = myProfile?.sunSign ?? myProfile?.astrologyData?.sunSign ?? myProfile?.astrology?.sun ?? myProfile?.astrology?.sunSign;
    if (!sunSign) return;
    const rawLp = myProfile?.numerology?.lifePath ?? myProfile?.numerologyData?.lifePathNumber ?? Number(myProfile?.soul_architecture?.expression);
    const lifePathNumber = rawLp || undefined;
    const hdType = myProfile?.humanDesign?.type ?? myProfile?.humanDesignData?.type;
    archetypeMatchMutation.mutate({ sunSign, lifePathNumber, hdType, mode });
  }, [myProfile, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const archetypeMatchMutation = useMutation({
    mutationFn: async (data: { sunSign: string; lifePathNumber?: number; hdType?: string; mode: Mode }) =>
      apiRequest("/api/compatibility/archetype-matches", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => setMatches(data),
    onError: (err: any) => console.warn("[archetype-matches]", err.message),
  });

  const saveMyProfileMutation = useMutation({
    mutationFn: async () => {
      const rawInputs = localStorage.getItem("onboardingData") || localStorage.getItem("soulUserInputs");
      let name: string | undefined, birthDate: string | undefined, birthTime: string | undefined, birthLocation: string | undefined;
      if (rawInputs) {
        const inputs = JSON.parse(rawInputs);
        name = inputs.name; birthDate = inputs.birthDate;
        birthTime = inputs.birthTime; birthLocation = inputs.birthLocation;
      }
      const p = myProfile;
      if (!name) name = p?.name;
      if (!birthDate) birthDate = p?.birthDate ?? p?.dob;
      if (!birthTime) birthTime = p?.birthTime;
      if (!birthLocation) birthLocation = p?.birthLocation ?? p?.location ?? p?.city;
      if (!name || !birthDate) throw new Error("Complete onboarding first.");
      return apiRequest("/api/profiles", {
        method: "POST",
        body: JSON.stringify({ name, birthDate, birthTime: birthTime || undefined, birthLocation: birthLocation || undefined }),
      });
    },
    onSuccess: (data: any) => {
      const id = data.id?.toString();
      localStorage.setItem("soulMyProfileId", id);
      setMyProfileId(id);
    },
    onError: (err: any) => console.warn("[save-profile]", err.message),
  });

  const addPersonMutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiRequest("/api/profiles", { method: "POST", body: JSON.stringify(data) }),
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
      return apiRequest("/api/compatibility", {
        method: "POST",
        body: JSON.stringify({ profile1Id: myProfileId, profile2Id: personId }),
      });
    },
    onSuccess: (data: any) => {
      const cd = data.compatibilityData || {};
      const dims = cd.dimensions || {};
      setResult({
        overallScore: data.overallScore ?? cd.overall ?? 0,
        dimensions: {
          identity:  dims.identity?.score  ?? dims.identity  ?? 0,
          stress:    dims.stress?.score    ?? dims.stress    ?? 0,
          values:    dims.values?.score    ?? dims.values    ?? 0,
          decisions: dims.decisions?.score ?? dims.decisions ?? 0,
        },
        friction:            cd.friction            || [],
        synergy:             cd.synergy             || [],
        growthOpportunities: cd.growthOpportunities || [],
        profile1Name: data.profile1?.name,
        profile2Name: data.profile2?.name,
      });
      setCompareOpen(true);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
    },
    onError: (err: any) => flash(setError, err.message || "Comparison failed"),
  });

  const sunSign  = myProfile?.sunSign  ?? myProfile?.astrologyData?.sunSign  ?? myProfile?.astrology?.sun  ?? myProfile?.astrology?.sunSign;
  const moonSign = myProfile?.moonSign ?? myProfile?.astrologyData?.moonSign ?? myProfile?.astrology?.moon ?? myProfile?.astrology?.moonSign;
  const rising   = myProfile?.risingSign ?? myProfile?.astrologyData?.risingSign ?? myProfile?.astrology?.rising ?? myProfile?.astrology?.risingSign;
  const rawLifePath = myProfile?.numerology?.lifePath ?? myProfile?.numerologyData?.lifePathNumber ?? Number(myProfile?.soul_architecture?.expression);
  const lifePath = rawLifePath || undefined;
  const hdType   = myProfile?.humanDesign?.type ?? myProfile?.humanDesignData?.type;

  const nearLimit = persons.length >= FREE_LIMIT - 1 && persons.length < FREE_LIMIT;
  const atLimit   = persons.length >= FREE_LIMIT;
  const modeInfo  = MODES.find(m => m.key === mode)!;

  return (
    <div style={{ padding: "2rem 1rem 5rem", maxWidth: 800, margin: "0 auto" }}>

      {/* ── Header ── */}
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem,5vw,2.25rem)" }}>
          Compatibility
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.88rem", marginTop: "0.35rem" }}>
          {sunSign
            ? `Your ${sunSign} blueprint ranked against all 12 signs`
            : "Complete your soul profile to see your matches"}
        </p>
      </section>

      {/* ── Toasts ── */}
      {error && (
        <div style={{ padding: "0.7rem 1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", color: "#ef4444", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>
      )}
      {success && (
        <div style={{ padding: "0.7rem 1rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "10px", color: "#22c55e", marginBottom: "1rem", fontSize: "0.85rem" }}>{success}</div>
      )}

      {/* ── My Blueprint Strip ── */}
      {myProfile && (
        <div style={{
          background: "rgba(26,14,8,0.72)", border: "1px solid rgba(212,168,95,0.2)",
          borderLeft: "3px solid #D4A85F", borderRadius: "14px",
          padding: "1.1rem 1.4rem", marginBottom: "1.75rem",
          display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconIdentity size={14} style={{ color: "#D4A85F" }} />
              {myProfile?.name || "My Blueprint"}
              {myConfidence && <ConfidenceBadge badge={myConfidence.badge} reason={myConfidence.reason} size="sm" />}
            </div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
              {([
                [IconSun, "Sun", sunSign], 
                [IconMoon, "Moon", moonSign], 
                [IconRising, "Rising", rising], 
                [IconHashtag, "LP", lifePath], 
                [IconGrowth, "HD", hdType]
              ] as [React.ComponentType<any>, string, string][])
                .filter(([,,v]) => v)
                .map(([icon, label, val]) => (
                  <span key={label} style={{
                    display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.18rem 0.6rem",
                    background: "rgba(212,168,95,0.1)", border: "1px solid rgba(212,168,95,0.22)",
                    borderRadius: "99px", fontSize: "0.68rem", color: "rgba(246,241,232,0.8)",
                  }}>
                  <icon.glyph size={12} style={{ color: "#D4A85F" }} />
                    <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </span>
                ))}
            </div>
          </div>
          {!myProfileId ? (
            <ScButton 
              onClick={() => saveMyProfileMutation.mutate()} 
              loading={saveMyProfileMutation.isPending} 
              size="sm"
              className="flex-shrink-0"
            >
              Link Profile
            </ScButton>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#22c55e", flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Linked
            </div>
          )}
        </div>
      )}

      {!sunSign ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: "rgba(28, 22, 53, 0.72)", border: "1px solid rgba(212,168,95,0.25)", borderRadius: "14px" }}>
          <IconIdentity size={48} style={{ margin: "0 auto 0.75rem", color: "#D4A85F", opacity: 0.6 }} />
          <p style={{ color: "rgba(234,234,245,0.7)", fontSize: "0.88rem", marginBottom: "1rem" }}>
            Complete your soul profile to unlock compatibility analysis.
          </p>
          <a href="/start" style={{ textDecoration: "none" }}>
            <button className="btn btn-primary">Complete Profile</button>
          </a>
        </div>
      ) : (
        <>
          {/* ── Relationship Mode Selector ── */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted-foreground)", marginBottom: "0.75rem" }}>
              Relationship context
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
              {MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  style={{
                    padding: "0.7rem 0.5rem",
                    background: mode === m.key ? "rgba(212,168,95,0.18)" : "rgba(26,14,8,0.65)",
                    border: `1px solid ${mode === m.key ? "rgba(212,168,95,0.55)" : "rgba(212,168,95,0.14)"}`,
                    borderRadius: "12px", cursor: "pointer",
                    color: mode === m.key ? "#D4A85F" : "var(--muted-foreground)",
                    fontSize: "0.72rem", fontWeight: mode === m.key ? 700 : 400,
                    textAlign: "center", transition: "all 0.18s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{m.glyph}</span>
                  {m.label}
                </button>
              ))}
            </div>
            {modeInfo && (
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.6rem", textAlign: "center" }}>
                {modeInfo.desc}
              </p>
            )}
          </div>

          {/* ── Best Matches ── */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#D4A85F", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <modeInfo.glyph size={14} /> Your Best Matches for {modeInfo?.label}
            </h2>

            {archetypeMatchMutation.isPending ? (
              <div className="py-12">
                <CosmicLoader label={`Seeking ${modeInfo?.label} Resonances…`} />
              </div>
            ) : matches?.best ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <AnimatePresence>
                  {matches.best.map((m, i) => (
                    <MatchCard key={m.sign.name} match={m} mode={mode} rank={i} />
                  ))}
                </AnimatePresence>
              </div>
            ) : null}
          </div>

          {/* ── Most Challenging ── */}
          {matches?.challenging && matches.challenging.length > 0 && (
            <div style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#ef4444", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconAlert size={14} /> Most Challenging for {modeInfo?.label}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {matches.challenging.map(m => (
                  <ChallengeCard key={m.sign.name} match={m} mode={mode} />
                ))}
              </div>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.75rem", lineHeight: 1.6 }}>
                Challenging doesn't mean impossible — it means more conscious effort is required on both sides.
              </p>
            </div>
          )}

          {/* ── Compare a Specific Person ── */}
          <div style={{
            background: "rgba(18,11,5,0.72)", border: "1px solid rgba(212,168,95,0.18)",
            borderRadius: "16px", overflow: "hidden", marginBottom: "1.5rem",
          }}>
            <button
              onClick={() => setCompareOpen(o => !o)}
              style={{
                width: "100%", padding: "1.1rem 1.4rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "none", border: "none", cursor: "pointer", color: "var(--foreground)",
                fontSize: "0.9rem", fontWeight: 600,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <IconCircle size={14} style={{ color: "var(--cosmic-pink)" }} />
                Compare a Specific Person
              </span>
              <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {compareOpen ? <><IconChevronUp size={12} /> Collapse</> : <><IconChevronDown size={12} /> Expand</>}
              </span>
            </button>

            {compareOpen && (
              <div style={{ padding: "0 1.4rem 1.4rem" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                  Enter someone's birth details to get a personalized synastry reading between your two blueprints.
                </p>

                {/* Limit banner */}
                {(nearLimit || atLimit) && (
                  <div style={{ padding: "0.75rem 1.1rem", marginBottom: "1rem", background: "rgba(212,168,95,0.07)", border: "1px solid rgba(212,168,95,0.28)", borderRadius: "10px", fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ color: "rgba(246,241,232,0.6)" }}>
                      {atLimit ? `Free limit reached (${FREE_LIMIT} people).` : `${FREE_LIMIT - persons.length} slot remaining.`}
                    </span>
                    <a href="/profile" style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", padding: "0.2rem 0.7rem", background: "rgba(212,168,95,0.15)", border: "1px solid rgba(212,168,95,0.4)", borderRadius: "99px", fontSize: "0.72rem", color: "#D4A85F", cursor: "pointer" }}>
                        Upgrade <IconSparkles size={10} style={{ display: "inline-block", marginLeft: "0.2rem" }} />
                      </span>
                    </a>
                  </div>
                )}

                {/* Add person form */}
                {!atLimit && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <ScButton 
                      variant="secondary" 
                      size="sm" 
                      className="mb-4"
                      onClick={() => setIsAddOpen(!isAddOpen)}
                    >
                      {isAddOpen ? "✕ Cancel" : "+ Add Person"}
                    </ScButton>
                    {isAddOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{ background: "rgba(15,20,40,0.65)", border: "1px dashed rgba(212,168,95,0.35)", borderRadius: "12px", padding: "1.25rem" }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1rem" }}>
                          {([["Name", "text", "name", "Name"], ["Birth Date", "date", "birthDate", ""], ["Birth Time (opt.)", "time", "birthTime", ""], ["Location (opt.)", "text", "birthLocation", "City"]] as [string, string, keyof typeof form, string][]).map(([label, type, key, ph]) => (
                            <div key={key} className="form-group" style={{ marginBottom: 0 }}>
                              <label className="label" style={{ fontSize: "0.72rem" }}>{label}</label>
                              <input className="input" type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                        <ScButton 
                          className="w-full"
                          onClick={() => addPersonMutation.mutate(form)} 
                          disabled={!form.name || !form.birthDate}
                          loading={addPersonMutation.isPending}
                        >
                          Add & Analyse
                        </ScButton>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Saved persons */}
                {persons.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "1.5rem", border: "1px dashed rgba(212,168,95,0.18)", borderRadius: "10px", fontSize: "0.82rem" }}>
                    No people added yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {persons.map(person => (
                      <div key={person.id} style={{ background: "rgba(15,20,40,0.55)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: "12px", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cosmic-rose)" }}>
                            <IconCircle size={18} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, margin: 0, fontSize: "0.88rem" }}>{person.name}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", margin: 0 }}>{person.birthDate}</p>
                          </div>
                        </div>
                        <ScButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => compareMutation.mutate(person.id)} 
                          loading={compareMutation.isPending && compareMutation.variables === person.id}
                        >
                          Compare
                        </ScButton>
                      </div>
                    ))}
                  </div>
                )}

                {/* Synastry Result */}
                {result && (
                  <div style={{ marginTop: "2rem", background: "rgba(15,20,40,0.7)", border: "1px solid rgba(212,168,95,0.22)", borderRadius: "16px", padding: "1.75rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <h3 className="gradient-text" style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", marginBottom: "0.3rem" }}>Synastry Reading</h3>
                      {(result.profile1Name || result.profile2Name) && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
                          {result.profile1Name} <span style={{ color: "rgba(212,168,95,0.6)" }}>×</span> {result.profile2Name}
                        </p>
                      )}
                    </div>

                    {/* Score ring */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}>
                      <ScoreRing score={result.overallScore} size={120} />
                      <div style={{ marginTop: "0.75rem" }}>
                        <span style={{ display: "inline-block", padding: "0.22rem 0.85rem", background: `${scoreLabel(result.overallScore).color}15`, border: `1px solid ${scoreLabel(result.overallScore).color}35`, borderRadius: "99px", fontSize: "0.76rem", fontWeight: 600, color: scoreLabel(result.overallScore).color }}>
                          {scoreLabel(result.overallScore).text}
                        </span>
                      </div>
                    </div>

                    {/* Dimension bars */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem", marginBottom: "1.5rem" }}>
                      {(Object.entries(DIM_CONFIG) as [keyof typeof DIM_CONFIG, typeof DIM_CONFIG[keyof typeof DIM_CONFIG]][]).map(([key, cfg]) => (
                        <DimensionBar key={key} label={cfg.label} glyph={cfg.glyph} color={cfg.color} score={result.dimensions[key]} />
                      ))}
                    </div>

                    <div style={{ height: 1, background: "rgba(212,168,95,0.1)", marginBottom: "1.25rem" }} />

                    {result.synergy.length > 0 && (
                      <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderLeft: "3px solid #22c55e", borderRadius: "12px", padding: "1.1rem 1.25rem", marginBottom: "0.85rem" }}>
                        <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#22c55e", textTransform: "uppercase", marginBottom: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <IconSparkles size={12} /> Where You Flow
                        </p>
                        {result.synergy.map((s, i) => <p key={i} style={{ fontSize: "0.83rem", color: "rgba(200,255,210,0.88)", marginBottom: "0.28rem", lineHeight: 1.65, display: "flex", alignItems: "center", gap: "0.4rem" }}><IconArrowRight size={12} style={{ color: "#22c55e", flexShrink: 0 }} />{s}</p>)}
                      </div>
                    )}

                    {result.growthOpportunities.length > 0 && (
                      <div style={{ background: "rgba(212,168,95,0.05)", border: "1px solid rgba(212,168,95,0.2)", borderLeft: "3px solid #D4A85F", borderRadius: "12px", padding: "1.1rem 1.25rem", marginBottom: "0.85rem" }}>
                        <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#D4A85F", textTransform: "uppercase", marginBottom: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <IconGrowth size={12} /> What This Can Build
                        </p>
                        {result.growthOpportunities.map((g, i) => <p key={i} style={{ fontSize: "0.83rem", color: "rgba(220,210,255,0.85)", marginBottom: "0.28rem", lineHeight: 1.65, display: "flex", alignItems: "center", gap: "0.4rem" }}><IconDecisions size={12} style={{ color: "#D4A85F", flexShrink: 0 }} />{g}</p>)}
                      </div>
                    )}

                    {result.friction.length > 0 && (
                      <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderLeft: "3px solid #f59e0b", borderRadius: "12px", padding: "1.1rem 1.25rem", marginBottom: "1.5rem" }}>
                        <p style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#f59e0b", textTransform: "uppercase", marginBottom: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <IconSquare size={10} /> Watch Points
                        </p>
                        {result.friction.map((f, i) => <p key={i} style={{ fontSize: "0.82rem", color: "rgba(255,240,200,0.82)", marginBottom: "0.28rem", lineHeight: 1.65, display: "flex", alignItems: "center", gap: "0.4rem" }}><IconAlert size={12} style={{ color: "#f59e0b", flexShrink: 0 }} />{f}</p>)}
                      </div>
                    )}

                    {/* ── RELATIONSHIP AUTOPSY (PREMIUM) ── */}
                    <div style={{
                      background: "rgba(20, 10, 35, 0.6)",
                      border: "1px solid rgba(157, 78, 221, 0.25)",
                      borderRadius: "16px",
                      padding: "1.5rem",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "4px",
                        background: "linear-gradient(90deg, #9D4EDD, #C77DFF)"
                      }} />
                      
                      <h4 style={{
                        fontFamily: "var(--font-serif)", color: "#C77DFF",
                        fontSize: "1rem", letterSpacing: "0.05em", marginBottom: "0.75rem",
                        textTransform: "uppercase"
                      }}>
                        Relationship Autopsy
                      </h4>
                      
                      <div style={{ opacity: 0.3, filter: "blur(4px)", pointerEvents: "none", userSelect: "none", marginBottom: "1.25rem" }}>
                        <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#EAEAF5", marginBottom: "0.5rem" }}>
                          "You move fast emotionally. They don't. That's where it breaks."
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "rgba(234, 234, 245, 0.6)" }}>
                          This connection eventually stalls because you prioritize the target while they prioritize the safety of the map...
                        </p>
                      </div>

                      <ScButton
                        className="w-full"
                        variant="secondary"
                        style={{ borderColor: "#9D4EDD", color: "#C77DFF" }}
                        onClick={() => window.location.href = "/profile"}
                      >
                        Unlock Surgical Autopsy <IconSparkles size={14} style={{ display: "inline-block", marginLeft: "0.4rem" }} />
                      </ScButton>
                      
                      <p style={{ fontSize: "0.65rem", color: "rgba(157, 78, 221, 0.6)", marginTop: "0.75rem" }}>
                        Expose the specific behavioral friction points that define your dynamic.
                      </p>
                    </div>
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
