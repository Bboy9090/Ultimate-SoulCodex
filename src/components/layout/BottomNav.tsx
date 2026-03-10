"use client"

import Link from "next/link"

export default function BottomNav(){

  return(
    <nav>

      <Link href="/home">Home</Link>

      <Link href="/codex">Codex</Link>

      <Link href="/timeline">Timeline</Link>

      <Link href="/relationships">Relationships</Link>

      <Link href="/advanced">Advanced</Link>

    </nav>
  )
}
