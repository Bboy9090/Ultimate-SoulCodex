import { useState, useEffect } from "react";
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

const THEME_ICONS: Record<string, string> = {
  precision: "◈", service: "✦", privacy: "◉", intensity: "⬡",
  freedom: "◎", leadership: "▲", healing: "✿", order: "⊞",
  innovation: "⚙", intuition: "☽", discipline: "⬛", rebellion: "⚡",
  craft: "⬟", legacy: "⧫", emotion_depth: "◇", social_sensitivity: "◌",
  truth: "◆", boundaries: "▪", courage: "▶", focus: "⊕",
};

const MOON_GLYPHS: Record<string, string> = {
  "new moon": "🌑", "waxing crescent": "🌒", "first quarter": "🌓",
  "waxing gibbous": "🌔", "full moon": "🌕", "waning gibbous": "🌖",
  "third quarter": "🌗", "waning crescent": "🌘", "balsamic": "🌘"
};

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
      const newCount = count + 1;
      localStorage.setItem("soulStreakCount", String(newCount));
      localStorage.setItem("soulStreakDate", today);
      setStreak(newCount);
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
        body: JSON.stringify({ card, format })
      });
      if (!res.ok) throw new Error("Render failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soul-codex-${format}-${card.date}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
      <button
        className="btn btn-ghost"
        onClick={() => download("square")}
        disabled={!!downloading}
        style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
      >
        {downloading === "square" ? "Generating…" : "⬡ Share Square"}
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => download("story")}
        disabled={!!downloading}
        style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
      >
        {downloading === "story" ? "Generating…" : "▮ Share Story"}
      </button>
    </div>
  );
}

export default function TodayPage() {
  const [, navigate] = useLocation();
  const [card, setCard] = useState<TodayCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeThemes, setActiveThemes] = useState<{ tag: string; score: number }[]>([]);
  const streak = useStreak();

  const cardMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("/api/today/card", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error ?? "Failed to build card");
      return data.card as TodayCard;
    },
    onSuccess: (data) => {
      setCard(data);
      try {
        localStorage.setItem("soulTodayCard", JSON.stringify({ card: data, ts: Date.now() }));
      } catch {}
    },
    onError: (err: any) => setError(err.message ?? "Unknown error")
  });

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      const raw = localStorage.getItem("soulTodayCard");
      if (raw) {
        const { card: cached, ts } = JSON.parse(raw);
        if (cached?.date === todayStr && Date.now() - ts < 3600_000 * 4) {
          setCard(cached);
          loadThemes();
          return;
        }
      }
    } catch {}
    loadCard();
  }, []);

  function loadThemes() {
    try {
      const rawCodex = localStorage.getItem("soulCodexReading");
      if (rawCodex) {
        const codex = JSON.parse(rawCodex);
        if (Array.isArray(codex?.topThemes)) {
          setActiveThemes(codex.topThemes.slice(0, 3));
        }
      }
    } catch {}
  }

  function loadCard() {
    const rawProfile = localStorage.getItem("soulProfile");
    const rawCodex   = localStorage.getItem("soulCodexReading");
    if (!rawProfile) { setError("No profile found. Complete the onboarding first."); return; }

    let profile: any = {};
    let codexSynthesis: any = undefined;
    try { profile = JSON.parse(rawProfile ?? "{}"); } catch {}
    try { if (rawCodex) codexSynthesis = JSON.parse(rawCodex); } catch {}

    if (codexSynthesis?.topThemes) {
      setActiveThemes(codexSynthesis.topThemes.slice(0, 3));
    }

    const profileId = profile?.id ?? profile?.profileId;
    cardMutation.mutate({ profileId, profile, codexSynthesis });
  }

  if (cardMutation.isPending && !card) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem" }}>
        <div style={{ fontSize: "2.5rem", animation: "spin 4s linear infinite" }}>☽</div>
        <p style={{ color: "var(--cosmic-lavender)", fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
          Reading today's signals…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "2rem" }}>⚠</div>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Start Onboarding</button>
      </div>
    );
  }

  if (!card) return null;

  const moonGlyph = MOON_GLYPHS[(card.moonPhase ?? "").toLowerCase()] ?? "☽";
  const conf = card.confidenceLabel as any;

  return (
    <div style={{ minHeight: "100vh", padding: "1.5rem 1rem", maxWidth: "520px", margin: "0 auto" }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "1.3rem" }}>{moonGlyph}</span>
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {card.moonPhase}
            </span>
          </div>
          <ConfidenceBadge badge={conf} size="sm" />
        </div>
        {streak > 0 && (
          <div style={{
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "12px", padding: "0.4rem 0.75rem", textAlign: "center"
          }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--cosmic-gold)" }}>
              {streak}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", letterSpacing: "0.08em" }}>
              {streak === 1 ? "DAY" : "DAY STREAK"}
            </div>
          </div>
        )}
      </div>

      {/* Title Card */}
      <div style={{
        background: "rgba(15,20,40,0.7)", border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem",
        borderTop: "3px solid var(--cosmic-purple)"
      }}>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--cosmic-gold)",
          marginBottom: "0.35rem", lineHeight: 1.15
        }}>
          {card.title}
        </h1>
        <p style={{ color: "rgba(232,230,255,0.7)", fontSize: "0.82rem", fontFamily: "var(--font-serif)", lineHeight: 1.6 }}>
          {card.focus}
        </p>
      </div>

      {/* Active Themes */}
      {activeThemes.length > 0 && (
        <div style={{
          display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem"
        }}>
          {activeThemes.map(t => (
            <span key={t.tag} style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: "8px", padding: "0.25rem 0.65rem",
              fontSize: "0.75rem", color: "var(--cosmic-lavender)"
            }}>
              <span style={{ opacity: 0.7 }}>{THEME_ICONS[t.tag] ?? "◈"}</span>
              {t.tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Do / Don't */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div style={{
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "14px", padding: "1rem"
        }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#22c55e", marginBottom: "0.6rem", fontWeight: 700 }}>
            DO
          </div>
          {card.doList.map((item, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: "rgba(232,255,232,0.85)", lineHeight: 1.6, marginBottom: "0.25rem", display: "flex", gap: "0.35rem" }}>
              <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div style={{
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "14px", padding: "1rem"
        }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#ef4444", marginBottom: "0.6rem", fontWeight: 700 }}>
            DON'T
          </div>
          {card.dontList.map((item, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: "rgba(255,220,220,0.85)", lineHeight: 1.6, marginBottom: "0.25rem", display: "flex", gap: "0.35rem" }}>
              <span style={{ color: "#ef4444", flexShrink: 0 }}>✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Watch-outs */}
      <div style={{
        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "14px", padding: "1rem", marginBottom: "0.75rem"
      }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "0.6rem", fontWeight: 700 }}>
          WATCH-OUTS
        </div>
        {card.watchouts.map((item, i) => (
          <div key={i} style={{ fontSize: "0.82rem", color: "rgba(255,240,200,0.88)", lineHeight: 1.65, marginBottom: "0.2rem", display: "flex", gap: "0.35rem" }}>
            <span style={{ color: "#f59e0b", flexShrink: 0 }}>▪</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Decision Advice */}
      <div style={{
        background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "14px", padding: "1rem", marginBottom: "1.25rem",
        display: "flex", gap: "0.75rem", alignItems: "flex-start"
      }}>
        <span style={{ fontSize: "1.2rem", flexShrink: 0, marginTop: "0.1rem" }}>◈</span>
        <div>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cosmic-lavender)", marginBottom: "0.4rem", fontWeight: 700 }}>
            DECISION ADVICE
          </div>
          <p style={{ fontSize: "0.85rem", color: "rgba(232,230,255,0.9)", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-serif)" }}>
            {card.decisionAdvice}
          </p>
        </div>
      </div>

      {/* Share */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", textAlign: "center", marginBottom: "0.75rem" }}>
          Share this card
        </div>
        <ShareButtons card={card} />
      </div>

      {/* Footer nav */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/codex")} style={{ fontSize: "0.8rem" }}>
          ✦ Codex Reading
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/horoscope")} style={{ fontSize: "0.8rem" }}>
          ☽ Full Chart
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => { try { localStorage.removeItem("soulTodayCard"); } catch {} setCard(null); setError(null); loadCard(); }}
          style={{ fontSize: "0.8rem", opacity: 0.6 }}
        >
          ↺ Refresh
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {card.codename}
        </span>
      </div>
    </div>
  );
}
