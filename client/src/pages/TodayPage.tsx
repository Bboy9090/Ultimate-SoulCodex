import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TodaySkeleton from "@/components/TodaySkeleton";
import { 
  IconMoon, IconAlert, IconRefresh, IconDiamond,
  IconLogo, IconIdentity, IconCompass, IconZap
} from "../components/Icons";
import { cleanCodexLine } from "../lib/soul-codex/utils/cleanCodexLine";
import ConfidenceBadge from "@/components/ConfidenceBadge";

interface TodayCard {
  codename: string;
  title: string;
  focus: string;
  doList: string[];
  watchouts: string[];
  decisionAdvice: string;
  date: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function getProfile() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function TodayPage() {
  const [, navigate] = useLocation();
  const [card, setCard] = useState<TodayCard | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const res = await apiRequest("/api/today/card", { method: "POST", body: JSON.stringify(payload) });
      return res.card as TodayCard;
    },
    onSuccess: (data) => {
      setCard(data);
      localStorage.setItem("soulTodayCard", JSON.stringify({ card: data, ts: Date.now() }));
      setError(null);
    },
    onError: (err: any) => {
      if (!card) setError(err.message ?? "Unknown error");
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

  if (!profile) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="glassmorphism" style={{ maxWidth: 420, width: "100%", padding: "2.5rem", textAlign: "center", borderRadius: 24 }}>
          <IconIdentity size={48} style={{ color: "var(--sc-gold)", marginBottom: "1.5rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--sc-ivory)" }}>Building your Soul Codex...</h2>
          <p style={{ color: "var(--sc-stone)", marginBottom: "2rem" }}>Complete your profile to generate your daily strategist dashboard.</p>
          <button id="today-begin-onboarding-btn" className="btn btn-primary w-full" onClick={() => navigate("/start")}>Begin Onboarding</button>
        </div>
      </div>
    );
  }

  if (cardMutation.isPending && !card) return <TodaySkeleton />;

  function refresh() {
    localStorage.removeItem("soulTodayCard");
    setCard(null);
    setError(null);
    cardMutation.mutate({ profile });
  }

  if (error) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="glassmorphism" style={{ maxWidth: 420, width: "100%", padding: "2rem", textAlign: "center", borderTop: "4px solid var(--sc-danger)" }}>
          <h3 style={{ color: "var(--sc-danger)", marginBottom: "1rem" }}>Calibration Delayed</h3>
          <p style={{ color: "var(--sc-stone)", marginBottom: "1.5rem" }}>{error}</p>
          <button id="today-try-again-btn" className="btn btn-primary w-full" onClick={refresh}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="nebula-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="glassmorphism" style={{ maxWidth: 420, width: "100%", padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--sc-stone)" }}>Today’s guidance is still forming. Check back after your profile is complete.</p>
        </div>
      </div>
    );
  }

  const archetypeName = profile?.archetype?.name || "The Seeker";
  const archetypeTagline = profile?.archetype?.tagline || "Aligning your natal signals...";
  
  const pattern = cleanCodexLine(
    profile.synthesis?.coreEssence || (profile.archetypeData as any)?.synthesis?.myPattern,
    "Your pattern needs verified chart data before it can be locked."
  );

  const dailyTheme = cleanCodexLine(card.title, "Calibrating daily focus...");
  const dailyFocus = cleanCodexLine(card.focus, "Observe the current state before making your next move.");
  
  const watchout = cleanCodexLine(
    card.watchouts?.[0],
    "Rushing the next step before the signal is clear."
  );
  
  const oneMove = cleanCodexLine(
    card.decisionAdvice,
    "Audit the current state before making the next move."
  );

  return (
    <div className="nebula-bg" style={{ minHeight: "100vh", padding: "var(--safe-top) 1.5rem var(--safe-bottom)" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: "6rem" }}>
        
        {/* Header Logo */}
        <div style={{ textAlign: "center", paddingTop: "2rem", marginBottom: "3rem" }}>
          <IconLogo size={80} className="sc-luminous-logo" />
          <div style={{ marginTop: "1rem", fontSize: "0.7rem", color: "var(--sc-gold)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {formatDate(card.date)}
          </div>
        </div>

        <div className="stagger">
          {/* 1. MY IDENTITY */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", textAlign: "center" }}>
            <h2 className="section-label" style={{ color: "var(--sc-gold)", marginBottom: "1.25rem" }}>1. MY IDENTITY</h2>
            <h1 className="heading-display" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{archetypeName}</h1>
            <p className="oracle-text" style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>{archetypeTagline}</p>
            
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <ConfidenceBadge 
                badge={profile.confidence?.badge || "unverified"} 
                label={profile.confidence?.label}
                reason={profile.confidence?.reason}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Type</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{profile.humanDesignData?.type || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Auth</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{profile.humanDesignData?.authority || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--sc-stone)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Profile</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{profile.humanDesignData?.profile || "—"}</div>
              </div>
            </div>
          </div>

          {/* 2. MY PATTERN */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem" }}>
            <h2 className="section-label" style={{ marginBottom: "1rem" }}>2. MY PATTERN</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--sc-ivory)" }}>{pattern}</p>
          </div>

          {/* 3. WHAT’S ALIVE NOW */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", borderLeft: "4px solid var(--sc-gold)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-gold)", marginBottom: "1rem" }}>3. WHAT’S ALIVE NOW</h2>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--sc-ivory)" }}>{dailyTheme}</h3>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.6, color: "var(--sc-stone)" }}>{dailyFocus}</p>
          </div>

          {/* 4. ONE PATTERN TO WATCH */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "1.5rem", background: "rgba(236, 72, 153, 0.05)", borderLeft: "4px solid var(--sc-danger)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-danger)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              4. ONE PATTERN TO WATCH <IconAlert size={14} />
            </h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--sc-ivory)" }}>{watchout}</p>
          </div>

          {/* 5. ONE MOVE TODAY */}
          <div className="glassmorphism" style={{ padding: "2rem", borderRadius: "24px", marginBottom: "2rem", background: "rgba(45, 226, 255, 0.05)", borderLeft: "4px solid var(--sc-cyan)" }}>
            <h2 className="section-label" style={{ color: "var(--sc-cyan)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              5. ONE MOVE TODAY <IconZap size={14} />
            </h2>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--sc-ivory)" }}>{oneMove}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <button id="today-soul-map-btn" className="btn btn-secondary" onClick={() => navigate("/profile")}>
             <IconIdentity size={18} style={{ marginRight: "0.5rem" }} /> Soul Map
          </button>
          <button id="today-open-codex-btn" className="btn btn-secondary" onClick={() => navigate("/codex")}>
            <IconCompass size={18} style={{ marginRight: "0.5rem" }} /> Open Codex
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem", opacity: 0.4 }}>
          <button id="today-refresh-signals-btn" onClick={refresh} className="btn btn-ghost" style={{ fontSize: "0.7rem", gap: "0.4rem" }}>
            <IconRefresh size={12} /> REFRESH SIGNALS
          </button>
        </div>

      </div>
    </div>
  );
}
