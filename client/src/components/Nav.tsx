import { useState } from "react";
import { Link, useLocation } from "wouter";

import {
  IconToday, IconProfile, IconGuide, IconTracker, IconTimeline,
  IconCodex, IconCompat, IconPoster, IconChart, IconBlueprint,
  IconLogo
} from "./Icons";

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

const NAV_ICONS: Record<string, any> = {
  "/":           IconToday,
  "/profile":    IconProfile,
  "/guide":      IconGuide,
  "/tracker":    IconTracker,
  "/timeline":   IconTimeline,
  "/codex":      IconCodex,
  "/compat":     IconCompat,
  "/poster":     IconPoster,
  "/horoscope":  IconChart,
  "/blueprint":  IconBlueprint,
};

export default function Nav() {
  const [location] = useLocation();
  const { mode, toggle } = useMode();

  const hasProfileData = (() => {
    try { return !!localStorage.getItem("soulProfile"); } catch { return false; }
  })();

  const baseLinks = [
    { href: "/",         label: hasProfileData ? "Today" : "Start" },
    { href: "/profile",  label: "Profile"  },
    { href: "/guide",    label: "Guide"    },
    { href: "/tracker",  label: "Tracker"  },
    { href: "/timeline", label: "Timeline" },
    { href: "/codex",    label: "Codex"    },
  ];

  const advancedLinks = [
    { href: "/compat",     label: "Compat"     },
    { href: "/poster",     label: "Poster"     },
    { href: "/horoscope",  label: "Chart"      },
    { href: "/blueprint",  label: "Blueprint"  },
  ];

  const appLinks = mode === "advanced" ? [...baseLinks, ...advancedLinks] : baseLinks;

  return (
    <nav className="sc-sidebar">
      <Link href="/" className="sc-sidebar-brand">
        <IconLogo size={24} style={{ filter: "drop-shadow(0 0 10px rgba(212,168,95,0.4))" }} />
        <span>Soul Codex</span>
      </Link>

      {appLinks.map((link) => {
        const isActive = location === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`sc-nav-item${isActive ? " sc-nav-active" : ""}`}
          >
            <span style={{ fontSize: "0.85rem", width: "1.1rem", textAlign: "center", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(() => {
                const IconComp = NAV_ICONS[link.href];
                if (IconComp) return <IconComp style={{ width: "1rem", height: "1rem" }} />;
                return <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>◦</span>;
              })()}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="sc-sidebar-divider" />

      <button
        onClick={toggle}
        className={`sc-mode-toggle${mode === "advanced" ? " sc-mode-full" : ""}`}
        title={mode === "beginner"
          ? "Switch to Full mode — unlocks Compat, Poster, Chart"
          : "Switch to Guided mode — essentials only"}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: "0.05rem" }}>
          <span style={{
            fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase",
            opacity: 0.45, lineHeight: 1, fontWeight: 700,
          }}>
            View
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.03em" }}>
            {mode === "advanced" ? "Full" : "Guided"}
          </span>
        </span>
        <span style={{
          fontSize: "0.65rem", opacity: 0.45,
          transform: mode === "advanced" ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}>
          ▸
        </span>
      </button>

      <div style={{ marginTop: "auto", padding: "1rem 0", display: "flex", flexDirection: "column", gap: "0.4rem", opacity: 0.4 }}>
        <Link href="/privacy" className="sc-nav-item" style={{ padding: "0.25rem 0.75rem", fontSize: "0.65rem" }}>
          Privacy
        </Link>
        <Link href="/terms" className="sc-nav-item" style={{ padding: "0.25rem 0.75rem", fontSize: "0.65rem" }}>
          Terms
        </Link>
      </div>
    </nav>
  );
}
