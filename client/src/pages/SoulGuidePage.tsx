import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Send, Sparkles, MessageSquare, ArrowLeft, RefreshCw, Shield } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
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

const SUGGESTIONS = [
  "What pattern am I repeating right now?",
  "What do I need to stop tolerating?",
  "What is this phase trying to teach me?"
];

export default function SoulGuidePage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fallback, setFallback] = useState<FallbackData | null>(null);
  const [statusLine, setStatusLine] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, fallback]);

  const getProfileContext = () => {
    try {
      const rawProfile = localStorage.getItem("soulProfile");
      if (!rawProfile) return null;
      return JSON.parse(rawProfile);
    } catch {
      return null;
    }
  };

  const loadFallback = async () => {
    try {
      const profileContext = getProfileContext();
      const res = await fetch("/api/chat/soul-guide/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileContext }),
      });
      const data = await res.json();
      if (data.status === "fallback") {
        setFallback(data);
        setStatusLine(data.message);
      }
    } catch {
      setFallback({
        status: "fallback",
        message: "Using backup guidance from your Codex.",
        cards: [
          { title: "Your strongest edge right now", body: "Complete your profile to unlock personalized guidance." },
          { title: "What may be throwing you off", body: "Without profile data, general guidance applies: slow down and pick one focus." },
          { title: "What to focus on today", body: "Narrow your attention. One finished action beats ten half-started ones." },
        ],
        prompts: SUGGESTIONS,
      });
      setStatusLine("Using backup guidance from your Codex.");
    }
  };

  const handleFallbackQuestion = async (question: string) => {
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setIsLoading(true);

    try {
      const profileContext = getProfileContext();
      const res = await fetch("/api/chat/soul-guide/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileContext, question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "model",
        text: data.answer || "Complete your profile for personalized guidance.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "model",
        text: "Could not generate a response. Try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
      setFallback(null);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStatusLine("");

    if (fallback) setFallback(null);

    const profileContext = getProfileContext();
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await fetch("/api/chat/soul-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, profileContext })
      });

      if (!response.ok) {
        setStatusLine("Guide is reconnecting. Your profile insight is still available.");
        await handleFallbackQuestion(text);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages(prev => [...prev, { role: "model", text: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") continue;

              try {
                const { content } = JSON.parse(dataStr);
                if (content) {
                  assistantText += content;
                  setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "model", text: assistantText };
                    return next;
                  });
                }
              } catch {
                // partial chunk
              }
            }
          }
        }
      }

      if (!assistantText) {
        setStatusLine("Guide is reconnecting. Your profile insight is still available.");
        setMessages(prev => prev.slice(0, -1));
        await handleFallbackQuestion(text);
      }
    } catch {
      setStatusLine("Guide is reconnecting. Your profile insight is still available.");
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "model" && !last.text) return prev.slice(0, -1);
        return prev;
      });
      await handleFallbackQuestion(text);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) loadFallback();
  }, []);

  const activeSuggestions = fallback?.prompts || SUGGESTIONS;

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "transparent",
      position: "relative",
      maxWidth: "800px",
      margin: "0 auto",
      width: "100%"
    }}>
      {/* Header */}
      <div style={{
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(10, 1, 24, 0.4)",
        backdropFilter: "blur(10px)"
      }}>
        <button
          onClick={() => navigate("/today")}
          style={{
            background: "none",
            border: "none",
            color: "var(--cosmic-lavender)",
            cursor: "pointer",
            padding: "0.5rem"
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.25rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} className="text-cosmic-purple" />
            Soul Guide
          </h1>
          {statusLine && (
            <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.15rem" }}>
              <Shield size={10} />
              {statusLine}
            </p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}
      >
        {/* Fallback cards — shown when no messages and fallback loaded */}
        {messages.length === 0 && fallback && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {fallback.cards.map((card, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                }}
              >
                <h3 style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: i === 0 ? "#E6C27A" : i === 1 ? "#ef4444" : "#6BA7FF",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.65", color: "rgba(232, 230, 255, 0.85)" }}>
                  {card.body}
                </p>
              </div>
            ))}

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              marginTop: "0.5rem",
            }}>
              <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Ask your guide
              </p>
              {activeSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — only if no fallback and no messages */}
        {messages.length === 0 && !fallback && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            padding: "2rem"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              border: "1px solid var(--glass-border)"
            }}>
              <MessageSquare size={30} className="text-cosmic-lavender" />
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginBottom: "1rem", color: "var(--cosmic-gold)" }}>
              Ask your Soul Guide
            </h2>
            <p style={{ color: "var(--muted-foreground)", maxWidth: "300px", marginBottom: "2rem", fontSize: "0.9rem" }}>
              Anything about your patterns, blind spots, or next move. No fluff.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "320px" }}>
              {activeSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="btn btn-secondary"
                  style={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    padding: "0.75rem 1rem"
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              width: "100%"
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "1rem",
              borderRadius: "1.25rem",
              fontSize: "0.9375rem",
              lineHeight: "1.6",
              position: "relative",
              ...(m.role === "user" ? {
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--foreground)",
                borderBottomRightRadius: "0.25rem"
              } : {
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "rgba(232, 230, 255, 0.95)",
                borderBottomLeftRadius: "0.25rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              })
            }}>
              {m.role === "model" && (
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-10px",
                  width: "24px",
                  height: "24px",
                  background: "var(--cosmic-purple)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "white",
                  boxShadow: "0 0 10px var(--cosmic-purple)"
                }}>
                  ✦
                </div>
              )}
              {m.text || (isLoading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        padding: "1rem",
        background: "rgba(10, 1, 24, 0.6)",
        backdropFilter: "blur(15px)",
        borderTop: "1px solid var(--glass-border)"
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          style={{
            display: "flex",
            gap: "0.75rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "1.5rem",
            padding: "0.25rem 0.25rem 0.25rem 1rem",
            alignItems: "center"
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "white",
              padding: "0.5rem 0",
              fontSize: "0.95rem"
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: input.trim() ? "var(--cosmic-purple)" : "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              transition: "all 0.2s"
            }}
          >
            {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
