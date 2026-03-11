"use client"

import { useRef, useEffect } from "react"

type YearItem = {
  year: number;
  phase: string;
  summary: string;
};

export default function YearStrip({
  years,
  currentYear,
}: {
  years: YearItem[];
  currentYear: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      container.scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
    }
  }, [years]);

  return (
    <div className="card">
      <h2 className="card-title">Life Map</h2>

      <div ref={scrollRef} className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pt-2 pb-1">
          {years.map((y) => {
            const active = y.year === currentYear;

            return (
              <div
                key={y.year}
                ref={active ? activeRef : undefined}
                className={`w-44 shrink-0 rounded-codex border p-3 transition-colors ${
                  active
                    ? "bg-codex-card border-codex-gold"
                    : "bg-codex-surface border-codex-border"
                }`}
              >
                <p className={`text-xs ${active ? "text-codex-gold font-semibold" : "text-codex-textMuted"}`}>
                  {y.year} {active && "← now"}
                </p>
                <h3 className="font-semibold mt-1">{y.phase}</h3>
                <p className="text-xs text-codex-textMuted mt-2">{y.summary}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
