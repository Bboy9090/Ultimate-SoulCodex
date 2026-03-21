"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { usePremium } from "@/hooks/usePremium"

const NAV_ITEMS = [
  { href: "/home",          label: "Oracle",   icon: "◎" },
  { href: "/codex",         label: "Codex",    icon: "⬡" },
  { href: "/timeline",      label: "Timeline", icon: "◈" },
  { href: "/guide",         label: "Guide",    icon: "✦" },
  { href: "/growth",        label: "Growth",   icon: "▲" },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isPremium, loading: premiumLoading } = usePremium()

  if (pathname === "/" || pathname === "/onboarding" || pathname === "/upgrade") return null

  return (
    <nav
      className="fixed bottom-0 w-full z-40"
      style={{
        background: "rgba(9, 11, 28, 0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(123, 97, 255, 0.1)",
        boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.45), 0 -1px 0 rgba(123,97,255,0.06)",
      }}
    >
      {/* Top glow line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(123,97,255,0.28) 50%, transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Premium upgrade strip — only for free users */}
      {!premiumLoading && !isPremium && (
        <button
          onClick={() => router.push("/upgrade")}
          style={{
            width: "100%",
            padding: "0.45rem 1rem",
            background: "linear-gradient(90deg, rgba(242,201,76,0.08) 0%, rgba(123,97,255,0.06) 50%, rgba(242,201,76,0.08) 100%)",
            borderBottom: "1px solid rgba(242,201,76,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            border: "none",
            borderTop: "none",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, rgba(242,201,76,0.14) 0%, rgba(123,97,255,0.1) 50%, rgba(242,201,76,0.14) 100%)"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, rgba(242,201,76,0.08) 0%, rgba(123,97,255,0.06) 50%, rgba(242,201,76,0.08) 100%)"
          }}
        >
          <span style={{ fontSize: 10, color: "#F2C94C", letterSpacing: "0.08em", fontWeight: 600 }}>
            ✦ UNLOCK PREMIUM
          </span>
          <span style={{ fontSize: 10, color: "#8B87A8", letterSpacing: "0.04em" }}>
            — Unlimited AI · Full Chart · Poster
          </span>
          <span
            style={{
              fontSize: 9,
              color: "#F2C94C",
              background: "rgba(242,201,76,0.12)",
              border: "1px solid rgba(242,201,76,0.25)",
              borderRadius: 4,
              padding: "1px 6px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            $9.99
          </span>
        </button>
      )}

      {/* Premium active strip */}
      {!premiumLoading && isPremium && (
        <div
          style={{
            width: "100%",
            padding: "0.3rem 1rem",
            background: "linear-gradient(90deg, rgba(242,201,76,0.04) 0%, rgba(123,97,255,0.04) 100%)",
            borderBottom: "1px solid rgba(242,201,76,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
          }}
        >
          <span style={{ fontSize: 9, color: "#F2C94C", letterSpacing: "0.1em", fontWeight: 600 }}>
            ✦ PREMIUM ACTIVE
          </span>
          <span style={{ fontSize: 9, color: "#4A4570" }}>·</span>
          <span style={{ fontSize: 9, color: "#8B87A8", letterSpacing: "0.04em" }}>
            All features unlocked
          </span>
        </div>
      )}

      <div
        className="max-w-xl mx-auto flex justify-around px-1"
        style={{
          paddingTop: "8px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center select-none"
              style={{
                gap: "0.2rem",
                minWidth: 52,
                minHeight: 48,
                justifyContent: "center",
                color: active ? "#F2C94C" : "#6B6880",
                fontSize: "9px",
                fontWeight: active ? 700 : 400,
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                position: "relative",
                transition: "color 0.25s ease",
                padding: "0.25rem 0.5rem",
                borderRadius: 12,
              }}
            >
              {/* Active indicator pill at top */}
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 24,
                    height: 2,
                    borderRadius: "0 0 4px 4px",
                    background: "linear-gradient(90deg, #F2C94C, #fbbf24)",
                    boxShadow: "0 0 10px rgba(242,201,76,0.7)",
                  }}
                />
              )}

              {/* Active background glow */}
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 12,
                    background: "radial-gradient(ellipse at center, rgba(242,201,76,0.07) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Icon */}
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: 1,
                  display: "block",
                  transition: "all 0.25s ease",
                  filter: active
                    ? "drop-shadow(0 0 6px rgba(242,201,76,0.55))"
                    : "none",
                  transform: active ? "scale(1.08)" : "scale(1)",
                }}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span
                style={{
                  transition: "color 0.25s ease, opacity 0.25s ease",
                  opacity: active ? 1 : 0.65,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
