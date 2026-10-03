import { useQuery } from "@tanstack/react-query";
import type { SoulCodexTier } from "@shared/product-access";
import { apiFetch } from "../lib/queryClient";

export type ProductAccessResponse = {
  tier: SoulCodexTier;
  source: "free" | "stripe" | "apple" | "google_play";
  verified: boolean;
  plan: "monthly" | "annual" | null;
  status: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string | null;
};

const FREE_ACCESS: ProductAccessResponse = {
  tier: "free",
  source: "free",
  verified: true,
  plan: null,
  status: null,
  expiresAt: null,
  lastVerifiedAt: null,
};

async function loadProductAccess(): Promise<ProductAccessResponse> {
  const response = await apiFetch("/api/access", { method: "GET" });
  if (!response.ok) return FREE_ACCESS;
  const payload = await response.json().catch(() => null);
  if (!payload || (payload.tier !== "free" && payload.tier !== "plus")) return FREE_ACCESS;

  const source =
    payload.source === "stripe" ||
    payload.source === "apple" ||
    payload.source === "google_play"
      ? payload.source
      : "free";

  return {
    tier: payload.tier,
    source,
    verified: Boolean(payload.verified),
    plan: payload.plan === "annual" ? "annual" : payload.plan === "monthly" ? "monthly" : null,
    status: typeof payload.status === "string" ? payload.status : null,
    expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : null,
    lastVerifiedAt: typeof payload.lastVerifiedAt === "string" ? payload.lastVerifiedAt : null,
  };
}

export function useProductAccess() {
  const query = useQuery({
    queryKey: ["/api/access"],
    queryFn: loadProductAccess,
    staleTime: 60_000,
  });

  return {
    ...query,
    access: query.data ?? FREE_ACCESS,
    tier: query.data?.tier ?? "free",
  };
}
