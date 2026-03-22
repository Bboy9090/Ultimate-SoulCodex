import "@/styles/globals.css"
import BottomNav from "@/components/layout/BottomNav"
import AppShell from "@/components/layout/AppShell"
import type { Viewport } from "next"

export const metadata = {
  title: "Soul Codex — Your Eternal Mirror",
  description: "A digital psychological mirror synthesizing astrology, numerology, human design, and behavioral patterns into one living intelligence.",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#7B61FF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-codex">
        <main>
          <AppShell>
            {children}
          </AppShell>
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
