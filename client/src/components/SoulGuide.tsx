import { useState, useEffect } from "react";
import {
  generateSoulGuidePromptText,
  parseSoulGuideResponse,
  saveSoulGuideInterpretation,
  loadSoulGuideInterpretation,
  type SoulGuideInterpretation,
} from "@soulcodex/core";
import type { TimelineIntelligenceSummary } from "@soulcodex/core";
import { IconSparkles } from "./Icons";

interface SoulGuideProps {
  intelligence: TimelineIntelligenceSummary | null;
}

export default function SoulGuide({ intelligence }: SoulGuideProps) {
  const [interpretation, setInterpretation] =
    useState<SoulGuideInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiPrompt, setShowApiPrompt] = useState(false);

  useEffect(() => {
    if (!intelligence) {
      setInterpretation(null);
      return;
    }

    // Try to load cached interpretation first
    const cached = loadSoulGuideInterpretation();
    if (cached) {
      // Validate cache is still fresh for current intelligence data
      if (cached.dataPointsAnalyzed === intelligence.sampleSize) {
        setInterpretation(cached);
        return;
      }
      // Cache is stale; fall through to regenerate
    }

    // If no cache and no API key configured, show prompt
    const apiKey = localStorage.getItem("soulcodex.claudeApiKey");
    if (!apiKey) {
      setShowApiPrompt(true);
      return;
    }

    // Generate new interpretation
    generateInterpretation(intelligence, apiKey);
  }, [intelligence]);

  async function generateInterpretation(
    summary: TimelineIntelligenceSummary,
    apiKey: string
  ) {
    setLoading(true);
    setError(null);

    try {
      const prompt = generateSoulGuidePromptText(summary);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: `You are an interpreter of personal tracking data. Your role is to help people understand what their logged experience reveals compared to astrological predictions.

CRITICAL CONSTRAINTS:
- Never invent or predict new events or signals
- Only reference data explicitly provided
- Help the user reflect, not decide
- Acknowledge data limitations
- Respect their judgment above all

Always respond with valid JSON matching the expected structure.`,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API error: ${response.status}`
        );
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error("No content in API response");
      }

      const parsed = parseSoulGuideResponse(content);
      if (!parsed) {
        throw new Error("Failed to parse API response");
      }

      setInterpretation(parsed);
      saveSoulGuideInterpretation(parsed);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      console.error("[SoulGuide] Generation error:", message);
    } finally {
      setLoading(false);
    }
  }

  function handleApiKeySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const apiKey = formData.get("apiKey") as string;

    if (!apiKey.trim()) {
      setError("API key cannot be empty");
      return;
    }

    localStorage.setItem("soulcodex.claudeApiKey", apiKey);
    setShowApiPrompt(false);

    if (intelligence) {
      generateInterpretation(intelligence, apiKey);
    }
  }

  // Empty state
  if (!intelligence || intelligence.sampleSize < 7) {
    return null;
  }

  // API key prompt
  if (showApiPrompt) {
    return (
      <div
        style={{
          padding: "2rem",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px dashed rgba(212,168,95,0.2)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            marginBottom: "1rem",
            color: "var(--sc-ivory)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <IconSparkles size={20} style={{ color: "var(--sc-gold)" }} />
          Soul Guide
        </h2>
        <p
          style={{
            color: "var(--sc-stone)",
            marginBottom: "1.5rem",
            maxWidth: "400px",
            margin: "0 auto 1.5rem",
          }}
        >
          Enable AI interpretation of your Timeline Intelligence by providing
          your Claude API key.
        </p>
        <form
          onSubmit={handleApiKeySubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "300px",
            margin: "0 auto",
          }}
        >
          <input
            type="password"
            name="apiKey"
            placeholder="sk-ant-..."
            style={{
              padding: "0.75rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "var(--sc-ivory)",
              fontSize: "0.9rem",
              fontFamily: "monospace",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              background: "rgba(212,168,95,0.2)",
              border: "1px solid rgba(212,168,95,0.4)",
              color: "var(--sc-gold)",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Enable Soul Guide
          </button>
        </form>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--sc-stone)",
            marginTop: "1rem",
            fontStyle: "italic",
          }}
        >
          Your API key is stored locally and never sent to our servers.
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "16px",
          border: "1px solid rgba(212,168,95,0.2)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <IconSparkles
            size={20}
            style={{
              color: "var(--sc-gold)",
              animation: "spin 2s linear infinite",
            }}
          />
          <span style={{ color: "var(--sc-ivory)", fontWeight: 600 }}>
            Soul Guide is reflecting...
          </span>
        </div>
        <p style={{ color: "var(--sc-stone)", fontSize: "0.9rem" }}>
          Interpreting your Timeline Intelligence observations.
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "16px",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "var(--sc-stone)",
            marginTop: 0,
            marginBottom: "0.75rem",
          }}
        >
          Soul Guide Error
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--sc-stone)", margin: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  // Interpretation display
  if (!interpretation) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header with theme */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(212,168,95,0.08)",
          borderLeft: "3px solid var(--sc-gold)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <IconSparkles size={18} style={{ color: "var(--sc-gold)" }} />
          <h3
            style={{
              margin: 0,
              fontSize: "0.95rem",
              textTransform: "uppercase",
              color: "var(--sc-gold)",
            }}
          >
            Soul Guide Interpretation
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--sc-ivory)",
          }}
        >
          {interpretation.theme}
        </p>
      </div>

      {/* Main narrative */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(212,168,95,0.2)",
        }}
      >
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          {interpretation.narrative}
        </p>
      </div>

      {/* Key insights */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(34,211,238,0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "var(--sc-teal)",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          Key Insights
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {interpretation.keyInsights.map((insight, idx) => (
            <div key={idx} style={{ fontSize: "0.9rem", color: "var(--sc-stone)" }}>
              • {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Reflection prompts */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "var(--sc-ivory)",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          Questions for Reflection
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {interpretation.reflectionPrompts.map((prompt, idx) => (
            <div
              key={idx}
              style={{
                fontSize: "0.9rem",
                color: "var(--sc-stone)",
                lineHeight: "1.5",
              }}
            >
              {idx + 1}. {prompt}
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,255,255,0.04)",
          borderRadius: "12px",
          border: "1px solid rgba(212,168,95,0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "0.95rem",
            textTransform: "uppercase",
            color: "var(--sc-gold)",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          Next Steps
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {interpretation.nextSteps.map((step, idx) => (
            <div
              key={idx}
              style={{ fontSize: "0.9rem", color: "var(--sc-stone)" }}
            >
              {idx + 1}. {step}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          padding: "1rem",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "8px",
          border: "1px dashed rgba(255,255,255,0.1)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "var(--sc-stone)", margin: 0 }}>
          <span style={{ fontStyle: "italic" }}>
            Soul Guide reflects on your evidence, never invents it.
          </span>
        </p>
      </div>
    </div>
  );
}
