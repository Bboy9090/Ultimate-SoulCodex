/**
 * Private Galactic Code cache/replay boundary.
 *
 * Persisted results are reusable only when the current profile ownership,
 * canonical profile revision, Galactic version, and stored result shape agree.
 * Stale or malformed records are regenerated from server-owned evidence.
 */
import type { GalacticCodeResult } from "../../shared/galactic-code/types";
import type { IStorage } from "../storage";
import type { ProfileActor } from "../lib/profile-ownership";
import { profileBelongsToActor } from "../lib/profile-ownership";
import { resolveProductEntitlementForUser } from "../lib/product-entitlement";
import { projectGalacticCodeForTier } from "../lib/galactic-code-response-access";
import { galacticProfileRevision } from "./galactic-code-revision";
import { generatePrivateGalacticCode } from "./galactic-code-private";

type GalacticCacheStorage = Pick<
  IStorage,
  "getProfile" | "getGalacticCodeRecord" | "upsertGalacticCodeRecord" | "getUser" | "getLatestEntitlementGrant"
>;

function storedResultIsUsable(
  value: unknown,
  profileId: string,
): value is GalacticCodeResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  return result.version === "galactic-code-v1"
    && result.profileId === profileId
    && typeof result.fingerprint === "string"
    && typeof result.shortCode === "string"
    && typeof result.coverage === "string"
    && typeof result.codename === "string"
    && typeof result.designation === "string"
    && typeof result.tagline === "string"
    && typeof result.primaryFunction === "string"
    && typeof result.generatedAt === "string"
    && Array.isArray(result.axes)
    && Array.isArray(result.evidence)
    && result.sourceCoverage !== null
    && typeof result.sourceCoverage === "object"
    && result.interpretation !== null
    && typeof result.interpretation === "object";
}

function recordOwnershipMatchesProfile(
  record: { userId?: string | null; sessionId?: string | null },
  profile: { userId?: string | null; sessionId?: string | null },
): boolean {
  if (profile.userId) return record.userId === profile.userId && !record.sessionId;
  if (profile.sessionId) return record.sessionId === profile.sessionId && !record.userId;
  return false;
}

export async function getOrGenerateEntitledGalacticCode(
  profileId: string,
  actor: ProfileActor,
  storage: GalacticCacheStorage,
) {
  if (!profileId || profileId.length > 128) return { status: "not_found" as const };

  const profile = await storage.getProfile(profileId);
  if (!profile || !profileBelongsToActor(profile, actor)) {
    return { status: "not_found" as const };
  }

  let revision: string;
  try {
    revision = galacticProfileRevision(profile);
  } catch {
    return { status: "insufficient_verified_evidence" as const };
  }

  const stored = await storage.getGalacticCodeRecord(profileId);
  let fullResult: GalacticCodeResult | null = null;

  if (
    stored
    && stored.revision === revision
    && stored.version === "galactic-code-v1"
    && recordOwnershipMatchesProfile(stored, profile)
    && storedResultIsUsable(stored.result, profileId)
  ) {
    fullResult = stored.result;
  }

  if (!fullResult) {
    const generated = await generatePrivateGalacticCode(profileId, actor, storage);
    if (generated.status !== "ready") return generated;

    const current = await storage.getProfile(profileId);
    if (!current || !profileBelongsToActor(current, actor)) {
      return { status: "not_found" as const };
    }

    const currentRevision = galacticProfileRevision(current);
    if (currentRevision !== generated.revision) {
      return { status: "insufficient_verified_evidence" as const };
    }

    fullResult = generated.result;
    await storage.upsertGalacticCodeRecord({
      profileId,
      userId: current.userId ?? null,
      sessionId: current.userId ? null : current.sessionId ?? null,
      revision: generated.revision,
      version: generated.result.version,
      result: generated.result,
      generatedAt: new Date(generated.result.generatedAt),
    });
    revision = generated.revision;
  }

  const entitlement = await resolveProductEntitlementForUser(storage, actor.userId ?? null);
  return {
    status: "ready" as const,
    revision,
    tier: entitlement.tier,
    result: projectGalacticCodeForTier(fullResult, entitlement.tier),
  };
}
