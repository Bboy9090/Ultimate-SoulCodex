import { storage } from "../../storage";
import type { Profile } from "../../shared/schema";

/**
 * Loads a single profile by ID using the active storage backend.
 * Returns undefined when the profile does not exist.
 */
export async function loadProfile(profileId: string): Promise<Profile | undefined> {
  return storage.getProfile(profileId);
}
