"use client"

import ErrorBoundary from "@/components/ui/ErrorBoundary"
import type { ReactNode } from "react"

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}
