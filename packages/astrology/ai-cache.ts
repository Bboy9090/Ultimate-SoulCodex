type CacheEntry = {
  response: string;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const TTL = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 200;

/** Full-string FNV-1a — avoids collisions from the old 32-bit prefix hash. Safe in browser and Node. */
function hashKey(prompt: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `fnv_${(h >>> 0).toString(16)}_${prompt.length}`;
}

function evictOldest() {
  if (cache.size <= MAX_ENTRIES) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  const toRemove = oldest.slice(0, cache.size - MAX_ENTRIES);
  for (const [key] of toRemove) cache.delete(key);
}

export function getCached(prompt: string): string | null {
  const key = hashKey(prompt);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.response;
}

export function setCached(prompt: string, response: string): void {
  const key = hashKey(prompt);
  cache.set(key, { response, timestamp: Date.now() });
  evictOldest();
}

export function getCacheStats() {
  return {
    entries: cache.size,
    maxEntries: MAX_ENTRIES,
    ttlMinutes: TTL / 60000,
  };
}
