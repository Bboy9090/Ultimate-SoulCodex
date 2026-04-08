/**
 * Railway/Vercel multiline paste or accidental line breaks in secrets break HTTP headers.
 * API keys should not contain whitespace.
 */
export function normalizeEnvSecret(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const s = value.replace(/\s/g, "");
  return s.length > 0 ? s : undefined;
}

/** Base URL: trim; strip newlines only (do not remove spaces from paths). */
export function normalizeEnvUrl(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const s = value.trim().replace(/[\r\n]+/g, "");
  return s.length > 0 ? s : undefined;
}
