import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TodaySkeleton from "@/components/TodaySkeleton";
import { 
  IconToday, IconMoon, IconGuide, IconTracker, 
  IconBlueprint, IconCodex, IconTimeline, IconIdentity,
  IconSparkles, IconAlert, IconRefresh, IconDiamond,
  IconCircle, IconMoonNew, IconMoonWaxingCrescent,
  IconMoonFirstQuarter, IconMoonWaxingGibbous, IconMoonFull,
  IconMoonWaningGibbous, IconMoonThirdQuarter, IconMoonWaningCrescent,
  IconLogo, IconInfo
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

/**
 * Aggressively cleans all technical artifacts and legacy signals from the text.
 */
function pureText(text: string): string {
  if (!text) return "";
  
  // 1. Remove greedy system prefixes like 'hj|1221-12-12|fix|chaoschaos' or 'rg | 1990... | talkwithdraw | chaosrepetition'
  // We look for patterns of lowercase tags and pipes that end before the first real sentence marker
  let cleaned = text.replace(/^[a-z]{2,3}\s*\|[^A-Z]+(?=[A-Z])/i, "");
  
  // 2. If it still starts with artifacts (e.g. 'talkwithdraw|chaosrepetition, I operate...')
  // Purge up to the first comma or capital letter
  cleaned = cleaned.replace(/^[a-z|,\s]+(?=[A-Z])/i, "").trim();

  // 3. Purge specific leakage tokens that might still be embedded
  const leakageTokens = [
    /chaosrepetition/gi, /talkwithdraw/gi, /chaoschaos/gi,
    /chaos/gi, /repetition/gi, /fix/gi, /withdraw/gi,
    /talk/gi, /analyze/gi, /hj\s*\|/gi, /rg\s*\|/gi
  ];
  
  leakageTokens.forEach(pat => {
    cleaned = cleaned.replace(pat, "");
  });

  // 4. Final Polish: trim, remove leading comma/pipes, capitalize
  cleaned = cleaned.replace(/^[,|.\s]+/, "").trim();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function getProfile() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 460, width: "100%" }}>
        <div style={{ background: "rgba(26, 11, 46, 0.65)", border: "1px solid rgba(255, 215, 0, 0.25)", borderTop: "3px solid var(--sc-gold)", borderRadius: 14, padding: "2.25rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "var(--sc-gold)" }}><IconMoon size={24} /></div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.65rem", color: "var(--sc-ivory)" }}>Your daily reading isn't ready yet</h2>
          <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>To generate your daily strategist dashboard, we need your profile first.</p>
          <button className="btn btn-primary" style={{ width: "100%", fontSize: "0.9rem" }} onClick={onStart}>Finish My Profile</button>
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
    if (profile && !cardMutation.isPending) {
      const cachedRaw = localStorage.getItem("soulTodayCard");
      if (cachedRaw) {
        try {
          const { card: cached, ts } = JSON.parse(cachedRaw);
          if (cached?.date === todayStr && Date.now() - ts < 3600_000 * 2) return;
        } catch(e) {}
      }
      cardMutation.mutate({ profile });
    }
  }, [profile]);

  if (!profile) return <WelcomeScreen onStart={() => navigate("/start")} />;
  if (cardMutation.isPending && !card) return <TodaySkeleton />;

  function refresh() {
    localStorage.removeItem("soulTodayCard");
    setCard(null);
    setError(null);
    cardMutation.mutate({ profile });
  }

  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 420, width: "100%", background: "rgba(26, 11, 46, 0.65)", border: "1px solid rgba(255, 215, 0, 0.25)", borderTop: "3px solid #ef4444", borderRadius: 12, padding: "2rem 1.75rem", textAlign: "center" }}>
          <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>Profile Calibration Required</h3>
          <p style={{ color: "var(--sc-text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{error}</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={refresh}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const archetypeName = profile?.archetypeData?.codename || card.codename || "The Seeker";
  const synthesis = profile?.archetypeData?.synthesis || profile?.archetypeData || {};

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "1.5rem 1.5rem 4rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Luminous Logo Header */}
        <div style={{ textAlign: "center", paddingBottom: "2.5rem", paddingTop: "0.5rem" }}>
          <IconLogo size={120} className="sc-luminous-logo" />
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sc-ivory)", marginTop: "0.75rem", fontWeight: 500, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            Soul Codex
          </h1>
          <div style={{ fontSize: "0.7rem", color: "var(--sc-gold)", letterSpacing: "0.12em", marginTop: "0.4rem", opacity: 0.8 }}>
            {formatDate(card.date)}
            {streak > 0 && <span style={{ marginLeft: "1rem" }}><IconDiamond size={10} /> Day {streak}</span>}
          </div>
        </div>

        {/* 1. MY IDENTITY */}
        <div className="glassmorphism" style={{ padding: "2.5rem 2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(212, 168, 95, 0.25)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, transparent, var(--sc-gold), transparent)" }} />
          
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-oracle)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--sc-gold)", opacity: 0.8, textTransform: "uppercase", marginBottom: "0.5rem" }}>
              1. MY IDENTITY
            </h2>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "0.5rem" }}>
              {archetypeName}
            </div>
            <div className="neptune-whisper" style={{ fontSize: "0.75rem", opacity: 0.8 }}>
              {profile?.archetypeData?.archetype?.element?.toUpperCase()} · {profile?.archetypeData?.archetype?.role?.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "2rem", padding: "1.25rem", background: "rgba(212, 168, 95, 0.05)", borderRadius: "16px", border: "1px solid rgba(212, 168, 95, 0.1)" }}>
            <div>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--sc-gold)", opacity: 0.7, textTransform: "uppercase", marginBottom: "0.25rem" }}>HD Type</div>
              <div style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{profile?.humanDesignData?.type || "Generator"}</div>
            </div>
            <div style={{ width: 1, background: "rgba(212, 168, 95, 0.2)" }} />
            <div>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--sc-gold)", opacity: 0.7, textTransform: "uppercase", marginBottom: "0.25rem" }}>Authority</div>
              <div style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{profile?.humanDesignData?.authority || "Sacral"}</div>
            </div>
            <div style={{ width: 1, background: "rgba(212, 168, 95, 0.2)" }} />
            <div>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--sc-gold)", opacity: 0.7, textTransform: "uppercase", marginBottom: "0.25rem" }}>Profile</div>
              <div style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>{profile?.humanDesignData?.profile || "5/1"}</div>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--foreground)", opacity: 0.9, marginTop: "2rem", fontStyle: "italic", maxWidth: "600px", margin: "2rem auto 0" }}>
            "I move through life as the {archetypeName}."
          </p>
        </div>

        {/* 2. MY PATTERN */}
        <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(183, 148, 244, 0.2)" }}>
          <h2 style={{ fontFamily: "var(--font-oracle)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--sc-purple-light)", opacity: 0.8, textTransform: "uppercase", marginBottom: "1.25rem" }}>
            2. MY PATTERN
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--foreground)", opacity: 0.9 }}>
            {pureText(synthesis.myPattern) || "Aligning your natal and behavioral signals..."}
          </p>
        </div>

        {/* 3. WHAT’S ALIVE NOW */}
        <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(212, 168, 95, 0.2)" }}>
          <h2 style={{ fontFamily: "var(--font-oracle)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "var(--sc-gold)", opacity: 0.8, textTransform: "uppercase", marginBottom: "1.25rem" }}>
            3. WHAT’S ALIVE NOW
          </h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(212, 168, 95, 0.1)", border: "1px solid rgba(212, 168, 95, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconMoon size={20} style={{ color: "var(--sc-gold)" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--foreground)", marginBottom: "0.5rem" }}>{card.title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(246, 241, 232, 0.75)" }}>{card.focus}</p>
            </div>
          </div>
        </div>

        {/* 4. ONE PATTERN TO WATCH */}
        <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", border: "1px solid rgba(239, 68, 68, 0.25)", background: "rgba(239, 68, 68, 0.03)" }}>
          <h2 style={{ fontFamily: "var(--font-oracle)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#ef4444", opacity: 0.8, textTransform: "uppercase", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            4. ONE PATTERN TO WATCH <IconAlert size={12} />
          </h2>
          <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--foreground)" }}>
            {card.watchouts?.[0] || "No critical loops detected today."}
          </p>
        </div>

        {/* 5. ONE MOVE TODAY */}
        <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "3rem", border: "1px solid rgba(34, 197, 94, 0.25)", background: "rgba(34, 197, 94, 0.03)" }}>
          <h2 style={{ fontFamily: "var(--font-oracle)", fontSize: "0.7rem", letterSpacing: "0.2em", color: "#22c55e", opacity: 0.8, textTransform: "uppercase", marginBottom: "1.25rem" }}>
            5. ONE MOVE TODAY
          </h2>
          <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--foreground)" }}>
            {card.decisionAdvice || "Operate from your core signature."}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "3rem" }}>
          <button className="btn btn-secondary" style={{ padding: "1.25rem" }} onClick={() => navigate("/profile")}>
            Explore Your Soul Map
          </button>
          <button className="btn btn-secondary" style={{ padding: "1.25rem" }} onClick={() => navigate("/codex")}>
            Open Codex Reading
          </button>
        </div>

        {/* Footer Actions */}
        <div style={{ textAlign: "center", opacity: 0.5 }}>
          <button onClick={refresh} className="btn btn-ghost" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <IconRefresh size={14} /> REFRESH SIGNALS
          </button>
        </div>

      </div>
    </div>
  );
}
