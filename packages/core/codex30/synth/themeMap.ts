export const THEME_TAGS = [
  "precision", "service", "privacy", "intensity", "freedom", "leadership", "healing",
  "order", "innovation", "intuition", "discipline", "rebellion", "craft", "legacy",
  "emotion_depth", "social_sensitivity", "truth", "boundaries", "courage", "focus"
] as const;

export type ThemeTag = typeof THEME_TAGS[number];

export const THEME_WORDS: Record<string, string[]> = {
  precision:         ["precision", "refinement", "mastery", "detail-control"],
  privacy:           ["privacy", "selectiveness", "inner fortress", "guardedness"],
  service:           ["service", "helpfulness", "usefulness", "repair energy"],
  legacy:            ["legacy", "immortality work", "long-game building", "empire-mode"],
  truth:             ["truth", "directness", "no-bullshit", "honesty"],
  intensity:         ["intensity", "depth", "pressure tolerance", "thermal output"],
  discipline:        ["discipline", "structure", "self-command", "consistency"],
  craft:             ["craft", "skill-building", "mastery path", "technical excellence"],
  intuition:         ["intuition", "signal reading", "felt sense", "inner knowing"],
  freedom:           ["freedom", "autonomy", "self-direction", "non-attachment"],
  boundaries:        ["boundaries", "clear lines", "non-negotiables", "edge-setting"],
  leadership:        ["leadership", "direction", "pulling others forward", "command"],
  courage:           ["courage", "willingness to act", "risk tolerance", "forward motion"],
  healing:           ["healing", "repair work", "integration", "restoration"],
  emotion_depth:     ["emotional depth", "feeling architecture", "inner weather"],
  social_sensitivity:["social sensitivity", "atmospheric reading", "crowd awareness"],
  innovation:        ["innovation", "pattern breaking", "new-angle thinking"],
  order:             ["order", "structure", "system building", "clean architecture"],
  rebellion:         ["rebellion", "rule questioning", "anti-conformity", "disruption"],
  focus:             ["focus", "singular drive", "target locking", "elimination of noise"]
};
