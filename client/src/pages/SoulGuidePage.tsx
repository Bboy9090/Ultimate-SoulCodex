import { apiFetch } from "../lib/queryClient";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Send, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}



const SUGGESTIONS = [
  "What pattern do I keep repeating?",
  "Where am I holding myself back?",
  "What should I focus on this week?",
];

export default function SoulGuidePage() {
  const [, navigate] = useLocation();
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [questionsUsed, setQuestionsUsed]   = useState(0);
  const [isPremium, setIsPremium]           = useState(false);
  const [freeLimit, setFreeLimit]           = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLimitReached]);

  // Fetch usage on mount so returning users see the right state
  useEffect(() => {
    const cachedPremium = (() => { try { return localStorage.getItem("soulPremium") === "true"; } catch { return false; } })();
    if (cachedPremium) setIsPremium(true);
    
    const hasLocalProfile = !!getProfileContext();
    apiFetch(`/api/chat/soul-guide/usage?hasProfile=${hasLocalProfile}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const premium = d.isPremium || cachedPremium;
        const limit = d.limit ?? (hasLocalProfile ? 2 : 1);
        setIsPremium(premium);
        setFreeLimit(limit);
        setQuestionsUsed(d.used ?? 0);
        if (!premium && (d.used ?? 0) >= limit) {
          setIsLimitReached(true);
        }
      })
      .catch(err => console.warn("[soul-guide] usage fetch failed:", err));
  }, []);

  const getProfileContext = () => {
    try {
      const raw = localStorage.getItem("soulProfile");
      if (!raw) return null;
      const p = JSON.parse(raw);
      return {
        name:        p.name,
        archetype:   p.archetype?.name,
        element:     p.archetype?.element,
        role:        p.archetype?.role,
        sunSign:     p.sunSign,
        moonSign:    p.moonSign,
        risingSign:  p.risingSign,
        lifePath:    p.lifePath,
        coreEssence: p.synthesis?.coreEssence,
      };
    } catch { return null; }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading || isLimitReached) return;
    const userMessage: Message = { role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    try {
      const res = await apiFetch("/api/chat/soul-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, profileContext: getProfileContext() }),
      });

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (body.error === "limit_reached") {
          setQuestionsUsed(body.used ?? freeLimit);
          setIsLimitReached(true);
          setIsLoading(false);
          return;
        }
      }

      if (res.status === 503) {
        setError("Your Soul Guide is resting — AI features are temporarily offline.");
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to connect to Soul Guide");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages(prev => [...prev, { role: "model", text: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const ds = line.slice(6).trim();
              if (ds === "[DONE]") continue;
              try {
                const { content } = JSON.parse(ds);
                if (content) {
                  assistantText += content;
                  setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "model", text: assistantText };
                    return next;
                  });
                }
              } catch {}
            }
          }
        }
      }

      // Update local count
      setQuestionsUsed(prev => prev + 1);
    } catch {
      setError("An error occurred while connecting to your Soul Guide.");
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = isPremium ? null : Math.max(0, freeLimit - questionsUsed);

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      maxWidth: "780px", margin: "0 auto", width: "100%",
    }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem",
        borderBottom: "1px solid rgba(212,168,95,0.2)",
        background: "rgba(10,1,24,0.5)", backdropFilter: "blur(12px)",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => navigate("/today")}
            style={{ background: "none", border: "none", color: "var(--cosmic-lavender)", cursor: "pointer", padding: "0.4rem", fontSize: "1.1rem" }}
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: "1.1rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.4rem", margin: 0 }}>
              <span style={{ color: "var(--cosmic-lavender)" }}>✦</span> Soul Guide
            </h1>
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", margin: 0 }}>
              Ask anything about your path, patterns, or next move.
            </p>
          </div>
        </div>
        {/* Usage pill — only show for free users who haven't hit limit */}
        {!isPremium && !isLimitReached && remaining !== null && (
          <div style={{
            fontSize: "0.72rem", padding: "0.25rem 0.7rem",
            borderRadius: "99px",
            background: remaining === 1
              ? "rgba(245,158,11,0.15)"
              : "rgba(212,168,95,0.12)",
            border: `1px solid ${remaining === 1 ? "rgba(245,158,11,0.35)" : "rgba(212,168,95,0.25)"}`,
            color: remaining === 1 ? "#f59e0b" : "rgba(200,190,255,0.7)",
            whiteSpace: "nowrap",
          }}>
            {remaining === 1 ? "1 question left" : `${remaining} free questions`}
          </div>
        )}
      </div>

      {/* ── Chat area ────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        {messages.length === 0 && !error && !isLimitReached && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "2rem" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(212,168,95,0.1)", border: "1px solid rgba(212,168,95,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", color: "var(--cosmic-lavender)", marginBottom: "1.25rem",
            }}>
              ◈
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.75rem", color: "var(--cosmic-gold)", textShadow: "0 2px 12px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)" }}>
              Ask your Soul Guide
            </h2>
            <p style={{ color: "var(--muted-foreground)", maxWidth: "280px", marginBottom: "1.75rem", fontSize: "0.85rem", lineHeight: 1.6 }}>
              No fluff, no generic advice — answers drawn from your actual blueprint.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%", maxWidth: "300px" }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  style={{
                    background: "rgba(242,234,218,0.96)", border: "1px solid rgba(212,168,95,0.45)",
                    borderRadius: "10px", padding: "0.7rem 1rem",
                    fontSize: "0.85rem", color: "#1A0E07",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,228,210,0.99)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(242,234,218,0.96)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
            <div style={{
              maxWidth: "85%", padding: "0.9rem 1rem",
              borderRadius: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.65,
              position: "relative",
              ...(m.role === "user" ? {
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--foreground)", borderBottomRightRadius: "0.25rem",
              } : {
                background: "rgba(212,168,95,0.14)", border: "1px solid rgba(212,168,95,0.28)",
                color: "rgba(232,230,255,0.95)", borderBottomLeftRadius: "0.25rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }),
            }}>
              {m.role === "model" && (
                <div style={{
                  position: "absolute", top: -10, left: -10,
                  width: 24, height: 24, background: "var(--cosmic-purple)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", color: "white", boxShadow: "0 0 10px var(--cosmic-purple)",
                }}>
                  ✦
                </div>
              )}
              {m.text || (isLoading && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}

        {error && (
          <div style={{
            padding: "0.9rem 1rem", borderRadius: "10px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#ef4444", fontSize: "0.85rem",
            display: "flex", alignItems: "center", gap: "0.65rem",
          }}>
            <span>⚠</span> <span>{error}</span>
          </div>
        )}

        {/* ── Upgrade wall ─────────────────────────────────────────────── */}
        {isLimitReached && (
          <div style={{
            margin: "auto 0 0",
            padding: "2rem 1.5rem",
            borderRadius: "1.25rem",
            background: "rgba(28,18,10,0.72)",
            border: "1px solid rgba(212,168,95,0.35)",
            textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(212,168,95,0.12)", border: "1px solid rgba(212,168,95,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", margin: "0 auto 1.1rem",
            }}>
              ✦
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--sc-gold, #D4A85F)", fontSize: "1.15rem", margin: "0 0 0.5rem" }}>
              You've used your {freeLimit} free questions
            </h3>
            <p style={{ color: "rgba(246,241,232,0.55)", fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 1.5rem", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
              Unlock unlimited access to the Soul Guide, your Full Cosmic Blueprint, and the premium birth chart.
            </p>
            <Link href="/profile">
              <button style={{
                background: "linear-gradient(135deg, #D4A85F 0%, #b8883a 100%)",
                border: "none", borderRadius: "10px",
                padding: "0.75rem 2rem", fontSize: "0.9rem",
                color: "#1A0E07", fontWeight: 700, cursor: "pointer",
                marginBottom: "0.75rem", display: "block", width: "100%", maxWidth: 280, margin: "0 auto 0.75rem",
              }}>
                Unlock Full Access
              </button>
            </Link>
            <p style={{ color: "rgba(246,241,232,0.3)", fontSize: "0.75rem", margin: 0 }}>
              Have an access code?{" "}
              <Link href="/profile">
                <span style={{ color: "rgba(212,168,95,0.7)", cursor: "pointer", textDecoration: "underline" }}>
                  Enter it on your profile page
                </span>
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0.9rem 1rem", background: "rgba(10,1,24,0.65)", backdropFilter: "blur(15px)", borderTop: "1px solid rgba(212,168,95,0.2)" }}>
        {isLimitReached ? (
          <div style={{
            textAlign: "center", fontSize: "0.8rem",
            color: "rgba(246,241,232,0.3)", padding: "0.5rem 0",
          }}>
            Upgrade to keep the conversation going
          </div>
        ) : (
          <form
            onSubmit={e => { e.preventDefault(); handleSend(input); }}
            style={{
              display: "flex", gap: "0.6rem",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,168,95,0.2)",
              borderRadius: "1.5rem", padding: "0.25rem 0.25rem 0.25rem 1rem",
              alignItems: "center",
            }}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything…"
              disabled={isLoading}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", padding: "0.5rem 0", fontSize: "0.9rem" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: input.trim() ? "var(--sc-gold)" : "rgba(255,255,255,0.08)",
                border: "none", color: input.trim() ? "#1A0E07" : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s",
              }}
            >
              {isLoading ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
