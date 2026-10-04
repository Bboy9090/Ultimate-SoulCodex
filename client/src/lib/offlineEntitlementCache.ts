import type { SoulCodexTier } from "@shared/product-access";

export const OFFLINE_ENTITLEMENT_CACHE_TTL_MS = 15 * 60 * 1000;

export type CachedProductAccess = {
  tier: SoulCodexTier;
  source: "free" | "stripe" | "apple" | "google_play";
  verified: boolean;
  plan: "monthly" | "annual" | null;
  status: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string | null;
  resolvedAt: string | null;
  offlineCache: boolean;
};

type OfflineCacheRecord = {
  access: CachedProductAccess;
  cachedAtMonotonicMs: number;
};

let lastVerifiedPlus: OfflineCacheRecord | null = null;

function monotonicNow(): number {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return 0;
}

export function rememberVerifiedPlus(access: CachedProductAccess): void {
  if (access.tier !== "plus" || !access.verified) {
    lastVerifiedPlus = null;
    return;
  }

  lastVerifiedPlus = {
    access: { ...access, offlineCache: false },
    cachedAtMonotonicMs: monotonicNow(),
  };
}

export function clearOfflineEntitlementCache(): void {
  lastVerifiedPlus = null;
}

export function readBoundedOfflinePlus(nowMonotonicMs = monotonicNow()): CachedProductAccess | null {
  if (!lastVerifiedPlus) return null;
  const age = nowMonotonicMs - lastVerifiedPlus.cachedAtMonotonicMs;
  if (!Number.isFinite(age) || age < 0 || age > OFFLINE_ENTITLEMENT_CACHE_TTL_MS) {
    lastVerifiedPlus = null;
    return null;
  }

  const expiresAt = lastVerifiedPlus.access.expiresAt
    ? Date.parse(lastVerifiedPlus.access.expiresAt)
    : null;
  if (expiresAt !== null && Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    lastVerifiedPlus = null;
    return null;
  }

  return {
    ...lastVerifiedPlus.access,
    offlineCache: true,
  };
}

export function __setOfflineCacheForTest(
  access: CachedProductAccess | null,
  cachedAtMonotonicMs = 0,
): void {
  lastVerifiedPlus = access
    ? { access: { ...access, offlineCache: false }, cachedAtMonotonicMs }
    : null;
}
