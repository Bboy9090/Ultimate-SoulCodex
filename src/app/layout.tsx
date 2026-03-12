import "@/styles/globals.css"
import BottomNav from "@/components/layout/BottomNav"
import AppShell from "@/components/layout/AppShell"

export const metadata = {
  title: "Soul Codex",
  description: "Your digital psychological mirror.",
  manifest: "/manifest.json",
  themeColor: "#8C6BFF",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
