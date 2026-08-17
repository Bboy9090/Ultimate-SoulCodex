/**
 * Reactive access to the canonical local-first active profile.
 *
 * Every consumer should observe the same repository state. Profile verification,
 * reconciliation, another tab, or another page may update the active Identity
 * while a feature is mounted, so a mount-only snapshot is not sufficient.
 */
import { useCallback, useEffect, useState } from "react";
import {
  loadActiveProfile,
  type StoredProfile,
  type ProfileLoadStatus,
} from "../lib/ActiveProfileRepository";

export interface UseActiveProfileReturn {
  profile: StoredProfile | null;
  isHydrated: boolean;
  status: ProfileLoadStatus;
  isLoading: boolean;
  hasProfile: boolean;
  isEmpty: boolean;
  isCorrupted: boolean;
  needsMigration: boolean;
  refresh: () => void;
}

export function useActiveProfile(): UseActiveProfileReturn {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [status, setStatus] = useState<ProfileLoadStatus>("missing");
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    const result = loadActiveProfile();
    setProfile(result.profile);
    setStatus(result.status);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    const onProfileUpdated = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("soulcodex:profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("soulcodex:profile-updated", onProfileUpdated);
    };
  }, [refresh]);

  return {
    profile,
    isHydrated,
    status,
    isLoading: !isHydrated,
    hasProfile: Boolean(profile) && isHydrated,
    isEmpty: !profile && status === "missing",
    isCorrupted: status === "corrupted" || status === "wrong-version",
    needsMigration: status === "legacy-found",
    refresh,
  };
}
