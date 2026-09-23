import type { UltimateCodexSynthesis } from "@/lib/ultimateCodexSynthesis";
import { ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

function CoverageChip({ coverage }: { coverage: UltimateCodexSynthesis["coverage"] }) {
  const label = coverage === "complete" ? "Complete governed fusion" : coverage === "partial" ? "Partial governed fusion" : "Insufficient governed fusion";
  return <span className="sc-trust-chip">{label}</span>;
}

export default function UltimateCodexPanel({ synthesis }: { synthesis: UltimateCodexSynthesis }) {
  const activeSystems = synthesis.systemSummary.filter((row) => !/excluded/i.test(row.status));
  const excludedSystems = synthesis.systemSummary.filter((row) => /excluded/i.test(row.status));

  return (
    <section className="sc-panel sc-panel-gold mb-6 overflow-hidden p-5 sm:p-7" data-testid="ultimate-galactic-codex-panel">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--sc-gold-bright)]" />
            <p className="sc-eyebrow m-0">Ultimate Galactic Codex · Diamond fusion</p>
            <CoverageChip coverage={synthesis.coverage} />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-[var(--sc-ivory)]">One identity map. Every governed system stays visible.</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--sc-stone)]">
            This fusion combines only supported evidence. The Codex Number and derived identity signature are deterministic symbolic identifiers,
            not scientific measurements of a soul and not proof of divine or galactic origin.
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--sc-line-gold)] bg-black/15 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--sc-gold)]">Derived identity signature</p>
            <h3 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">{synthesis.derivedArchetype ?? synthesis.identitySignature}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{synthesis.identitySignature}</p>
            {synthesis.derivedArchetype === null && (
              <p className="mt-3 text-xs leading-5 text-amber-200/80">
                A poetic archetype is withheld because the governed evidence is not broad enough. Soul Codex does not fill that gap with a stock identity.
              </p>
            )}
          </div>

          {synthesis.coverage === "insufficient" && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-100/80">
              Codex identifiers are withheld until at least two governed system families support the fusion. A single symbolic system is not enough to claim a unique imprint.
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sc-stone)]">Codex Number</p>
              <p className="mt-2 font-mono text-xl font-semibold tracking-[.08em] text-[var(--sc-gold-bright)]">{synthesis.codexNumber ?? "WITHHELD"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sc-stone)]">Codex ID</p>
              <p className="mt-2 font-mono text-sm font-semibold text-[var(--sc-ivory)]">{synthesis.codexId ?? "Withheld until governed fusion is sufficient"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--sc-line)] bg-white/[0.025] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sc-stone)]">Fingerprint</p>
              <p className="mt-2 break-all font-mono text-xs font-semibold text-[var(--sc-ivory)]">{synthesis.fingerprint ?? "No stable fingerprint issued"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(168,145,255,.2)] bg-[radial-gradient(circle_at_50%_20%,rgba(168,145,255,.12),transparent_45%),rgba(10,7,18,.45)] p-5">
          <p className="sc-eyebrow">System coverage</p>
          <div className="mt-4 space-y-3">
            {activeSystems.map((row) => (
              <div key={row.system} className="rounded-xl border border-[var(--sc-line)] bg-white/[0.025] p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-sm text-[var(--sc-ivory)]">{row.system}</strong>
                  <span className="text-[10px] uppercase tracking-[.1em] text-[var(--sc-gold)]">{row.status}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">{row.detail}</p>
              </div>
            ))}
          </div>
          <details className="mt-4 rounded-xl border border-[var(--sc-line)] bg-black/10 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-[var(--sc-ivory)]">
              Excluded / inspect-only system ledger · {excludedSystems.length}
            </summary>
            <div className="mt-3 space-y-2">
              {excludedSystems.map((row) => (
                <div key={row.system} className="rounded-lg border border-[var(--sc-line)] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-xs text-[var(--sc-ivory-soft)]">{row.system}</strong>
                    <span className="text-[9px] uppercase tracking-[.08em] text-[var(--sc-stone)]">{row.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--sc-stone)]">{row.detail}</p>
                </div>
              ))}
            </div>
          </details>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {synthesis.dominantElement && <span className="rounded-full border border-[var(--sc-line)] px-3 py-1 text-[var(--sc-stone)]">{synthesis.dominantElement} emphasis</span>}
            {synthesis.dominantModality && <span className="rounded-full border border-[var(--sc-line)] px-3 py-1 text-[var(--sc-stone)]">{synthesis.dominantModality} emphasis</span>}
            {synthesis.stelliums.map((cluster) => <span key={cluster.kind + cluster.key} className="rounded-full border border-[var(--sc-line-gold)] px-3 py-1 text-[var(--sc-gold-bright)]">{cluster.label}</span>)}
          </div>
        </div>
      </div>

      <article className="mt-6 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-5">
        <p className="sc-eyebrow">Verified angles, Nodes &amp; Chiron</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {synthesis.supportingPoints.length ? synthesis.supportingPoints.map((point) => (
            <div key={point.key} className="rounded-xl border border-[var(--sc-line)] bg-black/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--sc-stone)]">{point.label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--sc-ivory)]">{point.sign}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                {point.degree !== null ? point.degree.toFixed(2) + "°" : "degree unavailable"}
                {point.house ? " · House " + point.house : " · angle"}
              </p>
            </div>
          )) : <p className="text-sm text-[var(--sc-stone)]">No supporting point has passed the governed verification boundary.</p>}
        </div>
      </article>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.035)] p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--sc-teal)]" />
            <h3 className="font-serif text-xl text-[var(--sc-ivory)]">What works together</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--sc-stone)]">
            {synthesis.resonances.map((item, index) => <li key={index}>• {item}</li>)}
          </ul>
        </article>

        <article className="rounded-2xl border border-[rgba(255,180,120,.18)] bg-[rgba(255,180,120,.035)] p-5">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-amber-300" />
            <h3 className="font-serif text-xl text-[var(--sc-ivory)]">What works against or pulls differently</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--sc-stone)]">
            {synthesis.tensions.map((item, index) => <li key={index}>• {item}</li>)}
          </ul>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-[rgba(168,145,255,.18)] bg-[rgba(168,145,255,.035)] p-5">
        <p className="sc-eyebrow">Contradiction integration</p>
        <h3 className="mt-2 font-serif text-xl text-[var(--sc-ivory)]">How to cope when the systems pull in different directions</h3>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--sc-stone)]">
          {synthesis.integrationMoves.map((item, index) => <li key={index}><strong className="text-[var(--sc-gold-bright)]">{index + 1}.</strong> {item}</li>)}
        </ol>
      </article>

      {synthesis.stelliums.length > 0 && (
        <article className="mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-5">
          <p className="sc-eyebrow">Stellium / concentration ledger</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {synthesis.stelliums.map((cluster) => (
              <div key={cluster.kind + cluster.key} className="rounded-xl border border-[var(--sc-line)] bg-black/10 p-4">
                <strong className="text-[var(--sc-ivory)]">{cluster.label}</strong>
                <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">
                  Planets: {cluster.planetKeys.join(", ")}. {cluster.rule}
                </p>
              </div>
            ))}
          </div>
        </article>
      )}

      <details className="mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.015] p-5">
        <summary className="cursor-pointer font-semibold text-[var(--sc-ivory)]">
          Unresolved ledger · {synthesis.unresolved.length} item{synthesis.unresolved.length === 1 ? "" : "s"}
        </summary>
        {synthesis.unresolved.length ? (
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--sc-stone)]">
            {synthesis.unresolved.map((item, index) => <li key={index}>• {item}</li>)}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--sc-stone)]">No required core item is unresolved in this governed fusion.</p>
        )}
      </details>
    </section>
  );
}
