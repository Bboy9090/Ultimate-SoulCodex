# Soul Codex Full-Chart + Supporting-Systems Contract

## Product rule

Soul Codex is synthesis-first. Specialist systems exist to add distinct explanatory depth, not to make the interface look more mystical or to repeat the same claim under different names.

The main reading may use a system only when its evidence state satisfies `shared/system-visibility.ts`. Raw system details remain available through the optional **Underlying systems** inspector so a curious user can audit what was calculated, verified, withheld, or left unresolved.

## Complete birth data is not the same as verified chart evidence

Exact date + exact time + birth-place timezone + latitude + longitude mean a timed placement is **calculable**. They do not, by themselves, turn an internal calculation into independently verified evidence.

The UI must therefore distinguish:

1. **Inputs missing** — the placement cannot be calculated safely.
2. **Calculated candidate** — a value exists, but the required independent verification is incomplete.
3. **Verified chart fact** — the placement passed the approved verification contract.

A calculated candidate may be shown only in the optional inspector with an explicit unverified label. It must not silently populate verified aliases, Compatibility evidence, or a truth-coded PDF field.

## Birth-location timezone rule

The timezone used for timed chart calculation must belong to the **birth coordinates**, not to the device currently running Soul Codex.

`POST /api/location/resolve` is the online fallback used only when the user explicitly presses **Resolve place**. It accepts only the entered place string, resolves coordinates through the existing server geo layer, derives the IANA timezone with `geo-tz`, persists nothing, and invokes no AI generation.

The create flow no longer calls Nominatim directly and never substitutes the browser/device timezone for a remote birthplace.

## Ascendant retry rule

A current verification-version receipt does not mean Rising passed. When exact timed inputs exist and Ascendant remains unverified, `profileNeedsOnlineVerification()` must continue to return `true` until Rising actually verifies.

This prevents a temporary independent-reference failure from leaving a complete profile permanently stuck with an unresolved Rising value and no retry path.

## Optional Underlying systems inspector

Route: `/systems`

The inspector is secondary navigation, not another primary dashboard. It may show:

- saved birth inputs used by calculation;
- verified Sun / Moon / Rising;
- calculated-but-unverified placement candidates, clearly labeled;
- deterministic Life Path, Expression, Soul Urge, Personality, and Personal Year values where present;
- verified Human Design core fields;
- an explicit explanation when Human Design or other systems are not eligible for authoritative use;
- why a value can differ from another service, such as numerology reduction/master-number rules.

The inspector does not create a new profile, upload data merely by opening, or upgrade evidence states.

## Primary synthesis eligibility

| System | Default role | May enrich synthesis when | Candidate inspectable? |
|---|---|---|---|
| Verified astrology core | supporting | placement is verified | yes |
| Numerology | supporting | deterministic value exists | yes |
| Human Design | inspectable/supporting | trust record is verified | yes |
| User assessments | supporting | explicit assessment result exists | yes |
| Houses / Midheaven | unavailable | not production-ready | no |
| Nodes / Chiron / planetary houses | unavailable | not production-ready | no |
| Astrocartography | unavailable | not production-ready | no |
| Palmistry CV | unavailable | not production-ready | no |

`shared/system-visibility.ts` is the executable policy source.

## Elegant natal PDF

The one production natal-report path is:

`profile.tsx` → `NatalReportDownloadButton.tsx` → `GET /api/pdf/profile/:id` → `server/lib/natal-report-contract.ts` → `server/natalReportPdf.ts`

The truth adapter permits verified astronomy and deterministic calculations while withholding unsupported houses, aspects, nodes, Chiron, Midheaven, and planetary-house claims.

The old template generators under `services/pdf-generator.ts` and `packages/astrology/pdf-generator.ts` are legacy source only. Production `server/**` and `client/**` may not import them. `tests/pdf-production-path-contract.test.ts` locks that boundary.

## Not yet a production claim

This tranche does not declare completion of:

- independently verified houses / Midheaven;
- full verified planetary set and aspects;
- verified nodes / Chiron / planetary house placements;
- authoritative Human Design interpretation/Compatibility;
- real astrocartography planetary-line calculation and map rendering;
- palm-image computer vision.

Those are engineering lanes, not empty UI slots. Until they have evidence-grade implementations, Soul Codex may explain that they are unavailable but must not substitute sample data, guessed values, or decorative output.
