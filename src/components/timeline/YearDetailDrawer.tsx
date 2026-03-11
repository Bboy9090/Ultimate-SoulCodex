"use client"

type YearDetail = {
  year: number;
  phase: string;
  summary: string;
  why?: string;
  do?: string[];
  dont?: string[];
};

type Props = {
  item: YearDetail | null;
  open: boolean;
  onClose: () => void;
};

export default function YearDetailDrawer({ item, open, onClose }: Props) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <button
        aria-label="Close year details"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full md:max-w-lg bg-codex-surface border border-codex-border rounded-t-codex md:rounded-codex shadow-codex p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-codex-textMuted uppercase tracking-wide">
              Year Detail
            </p>
            <h2 className="text-2xl font-bold mt-1">
              {item.year} · {item.phase}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-sm text-codex-textMuted hover:text-codex-text transition-colors"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-codex-gold">Summary</h3>
            <p className="text-sm mt-2">{item.summary}</p>
          </section>

          {item.why && (
            <section>
              <h3 className="text-sm font-semibold text-codex-gold">Why this year matters</h3>
              <p className="text-sm mt-2">{item.why}</p>
            </section>
          )}

          {!!item.do?.length && (
            <section>
              <h3 className="text-sm font-semibold text-codex-gold">What to do</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                {item.do.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>
          )}

          {!!item.dont?.length && (
            <section>
              <h3 className="text-sm font-semibold text-red-400">What to avoid</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                {item.dont.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
