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

export type CapabilityDefinition = {
  minimumTier: SoulCodexTier;
  label: string;
  upgradeReason?: string;
};

export const SOUL_CODEX_CAPABILITIES: Record<SoulCodexCapability, CapabilityDefinition> = {
  core_profile: { minimumTier: "free", label: "Core profile" },
  big_three: { minimumTier: "free", label: "Supported Big 3" },
  date_numerology: { minimumTier: "free", label: "Date-based numerology" },
  evidence_provenance: { minimumTier: "free", label: "Evidence and provenance" },
  diamond_closure: { minimumTier: "free", label: "Diamond Way closure" },
  basic_connections: { minimumTier: "free", label: "Basic Connections" },
  basic_compatibility: { minimumTier: "free", label: "Basic compatibility" },

  full_natal_chart: {
    minimumTier: "plus",
    label: "Full natal chart",
    upgradeReason: "Unlock all qualified planets, houses, aspects, angles, Nodes, and Chiron.",
  },
  full_name_numerology: {
    minimumTier: "plus",
    label: "Full name numerology",
    upgradeReason: "Unlock Expression, Soul Urge, Personality, and Maturity when a complete birth name is available.",
  },
  human_design_depth: {
    minimumTier: "plus",
    label: "Human Design depth",
    upgradeReason: "Unlock verified Type, Strategy, Authority, Profile, centers, channels, and deeper synthesis.",
  },
  advanced_daily: {
    minimumTier: "plus",
    label: "Advanced Daily",
    upgradeReason: "See up to five strongest qualified influences and deeper cross-system synthesis.",
  },
  advanced_transits: {
    minimumTier: "plus",
    label: "Advanced transits",
    upgradeReason: "Unlock deeper transit interpretation and timing intelligence.",
  },
  timeline_history: {
    minimumTier: "plus",
    label: "Timeline history",
    upgradeReason: "Unlock deeper historical timing context and continuity.",
  },
  advanced_connections: {
    minimumTier: "plus",
    label: "Advanced Connections",
    upgradeReason: "Unlock communication, emotional rhythm, attraction, life direction, and verified Human Design context.",
  },
  cross_system_synthesis: {
    minimumTier: "plus",
    label: "Cross-system synthesis",
    upgradeReason: "Unlock deeper synthesis across qualified astrology, numerology, Human Design, and behavioral evidence.",
  },
  premium_exports: {
    minimumTier: "plus",
    label: "Premium exports",
    upgradeReason: "Unlock premium report and sharing formats.",
  },
  premium_tarot: {
    minimumTier: "plus",
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
  return TIER_RANK[tier] >= TIER_RANK[SOUL_CODEX_CAPABILITIES[capability].minimumTier];
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
  };
}
