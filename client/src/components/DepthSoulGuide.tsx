import { useMemo, useState } from "react";
import {
  buildDepthSoulGuideViewModel,
  type DepthInterpretationV1,
  type DepthSoulGuideLayerView,
  type InterpretationClaimKind,
  type InterpretationConfidence,
} from "@soulcodex/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconInfo,
  IconSparkles,
} from "./Icons";

export interface DepthSoulGuideProps {
  interpretation: DepthInterpretationV1;
  defaultOpenGroupIds?: string[];
  defaultEvidenceOpen?: boolean;
}

const PRIMARY_HEADINGS: Record<
  "claritySummary" | "coreContradiction" | "action",
  string
> = {
  claritySummary: "Your Core Pattern",
  coreContradiction: "The Main Contradiction",
  action: "What To Do With It",
};

const SUPPORT_CONFIG: Record<
  InterpretationConfidence,
  { label: string; color: string; background: string; border: string }
> = {
  high: {
    label: "High source support",
    color: "var(--sc-gold, #d4a85f)",
    background: "rgba(212, 168, 95, 0.12)",
    border: "rgba(212, 168, 95, 0.38)",
  },
  moderate: {
    label: "Moderate source support",
    color: "var(--cosmic-lavender, #c8beff)",
    background: "rgba(168, 145, 255, 0.12)",
    border: "rgba(168, 145, 255, 0.35)",
  },
  low: {
    label: "Low source support",
    color: "var(--muted-foreground, #9b96aa)",
    background: "rgba(255, 255, 255, 0.04)",
    border: "rgba(255, 255, 255, 0.14)",
  },
};

const CLAIM_LABELS: Record<InterpretationClaimKind, string> = {
  observed: "Observed",
  derived: "Derived",
  inferred: "Inferred",
  unavailable: "Unavailable",
};

function SupportPill({ confidence }: { confidence: InterpretationConfidence }) {
  const config = SUPPORT_CONFIG[confidence];

  return (
    <span
      role="status"
      aria-label={`${config.label}. Confidence reflects source quality and consistency, not scientific truth.`}
      className="depth-guide-support-pill"
      style={{
        color: config.color,
        background: config.background,
        borderColor: config.border,
      }}
    >
      {config.label}
    </span>
  );
}

function ClaimPill({ claimKind }: { claimKind: InterpretationClaimKind }) {
  return (
    <span
      className={`depth-guide-claim-pill depth-guide-claim-${claimKind}`}
      aria-label={`Claim type: ${CLAIM_LABELS[claimKind]}`}
    >
      {CLAIM_LABELS[claimKind]}
    </span>
  );
}

function TraceDetails({ layer }: { layer: DepthSoulGuideLayerView }) {
  return (
    <div className="depth-guide-trace" aria-label={`${layer.title} evidence details`}>
      <div className="depth-guide-trace-row">
        <ClaimPill claimKind={layer.claimKind} />
        <SupportPill confidence={layer.confidence} />
      </div>

      <div className="depth-guide-trace-block">
        <strong>Evidence references</strong>
        {layer.evidenceIds.length > 0 ? (
          <ul>
            {layer.evidenceIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : (
          <p>No evidence reference is available for this layer.</p>
        )}
      </div>

      <div className="depth-guide-trace-block">
        <strong>Limitations</strong>
        {layer.limitations.length > 0 ? (
          <ul>
            {layer.limitations.map((limitation, index) => (
              <li key={`${layer.key}-limitation-${index}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p>No additional limitation was recorded.</p>
        )}
      </div>
    </div>
  );
}

function LayerCard({
  layer,
  showTrace,
  primaryHeading,
}: {
  layer: DepthSoulGuideLayerView;
  showTrace: boolean;
  primaryHeading?: string;
}) {
  return (
    <article
      className={`depth-guide-layer-card${layer.unavailable ? " depth-guide-layer-unavailable" : ""}`}
      data-layer-key={layer.key}
    >
      <div className="depth-guide-layer-heading">
        <div>
          {primaryHeading && (
            <p className="depth-guide-eyebrow">{primaryHeading}</p>
          )}
          <h3>{layer.title}</h3>
        </div>
        {!showTrace && <SupportPill confidence={layer.confidence} />}
      </div>

      <p className="depth-guide-layer-summary">{layer.summary}</p>
      <p className="depth-guide-layer-explanation">{layer.explanation}</p>

      {layer.unavailable && (
        <div className="depth-guide-unavailable-note">
          <IconInfo size={15} aria-hidden="true" />
          <span>This layer remains visible so missing support is not mistaken for certainty.</span>
        </div>
      )}

      {showTrace && <TraceDetails layer={layer} />}
    </article>
  );
}

function formatEvidenceValue(value: string | number | boolean | null): string {
  if (value === null) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function provenanceLabel(value: string | undefined): string {
  if (value === "externally-verified") return "Externally verified";
  if (value === "partially-verified") return "Partially verified";
  return "Unverified";
}

export default function DepthSoulGuide({
  interpretation,
  defaultOpenGroupIds = [],
  defaultEvidenceOpen = false,
}: DepthSoulGuideProps) {
  const model = useMemo(
    () => buildDepthSoulGuideViewModel(interpretation),
    [interpretation],
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(defaultOpenGroupIds),
  );
  const [showTrace, setShowTrace] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(defaultEvidenceOpen);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="depth-guide" aria-labelledby="depth-guide-title">
      <header className="depth-guide-header">
        <div className="depth-guide-title-row">
          <div className="depth-guide-title-icon" aria-hidden="true">
            <IconSparkles size={20} />
          </div>
          <div>
            <p className="depth-guide-kicker">Clarity First, Depth On Demand</p>
            <h2 id="depth-guide-title">Soul Guide</h2>
          </div>
        </div>

        <div className="depth-guide-header-actions">
          <SupportPill confidence={model.overallConfidence} />
          <button
            type="button"
            className="depth-guide-secondary-button"
            aria-pressed={showTrace}
            onClick={() => setShowTrace((value) => !value)}
          >
            <IconInfo size={15} aria-hidden="true" />
            {showTrace ? "Hide layer evidence" : "Show layer evidence"}
          </button>
        </div>
      </header>

      <div className="depth-guide-principle">
        <p>
          Start with the strongest supported pattern, the tension inside it, and one grounded move.
          Open deeper layers only when they are useful.
        </p>
      </div>

      <div className="depth-guide-primary-grid" aria-label="Soul Guide clarity summary">
        {model.primary.map((layer) => (
          <LayerCard
            key={layer.key}
            layer={layer}
            showTrace={showTrace}
            primaryHeading={PRIMARY_HEADINGS[layer.key as keyof typeof PRIMARY_HEADINGS]}
          />
        ))}
      </div>

      <div className="depth-guide-disclosures" aria-label="Deeper interpretation layers">
        {model.disclosures.map((group) => {
          const open = openGroups.has(group.id);
          const panelId = `depth-guide-panel-${group.id}`;
          const buttonId = `depth-guide-button-${group.id}`;

          return (
            <div className="depth-guide-disclosure" key={group.id}>
              <button
                type="button"
                id={buttonId}
                className="depth-guide-disclosure-button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggleGroup(group.id)}
              >
                <span className="depth-guide-disclosure-icon" aria-hidden="true">
                  {open ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                </span>
                <span className="depth-guide-disclosure-copy">
                  <strong>{group.title}</strong>
                  <span>{group.description}</span>
                </span>
                <span className="depth-guide-disclosure-count">
                  {group.availableCount} supported
                  {group.unavailableCount > 0 ? `, ${group.unavailableCount} unavailable` : ""}
                </span>
              </button>

              {open && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="depth-guide-disclosure-panel"
                >
                  {group.layers.map((layer) => (
                    <LayerCard
                      key={layer.key}
                      layer={layer}
                      showTrace={showTrace}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="depth-guide-disclosure depth-guide-evidence-disclosure">
        <button
          type="button"
          id="depth-guide-evidence-button"
          className="depth-guide-disclosure-button"
          aria-expanded={evidenceOpen}
          aria-controls="depth-guide-evidence-panel"
          onClick={() => setEvidenceOpen((value) => !value)}
        >
          <span className="depth-guide-disclosure-icon" aria-hidden="true">
            {evidenceOpen ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
          </span>
          <span className="depth-guide-disclosure-copy">
            <strong>Evidence, confidence, and missing data</strong>
            <span>See exactly what supports the reading and what remains unknown.</span>
          </span>
          <span className="depth-guide-disclosure-count">
            {model.evidence.totalEvidence} evidence items
          </span>
        </button>

        {evidenceOpen && (
          <div
            id="depth-guide-evidence-panel"
            role="region"
            aria-labelledby="depth-guide-evidence-button"
            className="depth-guide-evidence-panel"
          >
            <div className="depth-guide-evidence-summary">
              <div>
                <span>Total evidence</span>
                <strong>{model.evidence.totalEvidence}</strong>
              </div>
              <div>
                <span>Externally verified</span>
                <strong>{model.evidence.externallyVerified}</strong>
              </div>
              <div>
                <span>Partially verified</span>
                <strong>{model.evidence.partiallyVerified}</strong>
              </div>
              <div>
                <span>Unverified</span>
                <strong>{model.evidence.unverified}</strong>
              </div>
              <div>
                <span>Recorded limitations</span>
                <strong>{model.evidence.limitationCount}</strong>
              </div>
            </div>

            <div className="depth-guide-evidence-list">
              {interpretation.evidence.map((evidence) => (
                <article className="depth-guide-evidence-item" key={evidence.id}>
                  <div className="depth-guide-evidence-item-heading">
                    <div>
                      <p>{evidence.system}</p>
                      <h3>{evidence.field}</h3>
                    </div>
                    <SupportPill confidence={evidence.confidence} />
                  </div>
                  <dl>
                    <div>
                      <dt>Reference</dt>
                      <dd>{evidence.id}</dd>
                    </div>
                    <div>
                      <dt>Value</dt>
                      <dd>{formatEvidenceValue(evidence.value)}</dd>
                    </div>
                    <div>
                      <dt>Provenance</dt>
                      <dd>{provenanceLabel(evidence.provenanceStatus)}</dd>
                    </div>
                    <div>
                      <dt>Time sensitivity</dt>
                      <dd>
                        {evidence.timeSensitivity === "birth-time-required"
                          ? "Exact birth time required"
                          : "Not birth-time sensitive"}
                      </dd>
                    </div>
                  </dl>
                  {evidence.notes && evidence.notes.length > 0 && (
                    <ul className="depth-guide-evidence-notes">
                      {evidence.notes.map((note, index) => (
                        <li key={`${evidence.id}-note-${index}`}>{note}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>

            <div className="depth-guide-missing-data">
              <h3>Missing data</h3>
              {model.missingData.length > 0 ? (
                <ul>
                  {model.missingData.map((item, index) => (
                    <li key={`missing-data-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No material missing data was recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="depth-guide-footer">
        <IconInfo size={15} aria-hidden="true" />
        <p>
          Confidence describes source quality and consistency, not scientific truth. Lived experience
          remains the final authority and may correct any layer.
        </p>
      </footer>

      <style>{`
        .depth-guide {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          color: var(--foreground, #f4f1ff);
        }
        .depth-guide-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          border: 1px solid rgba(212, 168, 95, 0.28);
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(212, 168, 95, 0.1), rgba(122, 82, 190, 0.08));
        }
        .depth-guide-title-row,
        .depth-guide-header-actions,
        .depth-guide-layer-heading,
        .depth-guide-evidence-item-heading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .depth-guide-header-actions {
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .depth-guide-title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          color: var(--sc-gold, #d4a85f);
          background: rgba(212, 168, 95, 0.12);
          border: 1px solid rgba(212, 168, 95, 0.28);
        }
        .depth-guide-kicker,
        .depth-guide-eyebrow,
        .depth-guide-evidence-item-heading p {
          margin: 0 0 0.2rem;
          color: var(--sc-gold, #d4a85f);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.11em;
          text-transform: uppercase;
        }
        .depth-guide-header h2,
        .depth-guide-layer-card h3,
        .depth-guide-evidence-item h3,
        .depth-guide-missing-data h3 {
          margin: 0;
        }
        .depth-guide-header h2 {
          font-size: 1.35rem;
        }
        .depth-guide-support-pill,
        .depth-guide-claim-pill {
          display: inline-flex;
          align-items: center;
          border: 1px solid;
          border-radius: 999px;
          padding: 0.22rem 0.58rem;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .depth-guide-claim-pill {
          border-color: rgba(255, 255, 255, 0.14);
          color: var(--muted-foreground, #aaa4b8);
          background: rgba(255, 255, 255, 0.04);
        }
        .depth-guide-claim-observed { color: #72d6b7; border-color: rgba(114, 214, 183, 0.34); }
        .depth-guide-claim-derived { color: #7fd6f2; border-color: rgba(127, 214, 242, 0.34); }
        .depth-guide-claim-inferred { color: #c8beff; border-color: rgba(200, 190, 255, 0.34); }
        .depth-guide-claim-unavailable { color: #aaa4b8; border-color: rgba(170, 164, 184, 0.24); }
        .depth-guide-secondary-button,
        .depth-guide-disclosure-button {
          font: inherit;
          color: inherit;
          cursor: pointer;
        }
        .depth-guide-secondary-button {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.48rem 0.72rem;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.72rem;
        }
        .depth-guide-secondary-button:hover,
        .depth-guide-disclosure-button:hover {
          border-color: rgba(212, 168, 95, 0.38);
          background: rgba(212, 168, 95, 0.07);
        }
        .depth-guide-secondary-button:focus-visible,
        .depth-guide-disclosure-button:focus-visible {
          outline: 2px solid var(--sc-gold, #d4a85f);
          outline-offset: 3px;
        }
        .depth-guide-principle,
        .depth-guide-footer {
          display: flex;
          align-items: flex-start;
          gap: 0.55rem;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          color: var(--muted-foreground, #aaa4b8);
          background: rgba(255, 255, 255, 0.025);
          border: 1px dashed rgba(255, 255, 255, 0.11);
        }
        .depth-guide-principle p,
        .depth-guide-footer p {
          margin: 0;
          font-size: 0.78rem;
          line-height: 1.55;
        }
        .depth-guide-primary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .depth-guide-layer-card {
          padding: 1.1rem;
          border-radius: 13px;
          border: 1px solid rgba(212, 168, 95, 0.2);
          background: rgba(255, 255, 255, 0.035);
          min-width: 0;
        }
        .depth-guide-primary-grid .depth-guide-layer-card:first-child {
          border-color: rgba(212, 168, 95, 0.4);
          background: rgba(212, 168, 95, 0.08);
        }
        .depth-guide-primary-grid .depth-guide-layer-card:nth-child(2) {
          border-color: rgba(168, 145, 255, 0.35);
          background: rgba(168, 145, 255, 0.07);
        }
        .depth-guide-primary-grid .depth-guide-layer-card:nth-child(3) {
          border-color: rgba(80, 205, 205, 0.35);
          background: rgba(80, 205, 205, 0.07);
        }
        .depth-guide-layer-unavailable {
          opacity: 0.78;
          border-style: dashed;
        }
        .depth-guide-layer-heading,
        .depth-guide-evidence-item-heading {
          justify-content: space-between;
          align-items: flex-start;
        }
        .depth-guide-layer-card h3,
        .depth-guide-evidence-item h3 {
          font-size: 0.92rem;
          line-height: 1.35;
        }
        .depth-guide-layer-summary {
          margin: 0.7rem 0 0;
          color: var(--foreground, #f4f1ff);
          font-size: 0.91rem;
          font-weight: 650;
          line-height: 1.5;
        }
        .depth-guide-layer-explanation {
          margin: 0.55rem 0 0;
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.8rem;
          line-height: 1.58;
        }
        .depth-guide-unavailable-note {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
          margin-top: 0.75rem;
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.72rem;
          line-height: 1.45;
        }
        .depth-guide-trace {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-top: 0.9rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .depth-guide-trace-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .depth-guide-trace-block strong {
          display: block;
          margin-bottom: 0.35rem;
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .depth-guide-trace ul,
        .depth-guide-trace p,
        .depth-guide-missing-data ul,
        .depth-guide-missing-data p,
        .depth-guide-evidence-notes {
          margin: 0;
          padding-left: 1.1rem;
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.72rem;
          line-height: 1.5;
        }
        .depth-guide-disclosures {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .depth-guide-disclosure {
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
        }
        .depth-guide-disclosure-button {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.7rem;
          width: 100%;
          padding: 0.9rem 1rem;
          border: 0;
          border-radius: 0;
          background: transparent;
          text-align: left;
        }
        .depth-guide-disclosure-icon {
          display: flex;
          color: var(--sc-gold, #d4a85f);
        }
        .depth-guide-disclosure-copy {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .depth-guide-disclosure-copy strong {
          font-size: 0.85rem;
        }
        .depth-guide-disclosure-copy span,
        .depth-guide-disclosure-count {
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.7rem;
          line-height: 1.4;
        }
        .depth-guide-disclosure-count {
          text-align: right;
          white-space: nowrap;
        }
        .depth-guide-disclosure-panel {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          padding: 0 0.85rem 0.85rem;
        }
        .depth-guide-disclosure-panel .depth-guide-layer-card:only-child {
          grid-column: 1 / -1;
        }
        .depth-guide-evidence-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 0 0.85rem 0.95rem;
        }
        .depth-guide-evidence-summary {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.55rem;
        }
        .depth-guide-evidence-summary > div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.7rem;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .depth-guide-evidence-summary span {
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.64rem;
          line-height: 1.3;
        }
        .depth-guide-evidence-summary strong {
          font-size: 1rem;
        }
        .depth-guide-evidence-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.7rem;
        }
        .depth-guide-evidence-item,
        .depth-guide-missing-data {
          padding: 0.9rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }
        .depth-guide-evidence-item dl {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.55rem;
          margin: 0.75rem 0 0;
        }
        .depth-guide-evidence-item dl > div {
          min-width: 0;
        }
        .depth-guide-evidence-item dt {
          color: var(--muted-foreground, #aaa4b8);
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .depth-guide-evidence-item dd {
          margin: 0.16rem 0 0;
          overflow-wrap: anywhere;
          font-size: 0.72rem;
          line-height: 1.4;
        }
        .depth-guide-evidence-notes {
          margin-top: 0.7rem;
        }
        .depth-guide-missing-data h3 {
          margin-bottom: 0.55rem;
          font-size: 0.82rem;
        }
        @media (max-width: 760px) {
          .depth-guide-header {
            flex-direction: column;
          }
          .depth-guide-header-actions {
            justify-content: flex-start;
          }
          .depth-guide-primary-grid,
          .depth-guide-disclosure-panel,
          .depth-guide-evidence-list {
            grid-template-columns: 1fr;
          }
          .depth-guide-evidence-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 520px) {
          .depth-guide-disclosure-button {
            grid-template-columns: auto minmax(0, 1fr);
          }
          .depth-guide-disclosure-count {
            grid-column: 2;
            text-align: left;
            white-space: normal;
          }
          .depth-guide-evidence-summary,
          .depth-guide-evidence-item dl {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
