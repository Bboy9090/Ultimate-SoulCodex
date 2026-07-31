/**
 * OverflowHandler - Phase 5
 *
 * Utility component for handling text overflow, wrapping, and truncation
 * Provides consistent overflow handling across Soul Codex
 */

interface OverflowHandlerProps {
  children: React.ReactNode;
  truncate?: "single" | "double" | "triple" | "none";
  breakWord?: boolean;
  nowrap?: boolean;
  style?: React.CSSProperties;
}

export default function OverflowHandler({
  children,
  truncate = "none",
  breakWord = false,
  nowrap = false,
  style,
}: OverflowHandlerProps) {
  let overflowStyle: React.CSSProperties = {
    ...style,
  };

  if (truncate === "single") {
    overflowStyle = {
      ...overflowStyle,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
  } else if (truncate === "double") {
    overflowStyle = {
      ...overflowStyle,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    };
  } else if (truncate === "triple") {
    overflowStyle = {
      ...overflowStyle,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    };
  }

  if (breakWord) {
    overflowStyle = {
      ...overflowStyle,
      wordBreak: "break-word",
      overflowWrap: "break-word",
    };
  }

  if (nowrap) {
    overflowStyle = {
      ...overflowStyle,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };
  }

  return (
    <div style={overflowStyle}>
      {children}
    </div>
  );
}

/**
 * Text truncation presets for common use cases
 */
export const truncationStyles = {
  title: {
    single: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    } as React.CSSProperties,
    double: {
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    } as React.CSSProperties,
  },
  body: {
    double: {
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    } as React.CSSProperties,
    triple: {
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    } as React.CSSProperties,
  },
} as const;
