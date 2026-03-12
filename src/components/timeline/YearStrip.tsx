"use client"

import { useRef, useEffect, useState } from "react"
import YearDetailDrawer from "./YearDetailDrawer"

type YearItem = {
  year: number;
  phase: string;
  summary: string;
  why?: string;
  do?: string[];
  dont?: string[];
};

export default function YearStrip({
  years,
  currentYear,
}: {
  years: YearItem[];
  currentYear: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<YearItem | null>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      container.scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
    }
  }, [years]);

  return (
    <>
      <div className="card">
        <h2 className="card-title">Life Map</h2>

        <div ref={scrollRef} className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pt-2 pb-1">
            {years.map((y) => {
              const active = y.year === currentYear;

              return (
                <button
                  key={y.year}
                  ref={active ? activeRef : undefined}
                  onClick={() => setSelected(y)}
                  className={`w-44 shrink-0 rounded-codex border p-3 text-left transition-colors ${
                    active
                      ? "bg-codex-card border-codex-gold"
                      : "bg-codex-surface border-codex-border hover:border-codex-gold/60"
                  }`}
                >
                  <p className={`text-xs ${active ? "text-codex-gold font-semibold" : "text-codex-textMuted"}`}>
                    {y.year} {active && "← now"}
                  </p>
                  <h3 className="font-semibold mt-1">{y.phase}</h3>
                  <p className="text-xs text-codex-textMuted mt-2 line-clamp-3">{y.summary}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <YearDetailDrawer
        item={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
