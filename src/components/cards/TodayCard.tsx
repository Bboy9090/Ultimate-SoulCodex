import type { DailyCard } from "@/types/soulcodex"

export default function TodayCard({ data }: { data?: DailyCard | null }) {
  if (!data) {
    return (
      <div className="card">
        <p className="section-label text-center mb-3">Today</p>
        <div className="skeleton h-4 w-3/4 mx-auto mb-3" />
        <div className="skeleton h-3 w-full mb-2" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    )
  }

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(107,167,255,0.14)",
      }}
    >
      {/* Header */}
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#6BA7FF",
          textAlign: "center",
          marginBottom: "0.75rem",
        }}
      >
        Today&apos;s Focus
      </p>

      <p
        className="oracle-text"
        style={{ fontSize: "0.9rem", color: "#8B87A8", marginBottom: "1.25rem", textAlign: "center", fontStyle: "italic" }}
      >
        {data.focus}
      </p>

      {/* Do / Don't grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "0.5rem" }}>
        <div
          style={{
            padding: "0.75rem",
            background: "rgba(242,201,76,0.05)",
            border: "1px solid rgba(242,201,76,0.12)",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#F2C94C",
              marginBottom: "0.6rem",
            }}
          >
            Do
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.do.map((item, i) => (
              <li key={i} style={{ fontSize: "0.8rem", display: "flex", gap: "0.4rem", lineHeight: 1.5 }}>
                <span style={{ color: "#F2C94C", flexShrink: 0, marginTop: "0.05rem" }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            padding: "0.75rem",
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.12)",
            borderRadius: 12,
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#ef4444",
              marginBottom: "0.6rem",
            }}
          >
            Don&apos;t
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.dont.map((item, i) => (
              <li key={i} style={{ fontSize: "0.8rem", display: "flex", gap: "0.4rem", lineHeight: 1.5 }}>
                <span style={{ color: "#ef4444", flexShrink: 0, marginTop: "0.05rem" }}>✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transits */}
      {data.transits && data.transits.length > 0 && (
        <div style={{ marginTop: "1.1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {data.transits.map((t, i) => (
            <div
              key={i}
              style={{
                paddingTop: "0.85rem",
                borderTop: "1px solid rgba(45,37,84,0.5)",
              }}
            >
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9B8AFF" }}>{t.title}</p>
              <p style={{ fontSize: "0.72rem", color: "#8B87A8", marginTop: "0.25rem" }}>{t.whatItAffects}</p>
              <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", lineHeight: 1.65 }}>{t.realLifeExample}</p>
            </div>
          ))}
        </div>
      )}

      {/* Decision advice */}
      {data.decisionAdvice && (
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.78rem",
            color: "#6BA7FF",
            lineHeight: 1.7,
            paddingTop: "0.85rem",
            borderTop: "1px solid rgba(45,37,84,0.4)",
          }}
        >
          {data.decisionAdvice}
        </p>
      )}
    </div>
  )
}
