import type { Request, Response } from "express";
import { z } from "zod";
import type { IStorage } from "../storage";
import { generateEntitledGalacticCode } from "../services/galactic-code-entitled";

type GenerateEntitled = typeof generateEntitledGalacticCode;

/**
 * Dormant HTTP admission boundary for Galactic Code.
 *
 * This handler is intentionally not registered in the production router yet.
 * It accepts no caller-supplied evidence or birth-data overrides: the profile id
 * is resolved from the URL and all synthesis inputs are reconstructed server-side.
 */
export function galacticCodeHandler(dependencies: {
  storage: Pick<IStorage, "getProfile" | "getUser" | "getLatestEntitlementGrant">;
  requireDurableFeature(res: Response): boolean;
  generate?: GenerateEntitled;
}) {
  const generate = dependencies.generate ?? generateEntitledGalacticCode;

  return async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    if (!dependencies.requireDurableFeature(res)) return;

    if (!z.object({}).strict().safeParse(req.body ?? {}).success) {
      return res.status(400).json({
        message: "Galactic Code uses the saved profile only; request overrides are not accepted.",
      });
    }

    const actor = {
      userId: (req as any).session?.userId ?? null,
      sessionId: (req as any).sessionID ?? null,
    };

    try {
      const result = await generate(req.params.id, actor, dependencies.storage);

      if (result.status === "not_found") {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (result.status === "insufficient_verified_evidence") {
        return res.status(422).json({
          code: "insufficient_verified_evidence",
          message: "Galactic Code needs more verified profile evidence before it can be generated.",
        });
      }

      return res.status(200).json({
        revision: result.revision,
        tier: result.tier,
        result: result.result,
      });
    } catch (error) {
      console.error("[GalacticCode] dormant handler failed", error);
      return res.status(503).json({
        message: "Galactic Code is temporarily unavailable.",
      });
    }
  };
}
