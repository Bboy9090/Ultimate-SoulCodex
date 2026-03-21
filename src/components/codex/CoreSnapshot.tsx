import type { SoulProfile } from "@/types/soulcodex"

type Props = {
  profile?: SoulProfile | null
}

const PLANET_ROWS = [
  { key: "sun",    label: "Sun",    color: "#F2C94C" },
  { key: "moon",   label: "Moon",   color: "#6BA7FF" },
  { key: "rising", label: "Rising", color: "#9B8AFF" },
]

export default function CoreSnapshot({ profile }: Props) {
  const chart = profile?.chart
  const numerology = profile?.numerology

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(123,97,255,0.14)",
      }}
    >
      <h2 className="card-title" style={{ marginBottom: "1rem" }}>
        Core Snapshot
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", marginBottom: "0.75rem" }}>
        {PLANET_ROWS.map((row, i) => {
          const sign = chart ? (chart as any)[row.key]?.sign : null
          const degree = chart ? (chart as any)[row.key]?.degree : null
          return (
            <div
              key={row.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: i < PLANET_ROWS.length - 1
                  ? "1px solid rgba(45,37,84,0.4)"
                  : "none",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#8B87A8", fontWeight: 500 }}>
                {row.label}
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: sign ? row.color : "rgba(139,135,168,0.35)" }}>
                {sign || "—"}
                {degree !== undefined && degree !== null && (
                  <span style={{ fontSize: "0.65rem", color: "rgba(139,135,168,0.5)", marginLeft: "0.3rem", fontWeight: 400 }}>
                    {Math.round(degree)}°
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.6rem",
          borderTop: "1px solid rgba(45,37,84,0.4)",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#8B87A8", fontWeight: 500 }}>Life Path</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: numerology?.lifePath ? "#F2C94C" : "rgba(139,135,168,0.35)" }}>
          {numerology?.lifePath ?? "—"}
        </span>
      </div>
    </div>
  )
}
