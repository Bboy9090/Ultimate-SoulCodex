import type { Signal } from "../types";

const TYPE_TAGS: Record<string, string[]> = {
  reflector: ["social_sensitivity", "intuition", "privacy"],
  projector: ["leadership", "precision", "boundaries"],
  generator: ["craft", "discipline", "service"],
  manifesting_generator: ["craft", "courage", "innovation"],
  manifestor: ["leadership", "freedom", "intensity"],
};

const TYPE_EXPLANATIONS: Record<string, string> = {
  reflector: "A Reflector reading can be used as a symbolic hypothesis about environmental sensitivity. Compare it against repeated lived observations across different rooms, groups, and days rather than treating it as a fixed psychological fact.",
  projector: "A Projector reading can be used as a symbolic hypothesis about selective attention, pacing, and guidance. Compare it against situations where advice is requested versus unrequested rather than treating it as a fixed psychological fact.",
  generator: "A Generator reading can be used as a symbolic hypothesis about sustained engagement and response. Compare it against what actually produces durable energy versus obligation rather than treating it as a fixed psychological fact.",
  manifesting_generator: "A Manifesting Generator reading can be used as a symbolic hypothesis about nonlinear experimentation and rapid iteration. Compare it against actual follow-through and repair patterns rather than treating it as a fixed psychological fact.",
  manifestor: "A Manifestor reading can be used as a symbolic hypothesis about initiation and autonomy. Compare it against real communication and consent patterns rather than treating it as a fixed psychological fact.",
};

function validText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validTimestamp(value: unknown): value is string {
  return validText(value) && !Number.isNaN(Date.parse(value));
}

function verifiedHumanDesign(hd: any): any | null {
  if (!hd || typeof hd !== "object") return null;
  const candidate = hd.candidate && typeof hd.candidate === "object" ? hd.candidate : hd;
  const status = hd.status ?? hd.verificationStatus;
  const complete =
    status === "verified" &&
    validText(candidate.type) &&
    validText(candidate.strategy) &&
    validText(candidate.authority) &&
    validText(candidate.profile) &&
    validText(hd.source) &&
    validTimestamp(hd.calculatedAt) &&
    validTimestamp(hd.inputTimestampUtc) &&
    validText(hd.verificationReceiptId) &&
    validText(hd.independentSource) &&
    validTimestamp(hd.verifiedAt);
  return complete ? { ...hd, ...candidate } : null;
}

export function humanDesignSignals(rawHd: any): Signal[] {
  const hd = verifiedHumanDesign(rawHd);
  if (!hd) return [];

  const raw = String(hd.type).toLowerCase().replace(/\s+/g, "_");
  const tags = TYPE_TAGS[raw];
  if (!tags) return [];

  return [{
    id: `hd.type.${raw}`,
    system: "humanDesign",
    label: TYPE_EXPLANATIONS[raw],
    evidence: [
      `Verified Human Design core type: ${hd.type}. Interpretation remains symbolic rather than verified psychology.`,
    ],
    intensity: 0.75,
    polarity: "neutral",
    confidence: "high",
    tags,
  }];
}
