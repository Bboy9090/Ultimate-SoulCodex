/** Device-local visual preference. Never changes the interpretation engine. */
export const COSMIC_MOTION_KEY = "soulcodex.cosmic-motion.v1";
export const COSMIC_MOTION_EVENT = "soulcodex:cosmic-motion-changed";
export const COSMIC_MOTION_OPTIONS = ["full", "ambient", "still"] as const;
export type CosmicMotion = typeof COSMIC_MOTION_OPTIONS[number];

export function normalizeCosmicMotion(value: unknown): CosmicMotion {
  return typeof value === "string" && COSMIC_MOTION_OPTIONS.includes(value as CosmicMotion)
    ? value as CosmicMotion
    : "ambient";
}

export function readCosmicMotion(): CosmicMotion {
  if (typeof window === "undefined") return "ambient";
  try { return normalizeCosmicMotion(window.localStorage.getItem(COSMIC_MOTION_KEY)); }
  catch { return "ambient"; }
}

export function applyCosmicMotion(value: CosmicMotion): void {
  if (typeof document !== "undefined") document.documentElement.dataset.cosmicMotion = value;
}

export function writeCosmicMotion(value: CosmicMotion): void {
  const safe = normalizeCosmicMotion(value);
  if (typeof window === "undefined") return;
  // Don't claim persistence when local storage is blocked.
  window.localStorage.setItem(COSMIC_MOTION_KEY, safe);
  applyCosmicMotion(safe);
  window.dispatchEvent(new CustomEvent(COSMIC_MOTION_EVENT, { detail: safe }));
}
