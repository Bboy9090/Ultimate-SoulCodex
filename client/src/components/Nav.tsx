import { useState } from "react";
import { Link, useLocation } from "wouter";

function useMode() {
  const [mode, setMode] = useState<"beginner" | "advanced">(() => {
    try { return (localStorage.getItem("soulMode") as any) ?? "beginner"; } catch { return "beginner"; }
  });

  function toggle() {
    const next = mode === "beginner" ? "advanced" : "beginner";
    setMode(next);
    try { localStorage.setItem("soulMode", next); } catch {}
  }

  return { mode, toggle };
}

export default function Nav() {
  const [location] = useLocation();
  const { mode, toggle } = useMode();
  const isLanding = location === "/";

  const baseLinks = [
    { href: "/start",    label: "Start"    },
    { href: "/profile",  label: "Profile"  },
    { href: "/today",    label: "Today"    },
    { href: "/guide",    label: "Guide"    },
    { href: "/tracker",  label: "Tracker"  },
    { href: "/timeline", label: "Timeline" },
    { href: "/codex",    label: "Codex"    },
  ];

  const advancedLinks = [
    { href: "/compat",    label: "Compat" },
    { href: "/poster",    label: "Poster" },
    { href: "/horoscope", label: "Chart"  },
  ];

  const appLinks = mode === "advanced" ? [...baseLinks, ...advancedLinks] : baseLinks;

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: "1.5rem" }}>✦</span>
          Soul Codex
        </Link>

        {isLanding ? (
          <div className="navbar-nav" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#systems",  label: "Systems"  },
              { href: "#pricing",  label: "Pricing"  },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.85rem",
                  color: "var(--muted-foreground)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
              >
                {link.label}
              </a>
            ))}
            <Link href="/start">
              <button
                className="btn btn-primary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 1.1rem", marginLeft: "0.5rem" }}
              >
                Get Started
              </button>
            </Link>
          </div>
        ) : (
          <div className="navbar-nav" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {appLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-ghost${location === link.href ? " active-nav" : ""}`}
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 0.85rem",
                  color: location === link.href ? "var(--cosmic-lavender)" : "var(--muted-foreground)",
                  borderBottom: location === link.href ? "2px solid var(--cosmic-purple)" : "2px solid transparent",
                  borderRadius: 0,
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mode chip — Guided (default) vs Full (advanced) */}
            <button
              onClick={toggle}
              title={mode === "beginner" ? "Show advanced pages: Compat, Poster, Chart" : "Show standard pages only"}
              style={{
                marginLeft: "0.6rem",
                padding: "0.22rem 0.7rem",
                borderRadius: "99px",
                border: "1px solid",
                borderColor: mode === "advanced" ? "rgba(139,92,246,0.55)" : "rgba(139,92,246,0.2)",
                background: mode === "advanced" ? "rgba(139,92,246,0.18)" : "transparent",
                color: mode === "advanced" ? "var(--cosmic-lavender)" : "rgba(148,163,184,0.6)",
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                lineHeight: 1,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {mode === "advanced" ? "Full" : "Guided"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
