/**
 * Private Galactic Code orchestration. No route registration or persistence.
 * The caller must supply a server-resolved actor and the canonical storage.
 */
import type { Profile } from "../../shared/schema";
import type { ProfileActor } from "../lib/profile-ownership";
import { profileBelongsToActor } from "../lib/profile-ownership";
import { trustedGalacticInputFromProfile } from "./galactic-code-trusted-input";
import { generateGalacticCode } from "./galactic-code/generator";
import { galacticProfileRevision } from "./galactic-code-revision";

export type GalacticCodePrivateResult =
  | { status: "not_found" }
  | { status: "insufficient_verified_evidence" }
  | { status: "ready"; revision: string; result: ReturnType<typeof generateGalacticCode> };

export async function generatePrivateGalacticCode(
  profileId: string,
  actor: ProfileActor,
  storage: { getProfile(id: string): Promise<Profile | undefined> },
): Promise<GalacticCodePrivateResult> {
  if (!profileId || profileId.length > 128) return { status: "not_found" };
  const profile = await storage.getProfile(profileId);
  if (!profile || !profileBelongsToActor(profile, actor)) return { status: "not_found" };
  let revision: string;
  try {
    revision = galacticProfileRevision(profile);
  } catch {
    return { status: "insufficient_verified_evidence" };
  }
  const input = await trustedGalacticInputFromProfile(profile, actor);
  if (!input) return { status: "insufficient_verified_evidence" };
  try {
    return { status: "ready", revision, result: generateGalacticCode(input) };
  } catch {
    // Do not return internal evidence or partial fingerprints on failed synthesis.
    return { status: "insufficient_verified_evidence" };
  }
}
