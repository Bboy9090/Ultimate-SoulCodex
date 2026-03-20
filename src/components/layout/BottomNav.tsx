"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/home",     label: "Oracle",   icon: "◎" },
  { href: "/codex",    label: "Codex",    icon: "⬡" },
  { href: "/timeline", label: "Timeline", icon: "◈" },
  { href: "/guide",    label: "Guide",    icon: "✦" },
  { href: "/growth",   label: "Growth",   icon: "▲" },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide nav on onboarding / root
  if (pathname === "/" || pathname === "/onboarding") return null

  return (
    <nav
      className="fixed bottom-0 w-full z-40"
      style={{
        background: "rgba(11, 14, 35, 0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(123, 97, 255, 0.12)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.35)",
      }}
    >
      <div
        className="max-w-xl mx-auto flex justify-around px-2"
        style={{ paddingTop: "10px", paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all duration-200 select-none"
              style={{
                minWidth: 44,
                minHeight: 44,
                justifyContent: "center",
                color: active ? "#F2C94C" : "#8B87A8",
                fontSize: "9px",
                fontWeight: active ? 700 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                position: "relative",
              }}
            >
              {/* Active top-dot indicator (Replit-style glow) */}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "#F2C94C",
                    boxShadow: "0 0 8px rgba(242,201,76,0.8)",
                  }}
                />
              )}
              {/* Icon */}
              <span
                style={{
                  fontSize: "15px",
                  lineHeight: 1,
                  filter: active ? "drop-shadow(0 0 5px rgba(242,201,76,0.5))" : "none",
                  transition: "all 0.2s ease",
                  display: "block",
                }}
              >
                {item.icon}
              </span>
              {/* Label */}
              <span style={{ transition: "color 0.2s ease" }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
