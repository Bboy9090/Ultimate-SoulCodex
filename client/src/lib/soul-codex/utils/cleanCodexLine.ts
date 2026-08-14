const sentenceCount = (value: string) =>
  value.split(/[.!?]+(?:\s|$)/).map(part => part.trim()).filter(Boolean).length;

const terminalDepthBridge = (value: string) =>
  `${value} Treat this as a starting interpretation rather than a verdict. Check where it appears in decisions, work, conflict, relationships, stress, or self-talk, then notice both what it helps and what it costs. One useful next step is to name a recent example that supports the pattern and another that contradicts it.`;

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

  // Several specialty surfaces historically ended after one polished sentence.
  // Preserve richer generated text, but give short legacy output a transparent
  // interpretation bridge instead of pretending the label is self-explanatory.
  if (sentenceCount(trimmed) < 3 || trimmed.length < 180) {
    return terminalDepthBridge(trimmed);
  }

  return trimmed;
}
