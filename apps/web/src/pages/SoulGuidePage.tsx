import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";

const API_BASE = "";

interface Message {
  role: "user" | "model";
  text: string;
  isDeeper?: boolean;
}

interface FallbackCard {
  title: string;
  body: string;
}

interface FallbackData {
  status: "fallback";
  message: string;
  cards: FallbackCard[];
  prompts: string[];
}

type Tone = "oracle" | "mirror" | "strategy" | "direct";

const TONE_CONFIG: Record<Tone, { label: string; description: string; color: string; glow: string }> = {
  oracle: {
    label: "Oracle",
    description: "Grounded, authoritative, specific",
    color: "#F2C94C",
    glow: "rgba(242,201,76,0.25)",
  },
  mirror: {
    label: "Mirror",
    description: "Behavioral reflection, no judgment",
    color: "#7B61FF",
    glow: "rgba(123,97,255,0.25)",
  },
  strategy: {
    label: "Strategy",
    description: "Tactical, practical, actionable",
    color: "#6BA7FF",
    glow: "rgba(107,167,255,0.25)",
  },
  direct: {
    label: "Direct",
    description: "Blunt, short, no softening",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.25)",
  },
};

const SUGGESTIONS = [
  "What pattern am I repeating right now?",
  "What do I need to stop tolerating?",
  "What is this phase trying to teach me?",
  "Why does this keep happening to me?",
  "What's my blind spot in relationships?",
  "What should I focus on this week?",
];

function getProfileContext() {
  try {
    const raw = localStorage.getItem("soulProfile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ─── Typing cursor component ─── */
function TypingCursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: "1em",
        background: "#7B61FF",
        marginLeft: 2,
        verticalAlign: "text-bottom",
        animation: "blink 1s step-end infinite",
        borderRadius: 1,
      }}
    />
  );
}

/* ─── Animated dots loader ─── */
function ThinkingDots() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        paddingLeft: "0.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0.85rem 1.1rem",
          borderRadius: "18px 18px 18px 4px",
          background: "rgba(28,22,53,0.8)",
          border: "1px solid rgba(123,97,255,0.2)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 0 12px rgba(123,97,255,0.08)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#7B61FF",
              display: "inline-block",
              animation: `dotBounce 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.16}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Fallback card ─── */
function FallbackCardItem({ card, index }: { card: FallbackCard; index: number }) {
  const colors = ["#F2C94C", "#ef4444", "#6BA7FF"];
  const color = colors[index] || "#8B87A8";
  return (
    <div
      className="animate-fadeIn"
      style={{
        background: `rgba(28,22,53,0.7)`,
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "1.1rem 1.25rem",
        backdropFilter: "blur(12px)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 16px ${color}08`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      <p
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "0.5rem",
        }}
      >
        {card.title}
      </p>
      <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(234,234,245,0.88)" }}>
        {card.body}
      </p>
    </div>
  );
}

export default function SoulGuidePage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("oracle");
  const [statusLine, setStatusLine] = useState("");
  const [fallback, setFallback] = useState<FallbackData | null>(null);
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Auto-scroll on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, fallback]);

  /* Load fallback on first mount */
  useEffect(() => {
    loadFallback();
  }, []);

  const loadFallback = async () => {
    try {
      const profileContext = getProfileContext();
      const res = await fetch(`${API_BASE}/api/chat/soul-guide/fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileContext }),
      });
      const data = await res.json();
      if (data.status === "fallback") {
        setFallback(data);
        setStatusLine(data.message || "");
      }
    } catch {
      setFallback({
        status: "fallback",
        message: "Using backup guidance from your Codex.",
        cards: [
          { title: "Your strongest edge right now", body: "Complete your profile to unlock personalized guidance from your full chart." },
          { title: "What may be throwing you off", body: "Without profile data, general guidance applies: slow down and pick one focus." },
          { title: "What to focus on today", body: "Narrow your attention. One finished action beats ten half-started ones." },
        ],
        prompts: SUGGESTIONS.slice(0, 3),
      });
      setStatusLine("Using backup guidance from your Codex.");
    }
  };

  const handleFallbackQuestion = useCallback(async (question: string) => {
    setLoading(true);
    try {
      const profileContext = getProfileContext();
      const res = await fetch(`${API_BASE}/api/chat/soul-guide/fallback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileContext, question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.answer || "Complete your profile for personalized guidance.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Could not generate a response. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
      setFallback(null);
    }
  }, []);

  /* ─── Core SSE streaming handler ─── */
  const streamResponse = useCallback(
    async (
      text: string,
      history: { role: string; parts: { text: string }[] }[],
      deeper = false
    ) => {
      const profileContext = getProfileContext();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${API_BASE}/api/chat/soul-guide`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history, profileContext, tone, deeper }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          setStatusLine("Guide is reconnecting. Using backup guidance.");
          await handleFallbackQuestion(text);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        let buffer = "";

        /* Add empty model message to stream into */
        setMessages((prev) => {
          const next = [...prev, { role: "model" as const, text: "", isDeeper: deeper }];
          setStreamingIndex(next.length - 1);
          return next;
        });

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.content) {
                  assistantText += parsed.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "model",
                      text: assistantText,
                      isDeeper: deeper,
                    };
                    return updated;
                  });
                }
              } catch {
                /* partial chunk — continue buffering */
              }
            }
          }
        }

        /* If nothing streamed, fall back */
        if (!assistantText) {
          setStatusLine("Guide is reconnecting. Using backup guidance.");
          setMessages((prev) => prev.slice(0, -1));
          await handleFallbackQuestion(text);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setStatusLine("Guide is reconnecting. Using backup guidance.");
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "model" && !last.text) return prev.slice(0, -1);
          return prev;
        });
        await handleFallbackQuestion(text);
      } finally {
        setStreamingIndex(null);
      }
    },
    [tone, handleFallbackQuestion]
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setMessages((prev) => [...prev, { role: "user", text }]);
      setInput("");
      setLoading(true);
      setStatusLine("");
      if (fallback) setFallback(null);

      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      await streamResponse(text, history);
      setLoading(false);
    },
    [loading, fallback, messages, streamResponse]
  );

  const handleAskDeeper = useCallback(async () => {
    if (loading) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    setLoading(true);
    setStatusLine("");

    const history = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    await streamResponse(lastUserMsg.text, history, true);
    setLoading(false);
  }, [loading, messages, streamResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const isEmpty = messages.length === 0;
  const activeSuggestions = fallback?.prompts || SUGGESTIONS;
  const activeTone = TONE_CONFIG[tone];
  const hasConversation = messages.length >= 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxWidth: 640,
        margin: "0 auto",
        padding: "0 0 5rem",
        position: "relative",
      }}
    >
      {/* ─── Ambient glow behind header ─── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: 120,
          background: `radial-gradient(ellipse at center, ${activeTone.glow} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
          transition: "background 0.5s ease",
        }}
      />

      {/* ─── Header ─── */}
      <div
        style={{
          padding: "1.1rem 1rem 0.8rem",
          borderBottom: "1px solid rgba(45,37,84,0.5)",
          background: "rgba(11,14,35,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
          <button
            onClick={() => navigate("/today")}
            style={{
              background: "none",
              border: "none",
              color: "#8B87A8",
              cursor: "pointer",
              fontSize: "1.2rem",
              marginRight: "0.5rem",
            }}
          >
            ‹
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p
              className="section-label"
              style={{ color: activeTone.color, transition: "color 0.3s ease", marginBottom: 0 }}
            >
              Soul Guide
            </p>
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#EAEAF5",
                letterSpacing: "-0.01em",
              }}
            >
              Ask your Codex anything
            </h1>
          </div>
          <div style={{ width: 24 }} /> {/* Spacer for centering */}
        </div>

        {/* Tone pills */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {(Object.entries(TONE_CONFIG) as [Tone, typeof TONE_CONFIG[Tone]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTone(key)}
              style={{
                padding: "0.28rem 0.9rem",
                borderRadius: 9999,
                border: `1px solid ${tone === key ? cfg.color : "rgba(45,37,84,0.7)"}`,
                background: tone === key ? `${cfg.color}18` : "transparent",
                color: tone === key ? cfg.color : "#8B87A8",
                fontSize: "0.72rem",
                fontWeight: tone === key ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: tone === key ? `0 0 12px ${cfg.color}28` : "none",
                minHeight: "unset",
                minWidth: "unset",
                letterSpacing: "0.03em",
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {statusLine && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.68rem",
              color: "#8B87A8",
              marginTop: "0.45rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            }}
          >
            <span style={{ opacity: 0.6 }}>◈</span> {statusLine}
          </p>
        )}
      </div>

      {/* ─── Message area ─── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          scrollBehavior: "smooth",
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div
            className="animate-fadeIn"
            style={{ textAlign: "center", paddingTop: "1.5rem" }}
          >
            {/* Oracle sigil */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(123,97,255,0.1)",
                border: "1px solid rgba(123,97,255,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.1rem",
                fontSize: "1.6rem",
                boxShadow: "0 0 28px rgba(123,97,255,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
                animation: "pulseGlow 4s ease-in-out infinite",
              }}
            >
              ◎
            </div>
            <h2
              className="heading-display"
              style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}
            >
              Your Oracle is listening
            </h2>
            <p
              style={{
                color: "#8B87A8",
                fontSize: "0.85rem",
                maxWidth: 300,
                margin: "0 auto 1.75rem",
                lineHeight: 1.65,
              }}
            >
              Ask about patterns, decisions, relationships, or what this phase means for you.
            </p>

            {/* Fallback cards */}
            {fallback && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxWidth: 480,
                  margin: "0 auto 1.5rem",
                  textAlign: "left",
                }}
              >
                {fallback.cards.map((card, i) => (
                  <FallbackCardItem key={i} card={card} index={i} />
                ))}
            </div>
            )}

            {/* Suggestion chips */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.45rem",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              {(fallback ? activeSuggestions : SUGGESTIONS).map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="animate-fadeIn"
                  style={{
                    padding: "0.7rem 1rem",
                    background: "rgba(28,22,53,0.65)",
                    border: "1px solid rgba(123,97,255,0.14)",
                    borderRadius: 12,
                    color: "#EAEAF5",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    minHeight: "unset",
                    backdropFilter: "blur(8px)",
                    animationDelay: `${i * 60}ms`,
                    lineHeight: 1.5,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(123,97,255,0.32)";
                    el.style.background = "rgba(123,97,255,0.07)";
                    el.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(123,97,255,0.14)";
                    el.style.background = "rgba(28,22,53,0.65)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ opacity: 0.5, marginRight: "0.5rem", fontSize: "0.75rem" }}>›</span>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => {
          const isStreaming = streamingIndex === i;
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className="animate-fadeIn"
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "0.5rem",
              }}
            >
              {/* Oracle avatar dot */}
              {!isUser && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: msg.isDeeper
                      ? "linear-gradient(135deg, #F2C94C, #E6C27A)"
                      : "linear-gradient(135deg, #7B61FF, #9B8AFF)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: msg.isDeeper
                      ? "0 0 12px rgba(242,201,76,0.35)"
                      : "0 0 12px rgba(123,97,255,0.35)",
                    marginBottom: 2,
                  }}
                >
                  {msg.isDeeper ? "◈" : "✦"}
                </div>
              )}

              <div
                style={{
                  maxWidth: "80%",
                  padding: "0.8rem 1rem",
                  borderRadius: isUser
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: isUser
                    ? "linear-gradient(135deg, rgba(123,97,255,0.22), rgba(123,97,255,0.14))"
                    : msg.isDeeper
                    ? "rgba(40,30,60,0.85)"
                    : "rgba(28,22,53,0.78)",
                  border: isUser
                    ? "1px solid rgba(123,97,255,0.28)"
                    : msg.isDeeper
                    ? "1px solid rgba(242,201,76,0.18)"
                    : "1px solid rgba(45,37,84,0.55)",
                  fontSize: "0.875rem",
                  lineHeight: 1.7,
                  color: "#EAEAF5",
                  backdropFilter: "blur(12px)",
                  boxShadow: isUser
                    ? "0 2px 12px rgba(123,97,255,0.12)"
                    : "0 4px 16px rgba(0,0,0,0.25)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
                {isStreaming && msg.text && <TypingCursor />}
                {isStreaming && !msg.text && <TypingCursor />}
              </div>
            </div>
          );
        })}

        {/* Loading dots (before first model reply) */}
        {loading && messages[messages.length - 1]?.role !== "model" && (
          <ThinkingDots />
        )}

        {/* Ask Deeper button */}
        {hasConversation && !loading && (
          <div
            className="animate-fadeIn"
            style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "2.25rem" }}
          >
            <button
              type="button"
              onClick={handleAskDeeper}
              style={{
                padding: "0.3rem 0.85rem",
                borderRadius: 9999,
                border: "1px solid rgba(242,201,76,0.2)",
                background: "transparent",
                color: "#F2C94C",
                fontSize: "0.7rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                minHeight: "unset",
                minWidth: "unset",
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(242,201,76,0.08)";
                el.style.borderColor = "rgba(242,201,76,0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "transparent";
                el.style.borderColor = "rgba(242,201,76,0.2)";
              }}
            >
              ◈ Ask deeper
            </button>
          </div>
        )}
      </div>

      {/* ─── Input bar ─── */}
      <div
        style={{
          padding: "0.7rem 1rem",
          borderTop: "1px solid rgba(45,37,84,0.45)",
          background: "rgba(11,14,35,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          bottom: "4rem", /* Accommodate bottom nav */
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            background: "rgba(20,16,40,0.7)",
            border: "1px solid rgba(45,37,84,0.7)",
            borderRadius: 16,
            padding: "0.2rem 0.2rem 0.2rem 1rem",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onFocusCapture={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = "rgba(123,97,255,0.4)";
            el.style.boxShadow = "0 0 16px rgba(123,97,255,0.1)";
          }}
          onBlurCapture={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = "rgba(45,37,84,0.7)";
            el.style.boxShadow = "none";
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask your Codex..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#EAEAF5",
              fontSize: "0.875rem",
              padding: "0.6rem 0",
              fontFamily: "inherit",
              width: "auto",
            }}
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background:
                input.trim() && !loading
                  ? `linear-gradient(135deg, ${activeTone.color}CC, ${activeTone.color}88)`
                  : "rgba(45,37,84,0.4)",
              border: "none",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              color: "#fff",
              transition: "all 0.25s ease",
              boxShadow:
                input.trim() && !loading
                  ? `0 4px 14px ${activeTone.glow}`
                  : "none",
              flexShrink: 0,
              minHeight: "unset",
              minWidth: "unset",
            }}
          >
            ›
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.35rem" }}>
          <p
            style={{
              fontSize: "0.62rem",
              color: "#8B87A8",
              textAlign: "center",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ color: activeTone.color, transition: "color 0.3s ease" }}>
              {activeTone.label}
            </span>{" "}
            — {activeTone.description}
          </p>
          <span style={{ fontSize: "0.58rem", color: "#F2C94C", letterSpacing: "0.06em" }}>✦ Premium</span>
        </div>
      </div>

      {/* ─── Keyframe injections ─── */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
