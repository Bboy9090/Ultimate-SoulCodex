import { useQuery } from "@tanstack/react-query";
import type { SoulCodexTier } from "@shared/product-access";
import { apiFetch } from "../lib/queryClient";
import {
  clearOfflineEntitlementCache,
  readBoundedOfflinePlus,
  rememberVerifiedPlus,
} from "../lib/offlineEntitlementCache";

export type ProductAccessResponse = {
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

const FREE_ACCESS: ProductAccessResponse = {
  tier: "free",
  source: "free",
  verified: true,
  plan: null,
  status: null,
  expiresAt: null,
  lastVerifiedAt: null,
  resolvedAt: null,
  offlineCache: false,
};

async function loadProductAccess(): Promise<ProductAccessResponse> {
  let response: Response;
  try {
    response = await apiFetch("/api/access", { method: "GET" });
  } catch {
    return readBoundedOfflinePlus() ?? FREE_ACCESS;
  }

  if (!response.ok) return readBoundedOfflinePlus() ?? FREE_ACCESS;
  const payload = await response.json().catch(() => null);
  if (!payload || (payload.tier !== "free" && payload.tier !== "plus")) {
    return readBoundedOfflinePlus() ?? FREE_ACCESS;
  }

  const source =
    payload.source === "stripe" ||
    payload.source === "apple" ||
    payload.source === "google_play"
      ? payload.source
      : "free";

  const access: ProductAccessResponse = {
    tier: payload.tier,
    source,
    verified: Boolean(payload.verified),
    plan: payload.plan === "annual" ? "annual" : payload.plan === "monthly" ? "monthly" : null,
    status: typeof payload.status === "string" ? payload.status : null,
    expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : null,
    lastVerifiedAt: typeof payload.lastVerifiedAt === "string" ? payload.lastVerifiedAt : null,
    resolvedAt: typeof payload.resolvedAt === "string" ? payload.resolvedAt : null,
    offlineCache: false,
  };

  if (access.tier === "plus" && access.verified) rememberVerifiedPlus(access);
  else clearOfflineEntitlementCache();

  return access;
}

export function useProductAccess() {
  const query = useQuery({
    queryKey: ["/api/access"],
    queryFn: loadProductAccess,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    networkMode: "always",
  });

  return {
    ...query,
    access: query.data ?? FREE_ACCESS,
    tier: query.data?.tier ?? "free",
  };
}
