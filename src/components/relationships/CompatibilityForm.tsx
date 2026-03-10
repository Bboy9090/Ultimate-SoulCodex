"use client"

export default function CompatibilityForm(){

  return(
    <div className="card">

      <h2 className="card-title">Compare Two People</h2>

      <div className="space-y-3 mt-4">
        <input
          placeholder="Person A Birthdate"
          className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple"
        />

        <input
          placeholder="Person B Birthdate"
          className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-2 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple"
        />

        <button className="w-full bg-codex-purple text-sm font-semibold py-2 rounded-codex hover:opacity-90 transition-opacity">
          Analyze
        </button>
      </div>

    </div>
  )
}
