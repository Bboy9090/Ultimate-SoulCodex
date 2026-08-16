// Backward-compatible import shim.
//
// The canonical Foundation Compatibility router now lives with the rest of the
// production server route modules under server/routes/. Older focused tests and
// imports may continue using this path while migration finishes.
export {
  COMPATIBILITY_FORMULA_VERSION,
  buildCompatibilityProfileInput,
  buildMatchResponse,
  buildPersonComparisonResponse,
  deterministicLifePath,
  symbolicSunSign,
  type CompatibilityEvidenceMode,
} from "../server/routes/compatibility";

export { default } from "../server/routes/compatibility";
