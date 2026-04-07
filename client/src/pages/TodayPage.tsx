import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ConfidenceBadge from "@/components/ConfidenceBadge";

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
  "new moon": "🌑", "waxing crescent": "🌒", "first quarter": "🌓",
  "waxing gibbous": "🌔", "full moon": "🌕", "waning gibbous": "🌖",
  "third quarter": "🌗", "waning crescent": "🌘", "balsamic": "🌘",
};

const THEME_LABELS: Record<string, string> = {
  precision: "Precision", service: "Service", privacy: "Privacy",
  intensity: "Intensity", freedom: "Freedom", leadership: "Leadership",
  healing: "Healing", order: "Order", intuition: "Intuition",
  discipline: "Discipline", craft: "Craft", legacy: "Legacy",
  emotion_depth: "Depth", social_sensitivity: "Sensitivity",
  truth: "Truth", courage: "Courage",
};

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

function ShareButtons({ card }: { card: TodayCard }) {
  const [downloading, setDownloading] = useState<"square" | "story" | null>(null);

  async function download(format: "square" | "story") {
    setDownloading(format);
    try {
      const res = await fetch("/api/today/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card, format }),
      });
      if (!res.ok) throw new Error("Render failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `soul-codex-${format}-${card.date}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally     { setDownloading(null); }
  }

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
      <button className="btn btn-ghost" onClick={() => download("square")} disabled={!!downloading}
        style={{ fontSize: "0.78rem", padding: "0.45rem 1rem" }}>
        {downloading === "square" ? "Generating…" : "⬡ Square"}
      </button>
      <button className="btn btn-ghost" onClick={() => download("story")} disabled={!!downloading}
        style={{ fontSize: "0.78rem", padding: "0.45rem 1rem" }}>
        {downloading === "story" ? "Generating…" : "▮ Story"}
      </button>
    </div>
  );
}

export default function TodayPage() {
  const [, navigate] = useLocation();
  const [card, setCard]   = useState<TodayCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streak = useStreak();

  const cardMutation = useMutation({
    mutationFn: async (payload: any) => {
      const data = await apiRequest("/api/today/card", { method: "POST", body: JSON.stringify(payload) });
      if (!data.ok) throw new Error(data.error ?? "Failed to build card");
      return data.card as TodayCard;
    },
    onSuccess: (data) => {
      setCard(data);
      try { localStorage.setItem("soulTodayCard", JSON.stringify({ card: data, ts: Date.now() })); } catch {}
    },
    onError: (err: any) => setError(err.message ?? "Unknown error"),
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem("soulTodayCard");
      if (raw) {
        const { card: cached, ts } = JSON.parse(raw);
        if (cached?.date === todayStr && Date.now() - ts < 3600_000 * 4) { setCard(cached); return; }
      }
    } catch {}
    loadCard();
  }, []);

  function loadCard() {
    const rawProfile = localStorage.getItem("soulProfile");
    const rawCodex   = localStorage.getItem("soulCodexReading");
    if (!rawProfile) { setError("No profile found. Complete the onboarding first."); return; }
    let profile: any = {};
    let codexSynthesis: any = undefined;
    try { profile = JSON.parse(rawProfile ?? "{}"); } catch {}
    try { if (rawCodex) codexSynthesis = JSON.parse(rawCodex); } catch {}
    const profileId = profile?.id ?? profile?.profileId;
    cardMutation.mutate({ profileId, profile, codexSynthesis });
  }

  // Loading state
  if (cardMutation.isPending && !card) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "2rem" }}>
        <div style={{ fontSize: "2.5rem", animation: "spin 4s linear infinite" }}>☽</div>
        <p style={{ color: "var(--cosmic-lavender)", fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
          Reading today's signals…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    const noProfile = error.toLowerCase().includes("no profile") || error.toLowerCase().includes("onboarding");
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderTop: `3px solid ${noProfile ? "var(--cosmic-purple)" : "#ef4444"}`,
            borderRadius: "var(--radius)",
            padding: "2rem 1.75rem",
            textAlign: "center",
          }}>
            {noProfile ? (
              <>
                <div style={{ fontSize: "1.75rem", marginBottom: "1rem", color: "var(--cosmic-lavender)", opacity: 0.7 }}>☽</div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem", fontWeight: 600 }}>Today's Reading needs your profile</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                  Your daily card includes your moon phase, personal day number, and a tailored do/don't signal — all calculated from your birth data.
                </p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {["Moon phase", "Personal day", "Do · Don't signal"].map((f) => (
                    <span key={f} style={{ padding: "0.2rem 0.6rem", borderRadius: 99, fontSize: "0.7rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "var(--cosmic-lavender)" }}>{f}</span>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/")}>Build My Profile</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "1.5rem", marginBottom: "1rem", opacity: 0.5 }}>⚠</div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>Could not load today's card</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{error}</p>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setError(null); loadCard(); }}>Try Again</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const moonGlyph  = MOON_GLYPHS[(card.moonPhase ?? "").toLowerCase()] ?? "☽";
  const themeLabel = card.topTheme ? (THEME_LABELS[card.topTheme] ?? card.topTheme) : null;

  // Confidence data
  let confBadge  = card.confidenceLabel ?? "unverified";
  let confReason = "";
  try {
    const raw = localStorage.getItem("soulConfidence");
    if (raw) { const c = JSON.parse(raw); confBadge = c.badge ?? confBadge; confReason = c.reason ?? ""; }
  } catch {}

  return (
    <div style={{ minHeight: "100vh", padding: "1.5rem 1rem 4rem", maxWidth: "500px", margin: "0 auto" }}>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {/* Date */}
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
            {formatDate(card.date)}
          </span>
          {/* Moon + Confidence */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1rem" }}>{moonGlyph}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>
              {card.moonPhase}
            </span>
            <ConfidenceBadge badge={confBadge} reason={confReason} size="sm" />
          </div>
        </div>

        {/* Streak + Personal Day */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {card.personalDayNumber > 0 && (
            <div style={{
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "12px", padding: "0.4rem 0.75rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cosmic-lavender)", lineHeight: 1 }}>
                {card.personalDayNumber}
              </div>
              <div style={{ fontSize: "0.58rem", color: "var(--muted-foreground)", letterSpacing: "0.08em", marginTop: "0.15rem" }}>
                DAY {card.personalDayNumber}
              </div>
            </div>
          )}
          {streak > 0 && (
            <div style={{
              background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: "12px", padding: "0.4rem 0.75rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cosmic-gold)", lineHeight: 1 }}>
                {streak}
              </div>
              <div style={{ fontSize: "0.58rem", color: "var(--muted-foreground)", letterSpacing: "0.08em", marginTop: "0.15rem" }}>
                {streak === 1 ? "DAY" : "STREAK"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Title Card ────────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(15,20,40,0.75)", border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "16px", padding: "1.5rem", marginBottom: "0.75rem",
        borderTop: "3px solid var(--cosmic-purple)",
      }}>
        {themeLabel && (
          <span style={{
            display: "inline-block", marginBottom: "0.75rem",
            padding: "0.18rem 0.65rem",
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "99px", fontSize: "0.65rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--cosmic-lavender)",
          }}>
            {themeLabel}
          </span>
        )}
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--cosmic-gold)",
          marginBottom: "0.5rem", lineHeight: 1.15,
        }}>
          {card.title}
        </h1>
        <p style={{
          color: "rgba(232,230,255,0.72)", fontSize: "0.85rem",
          fontFamily: "var(--font-serif)", lineHeight: 1.65, margin: 0,
        }}>
          {card.focus}
        </p>
      </div>

      {/* ── Do / Don't ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
        <ListCard
          label="DO" color="#22c55e" bg="rgba(34,197,94,0.06)" border="rgba(34,197,94,0.2)"
          icon="✓" items={card.doList}
        />
        <ListCard
          label="DON'T" color="#ef4444" bg="rgba(239,68,68,0.06)" border="rgba(239,68,68,0.2)"
          icon="✕" items={card.dontList}
        />
      </div>

      {/* ── Watch-outs ────────────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "14px", padding: "1rem", marginBottom: "0.6rem",
      }}>
        <div style={labelStyle("#f59e0b")}>WATCH-OUTS</div>
        {card.watchouts.map((item, i) => (
          <div key={i} style={itemStyle("rgba(255,240,200,0.88)")}>
            <span style={{ color: "#f59e0b", flexShrink: 0 }}>▪</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* ── Decision Advice ───────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "14px", padding: "1rem", marginBottom: "1.5rem",
        display: "flex", gap: "0.75rem", alignItems: "flex-start",
      }}>
        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.1rem", color: "var(--cosmic-lavender)" }}>◈</span>
        <div>
          <div style={labelStyle("var(--cosmic-lavender)")}>DECISION ADVICE</div>
          <p style={{
            fontSize: "0.85rem", color: "rgba(232,230,255,0.9)",
            lineHeight: 1.65, margin: 0, fontFamily: "var(--font-serif)",
          }}>
            {card.decisionAdvice}
          </p>
        </div>
      </div>

      {/* ── Share ─────────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid rgba(139,92,246,0.15)",
        paddingTop: "1.25rem", marginBottom: "1.25rem",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
      }}>
        <span style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
          Share this card
        </span>
        <ShareButtons card={card} />
      </div>

      {/* ── Footer nav ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/codex")} style={{ fontSize: "0.78rem" }}>
          ✦ Codex
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/horoscope")} style={{ fontSize: "0.78rem" }}>
          ☽ Chart
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/profile")} style={{ fontSize: "0.78rem" }}>
          ◉ Profile
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            try { localStorage.removeItem("soulTodayCard"); } catch {}
            setCard(null); setError(null); loadCard();
          }}
          style={{ fontSize: "0.78rem", opacity: 0.55 }}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Codename watermark */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {card.codename}
        </span>
      </div>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function labelStyle(color: string): CSSProperties {
  return {
    fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase",
    color, marginBottom: "0.6rem", fontWeight: 700,
  };
}

function itemStyle(color: string): CSSProperties {
  return {
    fontSize: "0.8rem", color, lineHeight: 1.6, marginBottom: "0.2rem",
    display: "flex", gap: "0.35rem",
  };
}

function ListCard({
  label, color, bg, border, icon, items,
}: {
  label: string; color: string; bg: string; border: string; icon: string; items: string[];
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "14px", padding: "1rem" }}>
      <div style={labelStyle(color)}>{label}</div>
      {items.map((item, i) => (
        <div key={i} style={itemStyle(label === "DO" ? "rgba(232,255,232,0.85)" : "rgba(255,220,220,0.85)")}>
          <span style={{ color, flexShrink: 0 }}>{icon}</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
