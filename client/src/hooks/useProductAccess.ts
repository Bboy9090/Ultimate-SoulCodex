import { useQuery } from "@tanstack/react-query";
import type { SoulCodexTier } from "@shared/product-access";
import { apiFetch } from "../lib/queryClient";

export type ProductAccessResponse = {
  tier: SoulCodexTier;
  source: "free" | "stripe_subscription";
  verified: boolean;
  expiresAt: string | null;
};

const FREE_ACCESS: ProductAccessResponse = {
  tier: "free",
  source: "free",
  verified: true,
  expiresAt: null,
};

async function loadProductAccess(): Promise<ProductAccessResponse> {
  const response = await apiFetch("/api/access", { method: "GET" });
  if (!response.ok) return FREE_ACCESS;
  const payload = await response.json().catch(() => null);
  if (!payload || (payload.tier !== "free" && payload.tier !== "plus")) return FREE_ACCESS;
  return {
    tier: payload.tier,
    source: payload.source === "stripe_subscription" ? "stripe_subscription" : "free",
    verified: Boolean(payload.verified),
    expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : null,
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
