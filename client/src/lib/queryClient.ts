import { QueryClient } from "@tanstack/react-query";
import { CapacitorHttp } from "@capacitor/core";

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
<<<<<<< Updated upstream
  const response = await CapacitorHttp.get({
    url,
    headers: { "Content-Type": "application/json" },
    connectTimeout: 20000,
    readTimeout: 20000
  });
  
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${response.status}: ${JSON.stringify(response.data)}`);
=======
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  const method = options?.method || "GET";
  
  console.log(`[API] ${method} ${resolvedUrl}`);
  
  const httpOptions = {
    url: resolvedUrl,
    method,
    headers: { "Content-Type": "application/json", ...options?.headers },
    data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    connectTimeout: 20000,
    readTimeout: 20000
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
=======
  
  // Robustness: Include credentials for Capacitor/iOS session support
  const fetchOptions: RequestInit = {
    ...options,
    credentials: options?.credentials ?? "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  // Robustness: Automatically stringify body if it's an object
  if (fetchOptions.body && typeof fetchOptions.body === "object") {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const res = await fetch(resolvedUrl, fetchOptions);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status}: ${errorText}`);
  }
  
  // Return null if 204 No Content
  if (res.status === 204) return null;
  
  return res.json();
>>>>>>> Stashed changes
}

/** Drop-in replacement for fetch that supports absolute URLs in native apps */
export async function apiFetch(url: string, options?: any): Promise<any> {
  const resolvedUrl = resolveApiUrl(url);
  const response = await CapacitorHttp.request({
    url: resolvedUrl,
    method: options?.method || "GET",
    headers: options?.headers || { "Content-Type": "application/json" },
    data: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    connectTimeout: 20000,
    readTimeout: 20000
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
