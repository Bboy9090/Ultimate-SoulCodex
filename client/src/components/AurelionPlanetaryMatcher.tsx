import { useMemo, useState } from "react";
import { ArrowRight, Orbit, Radar, Sparkles } from "lucide-react";
import { Link } from "wouter";
import {
  aurelionMatchSummary,
  buildAurelionPlacements,
  type AurelionMatchSignal,
  type AurelionPlacement,
} from "../lib/aurelionMatcher";

type Props = {
  profile: any;
  partnerName?: string;
  matchSignals?: AurelionMatchSignal[];
  compareHref?: string;
  compact?: boolean;
};

function AurelionGlyph() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-14 w-14" role="img" aria-label="Aurelion alien watcher glyph">
      <defs>
        <radialGradient id="aurelion-head" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="rgba(164,255,234,.95)" />
          <stop offset="100%" stopColor="rgba(53,117,124,.72)" />
        </radialGradient>
      </defs>
      <path
        d="M60 9c24 0 39 17 39 42 0 30-18 53-39 60-21-7-39-30-39-60C21 26 36 9 60 9Z"
        fill="url(#aurelion-head)"
        stroke="rgba(217,182,111,.72)"
        strokeWidth="2"
      />
      <path d="M34 48c8-10 18-13 25-8-3 13-12 22-25 20-4-4-4-8 0-12Z" fill="rgba(4,12,19,.95)" />
      <path d="M86 48c-8-10-18-13-25-8 3 13 12 22 25 20 4-4 4-8 0-12Z" fill="rgba(4,12,19,.95)" />
      <ellipse cx="47" cy="50" rx="4" ry="8" fill="rgba(114,216,197,.9)" />
      <ellipse cx="73" cy="50" rx="4" ry="8" fill="rgba(114,216,197,.9)" />
      <path d="M51 82c6 3 12 3 18 0" fill="none" stroke="rgba(5,19,24,.8)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="18" r="3" fill="rgba(217,182,111,.9)" />
    </svg>
  );
}

function placementLine(placement: AurelionPlacement): string {
  const house = placement.house ? ` · House ${placement.house}` : "";
  const degree = placement.degree !== undefined ? ` · ${placement.degree.toFixed(1)}°` : "";
  return `${placement.label} in ${placement.sign}${house}${degree}`;
}

export default function AurelionPlanetaryMatcher({
  profile,
  partnerName,
  matchSignals = [],
  compareHref = "/compatibility/compare",
  compact = false,
}: Props) {
  const placements = useMemo(() => buildAurelionPlacements(profile), [profile]);
  const [selectedKey, setSelectedKey] = useState<string>(() => placements[0]?.key ?? "sun");
  const selected = placements.find((placement) => placement.key === selectedKey) ?? placements[0] ?? null;
  const mode = partnerName ? "MATCH" : "WATCH";

  const message = partnerName
    ? aurelionMatchSummary(partnerName, matchSignals)
    : selected
      ? `I am watching ${selected.label}: ${selected.role}. This interface uses the saved placement shown below; it does not calculate a new chart or infer missing data.`
      : "I do not have a saved planetary placement to watch yet. Add verified or supported chart data and I will leave the unknowns unknown.";

  return (
    <section
      className={`sc-panel overflow-hidden border-[rgba(114,216,197,.22)] bg-[radial-gradient(circle_at_50%_36%,rgba(114,216,197,.09),transparent_42%),rgba(7,10,18,.78)] ${compact ? "p-4" : "p-5 sm:p-6"}`}
      data-testid="aurelion-planetary-matcher"
      aria-label="Aurelion planetary watcher and matcher"
    >
      <style>{`
        @keyframes aurelion-orbit { to { transform: rotate(360deg); } }
        @keyframes aurelion-pulse { 50% { opacity: .55; transform: scale(.96); } }
        .aurelion-orbit-ring { animation: aurelion-orbit 34s linear infinite; transform-origin: 50% 50%; }
        .aurelion-orbit-ring-slow { animation: aurelion-orbit 58s linear infinite reverse; transform-origin: 50% 50%; }
        .aurelion-pulse { animation: aurelion-pulse 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .aurelion-orbit-ring, .aurelion-orbit-ring-slow, .aurelion-pulse { animation: none; }
        }
      `}</style>

      <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[minmax(280px,.78fr)_minmax(0,1.22fr)]"}`}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="sc-eyebrow text-[var(--sc-teal)]">Aurelion · {mode} protocol</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--sc-ivory)]">
                The Watcher / Matcher
              </h2>
            </div>
            <span className="rounded-full border border-[rgba(114,216,197,.25)] px-3 py-1 font-mono text-[10px] tracking-[.16em] text-[var(--sc-teal)]">
              {placements.length} SIGNAL{placements.length === 1 ? "" : "S"}
            </span>
          </div>

          <div className="relative mx-auto mt-5 aspect-square w-full max-w-[320px] rounded-full border border-[rgba(114,216,197,.16)] bg-black/20">
            <div className="aurelion-orbit-ring absolute inset-[10%] rounded-full border border-dashed border-[rgba(217,182,111,.2)]" />
            <div className="aurelion-orbit-ring-slow absolute inset-[24%] rounded-full border border-[rgba(114,216,197,.18)]" />

            <div className="absolute inset-[33%] grid place-items-center rounded-full border border-[rgba(114,216,197,.28)] bg-[radial-gradient(circle,rgba(114,216,197,.18),rgba(11,18,28,.96)_68%)] shadow-[0_0_42px_rgba(114,216,197,.12)]">
              <div className="aurelion-pulse text-center">
                <AurelionGlyph />
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--sc-teal)]">Aurelion</div>
              </div>
            </div>

            {placements.map((placement, index) => {
              const angle = (Math.PI * 2 * index) / Math.max(placements.length, 1) - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 43;
              const y = 50 + Math.sin(angle) * 43;
              const active = selected?.key === placement.key;
              return (
                <button
                  type="button"
                  key={placement.key}
                  onClick={() => setSelectedKey(placement.key)}
                  className={`absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xl transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-teal)] ${active ? "border-[var(--sc-gold)] bg-[rgba(217,182,111,.16)] text-[var(--sc-gold-bright)]" : "border-[rgba(114,216,197,.2)] bg-[rgba(5,10,18,.92)] text-[var(--sc-ivory)]"}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Inspect ${placement.label}`}
                  aria-pressed={active}
                  data-testid={`aurelion-planet-${placement.key}`}
                >
                  {placement.symbol}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-center text-[10px] leading-4 text-[var(--sc-stone)]">
            Orbit positions are interface layout only, not astronomical longitudes.
          </p>
        </div>

        <div className="min-w-0">
          <div className="rounded-2xl border border-[rgba(114,216,197,.18)] bg-[rgba(114,216,197,.04)] p-4">
            <div className="flex items-center gap-2 text-[var(--sc-teal)]">
              {partnerName ? <Radar className="h-4 w-4" /> : <Orbit className="h-4 w-4" />}
              <span className="text-[10px] font-bold uppercase tracking-[.16em]">{mode} transmission</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--sc-ivory-soft)]">{message}</p>
          </div>

          {selected ? (
            <div className="mt-4 rounded-2xl border border-[var(--sc-line)] bg-white/[0.02] p-4" data-testid="aurelion-selected-placement">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sc-gold)]">{selected.role}</p>
              <h3 className="mt-2 font-serif text-2xl text-[var(--sc-ivory)]">{placementLine(selected)}</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--sc-stone)]">
                Planet = which function is being watched. Sign = how that function is symbolically described. House appears only when a saved valid house is present.
              </p>
            </div>
          ) : null}

          {partnerName && matchSignals.length ? (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Aurelion shared match signals">
              {[...matchSignals].sort((a, b) => b.score - a.score).slice(0, 6).map((signal) => (
                <span key={signal.key} className="rounded-full border border-[rgba(217,182,111,.2)] px-3 py-1.5 text-xs text-[var(--sc-ivory-soft)]">
                  {signal.label} · {signal.score}/100
                </span>
              ))}
            </div>
          ) : null}

          {!partnerName ? (
            <Link href={compareHref} className="sc-button-primary mt-5 inline-flex">
              Enter Match mode <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-5 text-[var(--sc-stone)]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-gold)]" />
              Match signals reuse existing transparent compatibility scores. Aurelion does not add a hidden universal score.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
