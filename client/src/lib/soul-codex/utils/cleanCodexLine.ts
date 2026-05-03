export function cleanCodexLine(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();

  if (!trimmed) return fallback;
  if (trimmed.length < 12) return fallback;
  if (/^[A-Z]\.?$/i.test(trimmed)) return fallback;
  if (trimmed === "undefined" || trimmed === "null") return fallback;
  if (trimmed.includes("Aligning your natal and behavioral signals")) {
    return fallback;
  }

  return trimmed;
}
