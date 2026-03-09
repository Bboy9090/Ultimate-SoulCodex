import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ConfidenceBadge from "@/components/ConfidenceBadge";

type TimelinePhase =
  | "Ignition"
  | "Exposure"
  | "Construction"
  | "Expansion"
  | "Friction"
  | "Refinement"
  | "Integration"
  | "Legacy";

interface TimelineData {
  phase: TimelinePhase;
  confidence: "Full" | "Partial";
  reasons: string[];
  focus: string;
  do: string[];
  dont: string[];
  nextPhase: TimelinePhase;
  narrative: string;
}

const PHASE_ICONS: Record<TimelinePhase, string> = {
  Ignition: "▶",
  Exposure: "◎",
  Construction: "⬛",
  Expansion: "◎",
  Friction: "⚡",
  Refinement: "◈",
  Integration: "⬡",
  Legacy: "⧫",
};

const PHASE_COLORS: Record<TimelinePhase, { accent: string; bg: string; border: string }> = {
  Ignition:     { accent: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)"  },
  Exposure:     { accent: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)" },
  Construction: { accent: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.3)" },
  Expansion:    { accent: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.3)"   },
  Friction:     { accent: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)"   },
  Refinement:   { accent: "#06b6d4", bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.3)"   },
  Integration:  { accent: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.3)"  },
  Legacy:       { accent: "#d4af37", bg: "rgba(212,175,55,0.08)",  border: "rgba(212,175,55,0.3)"  },
};

const PHASE_ORDER: TimelinePhase[] = [
  "Ignition", "Exposure", "Construction", "Expansion",
  "Friction", "Refinement", "Integration", "Legacy",
];

const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function TimelinePage() {
  const [, navigate] = useLocation();
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const data = await apiRequest("/api/timeline/current", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data as TimelineData;
    },
    onSuccess: (data) => {
      setTimeline(data);
      try {
        localStorage.setItem(
          "soulTimeline",
          JSON.stringify({ timeline: data, ts: Date.now() })
        );
      } catch {}
    },
    onError: (err: Error) => setError(err.message ?? "Failed to load timeline"),
  });

  useEffect(() => {
    // Try cache first
    try {
      const raw = localStorage.getItem("soulTimeline");
      if (raw) {
        const { timeline: cached, ts } = JSON.parse(raw);
        if (cached && Date.now() - ts < CACHE_DURATION_MS) {
          setTimeline(cached);
          return;
        }
      }
    } catch (e) {
      console.warn("[TimelinePage] Failed to read cache:", e);
    }

    loadTimeline();
  }, []);

  function loadTimeline() {
    const rawProfile = localStorage.getItem("soulProfile");
    const rawCodex = localStorage.getItem("soulCodexReading");
    const rawChart = localStorage.getItem("soulFullChart");

    if (!rawProfile) {
      setError("No profile found. Complete the onboarding first.");
      return;
    }

    let profile: Record<string, unknown> = {};
    let fullChart: unknown = undefined;

    try { profile = JSON.parse(rawProfile); } catch (e) {
      console.warn("[TimelinePage] Failed to parse profile:", e);
    }
    try { if (rawChart) fullChart = JSON.parse(rawChart); } catch (e) {
      console.warn("[TimelinePage] Failed to parse chart:", e);
    }

    // Merge Codex30 topThemes into profile if available
    try {
      if (rawCodex) {
        const codex = JSON.parse(rawCodex);
        if (Array.isArray(codex?.topThemes)) {
          profile = { ...profile, topThemes: codex.topThemes };
        }
      }
    } catch (e) {
      console.warn("[TimelinePage] Failed to parse codex reading:", e);
    }

    mutation.mutate({
      profile,
      fullChart,
      currentDateISO: new Date().toISOString(),
    });
  }

  if (mutation.isPending && !timeline) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: "2.5rem", animation: "spin 4s linear infinite" }}>
          ⬡
        </div>
        <p
          style={{
            color: "var(--cosmic-lavender)",
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
          }}
        >
          Mapping your life chapter…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem" }}>⚠</div>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Start Onboarding
        </button>
      </div>
    );
  }

  if (!timeline) return null;

  const { accent, bg, border } = PHASE_COLORS[timeline.phase];
  const icon = PHASE_ICONS[timeline.phase];
  const currentIdx = PHASE_ORDER.indexOf(timeline.phase);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1.5rem 1rem 3rem",
        maxWidth: "520px",
        margin: "0 auto",
      }}
    >
      {/* ── Section 1: Current Era ─────────────────────────────────────── */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: "0.4rem",
          }}
        >
          LIFE TIMELINE
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              color: accent,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {icon} {timeline.phase}
          </h1>
          <ConfidenceBadge badge={timeline.confidence.toLowerCase()} size="sm" />
        </div>
      </div>

      {/* Phase progress strip */}
      <div
        style={{
          display: "flex",
          gap: "3px",
          marginBottom: "1.25rem",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        {PHASE_ORDER.map((p, i) => (
          <div
            key={p}
            title={p}
            style={{
              flex: 1,
              minWidth: "28px",
              height: "5px",
              borderRadius: "3px",
              background:
                i < currentIdx
                  ? "rgba(255,255,255,0.15)"
                  : i === currentIdx
                  ? accent
                  : "rgba(255,255,255,0.06)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Narrative card */}
      <div
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1rem",
          borderTop: `3px solid ${accent}`,
        }}
      >
        <p
          style={{
            color: "rgba(232,230,255,0.88)",
            fontSize: "0.87rem",
            fontFamily: "var(--font-serif)",
            lineHeight: 1.75,
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {timeline.narrative}
        </p>
      </div>

      {/* Focus */}
      <div
        style={{
          background: "rgba(15,20,40,0.7)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "14px",
          padding: "1rem",
          marginBottom: "0.75rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.1rem", color: accent }}>
          ◈
        </span>
        <div>
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: "0.35rem",
              fontWeight: 700,
            }}
          >
            CURRENT FOCUS
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(232,230,255,0.9)",
              lineHeight: 1.65,
              margin: 0,
              fontFamily: "var(--font-serif)",
            }}
          >
            {timeline.focus}
          </p>
        </div>
      </div>

      {/* ── Section 2: Why This Is Active ─────────────────────────────── */}
      <div
        style={{
          background: "rgba(15,20,40,0.6)",
          border: "1px solid rgba(139,92,246,0.15)",
          borderRadius: "14px",
          padding: "1rem",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cosmic-lavender)",
            marginBottom: "0.65rem",
            fontWeight: 700,
          }}
        >
          WHY THIS IS ACTIVE
        </div>
        {timeline.reasons.map((reason, i) => (
          <div
            key={i}
            style={{
              fontSize: "0.82rem",
              color: "rgba(232,230,255,0.82)",
              lineHeight: 1.65,
              marginBottom: "0.5rem",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: accent, flexShrink: 0, marginTop: "0.1rem" }}>▪</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* ── Section 3 & 4: What To Do / What To Avoid ─────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        {/* DO */}
        <div
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "14px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#22c55e",
              marginBottom: "0.6rem",
              fontWeight: 700,
            }}
          >
            WHAT TO DO
          </div>
          {timeline.do.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.79rem",
                color: "rgba(232,255,232,0.85)",
                lineHeight: 1.6,
                marginBottom: "0.35rem",
                display: "flex",
                gap: "0.35rem",
              }}
            >
              <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* DON'T */}
        <div
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "14px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#ef4444",
              marginBottom: "0.6rem",
              fontWeight: 700,
            }}
          >
            WHAT TO AVOID
          </div>
          {timeline.dont.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.79rem",
                color: "rgba(255,220,220,0.85)",
                lineHeight: 1.6,
                marginBottom: "0.35rem",
                display: "flex",
                gap: "0.35rem",
              }}
            >
              <span style={{ color: "#ef4444", flexShrink: 0 }}>✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: What Opens Next ─────────────────────────────────── */}
      <div
        style={{
          background: "rgba(15,20,40,0.7)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "14px",
          padding: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.1rem", color: "#d4af37" }}>
          ⧫
        </span>
        <div>
          <div
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#d4af37",
              marginBottom: "0.35rem",
              fontWeight: 700,
            }}
          >
            WHAT OPENS NEXT
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(255,245,200,0.9)",
              lineHeight: 1.65,
              margin: 0,
              fontFamily: "var(--font-serif)",
            }}
          >
            <strong style={{ color: "#d4af37" }}>{timeline.nextPhase}</strong> — After this phase
            consolidates, the {timeline.nextPhase.toLowerCase()} pattern activates. What you build
            now directly shapes the quality of that window.
          </p>
        </div>
      </div>

      {/* Footer nav */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/today")}
          style={{ fontSize: "0.8rem" }}
        >
          ☽ Today's Card
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate("/codex")}
          style={{ fontSize: "0.8rem" }}
        >
          ✦ Codex Reading
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            try { localStorage.removeItem("soulTimeline"); } catch {}
            setTimeline(null);
            setError(null);
            loadTimeline();
          }}
          style={{ fontSize: "0.8rem", opacity: 0.6 }}
        >
          ↺ Refresh
        </button>
      </div>
    </div>
  );
}
