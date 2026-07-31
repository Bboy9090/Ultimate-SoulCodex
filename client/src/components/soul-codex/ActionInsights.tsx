/**
 * ActionInsights - Phase 3
 *
 * Mechanism-based action guidance across domains
 * Shows HOW to leverage strengths and WHAT to watch for
 *
 * OLD: "Avoid overthinking decisions"
 * NEW: "Ask first: 'Do you want me to problem-solve this, or do you need to think
 *       it through?' Then actually listen to the answer. Your instinct to improve
 *       isn't malice, but the recipient may experience it as judgment."
 */

interface ActionInsight {
  domain: string;
  currentPattern: string;
  leverage: string;
  guard: string;
  test: string;
}

interface ActionInsightsProps {
  insights: ActionInsight[];
}

export default function ActionInsights({ insights }: ActionInsightsProps) {
  const domainColors: Record<string, { bg: string; color: string }> = {
    "Work & Contribution": {
      bg: "rgba(212,168,95,0.12)",
      color: "var(--sc-gold)",
    },
    Relationships: {
      bg: "rgba(233,30,99,0.12)",
      color: "var(--sc-rose)",
    },
    "Self-Understanding": {
      bg: "rgba(103,58,183,0.12)",
      color: "rgba(156,39,176,1)",
    },
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-gold)",
          margin: "0 0 2rem 0",
        }}
      >
        Actionable Insights
      </h2>

      <div
        style={{
          display: "grid",
          gap: "2rem",
        }}
      >
        {insights.map((insight) => {
          const colors = domainColors[insight.domain] || {
            bg: "rgba(255,255,255,0.04)",
            color: "var(--sc-teal)",
          };

          return (
            <div
              key={insight.domain}
              style={{
                padding: "1.5rem",
                background: colors.bg,
                border: `1px solid ${colors.color}30`,
                borderRadius: "12px",
              }}
            >
              {/* Domain */}
              <h3
                style={{
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  color: colors.color,
                  margin: "0 0 1.5rem 0",
                }}
              >
                {insight.domain}
              </h3>

              {/* Four-part structure: Current / Leverage / Guard / Test */}
              <div
                data-insight-grid
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "1.5rem",
                }}
              >
                <style>{`
                  @media (min-width: 768px) {
                    [data-insight-grid] {
                      grid-template-columns: 1fr 1fr;
                    }
                  }
                `}</style>
                {/* Left: Current Pattern */}
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--sc-stone)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Current Pattern
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--sc-ivory)",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {insight.currentPattern}
                  </p>
                </div>

                {/* Right: Leverage */}
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: colors.color,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Lean Into
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--sc-ivory)",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {insight.leverage}
                  </p>
                </div>

                {/* Left: Guard */}
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--sc-amber)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Watch For
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--sc-ivory)",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {insight.guard}
                  </p>
                </div>

                {/* Right: Test */}
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: "var(--sc-teal)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    How You'll Know
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--sc-ivory)",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {insight.test}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
