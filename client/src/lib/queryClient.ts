import { QueryClient } from "@tanstack/react-query";
import { CapacitorHttp } from "@capacitor/core";

export function resolveApiUrl(url: string): string {
  if (url.startsWith("/api")) {
    const baseUrl = import.meta.env.VITE_API_URL || "https://ultimate-soulcodex-engine-of-the-eternal-now-production.up.railway.app";
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
  const httpOptions = {
    url: resolvedUrl,
    method: options?.method || "GET",
    headers: { "Content-Type": "application/json", ...options?.headers },
    data: options?.body ? JSON.parse(options.body) : undefined,
    connectTimeout: 30000,
    readTimeout: 30000
  };

  const response = await CapacitorHttp.request(httpOptions);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${response.status}: ${JSON.stringify(response.data)}`);
  }
  return response.data;
}

/** Drop-in replacement for fetch that supports absolute URLs in native apps */
export async function apiFetch(url: string, options?: any): Promise<any> {
  const resolvedUrl = resolveApiUrl(url);
  const response = await CapacitorHttp.request({
    url: resolvedUrl,
    method: options?.method || "GET",
    headers: options?.headers || { "Content-Type": "application/json" },
    data: options?.body ? JSON.parse(options.body) : undefined,
    connectTimeout: 30000,
    readTimeout: 30000,
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
