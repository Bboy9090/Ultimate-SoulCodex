import type { Express } from "express";
import { z } from "zod";
import * as geoTz from "geo-tz";
import { resolveGeo } from "../geo/index";

const resolveLocationSchema = z
  .object({
    place: z.string().trim().min(2).max(200),
  })
  .strict();

function isUsableTimezone(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Minimal location-resolution route for the local-first create flow.
 *
 * The user invokes this explicitly by pressing Resolve place. Only the entered
 * place string is sent. The server resolves coordinates and derives the IANA
 * timezone from those coordinates so a remote birth location can never inherit
 * the timezone of the device currently filling out the form.
 *
 * Nothing is persisted and no profile is created.
 */
export function registerLocationResolutionRoutes(app: Express) {
  app.post("/api/location/resolve", async (req, res) => {
    const parsed = resolveLocationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Location request is invalid",
        code: "invalid_location_request",
      });
    }

    try {
      const geo = await resolveGeo(parsed.data.place);
      if (!geo) {
        return res.status(404).json({
          message: "Birth location could not be resolved",
          code: "location_not_found",
        });
      }

      const timezoneCandidates = geoTz.find(geo.lat, geo.lon);
      const timezone = timezoneCandidates.find(isUsableTimezone) ?? null;
      if (!timezone) {
        return res.status(422).json({
          message: "Coordinates were found, but an IANA timezone could not be resolved safely",
          code: "timezone_unresolved",
          latitude: geo.lat,
          longitude: geo.lon,
          normalizedPlace: geo.normalizedPlace,
        });
      }

      return res.json({
        normalizedPlace: geo.normalizedPlace,
        latitude: geo.lat,
        longitude: geo.lon,
        timezone,
        provider: geo.provider,
        processing: {
          persistedProfile: false,
          aiGeneration: false,
          purpose: "birth_location_resolution_only",
        },
      });
    } catch (error) {
      console.error("[LocationResolution] Failed safely:", error);
      return res.status(503).json({
        message: "Location resolution is temporarily unavailable",
        code: "location_resolution_unavailable",
      });
    }
  });
}
