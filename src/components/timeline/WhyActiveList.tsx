type Reason = {
  source: string;
  label: string;
  weight: number;
};

export default function WhyActiveList({ reasons }: { reasons: Reason[] }) {
  return (
    <div className="card">
      <h2 className="card-title">Why this is active</h2>

      <ul className="space-y-3">
        {reasons.map((r, i) => (
          <li key={i} className="border-b border-codex-border pb-2 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{r.label}</span>
              <span className="text-xs text-codex-textMuted uppercase">{r.source}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
