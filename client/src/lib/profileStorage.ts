const STORAGE_KEY = "soulcodex.activeProfile.v1";

export interface StoredProfile {
  [key: string]: any;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  lifePathNumber?: number;
  astrologyData?: any;
  numerologyData?: any;
  humanDesignData?: any;
  synthesis?: any;
  codename?: string;
  archetype?: string;
}

export function loadActiveProfile(): StoredProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveProfile(profilePayload: any): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profilePayload));
  } catch (e) {
    console.warn("[profileStorage] Failed to save profile:", e);
  }
}

export function clearActiveProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("[profileStorage] Failed to clear profile:", e);
  }
}

export function deriveConfidenceState(
  profile: StoredProfile
): "verified" | "partial" | "unverified" {
  if (!profile) return "unverified";

  // Verified: birthDate + birthTime + birthLocation present
  if (profile.birthDate && profile.birthTime && profile.birthLocation) {
    return "verified";
  }

  // Partial: birthDate present but missing time or location
  if (profile.birthDate) {
    return "partial";
  }

  // Unverified: no birth data
  return "unverified";
}

export function isProfileComplete(profile: StoredProfile | null): boolean {
  if (!profile) return false;
  // Profile is complete if it has a birth date (minimum requirement for onboarding)
  return !!profile.birthDate;
}
