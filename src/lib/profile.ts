import { storage } from "../../storage";

/**
 * Loads a single profile by ID using the active storage backend.
 * Returns undefined when the profile does not exist.
 */
export async function loadProfile(profileId: string) {
  return storage.getProfile(profileId);
}
