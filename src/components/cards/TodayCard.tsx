import type { DailyCard } from "@/types/soulcodex"

export default function TodayCard({ data }: { data?: DailyCard | null }){

  if (!data) {
    return(
      <div className="card">
        <p className="section-label text-center mb-3">Today</p>
        <div className="skeleton h-4 w-3/4 mx-auto mb-3" />
        <div className="skeleton h-3 w-full mb-2" />
        <div className="skeleton h-3 w-4/5" />
      </div>
    )
  }

  return(
    <div className="card">

      <p className="section-label text-center mb-2">Today's Focus</p>

      <p className="oracle-text text-sm text-codex-textMuted mb-4">
        {data.focus}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="section-label text-codex-gold mb-2">Do</p>
          <ul className="space-y-1.5">
            {data.do.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-codex-gold shrink-0">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="section-label text-red-400 mb-2">Don't</p>
          <ul className="space-y-1.5">
            {data.dont.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-red-400 shrink-0">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {data.transits && data.transits.length > 0 && (
        <div className="mt-5 space-y-4">
          {data.transits.map((t, i) => (
            <div key={i} className="pt-3 border-t border-codex-border/50">
              <p className="text-sm font-semibold text-codex-purple">{t.title}</p>
              <p className="text-xs text-codex-textMuted mt-1">{t.whatItAffects}</p>
              <p className="text-sm mt-2 leading-relaxed">{t.realLifeExample}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-codex-blue leading-relaxed">{data.decisionAdvice}</p>

    </div>
  )
}
