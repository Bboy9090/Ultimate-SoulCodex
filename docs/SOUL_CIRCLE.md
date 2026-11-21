# Soul Circle — consent-based friendship lane

Status: **backend and client lane implemented and tested.** Reachable at `/circle`
(entry card on the People page); invite links open `/circle/join/:token`.

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

## The client lane

- `/circle`: your circle (each friend with the signs they share), and invite creation.
  An invite can carry a name you choose for that invite; the link is shown once.
- `/circle/join/:token`: shows who invited you and exactly what joining does, then joins.
  Signed-out visitors are sent to account settings and the invite is remembered for the
  session (`sessionStorage`) so they can continue after signing in.
- `/circle/:id`: what they share with you; what you share with them (per-field
  checkboxes, presets, a live "they can see right now" preview that is recomputed from
  your verified profile); stop sharing, remove, block.
- **Comparison happens on the viewer's device.** The friend's shared placements are
  compared (existing `compareFriendCharts` and Conversation Lab) with the viewer's own
  locally saved verified chart, so a person never has to share their chart to compare.
  Free keeps the existing first-look limits; Soul Codex+ opens the rest. No billing or
  entitlement behavior changed.

## Updates (in-app notifications)

Built and tested: a per-person feed of Soul Circle updates, shown as an "Updates" list on
`/circle` and an unread badge on the People entry card. It works in the web app and the
native apps because it needs no outside provider.

- **When an update is created:** the inviter is told when a friend accepts their invite
  (`friend_joined`); a friend is told when someone starts or resumes sharing with them
  (`friend_shared`). Tweaking an already-active share, revoking, removing, blocking, and
  expiry create **no** update, so nothing can reveal that someone stopped or blocked.
- **What an update stores:** only the kind, the friendship it belongs to, and timestamps.
  Never a name, a sign, or chart data. Display text is built when it is read, from what the
  other person currently consents to show (a name they chose, else "Soul Circle friend").
- **No stacking:** one unread update per kind and friendship; at most 100 per person.
- **Cleanup:** removing a friend or blocking deletes that friendship's updates for both
  people; deleting an account deletes every update about it. Updates whose friendship no
  longer exists are never shown.
- **Scoped:** marking read only ever affects the caller's own updates.

### Email, SMS and phone push: not built, and what each needs

An audit of the repo found no email provider, no SMS provider, no native push plugin, and no
push handling in the client or service worker. The only push code is a legacy root file whose
routes are non-canonical and that falls back to temporary placeholder VAPID keys, which must
not be reused. Shipping any of these without a real provider would be a simulated feature, so
none exist. All of them should be consumers of the same updates above, with generic content
only ("You have a new Soul Circle update", never a name or sign) and an opt-in per channel.

| Channel | Needs before it can be built |
| --- | --- |
| Email | A chosen provider (for example SES, Resend, Postmark) with a verified sending domain and credentials; per-user opt-in with address confirmation and one-click unsubscribe. |
| Phone push (native apps) | Server side is built and dormant (`docs/PUSH_NOTIFICATIONS.md`). Still needs a Capacitor push plugin, Apple APNs key and Firebase/FCM credentials, native entitlements, and a new store build for each platform. |
| Web push (browsers, installed PWA) | Real VAPID keys in production (no temporary keys), a subscription table, a service-worker push handler. It does not reach the native iPhone/Android apps. |
| SMS | Collecting phone numbers (new sensitive data), carrier registration and per-message cost. Not recommended for this app. |

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
- **Names come only from consent.** Account names (a sign-in provider can supply a full
  legal name) are never shown. A friend appears as "Soul Circle friend" unless they chose a
  display name for you; an invitee sees only a name the inviter typed for that invite;
  the block list is anonymous.
- **Consent writes are atomic with the friendship.** The link is re-checked under a row lock
  when consent is written, and removal/blocking take the same lock, so a request authorized
  before a friendship ended cannot leave a consent behind. A new friendship never inherits
  consent from an earlier one.
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

- `tests/soul-circle-routes.test.ts`: 19 scenarios against `MemStorage` and the same 19
  against `PostgresStorage` on a real local PostgreSQL 16 (38/38). The in-memory half is in
  the CI gate; the Postgres half runs wherever `DATABASE_URL` is set. Invite and
  removal-during-share races were repeated against Postgres. The SQL migration and the
  idempotent startup script were applied to clean databases.
- `tests/soul-circle-client.test.ts` (10 tests, in the CI gate): share-selection rules,
  presets, chips never inventing values, safe invite URLs, error mapping, and a source
  contract that the pages never read birth data, never store friends on-device, never touch
  Human Design or contacts, and keep the entitlement gate.
- **Real browser run (Chromium, mobile viewport, production build, real PostgreSQL 16):**
  two real email accounts with seeded verified profiles went through invite, join, consent,
  live preview, on-device comparison with the Conversation Lab, revoke, and block: 17/17
  checks, including that a full account name, birth time, birthplace, coordinates, email,
  and unconsented fields never appear on the friend's screen. This harness lives outside the
  repository and is **not** part of CI. Verification data was seeded directly because the
  independent ephemeris is unreachable from the sandbox.

## Not included / open

- Signed-out visitors cannot sign in from the invite page itself; they are sent to account
  settings. An inline sign-in is not built.
- Email and SMS: not built. Phone push: server side built but dormant and unverified; no native client yet (see `docs/PUSH_NOTIFICATIONS.md`).
- Group views, and per-friend naming nudges: not built.
- Production has not run this against its real database; the Postgres evidence is a local
  PostgreSQL 16 only.
