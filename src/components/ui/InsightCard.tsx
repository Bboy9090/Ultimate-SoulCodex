"use client"

import { useState } from "react"

type InsightData = {
  title: string
  subtitle?: string
  layer1: {
    items: { label: string; value: string }[]
  }
  layer2?: string
  layer3?: { label: string; value: string }[]
}

export default function InsightCard({ data, defaultExpanded }: { data: InsightData; defaultExpanded?: "layer2" | "layer3" }) {
  const [expanded, setExpanded] = useState<null | "layer2" | "layer3">(defaultExpanded || null)

  return (
    <div className="card animate-fadeIn">

      {/* Title */}
      <p className="section-label text-center text-codex-gold mb-1">{data.title}</p>
      {data.subtitle && (
        <h3 className="heading-display text-lg text-center mb-4">{data.subtitle}</h3>
      )}

      {/* Layer 1 — Simple insight */}
      <div className="space-y-3">
        {data.layer1.items.map((item, i) => (
          <div key={i}>
            <p className="text-xs text-codex-textMuted font-medium uppercase tracking-wider mb-0.5">{item.label}</p>
            <p className="text-sm leading-relaxed">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Expand to Layer 2 */}
      {data.layer2 && expanded !== "layer2" && expanded !== "layer3" && (
        <button
          onClick={() => setExpanded("layer2")}
          className="w-full mt-4 text-xs text-codex-purple font-medium tracking-wide hover:text-codex-purple-soft transition-colors"
        >
          Explore deeper
        </button>
      )}

      {/* Layer 2 — Deep meaning */}
      {data.layer2 && (expanded === "layer2" || expanded === "layer3") && (
        <div className="mt-4 pt-4 border-t border-codex-border/50 animate-slideUp">
          <p className="text-sm leading-relaxed text-codex-text">{data.layer2}</p>
        </div>
      )}

      {/* Expand to Layer 3 */}
      {data.layer3 && expanded === "layer2" && (
        <button
          onClick={() => setExpanded("layer3")}
          className="w-full mt-3 text-xs text-codex-textMuted font-medium tracking-wide hover:text-codex-purple transition-colors"
        >
          View system data
        </button>
      )}

      {/* Layer 3 — System mechanics */}
      {data.layer3 && expanded === "layer3" && (
        <div className="mt-3 pt-3 border-t border-codex-border/30 animate-slideUp">
          <div className="grid grid-cols-2 gap-2">
            {data.layer3.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-codex-textMuted">{item.label}</span>
                <span className="text-codex-text font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapse */}
      {expanded && (
        <button
          onClick={() => setExpanded(null)}
          className="w-full mt-3 text-xs text-codex-textMuted hover:text-codex-text transition-colors"
        >
          Collapse
        </button>
      )}

    </div>
  )
}
