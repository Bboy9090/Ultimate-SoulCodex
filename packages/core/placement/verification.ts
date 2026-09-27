import type {
  PlacementLike,
  VerifiedPlacement,
} from "./types.js";

/**
 * Return a placement only when its verified lifecycle state is accompanied by
 * traceable source, engine, and calculation-time evidence.
 *
 * This is the canonical verification gate for consumers. A sign string, UI
 * confidence, or status flag alone can never promote a placement.
 */
export function getVerifiedPlacement(
  value: PlacementLike | null | undefined,
): VerifiedPlacement | null {
  if (!value?.sign) return null;

  const state = value.verificationStatus ?? value.status;
  if (state !== "verified") return null;

  const evidence = value.provenance ?? value.evidence;
  const sourceValid =
    typeof evidence?.source === "string" && evidence.source.trim().length > 0;
  const engineValid =
    typeof evidence?.engine === "string" && evidence.engine.trim().length > 0;
  const timestampValid =
    typeof evidence?.calculatedAt === "string" &&
    evidence.calculatedAt.trim().length > 0 &&
    !Number.isNaN(Date.parse(evidence.calculatedAt));

  if (!sourceValid || !engineValid || !timestampValid) return null;

  return {
    sign: value.sign,
    ...(typeof value.degree === "number" ? { degree: value.degree } : {}),
    verificationStatus: "verified",
    evidence,
  };
}
