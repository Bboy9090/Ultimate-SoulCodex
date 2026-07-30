/**
 * EvidenceDrawer - Phase 2
 *
 * Hide the full audit behind an expandable "Why this reading?" drawer
 * User-facing page shows insight first, audit second
 *
 * Drawer contains:
 * - Input sources
 * - Calculation methods
 * - Evidence layers
 * - Confidence reasoning
 * - Time sensitivity
 * - Limitations (grouped)
 * - Version/provenance
 */

import { useState } from "react";
import type { EvidenceLayer, LimitationGroup } from "@soulcodex/core";

interface EvidenceDrawerProps {
  evidenceLayers: EvidenceLayer[];
  limitations: LimitationGroup[];
  calculatedAt?: string;
  engineVersion?: string;
  calculationMethod?: string;
}

export default function EvidenceDrawer({
  evidenceLayers,
  limitations,
  calculatedAt,
  engineVersion,
  calculationMethod,
}: EvidenceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const highConfidence = evidenceLayers.filter((l) => l.confidence === "high");
  const moderateConfidence = evidenceLayers.filter((l) => l.confidence === "moderate");
  const lowConfidence = evidenceLayers.filter((l) => l.confidence === "low");

  return (
    <div
      style={{
        marginTop: "2rem",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "1.5rem",
      }}
    >
      {/* Drawer Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          color: "var(--sc-teal)",
          fontSize: "0.9rem",
          cursor: "pointer",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: 0,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span style={{ fontSize: "1.1em" }}>{isOpen ? "▼" : "▶"}</span>
        Why this reading?
      </button>

      {/* Drawer Content */}
      {isOpen && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        >
          {/* Evidence Layers by Confidence */}
          <div style={{ marginBottom: "2rem" }}>
            <h4
              style={{
                fontSize: "0.85rem",
                textTransform: "uppercase",
                color: "var(--sc-gold)",
                marginBottom: "1rem",
              }}
            >
              Evidence Layers
            </h4>

            {highConfidence.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--sc-teal)",
                    marginBottom: "0.5rem",
                  }}
                >
                  ✓ High Confidence ({highConfidence.length})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {highConfidence.map((layer) => (
                    <EvidenceLayerCard key={layer.name} layer={layer} />
                  ))}
                </div>
              </div>
            )}

            {moderateConfidence.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--sc-amber)",
                    marginBottom: "0.5rem",
                  }}
                >
                  ≈ Moderate Confidence ({moderateConfidence.length})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {moderateConfidence.map((layer) => (
                    <EvidenceLayerCard key={layer.name} layer={layer} />
                  ))}
                </div>
              </div>
            )}

            {lowConfidence.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--sc-stone)",
                    marginBottom: "0.5rem",
                  }}
                >
                  ○ Low Confidence ({lowConfidence.length})
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {lowConfidence.map((layer) => (
                    <EvidenceLayerCard key={layer.name} layer={layer} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Limitations */}
          {limitations.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  color: "var(--sc-gold)",
                  marginBottom: "1rem",
                }}
              >
                {limitations.length} Active Limitation{limitations.length !== 1 ? "s" : ""}
              </h4>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {limitations.map((limit) => (
                  <div
                    key={limit.category}
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,152,0,0.08)",
                      border: "1px solid rgba(255,152,0,0.2)",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "var(--sc-stone)",
                    }}
                  >
                    <div style={{ fontWeight: 500, color: "var(--sc-amber)" }}>
                      {limit.userFacingLabel}
                    </div>
                    {limit.examples.length > 0 && (
                      <div style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.8 }}>
                        {limit.examples.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
                fontSize: "0.8rem",
                color: "var(--sc-stone)",
              }}
            >
              {calculationMethod && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Calculation</div>
                  <div>{calculationMethod}</div>
                </div>
              )}
              {engineVersion && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Engine</div>
                  <div>{engineVersion}</div>
                </div>
              )}
              {calculatedAt && (
                <div>
                  <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Generated</div>
                  <div>{new Date(calculatedAt).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EvidenceLayerCardProps {
  layer: EvidenceLayer;
}

function EvidenceLayerCard({ layer }: EvidenceLayerCardProps) {
  return (
    <div
      style={{
        padding: "0.75rem",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "6px",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--sc-ivory)", marginBottom: "0.5rem" }}>
        {layer.name}
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--sc-gold)",
          fontWeight: 500,
          marginBottom: "0.75rem",
        }}
      >
        {layer.value}
      </div>

      <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.75rem", color: "var(--sc-stone)" }}>
        {layer.inputStatus && (
          <div>
            <span style={{ opacity: 0.7 }}>Input:</span> {layer.inputStatus}
            {layer.inputRemark && <div style={{ opacity: 0.6 }}>→ {layer.inputRemark}</div>}
          </div>
        )}

        {layer.calculationStatus && (
          <div>
            <span style={{ opacity: 0.7 }}>Calculation:</span> {layer.calculationStatus}
            {layer.calculationRemark && <div style={{ opacity: 0.6 }}>→ {layer.calculationRemark}</div>}
          </div>
        )}

        {layer.interpretationStatus && (
          <div>
            <span style={{ opacity: 0.7 }}>Interpretation:</span> {layer.interpretationStatus}
            {layer.interpretationRemark && <div style={{ opacity: 0.6 }}>→ {layer.interpretationRemark}</div>}
          </div>
        )}

        {layer.confidence && (
          <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.1)" }}>
            <span style={{ color: "var(--sc-teal)" }}>◆ Confidence:</span> {layer.confidence}
            {layer.confidenceReason && (
              <div style={{ opacity: 0.6 }}>({layer.confidenceReason})</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
