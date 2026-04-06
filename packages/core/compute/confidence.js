export function computeConfidence(input) {
    const { timeUnknown, hasGeo, hasTimezone } = input;
    if (!hasGeo || !hasTimezone) {
        return {
            badge: "unverified",
            label: "Unverified",
            reason: "Location or timezone is missing — rising sign and houses are not reliable.",
            aiAssuranceNote: "We only show placements we can compute from your date (and time when given). Interpretive text is guidance, not a guarantee.",
        };
    }
    if (timeUnknown) {
        return {
            badge: "partial",
            label: "Partial",
            reason: "Birth time unknown — rising sign and houses are omitted; Sun, Moon, and Life Path stay grounded.",
            aiAssuranceNote: "Chart math for Sun and Moon is stable. Written insights may still vary in tone — use the badge above as the source of truth for what is locked in.",
        };
    }
    return {
        badge: "verified",
        label: "Verified",
        reason: "Birth time and location are set — full chart layer (houses, rising) is included.",
        aiAssuranceNote: "Your wheel data is computed from the birth record you gave. AI phrasing is tuned for clarity; if something feels off, re-check time and place.",
    };
}
const DEFAULT_AI_ASSURANCE = {
    verified: "Your wheel data is computed from the birth record you gave. AI phrasing is tuned for clarity; if something feels off, re-check time and place.",
    partial: "Chart math for Sun and Moon is stable. Written insights may still vary in tone — use the badge above as the source of truth for what is locked in.",
    unverified: "We only show placements we can compute from your date (and time when given). Interpretive text is guidance, not a guarantee.",
};
/** Normalize profile confidence for Codex reading + UI (badge key + display label + AI disclaimer). */
export function buildCodexReadingBadges(conf) {
    let badge = "unverified";
    if (conf?.badge === "verified" || conf?.badge === "partial" || conf?.badge === "unverified") {
        badge = conf.badge;
    }
    else if (conf?.label === "Verified")
        badge = "verified";
    else if (conf?.label === "Partial")
        badge = "partial";
    else if (conf?.label === "Unverified")
        badge = "unverified";
    const label = conf?.label ??
        { verified: "Verified", partial: "Partial", unverified: "Unverified" }[badge];
    return {
        badge,
        label,
        reason: conf?.reason ?? "",
        aiAssuranceNote: conf?.aiAssuranceNote?.trim() || DEFAULT_AI_ASSURANCE[badge],
    };
}
