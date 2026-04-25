import { QueryClient } from "@tanstack/react-query";

export function resolveApiUrl(url: string): string {
  if (url.startsWith("/api")) {
    const baseUrl = import.meta.env.VITE_API_URL || "https://ultimate-soulcodex-engine-of-the-eternal-now-production.up.railway.app";
    return `${baseUrl.replace(/\/$/, "")}${url}`;
  }
  return url;
}

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }) {
  const url = resolveApiUrl(queryKey[0] as string);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export async function apiRequest(url: string, options?: RequestInit) {
  const resolvedUrl = resolveApiUrl(url);
  const res = await fetch(resolvedUrl, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Drop-in replacement for fetch that supports absolute URLs in native apps */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(resolveApiUrl(url), options);
}
