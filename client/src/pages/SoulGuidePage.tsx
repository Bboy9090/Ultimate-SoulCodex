import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Send, Sparkles, MessageSquare, ArrowLeft, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "What's my greatest strength?",
  "Where do I self-sabotage?",
  "What should I focus on this week?"
];

export default function SoulGuidePage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getProfileContext = () => {
    try {
      const rawProfile = localStorage.getItem("soulProfile");
      if (!rawProfile) return null;
      const profile = JSON.parse(rawProfile);
      
      return {
        name: profile.name,
        archetype: profile.archetype?.name,
        element: profile.archetype?.element,
        role: profile.archetype?.role,
        sunSign: profile.sunSign,
        moonSign: profile.moonSign,
        risingSign: profile.risingSign,
        lifePath: profile.lifePath,
        coreEssence: profile.synthesis?.coreEssence
      };
    } catch (e) {
      console.error("Failed to parse soulProfile for context", e);
      return null;
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const profileContext = getProfileContext();
    
    // Prepare history for Gemini format: { role: "user"|"model", parts: [{ text }] }
    // Exclude the latest user message as it's sent separately
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await fetch("/api/chat/soul-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          profileContext
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const fallbackMsg = errData?.message || "The Soul Guide is reconnecting. Please try again in a moment.";
        setMessages(prev => [...prev, { role: "model", text: fallbackMsg }]);
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      // Add empty assistant message to start streaming into
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
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: "model",
        text: "The Soul Guide is reconnecting. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div>
          <h1 style={{ fontSize: "1.25rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} className="text-cosmic-purple" />
            Soul Guide
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
            Bronx-style mystical wisdom
          </p>
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
        {messages.length === 0 && !error && (
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
              Anything about your path, patterns, or next move. No fluff, just the real deal.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "320px" }}>
              {SUGGESTIONS.map((s, i) => (
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

        {error && (
          <div style={{ 
            padding: "1rem", 
            borderRadius: "1rem", 
            background: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "1rem"
          }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
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
