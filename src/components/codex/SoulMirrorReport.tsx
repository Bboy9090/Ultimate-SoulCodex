import type { Archetype } from "@/types/soulcodex"

export default function SoulMirrorReport({ archetype }: { archetype?: Archetype | null }){

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(242,201,76,0.14)",
      }}
    >
      <h2 className="card-title" style={{ marginBottom: "1rem" }}>
        Soul Mirror Report
      </h2>

      {archetype ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <p className="heading-display" style={{ fontSize: "1.15rem" }}>
            {archetype.name}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#8B87A8", lineHeight: 1.65 }}>
            {archetype.tagline}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {archetype.element && (
              <span style={{ padding: "0.25rem 0.75rem", background: "rgba(242,201,76,0.07)", border: "1px solid rgba(242,201,76,0.2)", borderRadius: 9999, fontSize: "0.72rem", color: "#F2C94C", fontWeight: 500 }}>
                {archetype.element}
              </span>
            )}
            {archetype.role && (
              <span style={{ padding: "0.25rem 0.75rem", background: "rgba(123,97,255,0.07)", border: "1px solid rgba(123,97,255,0.2)", borderRadius: 9999, fontSize: "0.72rem", color: "#9B8AFF", fontWeight: 500 }}>
                {archetype.role}
              </span>
            )}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "#8B87A8", lineHeight: 1.7 }}>
          Complete onboarding to generate your soul mirror report.
        </p>
      )}
    </div>
  )
}
