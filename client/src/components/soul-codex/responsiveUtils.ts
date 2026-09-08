/**
 * Responsive Utilities - Phase 5
 *
 * Breakpoints and responsive helpers for Soul Codex mobile-first design
 */

export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Viewport = "mobile" | "tablet" | "desktop" | "wide";

/**
 * Media query strings for use in component styles
 */
export const media = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `@media (min-width: ${BREAKPOINTS.wide}px)`,
} as const;

/**
 * Responsive grid templates for 2-column layouts
 * - Mobile: 1 column
 * - Tablet+: 2 columns
 */
export const responsiveGrid2 = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.5rem",
  "@media (min-width: 768px)": {
    gridTemplateColumns: "1fr 1fr",
  },
} as const;

/**
 * Responsive grid for 3-column layouts
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop+: 3 columns
 */
export const responsiveGrid3 = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1.5rem",
  "@media (min-width: 640px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
} as const;

/**
 * Text truncation helpers
 */
export const textOverflow = {
  singleLine: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as const,
  twoLines: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  } as React.CSSProperties,
  threeLines: {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  } as React.CSSProperties,
};

/**
 * Minimum touch target size (44px recommended by WCAG)
 */
export const touchTarget = {
  minHeight: "44px",
  minWidth: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

/**
 * Responsive padding that scales with viewport
 */
export const responsivePadding = {
  mobile: "1rem",
  tablet: "1.5rem",
  desktop: "2rem",
} as const;

/**
 * Font size scale for mobile readability
 */
export const fontScale = {
  h1: {
    mobile: "1.75rem",
    tablet: "2rem",
    desktop: "2.5rem",
  },
  h2: {
    mobile: "1.25rem",
    tablet: "1.5rem",
    desktop: "1.75rem",
  },
  h3: {
    mobile: "1rem",
    tablet: "1.25rem",
    desktop: "1.5rem",
  },
  body: {
    mobile: "0.95rem",
    tablet: "1rem",
    desktop: "1rem",
  },
  small: {
    mobile: "0.85rem",
    tablet: "0.9rem",
    desktop: "0.9rem",
  },
} as const;

/**
 * Safe area insets for notch/dynamic island (mobile)
 */
export const safeArea = {
  paddingTop: "max(1rem, env(safe-area-inset-top))",
  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
  paddingLeft: "max(1rem, env(safe-area-inset-left))",
  paddingRight: "max(1rem, env(safe-area-inset-right))",
} as const;

/**
 * Container queries for responsive component-level styling
 * (Use when CSS supports @container)
 */
export const containerQuery = {
  small: "@container (min-width: 300px)",
  medium: "@container (min-width: 500px)",
  large: "@container (min-width: 800px)",
} as const;

/**
 * Get viewport-specific value
 */
export function getResponsiveValue<T>(
  value: Record<Viewport, T>,
  viewport: Viewport
): T {
  return value[viewport];
}

/**
 * Stack layout helper - flex column on mobile, row on desktop
 */
export const stackLayout = (mobileGap = "1rem", desktopGap = "1.5rem") => ({
  display: "flex",
  flexDirection: "column" as const,
  gap: mobileGap,
  "@media (min-width: 768px)": {
    flexDirection: "row" as const,
    gap: desktopGap,
  },
});
