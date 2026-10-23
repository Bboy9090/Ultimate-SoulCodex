/**
 * Entitlement-aware private Galactic Code projection.
 * This is an internal service only; no HTTP route is registered here.
 */
import type { Profile } from "../../shared/schema";
import type { ProfileActor } from "../lib/profile-ownership";
import { resolveProductEntitlementForUser } from "../lib/product-entitlement";
import { projectGalacticCodeForTier } from "../lib/galactic-code-response-access";
import { generatePrivateGalacticCode } from "./galactic-code-private";
import type { IStorage } from "../storage";

export async function generateEntitledGalacticCode(
  profileId: string,
  actor: ProfileActor,
  storage: Pick<IStorage, "getProfile" | "getUser" | "getLatestEntitlementGrant">,
) {
  // Resolve ownership before reading entitlements, avoiding account enumeration.
  const privateResult = await generatePrivateGalacticCode(profileId, actor, storage as {
    getProfile(id: string): Promise<Profile | undefined>;
  });
  if (privateResult.status !== "ready") return privateResult;
  const entitlement = await resolveProductEntitlementForUser(storage, actor.userId ?? null);
  return {
    status: "ready" as const,
    revision: privateResult.revision,
    tier: entitlement.tier,
    result: projectGalacticCodeForTier(privateResult.result, entitlement.tier),
  };
}
