"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/home", label: "Oracle" },
  { href: "/codex", label: "Codex" },
  { href: "/timeline", label: "Timeline" },
  { href: "/decode", label: "Decode" },
  { href: "/advanced", label: "Chart" },
]

export default function BottomNav(){
  const pathname = usePathname()

  return(
    <nav className="fixed bottom-0 w-full z-40" style={{
      background: "rgba(11, 14, 35, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(123, 97, 255, 0.1)",
    }}>
      <div className="max-w-xl mx-auto flex justify-around py-3 px-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 transition-all duration-200"
              style={{
                color: active ? "#F2C94C" : "#8B87A8",
                fontSize: "10px",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.05em",
                textTransform: "uppercase" as const,
              }}
            >
              <div
                className="w-1 h-1 rounded-full mb-0.5 transition-all duration-200"
                style={{
                  background: active ? "#F2C94C" : "transparent",
                  boxShadow: active ? "0 0 6px rgba(242,201,76,0.4)" : "none",
                }}
              />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
