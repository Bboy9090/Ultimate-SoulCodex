"use client"

import { useState } from "react"
import type { SoulProfile } from "@/types/soulcodex"

type Props = {
  profile?: SoulProfile | null
}

export default function SystemAccordion({ profile }: Props){

  const [open, setOpen] = useState(false)

  const hd = profile?.humanDesign
  const elements = profile?.elements
  const morals = profile?.morals

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
        <div className="mt-4 space-y-3 text-sm">

          {hd && (
            <div>
              <p className="text-codex-gold font-semibold">Human Design</p>
              <p className="text-codex-textMuted">Type: {hd.type} | Strategy: {hd.strategy} | Authority: {hd.authority}</p>
            </div>
          )}

          {elements && (
            <div>
              <p className="text-codex-blue font-semibold">Elements</p>
              <p className="text-codex-textMuted">
                Fire: {elements.fire} | Earth: {elements.earth} | Air: {elements.air} | Water: {elements.water}
              </p>
            </div>
          )}

          {morals && (
            <div>
              <p className="text-codex-purple font-semibold">Moral Compass</p>
              <p className="text-codex-textMuted">
                {morals.values.length > 0 ? morals.values.join(", ") : "—"}
              </p>
              {morals.crisisResponse && (
                <p className="text-codex-textMuted">Crisis: {morals.crisisResponse}</p>
              )}
            </div>
          )}

          {profile?.numerology && (
            <div>
              <p className="text-codex-gold font-semibold">Numerology</p>
              <p className="text-codex-textMuted">
                Life Path: {profile.numerology.lifePath ?? "—"} |
                Expression: {profile.numerology.expression ?? "—"} |
                Soul Urge: {profile.numerology.soulUrge ?? "—"}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
