import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { resolveApiUrlWithBase } from "./api-url";

const configuredApiBase = import.meta.env.VITE_API_URL || "";

export function resolveApiUrl(url: string): string {
  return resolveApiUrlWithBase(url, configuredApiBase);
}

export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(resolveApiUrl(url), {
    ...init,
    credentials: init.credentials ?? "include",
  });
}

const MAX_PUBLIC_ERROR_MESSAGE_LENGTH = 240;

function boundedPublicMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.slice(0, MAX_PUBLIC_ERROR_MESSAGE_LENGTH);
}

export async function publicApiErrorMessage(res: Response): Promise<string> {
  const fallback = boundedPublicMessage(res.statusText) || "Request failed";
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const payload = await res.json();
      const message = boundedPublicMessage(payload?.message);
      const code = boundedPublicMessage(payload?.code);
      if (message && code) return `${message} (${code})`;
      if (message) return message;
      if (code) return code;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const message = await publicApiErrorMessage(res);
    throw new Error(`${res.status}: ${message}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await apiFetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await apiFetch(queryKey.join("/") as string);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
