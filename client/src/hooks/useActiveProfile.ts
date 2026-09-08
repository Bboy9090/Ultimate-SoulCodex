/**
 * Canonical reactive active-profile hook.
 *
 * Identity, Reading, Timeline, and Compatibility should consume the same
 * repository result so a verification, migration, clear, or cross-tab update
 * cannot leave one feature operating on stale profile state.
 */

import { useCallback, useEffect, useState } from "react";
import {
  ACTIVE_PROFILE_UPDATED_EVENT,
  loadActiveProfile,
  type ProfileLoadResult,
  type ProfileLoadStatus,
  type StoredProfile,
} from "../lib/ActiveProfileRepository";

export interface UseActiveProfileReturn {
  profile: StoredProfile | null;
  isHydrated: boolean;
  status: ProfileLoadStatus;
  reason?: string;
  isLoading: boolean;
  hasProfile: boolean;
  isEmpty: boolean;
  isCorrupted: boolean;
  needsMigration: boolean;
  refresh: () => void;
}

export function useActiveProfile(): UseActiveProfileReturn {
  const [result, setResult] = useState<ProfileLoadResult>({
    status: "missing",
    profile: null,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    setResult(loadActiveProfile());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(ACTIVE_PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ACTIVE_PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return {
    profile: result.profile,
    isHydrated,
    status: result.status,
    reason: result.reason,
    isLoading: !isHydrated,
    hasProfile: Boolean(result.profile) && isHydrated,
    isEmpty: isHydrated && !result.profile && result.status === "missing",
    isCorrupted:
      isHydrated &&
      (result.status === "corrupted" || result.status === "wrong-version"),
    needsMigration: isHydrated && result.status === "legacy-found",
    refresh,
  };
}
