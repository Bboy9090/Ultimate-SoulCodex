"use client"

import { useState, useEffect } from "react"

export type DisplayMode = "simple" | "advanced" | "research"

export function useDisplayMode() {
  const [mode, setMode] = useState<DisplayMode>("simple")

  useEffect(() => {
    const stored = localStorage.getItem("codex_display_mode")
    if (stored === "advanced" || stored === "research") setMode(stored)
  }, [])

  const setDisplayMode = (m: DisplayMode) => {
    setMode(m)
    localStorage.setItem("codex_display_mode", m)
  }

  const defaultExpanded =
    mode === "research" ? "layer3" as const
    : mode === "advanced" ? "layer2" as const
    : undefined

  return { mode, setDisplayMode, defaultExpanded }
}
