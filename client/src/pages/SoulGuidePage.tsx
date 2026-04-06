import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    try {
      const res = await fetch("/api/chat/soul-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, profileContext: getProfileContext() }),
      });

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
    } catch {
      setError("An error occurred while connecting to your Soul Guide.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      maxWidth: "780px", margin: "0 auto", width: "100%",
    }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{
        padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem",
        borderBottom: "1px solid rgba(139,92,246,0.2)",
        background: "rgba(10,1,24,0.5)", backdropFilter: "blur(12px)",
      }}>
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

      {/* ── Chat area ────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        {messages.length === 0 && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "2rem" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", color: "var(--cosmic-lavender)", marginBottom: "1.25rem",
            }}>
              ◈
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", marginBottom: "0.75rem", color: "var(--cosmic-gold)" }}>
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
                    background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                    borderRadius: "10px", padding: "0.7rem 1rem",
                    fontSize: "0.85rem", color: "rgba(232,230,255,0.88)",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.08)"; }}
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
                background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)",
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
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "0.9rem 1rem", background: "rgba(10,1,24,0.65)", backdropFilter: "blur(15px)", borderTop: "1px solid rgba(139,92,246,0.2)" }}>
        <form
          onSubmit={e => { e.preventDefault(); handleSend(input); }}
          style={{
            display: "flex", gap: "0.6rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.2)",
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
              background: input.trim() ? "var(--cosmic-purple)" : "rgba(255,255,255,0.08)",
              border: "none", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s",
            }}
          >
            {isLoading ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
