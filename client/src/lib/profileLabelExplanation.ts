import { calcExpression, calcLifePath, calcSoulUrge } from "@soulcodex/core";
import { canonicalNumberPattern, canonicalSignPattern, type CanonicalSymbolicPattern } from "@shared/symbolic-vocabulary";
import type { HumanDepthItem } from "../components/HumanDepthSurface";
import { getSynthesisAstrologySign } from "./profileVerificationReconciliation";

type RecordValue = Record<string, any>;
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

function supportedPatterns(profile: RecordValue) {
  const entries: Array<{ label: string; pattern: CanonicalSymbolicPattern }> = [];
  const addNumber = (label: string, value: unknown) => {
    const pattern = canonicalNumberPattern(value);
    if (pattern) entries.push({ label: `${label} ${value}`, pattern });
  };
  try {
    if (typeof profile.birthDate === "string") addNumber("Life Path", calcLifePath(profile.birthDate));
    if (typeof profile.fullBirthName === "string" && profile.fullBirthName.trim()) {
      addNumber("Expression", calcExpression(profile.fullBirthName));
      addNumber("Soul Urge", calcSoulUrge(profile.fullBirthName));
    }
  } catch { /* Unsupported inputs do not supply interpretation context. */ }
  const astrology = profile.verifiedAstrologyData ?? profile.astrologyData;
  for (const body of ["sun", "moon", "rising"] as const) {
    const sign = getSynthesisAstrologySign(astrology, body);
    const pattern = canonicalSignPattern(sign);
    if (pattern) entries.push({ label: `${sign} ${body === "rising" ? "Rising" : body === "sun" ? "Sun" : "Moon"}`, pattern });
  }
  return entries;
}

/** A saved label is not evidence of somebody's motives or relationship history. */
export function explainProfileLabel(label: string, kind: "strength" | "growth", profile: RecordValue): HumanDepthItem {
  const clean = label.trim();
  const item: HumanDepthItem = {
    id: `${kind}-${normalize(clean).replace(/[^a-z0-9]+/g, "-")}`,
    title: clean,
    observation: `Saved ${kind === "strength" ? "strength" : "growth"} theme: ${clean}.`,
    evidence: "Saved archetype label. Its source-specific explanation is unavailable; it does not establish a behavior or protective motive.",
  };
  const match = supportedPatterns(profile).find(({ pattern }) =>
    normalize(kind === "strength" ? pattern.gift : pattern.shadow) === normalize(clean));
  if (match) {
    return {
      ...item,
      observation: `${match.label} symbolism connects ${clean.toLowerCase()} with ${match.pattern.drive}. Treat this as a reflection theme to compare with your experience.`,
      benefit: `Symbolic constructive expression: ${match.pattern.gift}.`,
      tradeoff: `Symbolic overuse risk: ${match.pattern.shadow}.`,
      relationshipView: `In the ${match.label} interpretation, this pattern ${match.pattern.relationship}. Whether that describes your relationships needs your own examples.`,
      practicalTakeaway: match.pattern.action,
      evidence: `${match.label}: source-specific symbolic interpretation. Calculation evidence does not establish your psychological motives.`,
    };
  }

  const depth = profile.depthInterpretation ?? profile.synthesis;
  const layer = depth?.[kind === "strength" ? "gift" : "shadow"];
  const evidence = Array.isArray(depth?.evidence) ? depth.evidence : [];
  const ids = Array.isArray(layer?.evidenceIds) ? layer.evidenceIds : [];
  const refs = evidence.filter((entry: RecordValue) => ids.includes(entry.id));
  if (typeof layer?.summary === "string" && normalize(layer.summary).includes(normalize(clean)) &&
    ids.length > 0 && refs.length === ids.length) {
    const behavioral = refs.some((entry: RecordValue) => ["user-stated", "mirror", "tracker"].includes(entry.system));
    const prefix = layer.claimKind === "observed" && behavioral ? "From your recorded assessment" : "Symbolic reflection";
    return { ...item, observation: `${prefix}: ${layer.summary}`, evidence: `Saved ${kind === "strength" ? "gift" : "shadow"} layer linked to ${refs.map((entry: RecordValue) => `${entry.system} ${entry.field}`).join(", ")}.` };
  }
  return item;
}
