# Server profile Human Design parity

This patch adds verified Human Design to newly requested server profile creation when exact birth date, time, timezone, and coordinates are present. The same strict UTC instant drives calculation and the approved trust receipt. Saved verified Human Design survives assessment-based narrative regeneration. Symbolic meanings remain explicitly symbolic; Human Design does not enter compatibility.

Validation: `node --import tsx --test tests/server-profile-human-design-parity.test.ts` and `npm run check`. These prove the actual deterministic engine, trust qualification, symbolic archetype context, missing-input refusal, and summer timezone integrity. Signed archives and deployed server behavior are not proven by these checks.

Existing server profiles now have an explicit **Verify saved birth details** action on the remote profile page. The owner-checked POST `/api/profiles/:id/verify-systems` uses only stored inputs, refuses request overrides, checks durable storage, applies the approved helper, persists to the same owned profile, and regenerates biography/guidance. Ownership and birth details are rechecked after external calculation. Reads perform no automatic refresh. The button updates the matching remote query and matching active snapshot; device-local IDs are refused and unrelated active profiles are untouched.

Risk: new complete-input profile requests now stop before persistence if Human Design cannot meet its verified core contract. Missing-input profiles retain an explicit unresolved record. Legacy AI output still needs full chart parity beyond the newly supplied Human Design context.

Rollback: revert this isolated patch; existing profile records keep their evidence fields, which remain excluded from interpretation unless trust checks pass.
