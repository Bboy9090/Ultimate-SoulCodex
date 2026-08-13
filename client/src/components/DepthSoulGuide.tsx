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
  { label: string; shortLabel: string; color: string; background: string; border: string }
> = {
  high: {
    label: "High source support",
    shortLabel: "High support",
    color: "#e6bf77",
    background: "rgba(212, 168, 95, 0.12)",
    border: "rgba(212, 168, 95, 0.38)",
  },
  moderate: {
    label: "Moderate source support",
    shortLabel: "Moderate support",
    color: "#c8beff",
    background: "rgba(168, 145, 255, 0.12)",
    border: "rgba(168, 145, 255, 0.35)",
  },
  low: {
    label: "Low source support",
    shortLabel: "Low support",
    color: "#aaa4b8",
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

function SupportPill({ confidence, compact = false }: { confidence: InterpretationConfidence; compact?: boolean }) {
  const config = SUPPORT_CONFIG[confidence];
  return (
    <span
      role="status"
      aria-label={`${config.label}. Confidence reflects source quality and consistency, not scientific truth.`}
      className="depth-guide-support-pill"
      style={{ color: config.color, background: config.background, borderColor: config.border }}
    >
      {compact ? config.shortLabel : config.label}
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
        <SupportPill confidence={layer.confidence} compact />
      </div>
      <div className="depth-guide-trace-grid">
        <div className="depth-guide-trace-block">
          <strong>Evidence references</strong>
          {layer.evidenceIds.length > 0 ? (
            <ul>{layer.evidenceIds.map((id) => <li key={id}>{id}</li>)}</ul>
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
    </div>
  );
}

function LayerCard({
  layer,
  showTrace,
  primaryHeading,
  index,
}: {
  layer: DepthSoulGuideLayerView;
  showTrace: boolean;
  primaryHeading?: string;
  index?: number;
}) {
  return (
    <article
      className={`depth-guide-layer-card depth-guide-layer-card-${index ?? "detail"}${layer.unavailable ? " depth-guide-layer-unavailable" : ""}`}
      data-layer-key={layer.key}
    >
      <div className="depth-guide-layer-heading">
        <div>
          {primaryHeading && <p className="depth-guide-eyebrow">{primaryHeading}</p>}
          <h3>{layer.title}</h3>
        </div>
        {!showTrace && <SupportPill confidence={layer.confidence} compact />}
      </div>

      <p className="depth-guide-layer-summary">{layer.summary}</p>
      <p className="depth-guide-layer-explanation">{layer.explanation}</p>

      {layer.unavailable && (
        <div className="depth-guide-unavailable-note">
          <IconInfo size={15} aria-hidden="true" />
          <span>This layer stays visible so missing support cannot masquerade as certainty.</span>
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
  const model = useMemo(() => buildDepthSoulGuideViewModel(interpretation), [interpretation]);
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(defaultOpenGroupIds));
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
      <header className="depth-guide-hero">
        <div className="depth-guide-hero-copy">
          <div className="depth-guide-title-row">
            <div className="depth-guide-title-icon" aria-hidden="true">
              <span className="depth-guide-orbit" />
              <IconSparkles size={21} />
            </div>
            <div>
              <p className="depth-guide-kicker">Clarity first · depth on demand</p>
              <h2 id="depth-guide-title">Soul Guide</h2>
            </div>
          </div>
          <p className="depth-guide-hero-lede">
            One readable path through the strongest supported pattern, the tension inside it,
            and the grounded move available now. Deeper interpretation stays one tap away.
          </p>
          <div className="depth-guide-hero-actions">
            <SupportPill confidence={model.overallConfidence} />
            <button
              type="button"
              className="depth-guide-secondary-button"
              aria-pressed={showTrace}
              onClick={() => setShowTrace((value) => !value)}
            >
              <IconInfo size={15} aria-hidden="true" />
              {showTrace ? "Hide evidence trace" : "Show evidence trace"}
            </button>
          </div>
        </div>

        <div className="depth-guide-orbital-panel" aria-hidden="true">
          <div className="depth-guide-orbital-core">
            <IconSparkles size={26} />
          </div>
          <span className="depth-guide-ring depth-guide-ring-one" />
          <span className="depth-guide-ring depth-guide-ring-two" />
          <span className="depth-guide-node depth-guide-node-one" />
          <span className="depth-guide-node depth-guide-node-two" />
          <span className="depth-guide-node depth-guide-node-three" />
          <div className="depth-guide-orbit-label">
            <strong>{SUPPORT_CONFIG[model.overallConfidence].shortLabel}</strong>
            <span>{model.evidence.totalEvidence} evidence items</span>
          </div>
        </div>
      </header>

      <div className="depth-guide-principle">
        <IconInfo size={15} aria-hidden="true" />
        <p>
          Interpretations are symbolic and evidence-traced. Support describes the quality and
          consistency of source material, not scientific proof or a fixed verdict about you.
        </p>
      </div>

      <div className="depth-guide-primary-grid" aria-label="Soul Guide clarity summary">
        {model.primary.map((layer, index) => (
          <LayerCard
            key={layer.key}
            layer={layer}
            showTrace={showTrace}
            primaryHeading={PRIMARY_HEADINGS[layer.key as keyof typeof PRIMARY_HEADINGS]}
            index={index}
          />
        ))}
      </div>

      <div className="depth-guide-section-heading">
        <div>
          <p className="depth-guide-kicker">Go deeper</p>
          <h3>Open only the layers that matter right now.</h3>
        </div>
        <span>{model.disclosures.length} deeper groups</span>
      </div>

      <div className="depth-guide-disclosures" aria-label="Deeper interpretation layers">
        {model.disclosures.map((group) => {
          const open = openGroups.has(group.id);
          const panelId = `depth-guide-panel-${group.id}`;
          const buttonId = `depth-guide-button-${group.id}`;
          return (
            <div className={`depth-guide-disclosure${open ? " depth-guide-disclosure-open" : ""}`} key={group.id}>
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
                  {group.unavailableCount > 0 ? ` · ${group.unavailableCount} unavailable` : ""}
                </span>
              </button>
              {open && (
                <div id={panelId} role="region" aria-labelledby={buttonId} className="depth-guide-disclosure-panel">
                  {group.layers.map((layer) => (
                    <LayerCard key={layer.key} layer={layer} showTrace={showTrace} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`depth-guide-disclosure depth-guide-evidence-disclosure${evidenceOpen ? " depth-guide-disclosure-open" : ""}`}>
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
            <span>Inspect the receipts behind the reading and every recorded limitation.</span>
          </span>
          <span className="depth-guide-disclosure-count">{model.evidence.totalEvidence} evidence items</span>
        </button>

        {evidenceOpen && (
          <div id="depth-guide-evidence-panel" role="region" aria-labelledby="depth-guide-evidence-button" className="depth-guide-evidence-panel">
            <div className="depth-guide-evidence-summary">
              <div><span>Total evidence</span><strong>{model.evidence.totalEvidence}</strong></div>
              <div><span>Externally verified</span><strong>{model.evidence.externallyVerified}</strong></div>
              <div><span>Partially verified</span><strong>{model.evidence.partiallyVerified}</strong></div>
              <div><span>Unverified</span><strong>{model.evidence.unverified}</strong></div>
              <div><span>Recorded limitations</span><strong>{model.evidence.limitationCount}</strong></div>
            </div>

            <div className="depth-guide-evidence-list">
              {interpretation.evidence.map((evidence) => (
                <article className="depth-guide-evidence-item" key={evidence.id}>
                  <div className="depth-guide-evidence-item-heading">
                    <div>
                      <p>{evidence.system}</p>
                      <h3>{evidence.field}</h3>
                    </div>
                    <SupportPill confidence={evidence.confidence} compact />
                  </div>
                  <dl>
                    <div><dt>Reference</dt><dd>{evidence.id}</dd></div>
                    <div><dt>Value</dt><dd>{formatEvidenceValue(evidence.value)}</dd></div>
                    <div><dt>Provenance</dt><dd>{provenanceLabel(evidence.provenanceStatus)}</dd></div>
                    <div>
                      <dt>Time sensitivity</dt>
                      <dd>{evidence.timeSensitivity === "birth-time-required" ? "Exact birth time required" : "Not birth-time sensitive"}</dd>
                    </div>
                  </dl>
                  {evidence.notes && evidence.notes.length > 0 && (
                    <ul className="depth-guide-evidence-notes">
                      {evidence.notes.map((note, index) => <li key={`${evidence.id}-note-${index}`}>{note}</li>)}
                    </ul>
                  )}
                </article>
              ))}
            </div>

            <div className="depth-guide-missing-data">
              <div>
                <p className="depth-guide-kicker">Uncertainty ledger</p>
                <h3>Missing data</h3>
              </div>
              {model.missingData.length > 0 ? (
                <ul>{model.missingData.map((item, index) => <li key={`missing-data-${index}`}>{item}</li>)}</ul>
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
          Lived experience remains the final authority. A useful layer should sharpen reflection,
          not overrule reality.
        </p>
      </footer>

      <style>{`
        .depth-guide { display:flex; flex-direction:column; gap:1.15rem; width:100%; color:var(--foreground,#f4f1ff); }
        .depth-guide-hero { position:relative; display:grid; grid-template-columns:minmax(0,1.5fr) minmax(220px,.65fr); gap:1.5rem; overflow:hidden; padding:clamp(1.35rem,3vw,2rem); border:1px solid rgba(212,168,95,.28); border-radius:24px; background:radial-gradient(circle at 80% 15%,rgba(95,66,156,.28),transparent 34%),linear-gradient(145deg,rgba(24,18,38,.98),rgba(11,8,20,.98)); box-shadow:0 28px 80px rgba(0,0,0,.28); }
        .depth-guide-hero::after { content:""; position:absolute; inset:auto -10% -45% 15%; height:70%; background:radial-gradient(circle,rgba(68,179,190,.09),transparent 68%); pointer-events:none; }
        .depth-guide-hero-copy { position:relative; z-index:2; min-width:0; }
        .depth-guide-title-row,.depth-guide-hero-actions,.depth-guide-layer-heading,.depth-guide-evidence-item-heading { display:flex; align-items:center; gap:.75rem; }
        .depth-guide-title-icon { position:relative; display:flex; align-items:center; justify-content:center; width:48px; height:48px; flex:0 0 auto; border-radius:50%; color:#e6bf77; background:rgba(212,168,95,.1); border:1px solid rgba(212,168,95,.3); }
        .depth-guide-orbit { position:absolute; inset:-7px; border:1px solid rgba(168,145,255,.24); border-radius:50%; }
        .depth-guide-kicker,.depth-guide-eyebrow,.depth-guide-evidence-item-heading p { margin:0 0 .22rem; color:#d4a85f; font-size:.67rem; font-weight:750; letter-spacing:.13em; text-transform:uppercase; }
        .depth-guide-hero h2 { margin:0; font-family:var(--font-serif); font-size:clamp(1.65rem,4vw,2.45rem); line-height:1; }
        .depth-guide-hero-lede { max-width:720px; margin:1rem 0 1.1rem; color:rgba(247,240,228,.7); font-size:.95rem; line-height:1.72; }
        .depth-guide-hero-actions { flex-wrap:wrap; }
        .depth-guide-support-pill,.depth-guide-claim-pill { display:inline-flex; align-items:center; border:1px solid; border-radius:999px; padding:.28rem .62rem; font-size:.66rem; font-weight:750; letter-spacing:.035em; white-space:nowrap; }
        .depth-guide-claim-pill { border-color:rgba(255,255,255,.14); color:#aaa4b8; background:rgba(255,255,255,.04); }
        .depth-guide-claim-observed { color:#72d6b7; border-color:rgba(114,214,183,.34); }
        .depth-guide-claim-derived { color:#7fd6f2; border-color:rgba(127,214,242,.34); }
        .depth-guide-claim-inferred { color:#c8beff; border-color:rgba(200,190,255,.34); }
        .depth-guide-claim-unavailable { color:#aaa4b8; border-color:rgba(170,164,184,.24); }
        .depth-guide-secondary-button,.depth-guide-disclosure-button { font:inherit; color:inherit; cursor:pointer; }
        .depth-guide-secondary-button { display:inline-flex; align-items:center; gap:.42rem; min-height:36px; padding:.48rem .75rem; border-radius:999px; border:1px solid rgba(255,255,255,.13); background:rgba(255,255,255,.035); color:#b8b2c6; font-size:.72rem; }
        .depth-guide-secondary-button:hover,.depth-guide-disclosure-button:hover { border-color:rgba(212,168,95,.36); background:rgba(212,168,95,.055); }
        .depth-guide-secondary-button:focus-visible,.depth-guide-disclosure-button:focus-visible { outline:2px solid #d4a85f; outline-offset:3px; }
        .depth-guide-orbital-panel { position:relative; min-height:210px; display:flex; align-items:center; justify-content:center; }
        .depth-guide-orbital-core { position:relative; z-index:3; display:flex; align-items:center; justify-content:center; width:78px; height:78px; border-radius:50%; color:#e6bf77; background:radial-gradient(circle,rgba(212,168,95,.23),rgba(47,30,70,.58)); border:1px solid rgba(212,168,95,.42); box-shadow:0 0 45px rgba(212,168,95,.13); }
        .depth-guide-ring { position:absolute; border-radius:50%; border:1px solid rgba(168,145,255,.2); }
        .depth-guide-ring-one { width:142px; height:142px; }
        .depth-guide-ring-two { width:198px; height:198px; border-color:rgba(89,190,198,.16); }
        .depth-guide-node { position:absolute; width:9px; height:9px; border-radius:50%; background:#d4a85f; box-shadow:0 0 14px rgba(212,168,95,.6); }
        .depth-guide-node-one { transform:translate(71px,-45px); }
        .depth-guide-node-two { transform:translate(-90px,18px); background:#8ed6dc; }
        .depth-guide-node-three { transform:translate(30px,94px); background:#b9a5ff; }
        .depth-guide-orbit-label { position:absolute; bottom:5px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; min-width:150px; color:#b9b2c7; font-size:.67rem; }
        .depth-guide-orbit-label strong { color:#f3e6ce; font-size:.76rem; }
        .depth-guide-principle,.depth-guide-footer { display:flex; align-items:flex-start; gap:.55rem; padding:.82rem 1rem; border-radius:12px; color:#aaa4b8; background:rgba(255,255,255,.025); border:1px dashed rgba(255,255,255,.11); }
        .depth-guide-principle p,.depth-guide-footer p { margin:0; font-size:.77rem; line-height:1.6; }
        .depth-guide-primary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.9rem; }
        .depth-guide-layer-card { position:relative; min-width:0; padding:1.15rem; border-radius:16px; border:1px solid rgba(255,255,255,.09); background:linear-gradient(145deg,rgba(25,20,38,.9),rgba(14,11,23,.9)); box-shadow:0 16px 42px rgba(0,0,0,.16); }
        .depth-guide-layer-card-0 { border-color:rgba(212,168,95,.34); background:linear-gradient(145deg,rgba(53,40,28,.42),rgba(15,12,22,.92)); }
        .depth-guide-layer-card-1 { border-color:rgba(168,145,255,.3); background:linear-gradient(145deg,rgba(43,32,67,.4),rgba(15,12,22,.92)); }
        .depth-guide-layer-card-2 { border-color:rgba(80,205,205,.28); background:linear-gradient(145deg,rgba(24,57,60,.34),rgba(15,12,22,.92)); }
        .depth-guide-layer-unavailable { opacity:.78; border-style:dashed; }
        .depth-guide-layer-heading,.depth-guide-evidence-item-heading { justify-content:space-between; align-items:flex-start; }
        .depth-guide-layer-card h3,.depth-guide-evidence-item h3,.depth-guide-missing-data h3,.depth-guide-section-heading h3 { margin:0; }
        .depth-guide-layer-card h3,.depth-guide-evidence-item h3 { font-size:.94rem; line-height:1.35; }
        .depth-guide-layer-summary { margin:.78rem 0 0; color:#f4f1ff; font-size:.92rem; font-weight:680; line-height:1.52; }
        .depth-guide-layer-explanation { margin:.55rem 0 0; color:#aaa4b8; font-size:.8rem; line-height:1.62; }
        .depth-guide-unavailable-note { display:flex; align-items:flex-start; gap:.45rem; margin-top:.75rem; color:#aaa4b8; font-size:.72rem; line-height:1.45; }
        .depth-guide-trace { display:flex; flex-direction:column; gap:.72rem; margin-top:.95rem; padding-top:.9rem; border-top:1px solid rgba(255,255,255,.09); }
        .depth-guide-trace-row { display:flex; flex-wrap:wrap; gap:.4rem; }
        .depth-guide-trace-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.7rem; }
        .depth-guide-trace-block { padding:.72rem; border-radius:10px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); }
        .depth-guide-trace-block strong { display:block; margin-bottom:.35rem; color:#aaa4b8; font-size:.66rem; letter-spacing:.06em; text-transform:uppercase; }
        .depth-guide-trace ul,.depth-guide-trace p,.depth-guide-missing-data ul,.depth-guide-missing-data p,.depth-guide-evidence-notes { margin:0; padding-left:1.05rem; color:#aaa4b8; font-size:.72rem; line-height:1.5; }
        .depth-guide-section-heading { display:flex; align-items:end; justify-content:space-between; gap:1rem; margin-top:.25rem; }
        .depth-guide-section-heading h3 { font-family:var(--font-serif); font-size:clamp(1.2rem,3vw,1.6rem); }
        .depth-guide-section-heading > span { color:#8f899c; font-size:.72rem; white-space:nowrap; }
        .depth-guide-disclosures { display:flex; flex-direction:column; gap:.65rem; }
        .depth-guide-disclosure { overflow:hidden; border:1px solid rgba(255,255,255,.09); border-radius:14px; background:rgba(255,255,255,.018); transition:border-color .2s ease,background .2s ease; }
        .depth-guide-disclosure-open { border-color:rgba(212,168,95,.2); background:rgba(212,168,95,.025); }
        .depth-guide-disclosure-button { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:.72rem; width:100%; min-height:62px; padding:.9rem 1rem; border:0; background:transparent; text-align:left; }
        .depth-guide-disclosure-icon { display:flex; color:#d4a85f; }
        .depth-guide-disclosure-copy { display:flex; flex-direction:column; gap:.16rem; min-width:0; }
        .depth-guide-disclosure-copy strong { font-size:.86rem; }
        .depth-guide-disclosure-copy span,.depth-guide-disclosure-count { color:#aaa4b8; font-size:.7rem; line-height:1.42; }
        .depth-guide-disclosure-count { text-align:right; white-space:nowrap; }
        .depth-guide-disclosure-panel { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; padding:0 .85rem .85rem; }
        .depth-guide-disclosure-panel .depth-guide-layer-card:only-child { grid-column:1/-1; }
        .depth-guide-evidence-panel { display:flex; flex-direction:column; gap:1rem; padding:0 .85rem .95rem; }
        .depth-guide-evidence-summary { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.55rem; }
        .depth-guide-evidence-summary > div { display:flex; flex-direction:column; gap:.25rem; padding:.78rem; border-radius:11px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); }
        .depth-guide-evidence-summary span { color:#aaa4b8; font-size:.63rem; line-height:1.3; }
        .depth-guide-evidence-summary strong { font-size:1.06rem; }
        .depth-guide-evidence-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.7rem; }
        .depth-guide-evidence-item,.depth-guide-missing-data { padding:.95rem; border-radius:12px; background:rgba(255,255,255,.022); border:1px solid rgba(255,255,255,.085); }
        .depth-guide-evidence-item dl { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.58rem; margin:.78rem 0 0; }
        .depth-guide-evidence-item dl > div { min-width:0; }
        .depth-guide-evidence-item dt { color:#918b9f; font-size:.61rem; text-transform:uppercase; letter-spacing:.055em; }
        .depth-guide-evidence-item dd { margin:.16rem 0 0; overflow-wrap:anywhere; font-size:.72rem; line-height:1.42; }
        .depth-guide-evidence-notes { margin-top:.7rem; }
        .depth-guide-missing-data { display:grid; grid-template-columns:minmax(150px,.35fr) minmax(0,1fr); gap:1rem; align-items:start; }
        .depth-guide-missing-data h3 { font-size:.9rem; }
        .depth-guide-footer { margin-top:.1rem; }
        @media (max-width:820px) {
          .depth-guide-hero { grid-template-columns:1fr; }
          .depth-guide-orbital-panel { min-height:180px; }
          .depth-guide-primary-grid,.depth-guide-disclosure-panel,.depth-guide-evidence-list { grid-template-columns:1fr; }
          .depth-guide-evidence-summary { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .depth-guide-trace-grid { grid-template-columns:1fr; }
        }
        @media (max-width:560px) {
          .depth-guide-hero { padding:1.2rem; border-radius:18px; }
          .depth-guide-hero-actions { align-items:stretch; }
          .depth-guide-secondary-button { width:100%; justify-content:center; }
          .depth-guide-orbital-panel { min-height:155px; transform:scale(.92); }
          .depth-guide-section-heading { align-items:flex-start; flex-direction:column; gap:.35rem; }
          .depth-guide-disclosure-button { grid-template-columns:auto minmax(0,1fr); }
          .depth-guide-disclosure-count { grid-column:2; text-align:left; white-space:normal; }
          .depth-guide-evidence-summary,.depth-guide-evidence-item dl,.depth-guide-missing-data { grid-template-columns:1fr; }
        }
        @media (prefers-reduced-motion:reduce) {
          .depth-guide-disclosure { transition:none; }
        }
      `}</style>
    </section>
  );
}
