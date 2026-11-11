const PHASES = [
  { name: "New Moon", symbol: "🌑" },
  { name: "Waxing Crescent", symbol: "🌒" },
  { name: "First Quarter", symbol: "🌓" },
  { name: "Waxing Gibbous", symbol: "🌔" },
  { name: "Full Moon", symbol: "🌕" },
  { name: "Waning Gibbous", symbol: "🌖" },
  { name: "Last Quarter", symbol: "🌗" },
  { name: "Waning Crescent", symbol: "🌘" },
] as const;

/** Phase labels come only from the verified astronomical service. */
export default function BirthMomentLunarPhaseTrack({ phase }: { phase: string }) {
  if (!PHASES.some((entry) => entry.name === phase)) return null;
  return (
    <div className="rounded-xl border border-white/10 p-3" aria-label="Calculated lunar cycle phase">
      <p className="mb-3 text-xs text-[var(--sc-stone)]">
        Eight-phase lunar cycle · Highlighted phase is calculated, not a personality prediction
      </p>
      <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {PHASES.map(({ name, symbol }) => {
          const active = phase === name;
          return (
            <li
              key={name}
              aria-current={active ? "step" : undefined}
              className={active
                ? "rounded-lg border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.12)] px-1.5 py-3 text-center text-[var(--sc-ivory)]"
                : "rounded-lg border border-white/[0.07] px-1.5 py-3 text-center text-[var(--sc-stone)]"}
            >
              <span className="block text-2xl leading-8" aria-hidden="true">{symbol}</span>
              <span className="mt-1 block text-[10px] leading-4">{name}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
