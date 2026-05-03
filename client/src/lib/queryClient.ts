import { QueryClient } from "@tanstack/react-query";
import { CapacitorHttp } from "@capacitor/core";

// --- Timeouts & Fallbacks ---
const NETWORK_TIMEOUT = 60000; // 60s max for any request

export function resolveApiUrl(url: string): string {
  if (url.startsWith("/api")) {
    const defaultProdUrl = "https://ultimate-soulcodex.up.railway.app";
    let baseUrl = import.meta.env.VITE_API_URL;
    
    if (!baseUrl) {
      if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
        baseUrl = window.location.origin;
      } else {
        baseUrl = defaultProdUrl;
      }
    }
    
    return `${baseUrl.replace(/\/$/, "")}${url}`;
  }
  return url;
}

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
  const url = resolveApiUrl(queryKey[0] as string);
  try {
    const response = await CapacitorHttp.get({
      url,
      headers: { "Content-Type": "application/json" },
      connectTimeout: NETWORK_TIMEOUT,
      readTimeout: NETWORK_TIMEOUT
    });
    
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API ${response.status}`);
    }
    return response.data;
  } catch (err) {
    // If we fail, try to return cached data from localStorage as a last resort
    const cached = localStorage.getItem(`cache:${queryKey[0]}`);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60, // 1 hour stale time
      gcTime: 1000 * 60 * 60 * 24, // 24 hour cache
      retry: 1,
    },
  },
});

/** 
 * Persistent Storage Helpers 
 */
export function getPersistedData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setPersistedData(key: string, data: any) {
  try {
    localStorage.setItem(`cache:${key}`, JSON.stringify(data));
  } catch {}
}

export async function apiRequest(url: string, options?: any) {
  const resolvedUrl = resolveApiUrl(url);
  const method = options?.method || "GET";
  
  const httpOptions = {
    url: resolvedUrl,
    method,
    headers: { "Content-Type": "application/json", ...options?.headers },
    data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    connectTimeout: NETWORK_TIMEOUT,
    readTimeout: NETWORK_TIMEOUT
  };

  try {
    const response = await CapacitorHttp.request(httpOptions);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    // Auto-cache successful GET requests
    if (method === "GET") {
      setPersistedData(url, response.data);
    }
    
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`[API] FAILED ${method} ${resolvedUrl}:`, error);
    // If offline or timeout, try cache
    if (method === "GET") {
      const cached = getPersistedData(url);
      if (cached) return cached;
    }
    throw error;
  }
}

/** Drop-in replacement for fetch that supports absolute URLs in native apps */
export async function apiFetch(url: string, options?: any): Promise<any> {
  const resolvedUrl = resolveApiUrl(url);
  try {
    const response = await CapacitorHttp.request({
      url: resolvedUrl,
      method: options?.method || "GET",
      headers: options?.headers || { "Content-Type": "application/json" },
      data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
      connectTimeout: NETWORK_TIMEOUT,
      readTimeout: NETWORK_TIMEOUT
    });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
      json: async () => response.data,
      text: async () => typeof response.data === "string" ? response.data : JSON.stringify(response.data),
    };
  } catch (err) {
    return { ok: false, status: 500, data: null, json: async () => null };
  }
}
