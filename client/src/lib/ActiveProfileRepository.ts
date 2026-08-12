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

import type { VerificationState, PlacementEvidence, PlacementLike } from './placementVerification';

export interface StoredProfile {
  // Identification
  id?: string;
  remoteId?: string;
  name?: string;
  codename?: string;

  // Birth data
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

  // Astrological data
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

  // Numerology data
  lifePathNumber?: number;
  personalNumbers?: any;
  numerologyData?: any;

  // Human Design data
  humanDesignType?: string;
  humanDesignData?: any;

  // Synthesis
  archetype?: string;
  synthesis?: any;
  elements?: any;

  // Metadata
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

// Legacy keys to check during migration
const LEGACY_KEYS = [
  "soulProfile",
  "soulCodexReading",
  "soulConfidence",
  "soulGuestProfile",
  "soulGuestConfidence",
  "onboardingData",
];

type StorageReadResult =
  | { status: "missing"; profile: null }
  | { status: "loaded"; profile: StoredProfile }
  | { status: "corrupted"; profile: null; reason: string };

/**
 * Load active profile with migration and validation.
 * Tries canonical key first, then legacy keys.
 * Never returns both a profile and an error—always one truth.
 */
export function loadActiveProfile(): ProfileLoadResult {
  try {
    // First: canonical storage is authoritative. If it exists but is malformed,
    // fail closed instead of silently falling back to stale legacy data.
    const canonical = readFromKey(CANONICAL_KEY);
    if (canonical.status === "corrupted") {
      return {
        status: "corrupted",
        profile: null,
        reason: canonical.reason,
      };
    }

    if (canonical.status === "loaded") {
      const validation = validateProfile(canonical.profile);
      if (validation.valid) {
        return {
          status: "loaded",
          profile: canonical.profile,
        };
      }
      return {
        status: validation.reason === "wrong-version" ? "wrong-version" : "corrupted",
        profile: null,
        reason: validation.message,
      };
    }

    // Second: try legacy keys. Legacy payloads may predate schemaVersion, so
    // validate their minimum contract and normalize them before canonical save.
    for (const legacyKey of LEGACY_KEYS) {
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

    // Third: nothing usable found
    return {
      status: "missing",
      profile: null,
    };
  } catch (error) {
    console.error("[ActiveProfileRepository] Load error:", error);
    return {
      status: "corrupted",
      profile: null,
      reason: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Save profile under canonical key.
 * Automatically adds schema version and timestamp.
 * Verifies it can be read back immediately.
 */
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

    // Immediately verify it can be read back and parsed.
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

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ActiveProfileRepository] Save error:", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Clear every local profile source that can feed the active profile.
 * Removing only the canonical key would allow stale legacy data to resurrect
 * on the next load after logout/reset.
 */
export function clearActiveProfile(): void {
  try {
    localStorage.removeItem(CANONICAL_KEY);
    for (const legacyKey of LEGACY_KEYS) {
      localStorage.removeItem(legacyKey);
    }
  } catch (error) {
    console.error("[ActiveProfileRepository] Clear error:", error);
  }
}

/**
 * Get human-readable recovery message based on load status.
 */
export function getRecoveryMessage(
  result: ProfileLoadResult
): { title: string; description: string; recovery: string[] } {
  switch (result.status) {
    case "loaded":
      return {
        title: "Profile loaded",
        description: "Your Soul Codex profile is ready.",
        recovery: [],
      };

    case "missing":
      return {
        title: "No profile found",
        description:
          "Soul Codex profile not found in this browser or app context.",
        recovery: [
          "Create a new reading",
          "Import a saved profile from another device",
        ],
      };

    case "legacy-found":
      return {
        title: "Legacy profile restored",
        description: "Found an older Soul Codex reading. Would you like to continue with this profile?",
        recovery: ["Continue with restored profile", "Create new profile"],
      };

    case "corrupted":
      return {
        title: "Profile needs repair",
        description: "Your saved reading appears to be corrupted.",
        recovery: [
          "Repair profile",
          "View technical details",
          "Start fresh",
        ],
      };

    case "wrong-version":
      return {
        title: "Profile format changed",
        description:
          "Your profile was created with an older version of Soul Codex.",
        recovery: [
          "Migrate profile to new format",
          "Start fresh with new version",
        ],
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Private utilities
// ─────────────────────────────────────────────────────────────────────────

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

  if (raw === null) {
    return { status: "missing", profile: null };
  }

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
  // Explicit incompatible versions must not be silently rewritten.
  if (
    profile.schemaVersion !== undefined &&
    profile.schemaVersion !== SCHEMA_VERSION
  ) {
    return { success: false };
  }

  if (!profile.birthDate) {
    return { success: false };
  }

  const now = new Date().toISOString();
  const migrated: StoredProfile = {
    ...profile,
    schemaVersion: SCHEMA_VERSION,
    createdAt: profile.createdAt ?? now,
    updatedAt: now,
  };

  saveToKey(CANONICAL_KEY, migrated);
  const readBack = readFromKey(CANONICAL_KEY);
  if (readBack.status !== "loaded") {
    return { success: false };
  }

  const validation = validateProfile(readBack.profile);
  if (!validation.valid) {
    return { success: false };
  }

  return { success: true, profile: readBack.profile };
}

function validateProfile(
  profile: any
): { valid: boolean; reason?: string; message?: string } {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return {
      valid: false,
      reason: "not-object",
      message: "Profile is not a valid object",
    };
  }

  const schemaVersion = profile.schemaVersion ?? 0;
  if (schemaVersion !== SCHEMA_VERSION) {
    return {
      valid: false,
      reason: "wrong-version",
      message: `Expected schema v${SCHEMA_VERSION}, got v${schemaVersion}`,
    };
  }

  // Minimum requirement: birth date
  if (!profile.birthDate) {
    return {
      valid: false,
      reason: "incomplete",
      message: "Profile missing required birthDate",
    };
  }

  return { valid: true };
}
