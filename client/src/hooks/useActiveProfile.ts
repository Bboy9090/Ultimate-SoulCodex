/**
 * useActiveProfile hook
 *
 * Provides reactive access to active profile with hydration lifecycle.
 * Blocks rendering until profile load completes.
 * Provides recovery messaging for missing/corrupted profiles.
 */

import { useEffect, useState } from "react";
import {
  loadActiveProfile,
  type StoredProfile,
  type ProfileLoadStatus,
} from "../lib/ActiveProfileRepository";

export interface UseActiveProfileReturn {
  // State
  profile: StoredProfile | null;
  isHydrated: boolean;
  status: ProfileLoadStatus;

  // For UI
  isLoading: boolean;
  hasProfile: boolean;
  isEmpty: boolean;
  isCorrupted: boolean;
  needsMigration: boolean;
}

/**
 * Load and provide active profile.
 * Call this once in a layout/root component to hydrate globally.
 */
export function useActiveProfile(): UseActiveProfileReturn {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [status, setStatus] = useState<ProfileLoadStatus>("missing");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load profile on mount
    const result = loadActiveProfile();
    setProfile(result.profile);
    setStatus(result.status);
    setIsHydrated(true);
  }, []);

  return {
    // Raw state
    profile,
    isHydrated,
    status,

    // Derived state
    isLoading: !isHydrated,
    hasProfile: !!profile && isHydrated,
    isEmpty: !profile && status === "missing",
    isCorrupted: status === "corrupted" || status === "wrong-version",
    needsMigration: status === "legacy-found",
  };
}
