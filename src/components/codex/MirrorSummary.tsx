import type { MirrorProfile } from "@/types/soulcodex"

const MIRROR_ROWS: { key: keyof MirrorProfile; label: string; color: string }[] = [
  { key: "driver",        label: "Core Driver",     color: "#F2C94C" },
  { key: "shadowTrigger", label: "Shadow Trigger",  color: "#ef4444" },
  { key: "decisionStyle", label: "Decision Style",  color: "#6BA7FF" },
  { key: "energyStyle",   label: "Energy Style",    color: "#9B8AFF" },
  { key: "conflictStyle", label: "Conflict Style",  color: "#F2C94C" },
]

export default function MirrorSummary({ data }: { data?: MirrorProfile | null }) {
  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(123,97,255,0.14)",
      }}
    >
      <h2 className="card-title" style={{ marginBottom: "1rem" }}>
        Mirror Summary
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {MIRROR_ROWS.map((row, i) => {
          const value = data ? data[row.key] : null
          return (
            <div
              key={row.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.55rem 0",
                borderBottom: i < MIRROR_ROWS.length - 1
                  ? "1px solid rgba(45,37,84,0.4)"
                  : "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#8B87A8",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: value ? row.color : "rgba(139,135,168,0.35)",
                }}
              >
                {value || "—"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
