export type ReflectionLens = "grounded" | "cosmic" | "sacred";

export const REFLECTION_LENS_STORAGE_KEY = "soulcodex.reflectionLens.v1";

export const REFLECTION_LENS_COPY: Record<
  ReflectionLens,
  {
    label: string;
    shortDescription: string;
    kicker: string;
    lede: string;
    principle: string;
  }
> = {
  grounded: {
    label: "Grounded",
    shortDescription: "Plain symbolic language with the strongest emphasis on evidence, uncertainty, and lived experience.",
    kicker: "Signal · resonance · tension · choice",
    lede:
      "Your strongest supported signals are refracted into one clear pattern: what reinforces, what conflicts, what remains unknown, and what you can test in real life now.",
    principle:
      "Interpretations are symbolic and evidence-traced. Support describes source quality and consistency, not scientific proof or a fixed verdict about you.",
  },
  cosmic: {
    label: "Cosmic",
    shortDescription: "Frames the same evidence as a galactic pattern or cosmic blueprint for reflective self-discovery.",
    kicker: "Cosmic lens · signal · resonance · choice",
    lede:
      "Read your verified signals as a cosmic pattern: not a sentence written over your life, but a map of recurring tensions, gifts, and choices you can test against experience.",
    principle:
      "The cosmic lens is a meaning-making frame. It never changes astronomical calculations, evidence support, missing-data rules, or factual confidence.",
  },
  sacred: {
    label: "Sacred",
    shortDescription: "Uses spiritual language for people who understand their life pattern through God, divine purpose, or sacred design.",
    kicker: "Sacred lens · evidence · reflection · free will",
    lede:
      "If you experience your life as God-given or sacred, use these supported patterns as reflection on potential, tension, and responsibility—not as proof of a predetermined destiny.",
    principle:
      "The sacred lens expresses personal belief and meaning. It never turns symbolic interpretation into empirical fact, and it never overrides lived experience or free choice.",
  },
};

export function normalizeReflectionLens(value: unknown): ReflectionLens {
  return value === "cosmic" || value === "sacred" ? value : "grounded";
}

export function readReflectionLens(): ReflectionLens {
  if (typeof window === "undefined") return "grounded";
  try {
    return normalizeReflectionLens(window.localStorage.getItem(REFLECTION_LENS_STORAGE_KEY));
  } catch {
    return "grounded";
  }
}

export function writeReflectionLens(value: ReflectionLens): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REFLECTION_LENS_STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent("soulcodex:reflection-lens", { detail: value }));
  } catch {
    // Preference persistence is best-effort; the reading itself remains available.
  }
}
