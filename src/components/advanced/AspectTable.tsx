type Aspect = {
  planetA: string;
  planetB: string;
  type: string;
  orb?: number;
};

export default function AspectTable({ aspects }: { aspects?: Aspect[] }){

  if (!aspects || aspects.length === 0) return null;

  return(
    <div className="card">

      <h2 className="card-title">Aspects</h2>

      <div className="space-y-2">
        {aspects.slice(0, 8).map((a, i) => (
          <div key={i} className="flex justify-between text-sm border-b border-codex-border pb-2 last:border-0">
            <span className="text-codex-text">{a.planetA} {a.type} {a.planetB}</span>
            {a.orb !== undefined && (
              <span className="text-xs text-codex-textMuted">{a.orb.toFixed(1)}°</span>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
