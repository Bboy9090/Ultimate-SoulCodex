/**
 * TechnicalAppendix
 *
 * Calculation methodology, data sources, metadata, version info
 * Only shown in Technical depth mode
 */

import type { AstrologyDataStatus, BirthData } from "@soulcodex/core";

interface TechnicalAppendixProps {
  birthData: BirthData;
  meta?: {
    engineVersion?: string;
    generatedAt?: string;
    calculationStatus?: AstrologyDataStatus;
  };
}

function astrologyStatusLabel(status?: AstrologyDataStatus): string {
  switch (status) {
    case "verified_ephemeris":
      return "Verified ephemeris for this reading";
    case "estimated_birth_window":
      return "Estimated birth-window astronomy";
    case "date_only":
      return "Date-only astronomy; time-sensitive geometry withheld";
    case "legacy_approximation":
      return "Legacy approximation; excluded from verified synthesis";
    case "unavailable":
    default:
      return "Astronomy verification unavailable";
  }
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
            <div>Engine: Soul Codex governed astronomy stack</div>
            <div>House System: Equal House production policy</div>
            <div>Zodiac: Tropical</div>
            <div>Astronomy Status: {astrologyStatusLabel(meta?.calculationStatus)}</div>
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
        <strong style={{ color: "var(--sc-amber)" }}>Note:</strong> This record describes calculation support, not certainty about personality or outcomes. Astrology enters verified surfaces only after the applicable evidence contract passes. Numerology arithmetic is deterministic under the governed reduction policy. Human Design contributes only when its separate verified core contract is present. Unknown or approximate birth time limits time-sensitive chart geometry rather than being silently replaced with invented precision.
      </div>
    </div>
  );
}
