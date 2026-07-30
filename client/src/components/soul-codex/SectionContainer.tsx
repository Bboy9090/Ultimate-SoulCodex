/**
 * SectionContainer - Phase 4/5
 *
 * Consistent wrapper for all Soul Codex sections
 * Provides spacing, optional background, visual hierarchy, and mobile responsiveness
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
        marginBottom: "2rem",
        padding: variant !== "primary" ? "1rem" : "0",
        background: backgrounds[variant],
        borderRadius: variant !== "primary" ? "8px" : "0",
        border:
          variant !== "primary"
            ? `1px solid ${variant === "technical" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)"}`
            : "none",
        // Mobile responsive
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          [data-section-id="${id}"] {
            margin-bottom: 3rem;
            padding: ${variant !== "primary" ? "1.5rem" : "0"};
          }
          [data-section-id="${id}"] h2 {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      {title && (
        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: titleColors[variant],
              margin: "0 0 0.5rem 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
                color: "var(--sc-stone)",
                margin: 0,
                lineHeight: "1.6",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
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
