/**
 * SectionContainer - Phase 4
 *
 * Consistent wrapper for all Soul Codex sections
 * Provides spacing, optional background, and visual hierarchy
 */

interface SectionContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "technical";
  id?: string;
}

export default function SectionContainer({
  title,
  subtitle,
  children,
  variant = "primary",
  id,
}: SectionContainerProps) {
  const backgrounds: Record<string, string> = {
    primary: "transparent",
    secondary: "rgba(255,255,255,0.01)",
    technical: "rgba(255,255,255,0.02)",
  };

  const titleColors: Record<string, string> = {
    primary: "var(--sc-gold)",
    secondary: "var(--sc-teal)",
    technical: "var(--sc-stone)",
  };

  return (
    <section
      id={id}
      style={{
        marginBottom: "3rem",
        padding: variant !== "primary" ? "1.5rem" : "0",
        background: backgrounds[variant],
        borderRadius: variant !== "primary" ? "12px" : "0",
        border:
          variant !== "primary"
            ? `1px solid ${variant === "technical" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)"}`
            : "none",
      }}
    >
      {title && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: titleColors[variant],
              margin: "0 0 0.5rem 0",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--sc-stone)",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
