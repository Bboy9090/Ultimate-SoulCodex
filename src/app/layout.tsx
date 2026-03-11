import "@/styles/globals.css"
import BottomNav from "@/components/layout/BottomNav"
import AppShell from "@/components/layout/AppShell"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
