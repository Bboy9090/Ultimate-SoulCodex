import { useState } from "react";
import { Link, useLocation } from "wouter";

function useMode() {
  const [mode, setMode] = useState<"beginner" | "advanced">(() => {
    try {
      const stored = localStorage.getItem("soulMode");
      return (stored === "advanced" ? "advanced" : "beginner");
    } catch { return "beginner"; }
  });

  function toggle() {
    const next = mode === "beginner" ? "advanced" : "beginner";
    setMode(next);
    try { localStorage.setItem("soulMode", next); } catch {}
  }

  return { mode, toggle };
}

const NAV_ICONS: Record<string, string> = {
  "/start":     "◉",
  "/profile":   "◆",
  "/today":     "☽",
  "/guide":     "◎",
  "/tracker":   "▲",
  "/timeline":  "◈",
  "/codex":     "✦",
  "/compat":    "⧫",
  "/poster":    "⬡",
  "/horoscope": "◌",
};

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
    { href: "/compat",    label: "Compat"  },
    { href: "/poster",    label: "Poster"  },
    { href: "/horoscope", label: "Chart"   },
  ];

  const appLinks = mode === "advanced" ? [...baseLinks, ...advancedLinks] : baseLinks;

  /* ── Landing page: horizontal top bar ─────────────────────────────────── */
  if (isLanding) {
    return (
      <nav className="navbar">
        <div className="container navbar-content">
          <Link href="/" className="navbar-brand">
            <img
              src="/soul-codex-logo.svg"
              alt="Soul Codex"
              style={{ width: 28, height: 28, filter: "drop-shadow(0 0 5px rgba(212,168,95,0.5))" }}
            />
            Soul Codex
          </Link>
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
                  color: "var(--sc-text-muted)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sc-ivory)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--sc-text-muted)")}
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
        </div>
      </nav>
    );
  }

  /* ── App pages: sidebar nav ────────────────────────────────────────────── */
  return (
    <nav className="sc-sidebar">
      {/* Brand mark */}
      <Link href="/" className="sc-sidebar-brand">
        <img src="/soul-codex-logo.svg" alt="Soul Codex logo" />
        <span>Soul Codex</span>
      </Link>

      {/* Primary nav links */}
      {appLinks.map((link) => {
        const isActive = location === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`sc-nav-item${isActive ? " sc-nav-active" : ""}`}
          >
            <span style={{ fontSize: "0.85rem", width: "1rem", textAlign: "center", flexShrink: 0 }}>
              {NAV_ICONS[link.href] ?? "◦"}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="sc-sidebar-divider" />

      {/* Mode toggle */}
      <button
        onClick={toggle}
        className={`sc-mode-toggle${mode === "advanced" ? " sc-mode-full" : ""}`}
        title={mode === "beginner"
          ? "Switch to Full mode: adds Compat, Poster, Chart"
          : "Switch to Guided mode: hides advanced pages"}
      >
        <span>{mode === "advanced" ? "Full mode" : "Guided mode"}</span>
        <span style={{ opacity: 0.55, fontSize: "0.7rem" }}>{mode === "advanced" ? "▾" : "▸"}</span>
      </button>
    </nav>
  );
}
