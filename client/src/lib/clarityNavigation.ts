export type ProfileKind = "server" | "local";

export function getProfileKind(profileId: string | null | undefined): ProfileKind | null {
  if (!profileId?.trim()) return null;
  return profileId.startsWith("local-") ? "local" : "server";
}

export function getProfilePath(profileId: string | null | undefined): string {
  return profileId?.trim() ? `/profile/${encodeURIComponent(profileId)}` : "/";
}

export function getReadingPath(profileId: string | null | undefined): string {
  return profileId?.trim() ? `/reading/${encodeURIComponent(profileId)}` : "/create";
}

export function getPrimaryCodexDestination(profileId: string | null | undefined): {
  href: string;
  label: string;
  kind: ProfileKind | null;
} {
  const kind = getProfileKind(profileId);
  return {
    href: getReadingPath(profileId),
    label: kind ? "Open clarity reading" : "Create your Soul Codex",
    kind,
  };
}
