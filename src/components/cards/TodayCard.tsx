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

      {data.watchouts && data.watchouts.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-codex-textMuted">Active transits</p>
          <ul className="text-xs text-codex-purple mt-1 space-y-1">
            {data.watchouts.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-codex-blue">{data.decisionAdvice}</p>

    </div>

  )
}
