// Active server storage adapter.
//
// The repository-root storage implementation is the canonical authority. It
// selects HybridStorage when DATABASE_URL is configured and MemStorage only for
// local/demo operation. Keeping a second in-memory implementation here caused
// production profile data to disappear across restarts and made deletion tests
// exercise a different storage path than Railway.
export { storage, MemStorage } from "../storage";
export type { IStorage } from "../storage";
