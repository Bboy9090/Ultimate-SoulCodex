export * from "./rules.js";
export * from "./score.js";
export * from "./resolve.js";
import { resolveTimelinePhase } from "./resolve.js";

export type TimelineOutput = {
  phase: import("./rules.js").Phase;
  confidence: {
    badge: "verified" | "partial" | "unverified";
    label: "Verified" | "Partial" | "Unverified";
    reason: string;
    aiAssuranceNote?: string;
  };
  confidenceLabel: "Full" | "Partial";
  reasons: string[];
  focus: string;
  do: string[];
  dont: string[];
  nextPhase: import("./rules.js").Phase;
  narrative: string;
};

export function generateTimeline(input: {
  profile: {
    birthDate?: string;
    birthTime?: string;
    confidenceLabel?: string;
    confidence?: { badge?: string; label?: string };
    meta?: { confidence?: { badge?: string; label?: string } };
    topThemes?: { tag: string; score: number }[];
    signals?: { topThemes?: { tag: string; score: number }[] };
  };
  fullChart?: any;
  currentDateISO: string;
}): TimelineOutput {
  const confidenceBadge =
    (input.profile?.confidence?.badge ??
      input.profile?.meta?.confidence?.badge ??
      "") as string;
  const confidenceLabelRaw =
    (input.profile?.confidence?.label ??
      input.profile?.meta?.confidence?.label ??
      "") as string;

  const hasBirthTime = Boolean(input.profile?.birthTime && input.profile.birthTime.trim().length > 0);
  const astroConfidence: import("./rules.js").ConfidenceLabel =
    !hasBirthTime
      ? "Partial"
      : confidenceBadge === "verified" || confidenceLabelRaw === "Verified"
        ? "Verified"
        : confidenceBadge === "partial" || confidenceLabelRaw === "Partial"
          ? "Partial"
          : confidenceBadge === "unverified" || confidenceLabelRaw === "Unverified"
            ? "Unverified"
            : "Partial";

  const themeTags = (() => {
    const top =
      input.profile?.topThemes ??
      input.profile?.signals?.topThemes ??
      [];
    return Array.isArray(top) ? top.map((t) => t.tag).filter(Boolean) : [];
  })();

  // Astrology cycles: in v1 we derive from age buckets deterministically (no ephemeris dependency).
  const birthDate = input.profile?.birthDate;
  const cycles: string[] = [];
  if (birthDate) {
    const birth = new Date(birthDate);
    const now = new Date(input.currentDateISO);
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
    const mod12 = ((age % 12) + 12) % 12;
    if (age >= 27 && age <= 31) cycles.push("saturn_return");
    if (age >= 56 && age <= 61) cycles.push("saturn_return");
    if (mod12 <= 1 || mod12 >= 11) cycles.push("jupiter_return");
    if ((age >= 18 && age <= 20) || (age >= 37 && age <= 39) || (age >= 56 && age <= 58)) cycles.push("nodes_strong");
    if (age >= 40 && age <= 44) cycles.push("uranus_hard");
  }

  // Personal year: standard numerology.
  const personalYear = (() => {
    if (!birthDate) return 1;
    const b = new Date(birthDate);
    const now = new Date(input.currentDateISO);
    const sum = (n: number) => String(Math.abs(n)).split("").reduce((a, d) => a + Number(d), 0);
    const reduce = (n: number) => {
      while (n > 9) n = sum(n);
      return n || 9;
    };
    return reduce(sum(b.getMonth() + 1) + sum(b.getDate()) + sum(now.getFullYear()));
  })();

  const resolved = resolveTimelinePhase({
    personalYear,
    astrologyCycles: cycles,
    themeTags,
    confidence: astroConfidence,
  });

  const badgeOut = astroConfidence === "Verified" ? "verified" : astroConfidence === "Unverified" ? "unverified" : "partial";
  const confidenceLabelOut: "Full" | "Partial" = astroConfidence === "Verified" ? "Full" : "Partial";
  const reasonOut =
    badgeOut === "verified"
      ? "Birth time and location are set — full chart layer (houses, rising) is included."
      : "Birth time unknown or not trusted — timeline timing is softened.";
  const aiAssuranceNote =
    badgeOut === "verified"
      ? "Timeline timing is derived from major cycles and your birth record. Interpretive language is guidance, not a guarantee."
      : "Timeline themes still apply, but time-specific timing is softened without a verified birth time.";

  // Content for focus/do/dont/next/narrative remains in `services/timeline/*` today; keep this minimal for Phase 4.
  // For now, reuse the existing phase strings as focus until we fully migrate content.
  const focus = `${resolved.phase} phase active.`;

  return {
    phase: resolved.phase,
    confidence: { badge: badgeOut, label: badgeOut === "verified" ? "Verified" : badgeOut === "unverified" ? "Unverified" : "Partial", reason: reasonOut, aiAssuranceNote },
    confidenceLabel: confidenceLabelOut,
    reasons: resolved.reasons.slice(0, 5),
    focus,
    do: [],
    dont: [],
    nextPhase: resolved.phase,
    narrative: resolved.reasons[0] ?? "",
  };
}

