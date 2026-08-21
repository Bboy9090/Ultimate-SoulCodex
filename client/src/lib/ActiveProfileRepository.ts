/**
 * ActiveProfileRepository
 *
 * Single source of truth for active Soul Codex profile.
 * All pages read/write through this, ensuring data consistency.
 *
 * Responsibilities:
 * 1. Canonical localStorage key (soulcodex.activeProfile.v1)
 * 2. Legacy key migration (soulProfile, soulCodexReading, etc.)
 * 3. Schema validation and versioning
 * 4. Cross-page synchronization
 * 5. Recovery messaging (missing, corrupted, wrong version)
 */

import { calcLifePath } from "@soulcodex/core";
import type { PlacementLike } from './placementVerification';

export interface StoredProfile {
  id?: string;
  remoteId?: string;
  name?: string;
  codename?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  timezone?: string;
  latitude?: string;
  longitude?: string;
  birthplace?: {
    city?: string;
    region?: string;
    country?: string;
  };
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  astrologyData?: any & {
    placements?: {
      sun?: PlacementLike;
      moon?: PlacementLike;
      rising?: PlacementLike;
    };
  };
  lifePathNumber?: number;
  personalNumbers?: any;
  numerologyData?: any;
  humanDesignType?: string;
  humanDesignData?: any;
  archetype?: string;
  synthesis?: any;
  elements?: any;
  confidence?: any;
  schemaVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProfileLoadStatus =
  | "loaded"
  | "missing"
  | "corrupted"
  | "wrong-version"
  | "legacy-found";

export interface ProfileLoadResult {
  status: ProfileLoadStatus;
  profile: StoredProfile | null;
  legacyKey?: string;
  reason?: string;
}

const CANONICAL_KEY = "soulcodex.activeProfile.v1";
const SCHEMA_VERSION = 1;
export const ACTIVE_PROFILE_UPDATED_EVENT = "soulcodex:profile-updated";

const LEGACY_PROFILE_KEYS = [
  "soulProfile",
  "soulCodexReading",
  "soulConfidence",
  "soulGuestProfile",
  "soulGuestConfidence",
];

const PROFILE_RELATED_KEYS_TO_CLEAR = [
  ...LEGACY_PROFILE_KEYS,
  "onboardingData",
];

type StorageReadResult =
  | { status: "missing"; profile: null }
  | { status: "loaded"; profile: StoredProfile }
  | { status: "corrupted"; profile: null; reason: string };

function notifyProfileUpdated(): void {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  window.dispatchEvent(new Event(ACTIVE_PROFILE_UPDATED_EVENT));
}

export function loadActiveProfile(): ProfileLoadResult {
  try {
    const canonical = readFromKey(CANONICAL_KEY);
    if (canonical.status === "corrupted") {
      return { status: "corrupted", profile: null, reason: canonical.reason };
    }

    if (canonical.status === "loaded") {
      const validation = validateProfile(canonical.profile);
      if (validation.valid) {
        const repaired = repairStoredLifePath(canonical.profile);
        if (repaired !== canonical.profile) saveToKey(CANONICAL_KEY, repaired);
        return { status: "loaded", profile: repaired };
      }
      return {
        status: validation.reason === "wrong-version" ? "wrong-version" : "corrupted",
        profile: null,
        reason: validation.message,
      };
    }

    for (const legacyKey of LEGACY_PROFILE_KEYS) {
      const legacy = readFromKey(legacyKey);
      if (legacy.status !== "loaded") continue;

      const migrated = migrateLegacyProfile(legacy.profile);
      if (!migrated.success || !migrated.profile) continue;

      return {
        status: "legacy-found",
        profile: migrated.profile,
        legacyKey,
      };
    }

    return { status: "missing", profile: null };
  } catch (error) {
    console.error("[ActiveProfileRepository] Load error:", error);
    return {
      status: "corrupted",
      profile: null,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function saveActiveProfile(profile: StoredProfile): {
  success: boolean;
  error?: string;
} {
  try {
    const now = new Date().toISOString();
    const enriched: StoredProfile = {
      ...profile,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: now,
      createdAt: profile.createdAt ?? now,
    };

    saveToKey(CANONICAL_KEY, enriched);

    const verification = readFromKey(CANONICAL_KEY);
    if (verification.status !== "loaded") {
      return {
        success: false,
        error:
          verification.status === "corrupted"
            ? `Profile saved but read-back was corrupted: ${verification.reason}`
            : "Profile saved but could not be verified immediately.",
      };
    }

    const validation = validateProfile(verification.profile);
    if (!validation.valid) {
      return {
        success: false,
        error: `Profile verification failed: ${validation.message}`,
      };
    }

    notifyProfileUpdated();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ActiveProfileRepository] Save error:", message);
    return { success: false, error: message };
  }
}

export function clearActiveProfile(): void {
  try {
    localStorage.removeItem(CANONICAL_KEY);
    for (const key of PROFILE_RELATED_KEYS_TO_CLEAR) {
      localStorage.removeItem(key);
    }
    notifyProfileUpdated();
  } catch (error) {
    console.error("[ActiveProfileRepository] Clear error:", error);
  }
}

export function getRecoveryMessage(
  result: ProfileLoadResult
): { title: string; description: string; recovery: string[] } {
  switch (result.status) {
    case "loaded":
      return { title: "Profile loaded", description: "Your Soul Codex profile is ready.", recovery: [] };
    case "missing":
      return {
        title: "No profile found",
        description: "Soul Codex profile not found in this browser or app context.",
        recovery: ["Create profile", "Import a saved profile from another device"],
      };
    case "legacy-found":
      return {
        title: "Legacy profile restored",
        description: "Found an older Soul Codex profile. Would you like to continue with it?",
        recovery: ["Continue with restored profile", "Create profile"],
      };
    case "corrupted":
      return {
        title: "Profile needs repair",
        description: "Your saved profile appears to be corrupted.",
        recovery: ["Repair profile", "View technical details", "Start fresh"],
      };
    case "wrong-version":
      return {
        title: "Profile format changed",
        description: "Your profile was created with an older version of Soul Codex.",
        recovery: ["Migrate profile to new format", "Start fresh with new version"],
      };
  }
}

function readFromKey(key: string): StorageReadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch (error) {
    return {
      status: "corrupted",
      profile: null,
      reason: error instanceof Error ? error.message : `Unable to read ${key}`,
    };
  }

  if (raw === null) return { status: "missing", profile: null };

  if (!raw.trim() || raw === "undefined" || raw === "null") {
    return {
      status: "corrupted",
      profile: null,
      reason: `Stored value for ${key} is empty or invalid`,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        status: "corrupted",
        profile: null,
        reason: `Stored value for ${key} is not a profile object`,
      };
    }
    return { status: "loaded", profile: parsed as StoredProfile };
  } catch (error) {
    return {
      status: "corrupted",
      profile: null,
      reason: error instanceof Error ? error.message : `Invalid JSON in ${key}`,
    };
  }
}

function saveToKey(key: string, profile: StoredProfile): void {
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.warn(`[ActiveProfileRepository] Failed to save to ${key}:`, error);
    throw error;
  }
}

function migrateLegacyProfile(profile: StoredProfile): {
  success: boolean;
  profile?: StoredProfile;
} {
  if (profile.schemaVersion !== undefined && profile.schemaVersion !== SCHEMA_VERSION) {
    return { success: false };
  }

  if (!profile.birthDate) return { success: false };

  const now = new Date().toISOString();
  const migrated: StoredProfile = repairStoredLifePath({
    ...profile,
    schemaVersion: SCHEMA_VERSION,
    createdAt: profile.createdAt ?? now,
    updatedAt: now,
  });

  saveToKey(CANONICAL_KEY, migrated);
  const readBack = readFromKey(CANONICAL_KEY);
  if (readBack.status !== "loaded") return { success: false };

  const validation = validateProfile(readBack.profile);
  if (!validation.valid) return { success: false };

  notifyProfileUpdated();
  return { success: true, profile: readBack.profile };
}

function repairStoredLifePath(profile: StoredProfile): StoredProfile {
  const storedNumerology =
    profile.numerologyData && typeof profile.numerologyData === "object"
      ? profile.numerologyData
      : undefined;
  const hasStoredLifePath =
    profile.lifePathNumber !== undefined || storedNumerology?.lifePath !== undefined;
  if (!profile.birthDate || !hasStoredLifePath) return profile;

  let expectedLifePath: number;
  try {
    expectedLifePath = calcLifePath(profile.birthDate);
  } catch {
    return profile;
  }

  if (
    profile.lifePathNumber === expectedLifePath &&
    (!storedNumerology || storedNumerology.lifePath === expectedLifePath)
  ) {
    return profile;
  }

  return {
    ...profile,
    lifePathNumber: expectedLifePath,
    numerologyData: {
      ...(storedNumerology ?? {}),
      lifePath: expectedLifePath,
    },
    updatedAt: new Date().toISOString(),
  };
}

function validateProfile(
  profile: any
): { valid: boolean; reason?: string; message?: string } {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return { valid: false, reason: "not-object", message: "Profile is not a valid object" };
  }

  const schemaVersion = profile.schemaVersion ?? 0;
  if (schemaVersion !== SCHEMA_VERSION) {
    return {
      valid: false,
      reason: "wrong-version",
      message: `Expected schema v${SCHEMA_VERSION}, got v${schemaVersion}`,
    };
  }

  if (!profile.birthDate) {
    return {
      valid: false,
      reason: "incomplete",
      message: "Profile missing required birthDate",
    };
  }

  return { valid: true };
}
