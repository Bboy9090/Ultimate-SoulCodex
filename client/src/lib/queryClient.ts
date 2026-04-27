import { QueryClient } from "@tanstack/react-query";
import { CapacitorHttp } from "@capacitor/core";

export function resolveApiUrl(url: string): string {
  if (url.startsWith("/api")) {
    const defaultProdUrl = "https://ultimate-soulcodex-engine-of-the-eternal-now-production.up.railway.app";
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
  const response = await CapacitorHttp.get({
    url,
    headers: { "Content-Type": "application/json" },
    connectTimeout: 30000,
    readTimeout: 30000
  });
  
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${response.status}: ${JSON.stringify(response.data)}`);
  }
  return response.data;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export async function apiRequest(url: string, options?: any) {
  const resolvedUrl = resolveApiUrl(url);
  const method = options?.method || "GET";
  
  console.log(`[API] ${method} ${resolvedUrl}`);
  
  const httpOptions = {
    url: resolvedUrl,
    method,
    headers: { "Content-Type": "application/json", ...options?.headers },
    data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    connectTimeout: 60000,
    readTimeout: 60000
  };

  try {
    const response = await CapacitorHttp.request(httpOptions);
    console.log(`[API] ${response.status} ${resolvedUrl}`);
    
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`${response.status}: ${JSON.stringify(response.data)}`);
    }
    return response.data;
  } catch (error) {
    console.error(`[API] FAILED ${method} ${resolvedUrl}:`, error);
    throw error;
  }
}

/** Drop-in replacement for fetch that supports absolute URLs in native apps */
export async function apiFetch(url: string, options?: any): Promise<any> {
  const resolvedUrl = resolveApiUrl(url);
  const response = await CapacitorHttp.request({
    url: resolvedUrl,
    method: options?.method || "GET",
    headers: options?.headers || { "Content-Type": "application/json" },
    data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    connectTimeout: 60000,
    readTimeout: 60000
  });
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    data: response.data,
    json: async () => response.data,
    text: async () =>
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data),
    blob: async () => {
      throw new Error("Blob downloads are not supported through CapacitorHttp yet.");
    },
  };
}
