import "@/styles/globals.css"
import BottomNav from "@/components/layout/BottomNav"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-codex">

        <main>{children}</main>

        <BottomNav />

      </body>
    </html>
  )
}
