import type { OfflineCodexProfile } from "@soulcodex/core";
import { repairFoundationOfflineCodexProfile } from "./foundationOfflineCodex";

const DB_NAME = "soulcodex-offline";
const DB_VERSION = 1;
const PROFILE_STORE = "profiles";
const FALLBACK_PREFIX = "soulcodex.offlineProfile.v1.";

function hasIndexedDb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILE_STORE)) {
        database.createObjectStore(PROFILE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error ?? new Error("Unable to open offline profile database"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PROFILE_STORE, mode);
    const request = operation(transaction.objectStore(PROFILE_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Offline profile operation failed"));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Offline profile transaction failed"));
    };
  });
}

function fallbackKey(id: string): string {
  return `${FALLBACK_PREFIX}${id}`;
}

function saveFallback(profile: OfflineCodexProfile): void {
  localStorage.setItem(fallbackKey(profile.id), JSON.stringify(profile));
}

function loadFallback(id: string): OfflineCodexProfile | null {
  const raw = localStorage.getItem(fallbackKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OfflineCodexProfile;
  } catch {
    return null;
  }
}

export async function saveOfflineProfile(profile: OfflineCodexProfile): Promise<void> {
  if (!hasIndexedDb()) {
    saveFallback(profile);
    return;
  }

  try {
    await withStore("readwrite", (store) => store.put(profile));
  } catch (error) {
    console.warn("[offlineProfileStore] IndexedDB save failed; using localStorage fallback", error);
    saveFallback(profile);
  }
}

export async function loadOfflineProfile(id: string): Promise<OfflineCodexProfile | null> {
  if (!hasIndexedDb()) {
    const stored = loadFallback(id);
    if (!stored) return null;
    const repaired = repairFoundationOfflineCodexProfile(stored);
    if (repaired !== stored) saveFallback(repaired);
    return repaired;
  }

  try {
    const stored =
      (await withStore<OfflineCodexProfile | undefined>("readonly", (store) => store.get(id))) ??
      loadFallback(id);
    if (!stored) return null;
    const repaired = repairFoundationOfflineCodexProfile(stored);
    if (repaired !== stored) await saveOfflineProfile(repaired);
    return repaired;
  } catch (error) {
    console.warn("[offlineProfileStore] IndexedDB read failed; using localStorage fallback", error);
    const stored = loadFallback(id);
    if (!stored) return null;
    const repaired = repairFoundationOfflineCodexProfile(stored);
    if (repaired !== stored) saveFallback(repaired);
    return repaired;
  }
}

export async function deleteOfflineProfile(id: string): Promise<void> {
  try {
    localStorage.removeItem(fallbackKey(id));
  } catch {}

  if (!hasIndexedDb()) return;
  try {
    await withStore("readwrite", (store) => store.delete(id));
  } catch (error) {
    console.warn("[offlineProfileStore] IndexedDB delete failed", error);
  }
}

/**
 * Remove every locally persisted offline profile for account/data deletion.
 * The object store is cleared before database deletion so profile data is gone
 * even if another tab temporarily blocks deleteDatabase().
 */
export async function clearOfflineProfiles(): Promise<void> {
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(FALLBACK_PREFIX)) localStorage.removeItem(key);
    }
  } catch {}

  if (!hasIndexedDb()) return;

  let storeCleared = false;
  try {
    await withStore("readwrite", (store) => store.clear());
    storeCleared = true;
  } catch (error) {
    console.warn("[offlineProfileStore] IndexedDB profile-store clear failed", error);
  }

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      const error = request.error ?? new Error("Unable to delete offline profile database");
      if (storeCleared) {
        console.warn("[offlineProfileStore] Database deletion failed after profile store was cleared", error);
        resolve();
      } else {
        reject(error);
      }
    };
    request.onblocked = () => {
      if (storeCleared) {
        console.warn("[offlineProfileStore] Database deletion blocked; profile store was already cleared");
        resolve();
      } else {
        reject(new Error("Offline profile database deletion was blocked before profile data could be cleared"));
      }
    };
  });
}
