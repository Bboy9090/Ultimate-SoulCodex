import type { TimelineProfile } from "@/types/soulcodex"

export default function PhaseCard({ data }: { data?: TimelineProfile | null }) {
  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(123,97,255,0.14)",
      }}
    >
      <h2 className="card-title" style={{ marginBottom: "0.85rem" }}>
        Current Phase
      </h2>

      <p
        className="heading-display"
        style={{ fontSize: "1.25rem", color: "#9B8AFF", marginBottom: "0.5rem" }}
      >
        {data?.currentPhase || "—"}
      </p>

      {data?.nextPhase && (
        <p style={{ fontSize: "0.72rem", color: "#8B87A8", marginBottom: "0.85rem" }}>
          Next: <span style={{ color: "#7B61FF", fontWeight: 500 }}>{data.nextPhase}</span>
        </p>
      )}

      {data?.reasons && data.reasons.length > 0 && (
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
          {data.reasons.map((r, i) => (
            <li key={i} style={{ fontSize: "0.8rem", color: "#8B87A8", display: "flex", gap: "0.4rem", lineHeight: 1.55 }}>
              <span style={{ color: "#7B61FF", flexShrink: 0 }}>›</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
