import type { Express, Response } from "express";
import rateLimit from "express-rate-limit";
import type { IStorage } from "../storage";
import { galacticCodeHandler } from "./galactic-code-entitled";

export const GALACTIC_CODE_RATE_LIMIT_PER_MINUTE = 10;

export function registerProfileGalacticCodeRoute(
  app: Express,
  dependencies: {
    storage: Pick<
      IStorage,
      "getProfile" | "getGalacticCodeRecord" | "upsertGalacticCodeRecord" | "getUser" | "getLatestEntitlementGrant"
    >;
    requireDurableFeature(res: Response): boolean;
  },
) {
  app.post(
    "/api/profiles/:id/galactic-code",
    rateLimit({
      windowMs: 60_000,
      limit: GALACTIC_CODE_RATE_LIMIT_PER_MINUTE,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        message: "Too many Galactic Code requests. Please try again later.",
        code: "galactic_code_rate_limited",
      },
    }),
    galacticCodeHandler(dependencies),
  );
}
