import type { DailyCard } from "@/types/soulcodex"

export default function TodayCard({ data }: { data?: DailyCard | null }){

  if (!data) {
    return(
      <div className="card animate-pulse">
        <h2 className="card-title">Today's Focus</h2>
        <p className="card-subtitle">Loading daily guidance...</p>
      </div>
    )
  }

  return(

    <div className="card">

      <h2 className="card-title">
        Today's Focus
      </h2>

      <p className="card-subtitle">
        {data.focus}
      </p>

      <div className="mt-4">
        <p className="text-sm text-codex-gold">Do</p>
        <ul className="list-disc pl-4 text-sm">
          {data.do.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-sm text-red-400">Don't</p>
        <ul className="list-disc pl-4 text-sm">
          {data.dont.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>

      {data.transits && data.transits.length > 0 && (
        <div className="mt-5 space-y-4">
          {data.transits.map((t, i) => (
            <div key={i} className="border-t border-codex-border pt-3">
              <p className="text-sm font-semibold text-codex-purple">{t.title}</p>
              <p className="text-xs text-codex-textMuted mt-1">Affects: {t.whatItAffects}</p>
              <p className="text-sm mt-2">{t.realLifeExample}</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-xs text-codex-gold">Do</p>
                  <ul className="text-xs list-disc pl-3">
                    {t.do.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-red-400">Avoid</p>
                  <ul className="text-xs list-disc pl-3">
                    {t.avoid.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-codex-blue">{data.decisionAdvice}</p>

    </div>

  )
}
