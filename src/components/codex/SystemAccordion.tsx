"use client"
import { useState } from "react"
import type { SoulProfile } from "@/types/soulcodex"

type Props = {
  profile?: SoulProfile | null
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "0.45rem 0",
        borderBottom: "1px solid rgba(45,37,84,0.35)",
        gap: "1rem",
      }}
    >
      <span style={{ fontSize: "0.72rem", color: "#8B87A8", fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: "0.78rem", color: color || "#EAEAF5", fontWeight: 500, textAlign: "right" }}>
        {value}
      </span>
    </div>
  )
}

export default function SystemAccordion({ profile }: Props) {
  const [open, setOpen] = useState(false)

  const hd = profile?.humanDesign
  const elements = profile?.elements
  const morals = profile?.morals
  const num = profile?.numerology

  return (
    <div
      className="card"
      style={{
        background: "rgba(28,22,53,0.72)",
        border: "1px solid rgba(45,37,84,0.55)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#EAEAF5",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          minHeight: "unset",
          minWidth: "unset",
          padding: 0,
        }}
      >
        System Details
        <span
          style={{
            color: "#8B87A8",
            fontSize: "1rem",
            transition: "transform 0.25s ease",
            transform: open ? "rotate(45deg)" : "none",
            display: "inline-block",
          }}
        >
          +
        </span>
      </button>

      {open && (
        <div
          className="animate-slideUp"
          style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {hd && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#F2C94C",
                  marginBottom: "0.4rem",
                }}
              >
                Human Design
              </p>
              <Row label="Type" value={hd.type || "—"} color="#F2C94C" />
              <Row label="Strategy" value={hd.strategy || "—"} />
              <Row label="Authority" value={hd.authority || "—"} />
            </div>
          )}

          {elements && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#6BA7FF",
                  marginBottom: "0.4rem",
                }}
              >
                Elements
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.1rem" }}>
                <Row label="Fire" value={String(elements.fire ?? "—")} color="#ef4444" />
                <Row label="Earth" value={String(elements.earth ?? "—")} color="#22c55e" />
                <Row label="Air" value={String(elements.air ?? "—")} color="#6BA7FF" />
                <Row label="Water" value={String(elements.water ?? "—")} color="#7B61FF" />
              </div>
            </div>
          )}

          {morals && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9B8AFF",
                  marginBottom: "0.4rem",
                }}
              >
                Moral Compass
              </p>
              <Row label="Values" value={morals.values.length > 0 ? morals.values.join(", ") : "—"} color="#9B8AFF" />
              {morals.crisisResponse && (
                <Row label="Crisis Response" value={morals.crisisResponse} />
              )}
            </div>
          )}

          {num && (
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#F2C94C",
                  marginBottom: "0.4rem",
                }}
              >
                Numerology
              </p>
              <Row label="Life Path" value={String(num.lifePath ?? "—")} color="#F2C94C" />
              <Row label="Expression" value={String(num.expression ?? "—")} />
              <Row label="Soul Urge" value={String(num.soulUrge ?? "—")} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
