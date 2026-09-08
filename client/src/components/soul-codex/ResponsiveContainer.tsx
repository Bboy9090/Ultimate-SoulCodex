/**
 * ResponsiveContainer - Phase 5
 *
 * Mobile-first responsive wrapper for Soul Codex reading display
 * Handles:
 * - Viewport-aware spacing and padding
 * - Safe area insets (notch, dynamic island)
 * - Responsive font sizes
 * - Touch-friendly layout on mobile
 * - Automatic overflow handling
 */

import { useEffect, useState } from "react";
import { BREAKPOINTS } from "./responsiveUtils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function ResponsiveContainer({
  children,
  maxWidth = 960,
}: ResponsiveContainerProps) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);

    // Handle viewport changes
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= BREAKPOINTS.mobile) {
        setViewport("mobile");
      } else if (width <= BREAKPOINTS.tablet) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getContainerPadding = () => {
    switch (viewport) {
      case "mobile":
        return "1rem";
      case "tablet":
        return "1.5rem";
      default:
        return "2rem";
    }
  };

  const getContainerMaxWidth = () => {
    switch (viewport) {
      case "mobile":
        return "100%";
      case "tablet":
        return "95%";
      default:
        return `${maxWidth}px`;
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--sc-background, #0a0a0a)",
      }}
      data-viewport={viewport}
      data-touch={isTouchDevice ? "true" : "false"}
    >
      <div
        style={{
          maxWidth: getContainerMaxWidth(),
          margin: "0 auto",
          padding: getContainerPadding(),
          // Safe area for notch/dynamic island
          paddingTop: `max(${getContainerPadding()}, env(safe-area-inset-top))`,
          paddingBottom: `max(${getContainerPadding()}, env(safe-area-inset-bottom))`,
          paddingLeft: `max(${getContainerPadding()}, env(safe-area-inset-left))`,
          paddingRight: `max(${getContainerPadding()}, env(safe-area-inset-right))`,
          // Improve text rendering on mobile
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </div>

      {/* Mobile-specific styles via data attribute */}
      <style>{`
        [data-viewport="mobile"] h1 {
          font-size: 1.75rem;
        }
        [data-viewport="mobile"] h2 {
          font-size: 1.25rem;
        }
        [data-viewport="mobile"] h3 {
          font-size: 1rem;
        }
        [data-viewport="mobile"] body {
          font-size: 0.95rem;
        }

        [data-viewport="tablet"] h1 {
          font-size: 2rem;
        }
        [data-viewport="tablet"] h2 {
          font-size: 1.5rem;
        }

        /* Touch device adjustments */
        [data-touch="true"] button,
        [data-touch="true"] a {
          min-height: 44px;
          min-width: 44px;
        }

        /* Prevent zoom on double-tap */
        [data-touch="true"] input,
        [data-touch="true"] button {
          font-size: 1rem;
        }

        /* Better text rendering on mobile */
        [data-viewport="mobile"] p {
          -webkit-hyphens: auto;
          hyphens: auto;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
