import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TodayCard {
  codename: string;
  title: string;
  focus: string;
  doList: string[];
  dontList: string[];
  watchouts: string[];
  decisionAdvice: string;
  moonPhase: string;
  personalDayNumber: number;
  confidenceLabel: string;
  topTheme?: string;
  date: string;
}

const MOON_GLYPHS: Record<string, string> = {
  "new moon": "◌", "waxing crescent": "◑", "first quarter": "◑",
  "waxing gibbous": "●", "full moon": "●", "waning gibbous": "◕",
  "third quarter": "◐", "waning crescent": "◐", "balsamic": "◐",
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
          <div style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "var(--sc-gold)" }}>☽</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.65rem", color: "var(--sc-ivory)" }}>
            Your daily reading isn't ready yet
          </h2>
          <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            Today's page shows your daily card, the active moon phase, and signals drawn from your behavioral and birth patterns. To generate it, we need your profile first.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem", textAlign: "left" }}>
            {[
              { glyph: "◉", label: "Daily archetype card", desc: "A focused signal for who you're operating as today" },
              { glyph: "☽", label: "Moon phase + transit", desc: "The cosmic context overlaying your patterns right now" },
              { glyph: "✦", label: "Active behavioral signals", desc: "What your pressure and decision patterns say about today" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.6rem 0.75rem", background: "rgba(212,168,95,0.04)", border: "1px solid rgba(212,168,95,0.1)", borderRadius: 8 }}>
                <span style={{ color: "rgba(212,168,95,0.7)", fontSize: "0.85rem", marginTop: "0.05rem", flexShrink: 0 }}>{item.glyph}</span>
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
        <img src="/soul-codex-logo-star.png" alt="" style={{ width: 72, height: 72, opacity: 0.7, animation: "spin 6s linear infinite", filter: "drop-shadow(0 0 14px rgba(212,168,95,0.4))" }} />
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
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.5 }}>⚠</div>
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

  const moonGlyph = MOON_GLYPHS[(card.moonPhase ?? "").toLowerCase()] ?? "☽";
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
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>

      {/* ── Hero: logo + title ──────────────────────────────────────────── */}
      <div style={{ textAlign: "center", paddingBottom: "1.75rem", paddingTop: "0.5rem" }}>
        <img
          src="/soul-codex-logo-star.png"
          alt="Soul Codex"
          style={{ width: 110, height: 110, filter: "drop-shadow(0 0 28px rgba(212,168,95,0.55)) drop-shadow(0 0 60px rgba(200,130,60,0.25))" }}
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
          {streak > 0 && <span style={{ marginLeft: "0.75rem", opacity: 0.8 }}>◆ Day {streak}</span>}
        </div>
      </div>

      {/* ── Main content grid ───────────────────────────────────────────── */}
      <div className="today-grid-main" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.75fr", gap: "0.9rem", marginBottom: "0.9rem" }}>

        {/* Soul Snapshot */}
        <div style={{ ...cardStyle, padding: "1.4rem" }}>
          <div style={labelStyle}>Soul Snapshot ✦</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem", color: "var(--sc-gold)", opacity: 0.85 }}>{moonGlyph}</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 600, color: "var(--sc-ivory)", lineHeight: 1.1 }}>
              {archetypeName}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "rgba(246,241,232,0.72)", fontSize: "0.82rem", marginBottom: "1.1rem", lineHeight: 1.55 }}>
            {archetypeTagline}
          </p>
          {/* My Pattern - Hero Element */}
          <div style={{ 
            marginTop: "1.2rem", 
            marginBottom: "1.5rem", 
            padding: "1.2rem", 
            background: "rgba(212,168,95,0.05)", 
            border: "1px solid rgba(212,168,95,0.15)", 
            borderRadius: 12,
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 700, opacity: 0.8, marginBottom: "0.6rem" }}>My Pattern</div>
            <div style={{ 
              fontFamily: "var(--font-serif)", 
              fontSize: "1.1rem", 
              color: "var(--sc-ivory)", 
              lineHeight: 1.45,
              fontWeight: 500,
              fontStyle: "italic"
            }}>
              "{profile?.synthesis?.myPattern ?? (card.doList?.[0] ?? "—")}"
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem 1rem" }}>
            {[
              { label: "Today's Theme",   value: card.topTheme ? displayTheme(card.topTheme) : (card.title ?? "—") },
              { label: "Pattern to Watch",value: patternWatch },
              { label: "One Move Today",  value: oneMove },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sc-gold)", fontWeight: 700, opacity: 0.7, marginBottom: "0.2rem" }}>{label}</div>
                <div style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.85)", lineHeight: 1.45 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Update */}
        <div style={{ ...cardStyle, padding: "1.4rem" }}>
          <div style={labelStyle}>Energy Update ✦</div>
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
          <div style={labelStyle}>Daily Focus</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ color: "var(--sc-gold)", fontSize: "0.9rem", marginTop: "0.1rem", flexShrink: 0 }}>☽</span>
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
            ☽ Open Codex Reading
          </button>
        </div>
      </div>

      {/* ── Bottom row ──────────────────────────────────────────────────── */}
      <div className="today-grid-bottom" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.9rem" }}>

        {/* Growth Focus */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>Growth Focus</span>
            <span style={{ color: "var(--sc-gold)", fontSize: "0.7rem", opacity: 0.7 }}>✦</span>
          </div>
          {(card.doList ?? []).slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "0.78rem", color: "rgba(246,241,232,0.78)", lineHeight: 1.4 }}>
              <span style={{ color: "var(--sc-gold)", opacity: 0.7, flexShrink: 0 }}>◆</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Decision Guide */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>Decision Guide</span>
            <span style={{ color: "var(--sc-gold)", fontSize: "0.7rem", opacity: 0.7 }}>✦</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.75)", fontFamily: "var(--font-serif)", lineHeight: 1.6, margin: 0 }}>
            {card.decisionAdvice ?? card.doList?.[0] ?? "—"}
          </p>
        </div>

        {/* One to Watch */}
        <div style={{ ...cardStyle, padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--sc-ivory)" }}>One to Watch</span>
            <span style={{ color: "var(--sc-gold)", fontSize: "0.7rem", opacity: 0.7 }}>☽</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(246,241,232,0.75)", lineHeight: 1.6, margin: 0 }}>
            {card.watchouts?.[1] ?? card.dontList?.[0] ?? card.watchouts?.[0] ?? "—"}
          </p>
        </div>
      </div>

      {/* ── Footer actions ───────────────────────────────────────────────── */}
      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/horoscope")} style={{ fontSize: "0.75rem" }}>◌ Chart</button>
        <button className="btn btn-ghost" onClick={() => navigate("/profile")} style={{ fontSize: "0.75rem" }}>◆ Profile</button>
        <button className="btn btn-ghost" onClick={refresh} style={{ fontSize: "0.75rem", opacity: 0.5 }}>↺ Refresh</button>
      </div>
    </div>
  </div>
  );
}
