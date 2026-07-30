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

export interface StoredProfile {
  // Identification
  id?: string;
  codename?: string;

  // Birth data
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  birthplace?: {
    city?: string;
    region?: string;
    country?: string;
  };

  // Astrological data
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  astrologyData?: any;

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

/**
 * Load active profile with migration and validation.
 * Tries canonical key first, then legacy keys.
 * Never returns both a profile and an error—always one truth.
 */
export function loadActiveProfile(): ProfileLoadResult {
  try {
    // First: try canonical key
    const canonical = loadFromKey(CANONICAL_KEY);
    if (canonical) {
      const validation = validateProfile(canonical);
      if (validation.valid) {
        return {
          status: "loaded",
          profile: canonical,
        };
      }
      // Canonical key exists but is corrupted/wrong version
      return {
        status: validation.reason === "wrong-version" ? "wrong-version" : "corrupted",
        profile: null,
        reason: validation.message,
      };
    }

    // Second: try legacy keys
    for (const legacyKey of LEGACY_KEYS) {
      const legacy = loadFromKey(legacyKey);
      if (legacy) {
        const validation = validateProfile(legacy);
        if (validation.valid) {
          // Found valid legacy profile—migrate it to canonical
          saveToKey(CANONICAL_KEY, legacy);
          return {
            status: "legacy-found",
            profile: legacy,
            legacyKey,
          };
        }
      }
    }

    // Third: nothing found
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
    const enriched: StoredProfile = {
      ...profile,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };

    // Set creation time only on first save
    if (!profile.createdAt) {
      enriched.createdAt = new Date().toISOString();
    }

    // Save to canonical key
    saveToKey(CANONICAL_KEY, enriched);

    // Immediately verify it can be read back
    const verification = loadFromKey(CANONICAL_KEY);
    if (!verification) {
      return {
        success: false,
        error: "Profile saved but could not be verified immediately.",
      };
    }

    // Validate the read-back result
    const validation = validateProfile(verification);
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
 * Clear the active profile.
 * Use this for logout or reset flows.
 */
export function clearActiveProfile(): void {
  try {
    localStorage.removeItem(CANONICAL_KEY);
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

function loadFromKey(key: string): StoredProfile | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined" || raw === "null") return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
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

function validateProfile(
  profile: any
): { valid: boolean; reason?: string; message?: string } {
  if (!profile || typeof profile !== "object") {
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
