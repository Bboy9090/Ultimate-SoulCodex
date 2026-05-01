import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TodaySkeleton from "@/components/TodaySkeleton";
import { 
  IconToday, IconMoon, IconStar, IconGuide, IconTracker, 
  IconBlueprint, IconCodex, IconTimeline, IconIdentity,
  IconSparkles, IconAlert, IconRefresh, IconDiamond,
  IconCircle, IconMoonNew, IconMoonWaxingCrescent,
  IconMoonFirstQuarter, IconMoonWaxingGibbous, IconMoonFull,
  IconMoonWaningGibbous, IconMoonThirdQuarter, IconMoonWaningCrescent,
  IconLogo
} from "../components/Icons";

interface TodayCard {
  codename: string;
  title: string;
  focus: string;
  recognitionMoment: string;
  doList: string[];
  dontList: string[];
  watchouts: string[];
  decisionAdvice: string;
  moonPhase: string;
  personalDayNumber: number;
  confidenceLabel: string;
  topTheme?: string;
  date: string;
  tomorrowTension?: string;
  memoryCallout?: string;
}

const SECTION_ACCENTS: Record<string, { glyph: React.ComponentType<any>; color: string }> = {
  codename:  { glyph: IconToday,   color: "#D4A85F" },
  focus:     { glyph: IconGuide,   color: "#f59e0b" },
  actions:   { glyph: IconTracker, color: "#22c55e" },
  watchouts: { glyph: IconBlueprint, color: "#ef4444" },
  advice:    { glyph: IconBlueprint, color: "#22d3ee" },
  memory:    { glyph: IconCodex,   color: "#a78bfa" },
  tension:   { glyph: IconTimeline,color: "#f472b6" },
};

const MOON_GLYPHS: Record<string, React.ComponentType<any>> = {
  "new moon": IconMoonNew, 
  "waxing crescent": IconMoonWaxingCrescent, 
  "first quarter": IconMoonFirstQuarter,
  "waxing gibbous": IconMoonWaxingGibbous, 
  "full moon": IconMoonFull, 
  "waning gibbous": IconMoonWaningGibbous,
  "third quarter": IconMoonThirdQuarter, 
  "waning crescent": IconMoonWaningCrescent, 
  "balsamic": IconMoonThirdQuarter,
};

const THEME_DISPLAY: Record<string, string> = {
  precision: "Precision", service: "Service", privacy: "Discretion",
  intensity: "Intensity", freedom: "Freedom", leadership: "Leadership",
  healing: "Healing", order: "Order", innovation: "Innovation",
  intuition: "Intuition", discipline: "Discipline", rebellion: "Independence",
  craft: "Craft", legacy: "Legacy", emotion_depth: "Emotional Depth",
  social_sensitivity: "Social Attunement", truth: "Truth",
  boundaries: "Sovereignty", courage: "Courage", focus: "Focus",
};

function displayTheme(tag?: string): string {
  if (!tag) return "";
  return THEME_DISPLAY[tag] ?? tag.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function useStreak() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem("soulStreakDate") ?? "";
    const count = parseInt(localStorage.getItem("soulStreakCount") ?? "0", 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (lastVisit === today) {
      setStreak(count);
    } else if (lastVisit === yesterdayStr) {
      const n = count + 1;
      localStorage.setItem("soulStreakCount", String(n));
      localStorage.setItem("soulStreakDate", today);
      setStreak(n);
    } else {
      localStorage.setItem("soulStreakCount", "1");
      localStorage.setItem("soulStreakDate", today);
      setStreak(1);
    }
  }, []);
  return streak;
}

function getProfile() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 1.5rem",
    }}>
      <div style={{ maxWidth: 460, width: "100%" }}>
        <div style={{
          background: "rgba(26, 11, 46, 0.65)",
          border: "1px solid rgba(255, 215, 0, 0.25)",
          borderTop: "3px solid var(--sc-gold)",
          borderRadius: 14,
          padding: "2.25rem 2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "var(--sc-gold)" }}><IconMoon size={24} /></div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.65rem", color: "var(--sc-ivory)" }}>
            Your daily reading isn't ready yet
          </h2>
          <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            Today's page shows your daily card, the active moon phase, and signals drawn from your behavioral and birth patterns. To generate it, we need your profile first.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem", textAlign: "left" }}>
            {[
              { glyph: IconIdentity, label: "Daily archetype card", desc: "A focused signal for who you're operating as today" },
              { glyph: IconMoon, label: "Moon phase + transit", desc: "The cosmic context overlaying your patterns right now" },
              { glyph: IconSparkles, label: "Active behavioral signals", desc: "What your pressure and decision patterns say about today" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.6rem 0.75rem", background: "rgba(212,168,95,0.04)", border: "1px solid rgba(212,168,95,0.1)", borderRadius: 8 }}>
                <item.glyph size={14} style={{ color: "rgba(212,168,95,0.7)", flexShrink: 0, marginTop: "0.15rem" }} />
                <span>
                  <span style={{ fontWeight: 600, fontSize: "0.8rem", display: "block", color: "var(--sc-ivory)" }}>{item.label}</span>
                  <span style={{ color: "rgba(246,241,232,0.45)", fontSize: "0.73rem" }}>{item.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "0.9rem" }}
            onClick={onStart}
          >
            Finish My Profile
          </button>
          <p style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "rgba(246,241,232,0.25)", letterSpacing: "0.04em" }}>
            Takes about 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TodayPage() {
  const [, navigate] = useLocation();
  const [card, setCard] = useState<TodayCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const streak = useStreak();
  const profile = getProfile();

  // 1. Initial load from persistence (Zero Lag)
  useEffect(() => {
    const cached = localStorage.getItem("soulTodayCard");
    if (cached) {
      try {
        const { card: parsed } = JSON.parse(cached);
        if (parsed) setCard(parsed);
      } catch (e) {}
    }
  }, []);

  const cardMutation = useMutation({
    mutationFn: async (payload: any) => {
      setIsRefreshing(true);
      const res = await apiRequest("/api/today/card", { method: "POST", body: JSON.stringify(payload) });
      const data = res.card;
      if (!data) throw new Error("Failed to build card");
      return data as TodayCard;
    },
    onSuccess: (data) => {
      setCard(data);
      localStorage.setItem("soulTodayCard", JSON.stringify({ card: data, ts: Date.now() }));
      setError(null);
      setIsRefreshing(false);
    },
    onError: (err: any) => {
      if (!card) setError(err.message ?? "Unknown error");
      setIsRefreshing(false);
    },
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    // 2. Background Refresh if stale or missing
    if (profile && !cardMutation.isPending) {
      const cachedRaw = localStorage.getItem("soulTodayCard");
      if (cachedRaw) {
        try {
          const { card: cached, ts } = JSON.parse(cachedRaw);
          if (cached?.date === todayStr && Date.now() - ts < 3600_000 * 2) {
            // Already have fresh today's card
            return;
          }
        } catch(e) {}
      }
      cardMutation.mutate({ profile });
    }
  }, [profile]);

  if (!profile) return <WelcomeScreen onStart={() => navigate("/start")} />;

  // Show skeleton ONLY if we have absolutely NO card data yet
  if (cardMutation.isPending && !card) {
    return <TodaySkeleton />;
  }

  function loadCard() {
    const rawProfile = localStorage.getItem("soulProfile");
    const rawCodex = localStorage.getItem("soulCodexReading");
    if (!rawProfile) { setError("No profile found. Complete the onboarding first."); return; }
    let prof: any = {};
    let codexSynthesis: any = undefined;
    try { prof = JSON.parse(rawProfile ?? "{}"); } catch {}
    try { if (rawCodex) codexSynthesis = JSON.parse(rawCodex); } catch {}
    const profileId = prof?.id ?? prof?.profileId;
    cardMutation.mutate({ profileId, profile: prof, codexSynthesis });
  }

  function refresh() {
    try { localStorage.removeItem("soulTodayCard"); } catch {}
    setCard(null); setError(null); loadCard();
  }

  if (cardMutation.isPending && !card) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <IconLogo size={72} style={{ opacity: 0.7, animation: "spin 6s linear infinite", filter: "drop-shadow(0 0 14px rgba(212,168,95,0.4))" }} />
        <p style={{ color: "var(--sc-gold)", fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.04em" }}>
          Reading today's signals…
        </p>
      </div>
    );
  }

  if (error) {
    const noProfile = error.toLowerCase().includes("no profile") || error.toLowerCase().includes("onboarding");
    if (noProfile) {
      return <WelcomeScreen onStart={() => navigate("/start")} />;
    }
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 420, width: "100%", background: "rgba(26, 11, 46, 0.65)", border: "1px solid rgba(255, 215, 0, 0.25)", borderTop: "3px solid #ef4444", borderRadius: 12, padding: "2rem 1.75rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.5 }}><IconAlert size={24} /></div>
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>Profile Calibration Required</h3>
          <p style={{ color: "var(--sc-text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {error || "We couldn't load your daily reading. This usually happens if the birth data is invalid or if there's a temporary connection issue."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setError(null); loadCard(); }}>Try Again</button>
            <button 
              className="btn btn-ghost" 
              style={{ width: "100%", fontSize: "0.75rem", opacity: 0.6 }} 
              onClick={() => {
                if (confirm("Reset everything and use a different birthday?")) {
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
            >
              Reset & Use New Birthday
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const MoonIcon = MOON_GLYPHS[(card.moonPhase ?? "").toLowerCase()] ?? IconMoon;
  const archetypeName = profile?.archetype?.name ?? card.codename ?? "—";
  const archetypeTagline = profile?.archetype?.tagline ?? card.focus ?? "";
  const whoIAm = profile?.archetype?.element && profile?.archetype?.role
    ? `${profile.archetype.element} ${profile.archetype.role}`
    : (card.doList?.[0] ?? "—");
  const personalYear = profile?.numerology?.personalYear ?? card.personalDayNumber;
  const patternWatch = card.watchouts?.[0] ?? "—";
  const oneMove = card.decisionAdvice ?? "—";

  const cardStyle: CSSProperties = {
    background: "rgba(26, 11, 46, 0.65)",
    border: "1px solid rgba(255, 215, 0, 0.25)",
    borderRadius: 12,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  const labelStyle: CSSProperties = {
    fontSize: "0.58rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "var(--sc-gold)",
    fontWeight: 700,
    marginBottom: "0.35rem",
    opacity: 0.8,
  };

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "1.5rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 10 }}>

      <div style={{ textAlign: "center", paddingBottom: "1.75rem", paddingTop: "0.5rem" }}>
        <IconLogo
          size={110}
          className="sc-luminous-logo"
        />
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.45rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--sc-ivory)",
          marginTop: "0.65rem",
          fontWeight: 500,
          opacity: 0.92,
          textShadow: "0 2px 16px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.5)",
        }}>
          Soul Codex
        </div>
        <div style={{ fontSize: "0.68rem", color: "var(--sc-gold)", letterSpacing: "0.1em", marginTop: "0.3rem", opacity: 0.85, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
          {formatDate(card.date)}
          {streak > 0 && <span style={{ marginLeft: "0.75rem", opacity: 0.8, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}><IconDiamond size={10} /> Day {streak}</span>}
        </div>
      </div>

      {/* ── Main content grid ───────────────────────────────────────────── */}
      <div className="today-grid-main" style={{ marginBottom: "0.9rem" }}>

        {/* Soul Snapshot */}
        <div style={{ ...cardStyle, padding: "1.4rem" }}>
          <div style={labelStyle}>My Identity <IconSparkles size={10} style={{ verticalAlign: "middle" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem", color: "var(--sc-gold)", opacity: 0.85 }}>
              <MoonIcon size={20} />
            </span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 600, color: "var(--sc-ivory)", lineHeight: 1.1 }}>
              {archetypeName}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "rgba(246,241,232,0.72)", fontSize: "0.82rem", marginBottom: "1.1rem", lineHeight: 1.55 }}>
            {archetypeTagline}
          </p>
          {/* Memory Callout - If repeating a pattern */}
          {card.memoryCallout && (
            <div style={{
              marginBottom: "1.2rem",
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 12,
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#ef4444", fontWeight: 700, marginBottom: "0.4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>Loop Detected <IconAlert size={10} /></div>
              <div style={{ fontSize: "0.85rem", color: "var(--sc-ivory)", fontWeight: 500, fontStyle: "italic" }}>
                "{card.memoryCallout}"
              </div>
            </div>
          )}

          {/* Recognition Moment - Hero Element */}
          {card.recognitionMoment && (
            <div style={{ 
              marginTop: "1.2rem", 
              marginBottom: "1.5rem", 
              padding: "1.8rem 1.4rem", 
              background: "linear-gradient(135deg, rgba(212,168,95,0.1), rgba(212,168,95,0.02))", 
              border: "1px solid rgba(212,168,95,0.3)", 
              borderRadius: 16,
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              position: "relative"
            }}>
              <div style={{ 
                fontFamily: "var(--font-serif)", 
                fontSize: "1.25rem", 
                color: "var(--sc-ivory)", 
                lineHeight: 1.4,
                fontWeight: 500,
                fontStyle: "italic",
                textShadow: "0 2px 10px rgba(0,0,0,0.5)"
              }}>
                "{card.recognitionMoment}"
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem 1rem" }}>
            {[
              { label: "My Identity",   value: card.topTheme ? displayTheme(card.topTheme) : (card.title ?? "—") },
              { label: "One Pattern to Watch",value: patternWatch },
              { label: "One Move Today",  value: oneMove },
            ].map(({ label, value }) => {
              if (!value || value === "—" || value.toLowerCase().includes("unknown")) return null;
              return (
                <div key={label}>
                  <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 700, opacity: 0.7, marginBottom: "0.2rem" }}>{label}</div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.85)", lineHeight: 1.45 }}>{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Energy Update */}
        <div style={{ ...cardStyle, padding: "1.4rem" }}>
          <div style={labelStyle}>My Pattern <IconSparkles size={10} style={{ verticalAlign: "middle" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.9rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--sc-ivory)", opacity: 0.7, marginBottom: "0.1rem" }}>
                Personal {personalYear !== card.personalDayNumber ? "Year" : "Day"}
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(246,241,232,0.5)", letterSpacing: "0.06em" }}>
                {card.topTheme ? displayTheme(card.topTheme) : card.moonPhase}
              </div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(212,168,95,0.12)", border: "1.5px solid rgba(212,168,95,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 700, color: "var(--sc-gold)",
              flexShrink: 0,
            }}>
              {personalYear}
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "rgba(246,241,232,0.75)", lineHeight: 1.6, marginBottom: "1.1rem" }}>
            {card.focus}
          </p>

          {/* Tomorrow Tension Hook */}
          {card.tomorrowTension && (
            <div style={{
              marginTop: "1rem",
              marginBottom: "1.1rem",
              padding: "0.8rem",
              background: "rgba(255, 215, 0, 0.04)",
              border: "1px solid rgba(255, 215, 0, 0.15)",
              borderRadius: 10,
            }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 700, opacity: 0.8, marginBottom: "0.3rem" }}>Tomorrow Depends On Today</div>
              <div style={{ fontSize: "0.75rem", color: "var(--sc-ivory)", opacity: 0.8, fontStyle: "italic", lineHeight: 1.45 }}>
                {card.tomorrowTension}
              </div>
            </div>
          )}
          <button
            className="btn btn-secondary"
            style={{ width: "100%", fontSize: "0.75rem", padding: "0.5rem" }}
            onClick={() => navigate("/profile")}
          >
            Explore Your Soul Map
          </button>
        </div>

        {/* Daily Focus */}
        <div style={{ ...cardStyle, padding: "1.4rem" }}>
          <div style={labelStyle}>What’s Alive Now</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <IconMoon size={14} style={{ color: "var(--sc-gold)", marginTop: "0.1rem", flexShrink: 0 }} />
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", fontWeight: 600, color: "var(--sc-ivory)", lineHeight: 1.25, margin: 0 }}>
              {card.title}
            </h3>
          </div>
          <p style={{ fontSize: "0.77rem", color: "rgba(246,241,232,0.7)", lineHeight: 1.6, marginBottom: "1.1rem" }}>
            {card.doList?.[0] ?? card.focus}
          </p>
          <button
            className="btn btn-secondary"
            style={{ width: "100%", fontSize: "0.73rem", padding: "0.5rem" }}
            onClick={() => navigate("/codex")}
          >
            <IconMoon size={12} /> Open Codex Reading
          </button>
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────── */}
      <div className="today-grid-bottom">

        {/* Growth Focus */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>Growth Focus</span>
            <IconSparkles size={12} style={{ color: "var(--sc-gold)", opacity: 0.7 }} />
          </div>
          {(card.doList ?? []).slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.78rem", color: "rgba(246,241,232,0.78)", lineHeight: 1.4 }}>
              <IconDiamond size={8} style={{ color: "var(--sc-gold)", opacity: 0.7, flexShrink: 0, marginTop: "0.2rem" }} />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Decision Guide */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>Decision Guide</span>
            <IconSparkles size={12} style={{ color: "var(--sc-gold)", opacity: 0.7 }} />
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.75)", fontFamily: "var(--font-serif)", lineHeight: 1.6, margin: 0 }}>
            {card.decisionAdvice ?? card.doList?.[0] ?? "—"}
          </p>
        </div>

        {/* One to Watch */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>One to Watch</span>
            <IconMoon size={12} style={{ color: "var(--sc-gold)", opacity: 0.7 }} />
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.75)", lineHeight: 1.6, margin: 0 }}>
            {card.watchouts?.[1] ?? card.dontList?.[0] ?? card.watchouts?.[0] ?? "—"}
          </p>
        </div>
      </div>

      {/* ── Footer actions ───────────────────────────────────────────────── */}
      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/horoscope")} style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><IconCircle size={10} /> Chart</button>
        <button className="btn btn-ghost" onClick={() => navigate("/profile")} style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><IconDiamond size={10} /> Profile</button>
        <button className="btn btn-ghost" onClick={refresh} style={{ fontSize: "0.75rem", opacity: 0.5, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}><IconRefresh size={10} /> Refresh</button>
      </div>
    </div>
  </div>
  );
}
