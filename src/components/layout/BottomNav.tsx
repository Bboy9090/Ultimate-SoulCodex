"use client"

import Link from "next/link"

export default function BottomNav(){

  return(

    <nav className="fixed bottom-0 w-full bg-codex-surface border-t border-codex-border flex justify-around py-3">

      <Link href="/home" className="text-xs text-codex-textMuted hover:text-codex-text transition-colors">Home</Link>
      <Link href="/codex" className="text-xs text-codex-textMuted hover:text-codex-text transition-colors">Codex</Link>
      <Link href="/timeline" className="text-xs text-codex-textMuted hover:text-codex-text transition-colors">Timeline</Link>
      <Link href="/relationships" className="text-xs text-codex-textMuted hover:text-codex-text transition-colors">Relations</Link>
      <Link href="/advanced" className="text-xs text-codex-textMuted hover:text-codex-text transition-colors">Advanced</Link>

    </nav>

  )
}
