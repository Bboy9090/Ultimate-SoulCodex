export type SoulCodexTier = "free" | "plus";

export type SoulCodexCapability =
  | "core_profile"
  | "big_three"
  | "date_numerology"
  | "evidence_provenance"
  | "diamond_closure"
  | "basic_connections"
  | "basic_compatibility"
  | "full_natal_chart"
  | "full_name_numerology"
  | "human_design_depth"
  | "advanced_daily"
  | "advanced_transits"
  | "timeline_history"
  | "advanced_connections"
  | "cross_system_synthesis"
  | "premium_exports"
  | "premium_tarot";

export type CapabilityAvailability = "live" | "planned";

export type CapabilityDefinition = {
  minimumTier: SoulCodexTier;
  availability: CapabilityAvailability;
  label: string;
  upgradeReason?: string;
};

export const SOUL_CODEX_CAPABILITIES: Record<SoulCodexCapability, CapabilityDefinition> = {
  core_profile: { minimumTier: "free", availability: "live", label: "Core profile" },
  big_three: { minimumTier: "free", availability: "live", label: "Supported Big 3" },
  date_numerology: { minimumTier: "free", availability: "live", label: "Date-based numerology" },
  evidence_provenance: { minimumTier: "free", availability: "live", label: "Evidence and provenance" },
  diamond_closure: { minimumTier: "free", availability: "live", label: "Diamond Way closure" },
  basic_connections: { minimumTier: "free", availability: "live", label: "Basic Connections" },
  basic_compatibility: { minimumTier: "free", availability: "live", label: "Basic compatibility" },

  full_natal_chart: {
    minimumTier: "plus",
    availability: "planned",
    label: "Full natal chart",
    upgradeReason: "Unlock all qualified planets, houses, aspects, angles, Nodes, and Chiron.",
  },
  full_name_numerology: {
    minimumTier: "plus",
    availability: "live",
    label: "Full name numerology",
    upgradeReason: "Unlock Expression, Soul Urge, Personality, and Maturity when a complete birth name is available.",
  },
  human_design_depth: {
    minimumTier: "plus",
    availability: "live",
    label: "Human Design core",
    upgradeReason: "Unlock verified Type, Strategy, Authority, and Profile. Centers, channels, and deeper interaction synthesis remain planned until their paid surfaces are fully qualified.",
  },
  advanced_daily: {
    minimumTier: "plus",
    availability: "live",
    label: "Advanced Daily",
    upgradeReason: "See up to five strongest qualified influences and deeper cross-system synthesis.",
  },
  advanced_transits: {
    minimumTier: "plus",
    availability: "planned",
    label: "Advanced transits",
    upgradeReason: "Unlock deeper transit interpretation and timing intelligence.",
  },
  timeline_history: {
    minimumTier: "plus",
    availability: "planned",
    label: "Timeline history",
    upgradeReason: "Unlock deeper historical timing context and continuity.",
  },
  advanced_connections: {
    minimumTier: "plus",
    availability: "planned",
    label: "Advanced Connections",
    upgradeReason: "Unlock communication, emotional rhythm, attraction, life direction, and verified Human Design context.",
  },
  cross_system_synthesis: {
    minimumTier: "plus",
    availability: "planned",
    label: "Cross-system synthesis",
    upgradeReason: "Unlock deeper synthesis across qualified astrology, numerology, Human Design, and behavioral evidence.",
  },
  premium_exports: {
    minimumTier: "plus",
    availability: "live",
    label: "Premium PDF report",
    upgradeReason: "Unlock the evidence-aware downloadable natal PDF report.",
  },
  premium_tarot: {
    minimumTier: "plus",
    availability: "planned",
    label: "Premium personalized tarot",
    upgradeReason: "Unlock premium personalized card generation when the feature is available.",
  },
};

const TIER_RANK: Record<SoulCodexTier, number> = {
  free: 0,
  plus: 1,
};

export function tierAllowsCapability(
  tier: SoulCodexTier,
  capability: SoulCodexCapability,
): boolean {
  const definition = SOUL_CODEX_CAPABILITIES[capability];
  return definition.availability === "live" &&
    TIER_RANK[tier] >= TIER_RANK[definition.minimumTier];
}

export function capabilityUpgradeReason(capability: SoulCodexCapability): string | null {
  return SOUL_CODEX_CAPABILITIES[capability].upgradeReason ?? null;
}

export const DAILY_INFLUENCE_LIMIT: Record<SoulCodexTier, number> = {
  free: 3,
  plus: 5,
};

export type CapabilityGate = {
  capability: SoulCodexCapability;
  tier: SoulCodexTier;
  allowed: boolean;
  label: string;
  upgradeReason: string | null;
  availability: CapabilityAvailability;
};

export function resolveCapabilityGate(
  tier: SoulCodexTier,
  capability: SoulCodexCapability,
): CapabilityGate {
  const definition = SOUL_CODEX_CAPABILITIES[capability];
  return {
    capability,
    tier,
    allowed: tierAllowsCapability(tier, capability),
    label: definition.label,
    upgradeReason: definition.upgradeReason ?? null,
    availability: definition.availability,
  };
}
