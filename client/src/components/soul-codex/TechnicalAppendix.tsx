/**
 * TechnicalAppendix
 *
 * Calculation methodology, data sources, metadata, version info
 * Only shown in Technical depth mode
 */

import type { BirthData } from "@soulcodex/core";

interface TechnicalAppendixProps {
  birthData: BirthData;
  meta?: any;
}

export default function TechnicalAppendix({ birthData, meta }: TechnicalAppendixProps) {
  return (
    <div
      style={{
        padding: "2rem",
        background: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
        borderRadius: "12px",
      }}
    >
      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-stone)",
          margin: "0 0 1.5rem 0",
        }}
      >
        Technical Record
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Birth Data */}
        <div>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
            Birth Data
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--sc-stone)", lineHeight: "1.8" }}>
            <div>Date: {birthData.date}</div>
            <div>Time: {birthData.time || "Unknown"}</div>
            <div>Location: {birthData.location}</div>
            <div>Timezone: {birthData.timezone}</div>
          </div>
        </div>

        {/* Calculation Method */}
        <div>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
            Calculation Method
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--sc-stone)", lineHeight: "1.8" }}>
            <div>Engine: astronomy-engine</div>
            <div>House System: Placidus</div>
            <div>Zodiac: Tropical</div>
            <div>Ephemeris: SOFA-compliant</div>
          </div>
        </div>

        {/* Version Info */}
        <div>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--sc-gold)", marginBottom: "0.75rem" }}>
            Version
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--sc-stone)", lineHeight: "1.8" }}>
            <div>Engine: {meta?.engineVersion || "1.0.0"}</div>
            <div>Generated: {meta?.generatedAt ? new Date(meta.generatedAt).toLocaleString() : "—"}</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(255,152,0,0.08)",
          border: "1px dashed rgba(255,152,0,0.2)",
          borderRadius: "8px",
          fontSize: "0.8rem",
          color: "var(--sc-stone)",
          lineHeight: "1.6",
        }}
      >
        <strong style={{ color: "var(--sc-amber)" }}>Note:</strong> This reading synthesizes astrology, numerology, and Human Design. Calculation precision depends on birth time accuracy. Unknown or rounded birth times reduce house and ascendant confidence.
      </div>
    </div>
  );
}
