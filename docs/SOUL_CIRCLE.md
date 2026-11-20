# Soul Circle — consent-based friendship lane

Status: **backend implemented and tested; client lane not yet built.** Nothing in the
app calls these endpoints yet, so no user-visible behavior has changed.

Soul Circle lets two people who both have Soul Codex accounts see each other's
verified chart signs **without either typing anything about the other**. It is built
to satisfy item 4 of `docs/ASTROLOGY_ATLAS_AND_CONNECTIONS.md`: authenticated
durable storage, explicit invitations and acceptance, private defaults, separate
consent for chart sharing, block/remove/revoke, deletion cascade, and server-side
authorization against cross-user reads. No contact upload, no public birth details.

## How a friendship works

1. **Invite.** A signed-in user creates a single-use invite link (valid 7 days, at most
   10 open). The token is shown once; only its SHA-256 is stored.
2. **Accept.** The friend signs in and accepts. Accepting creates the link and **shares
   nothing**. Both sides start private.
3. **Consent, per friend.** Each person separately chooses which fields *this one friend*
   may see (`displayName`, `sunSign`, `moonSign`, `risingSign`, `lifePath`,
   `archetypeTitle`, `comparisonChart`). The response echoes exactly what the friend can
   see. Consent lapses after 180 days unless renewed.
4. **Auto-updating, never copied.** A friend's chart is **recomputed on every read** from
   the sharer's own profile, filtered to the consented fields. No snapshot is stored, so
   re-verifying a chart updates what friends see and revoking cuts access instantly.
5. **Leave any time.** Revoke sharing, remove the friend (deletes the link and both
   consents), or block. Deleting an account removes every invite, link and consent.

## What may be shared (doctrine)

The projection is the same one used for public share links
(`server/lib/public-profile-projection.ts`): only **independently verified, evidence-bound**
placements are ever emitted. Unverified or user-asserted data is dropped, so a person
who has not verified online has nothing to share and sees why
(`verified_profile_required` / `no_verified_fields`). Human Design, birth date, birth
time, birthplace, coordinates, legal name, email and username are **never** included.
Local-only profiles stay on-device until their owner chooses online verification.

## Privacy and authorization rules enforced (and tested)

- Every endpoint requires a signed-in user and sends `Cache-Control: private, no-store`.
- Links are addressed by an opaque link id; callers who are not members get `404`
  (existence is never revealed). Other users' ids are never returned.
- A blocked person cannot tell they were blocked: new invites from them look like any
  other unavailable invite (`410`).
- Block deletes consents both ways; only the blocker can lift it, and lifting deletes the
  link, so the pair must be re-invited and must consent again.
- Invite acceptance is limited to 20 attempts / 15 min and is single-use under a row lock.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/soul-circle/invites` | Create an invite (token returned once) |
| GET | `/api/soul-circle/invites` | List my invites (never returns tokens) |
| DELETE | `/api/soul-circle/invites/:id` | Cancel an invite |
| GET | `/api/soul-circle/invites/:token/preview` | Who is inviting me |
| POST | `/api/soul-circle/invites/accept` | Accept `{ token }` |
| GET | `/api/soul-circle/friends` | My friends with what they currently share |
| GET | `/api/soul-circle/friends/:id` | One friend |
| PUT | `/api/soul-circle/friends/:id/share` | Set what this friend may see |
| DELETE | `/api/soul-circle/friends/:id/share` | Stop sharing with this friend |
| DELETE | `/api/soul-circle/friends/:id` | Remove friend |
| POST | `/api/soul-circle/friends/:id/block` | Block |
| GET / DELETE | `/api/soul-circle/blocks[/:id]` | List / lift my blocks |

Tables: `soul_circle_invites`, `soul_circle_links`, `soul_circle_shares`
(`shared/schema.ts`, `migrations/0004_soul_circle.sql`, and the idempotent startup
script `scripts/ensure-public-share-schema.mjs` that production runs before boot).

## Validation (actually run)

`tests/soul-circle-routes.test.ts`: 12 scenarios against `MemStorage` and the same 12
against `PostgresStorage` on a real local PostgreSQL 16 (24/24). The CI gate runs the
in-memory half; the Postgres half runs wherever `DATABASE_URL` is set. The invite race
was repeated six times against Postgres. The SQL migration and the startup schema script
were applied to clean databases, and the script was re-run to confirm it is idempotent.

## Not included / open

- **Client lane** (invite screen, friends list, per-friend consent sheet, comparison):
  not built. The existing `friendChartCompatibility` and the Conversation Lab are the
  intended comparison surface.
- Push/notification when a friend joins or shares: not built.
- Group views, and a shareable "join my circle" landing page for signed-out visitors:
  not built; joining requires an account.
- Production has not run this against its real database; the Postgres evidence is a
  local PostgreSQL 16 only.
