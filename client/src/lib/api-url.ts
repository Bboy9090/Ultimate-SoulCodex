export function normalizeApiBase(base: string | undefined): string {
  return (base || "").trim().replace(/\/+$/, "");
}

export function resolveApiUrlWithBase(url: string, base: string | undefined): string {
  if (!url.startsWith("/api/")) return url;
  const normalizedBase = normalizeApiBase(base);
  return normalizedBase ? `${normalizedBase}${url}` : url;
}
