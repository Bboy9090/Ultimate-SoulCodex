"use client"

import { useState } from "react"

export default function SystemAccordion(){

  const [open, setOpen] = useState(false)

  return(
    <div className="card">

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-sm font-semibold"
      >
        System Details
        <span className="text-codex-textMuted">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-codex-gold">Astrology</p>
          <p className="text-codex-blue">Numerology</p>
          <p className="text-codex-purple">Human Design</p>
          <p className="text-codex-gold">Elements</p>
          <p className="text-codex-blue">Moral Compass</p>
        </div>
      )}

    </div>
  )
}
