import { useMemo, useState } from "react";
import AurelionAvatar from "./AurelionAvatar";
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
        .aurelion-planet-button { background: transparent; border-color: transparent; }
        .aurelion-planet-surface {
          position: relative;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.22);
          box-shadow: inset -7px -6px 12px rgba(0,0,0,.38), 0 0 12px rgba(114,216,197,.12);
          isolation: isolate;
        }
        .aurelion-planet-glyph {
          position: relative;
          z-index: 2;
          color: #fffaf0;
          font-size: 17px;
          line-height: 1;
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0,0,0,.95), 0 0 4px rgba(0,0,0,.8);
        }
        .aurelion-planet-surface[data-planet="sun"] {
          background: radial-gradient(circle at 35% 32%, #fff6b0 0 10%, #ffd45d 22%, #f49b22 55%, #b9470a 100%);
          box-shadow: inset -6px -6px 10px rgba(135,54,0,.28), 0 0 18px rgba(244,177,55,.42);
        }
        .aurelion-planet-surface[data-planet="moon"] {
          background:
            radial-gradient(circle at 30% 28%, rgba(65,69,78,.42) 0 9%, transparent 10%),
            radial-gradient(circle at 68% 62%, rgba(75,79,87,.34) 0 8%, transparent 9%),
            linear-gradient(135deg, #ddd9cf, #817f82 72%, #4d5057);
        }
        .aurelion-planet-surface[data-planet="mercury"] {
          background:
            radial-gradient(circle at 66% 30%, rgba(78,62,48,.45) 0 7%, transparent 8%),
            linear-gradient(140deg, #bba68f, #756b62 60%, #3f3b39);
        }
        .aurelion-planet-surface[data-planet="venus"] {
          background: repeating-linear-gradient(165deg, #f6df98 0 5px, #c99c56 6px 10px, #f0c878 11px 15px);
        }
        .aurelion-planet-surface[data-planet="mars"] {
          background:
            radial-gradient(circle at 64% 35%, rgba(91,38,25,.45) 0 8%, transparent 9%),
            linear-gradient(145deg, #dc7048, #9d3f2b 62%, #53251e);
        }
        .aurelion-planet-surface[data-planet="jupiter"] {
          background: repeating-linear-gradient(180deg, #e2c39b 0 4px, #9f684b 5px 8px, #eed7b3 9px 13px, #b87e58 14px 17px);
        }
        .aurelion-planet-surface[data-planet="saturn"] {
          background: linear-gradient(145deg, #ecd9a5, #bd965b 62%, #71573c);
        }
        .aurelion-planet-surface[data-planet="saturn"]::after {
          content: "";
          position: absolute;
          width: 56px;
          height: 17px;
          border: 2px solid rgba(226,199,139,.8);
          border-left-color: rgba(226,199,139,.38);
          border-right-color: rgba(226,199,139,.38);
          border-radius: 50%;
          transform: rotate(-16deg);
          z-index: 1;
          pointer-events: none;
        }
        .aurelion-planet-surface[data-planet="uranus"] {
          background: linear-gradient(145deg, #c4f4f0, #6bc8cc 62%, #287b8d);
        }
        .aurelion-planet-surface[data-planet="neptune"] {
          background: repeating-linear-gradient(175deg, #648cff 0 7px, #3159cc 8px 13px, #183482 14px 18px);
        }
        .aurelion-planet-surface[data-planet="pluto"] {
          background:
            radial-gradient(circle at 38% 38%, #ddd4c2 0 13%, transparent 14%),
            linear-gradient(145deg, #b79c7d, #6d594e 62%, #353036);
        }
        .aurelion-planet-button[aria-pressed="true"] .aurelion-planet-surface {
          outline: 2px solid var(--sc-gold);
          outline-offset: 3px;
          box-shadow: inset -7px -6px 12px rgba(0,0,0,.32), 0 0 20px rgba(217,182,111,.38);
        }
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
                <AurelionAvatar />
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
                  className="aurelion-planet-button absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-teal)]"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Inspect ${placement.label}`}
                  aria-pressed={active}
                  data-testid={`aurelion-planet-${placement.key}`}
                >
                  <span className="aurelion-planet-surface" data-planet={placement.key} aria-hidden="true">
                    <span className="aurelion-planet-glyph">{placement.symbol}</span>
                  </span>
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
