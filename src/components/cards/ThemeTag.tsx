export default function ThemeTag({ label, color }: { label: string; color?: string }) {
  const c = color || "#7B61FF"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        background: `${c}0F`,
        border: `1px solid ${c}28`,
        borderRadius: 9999,
        fontSize: "0.72rem",
        color: c,
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  )
}
