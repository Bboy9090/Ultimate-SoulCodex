# Soul Codex — Release Certification Status

**Last Updated:** 2026-11-07  
**Current Branch:** `main`  
**Last verified pre-status-update main/runtime checkpoint:** `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b`  
**Current Milestone:** Soul Codex 4.1.0 split-store launch / external provider and store-owner completion

## Current Authority Model

Soul Codex now uses separate evidence classes. Do not collapse these into one “release SHA.”

### 1. Current source authority

This status file is itself a repository change. After it merges, GitHub `main` will advance again and Railway may auto-deploy that docs-only commit. Therefore the moving repository HEAD must be read from GitHub rather than frozen into this file.

Last verified pre-status-update checkpoint:
- repository `main`: `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b`
- Latest exact-head Store Candidate source: `b1a2af702411a54ddc94da4ac8f89cfe4f927f8a`
- Store Candidate run: `42400835507` — PASS\n- Exact-head Account Sign-In run: `42400835166` — PASS\n- Exact-head iOS Billing Parity run: `42400835339` — PASS
- Current source mobile identity:
  - Android: `4.1.0` / versionCode `4000016` / package `soulcodex.app`
  - iOS source project: `4.1.0` / build `4000014` / bundle `app.soulcodex.ios`
- Latest qualified source artifacts:
  - release-gate artifact ID: `13585158689`
  - iOS qualification artifact ID: `13585159197`
  - Android qualification artifact ID: `13585049471`
  - Google Play production-handoff artifact ID: `13585631821`

These artifacts qualify the exact source head above. They do not automatically replace the frozen store-upload authority described below.

### 2. Live Railway production authority

The following is the last verified pre-status-update runtime checkpoint. A later docs-only merge may advance the runtime release SHA without changing application behavior; verify Railway again before using this SHA as a current deployment claim.

Public production domain:
- `https://soulcodex.up.railway.app`

Live service:
- Railway project: `Soulcodex`
- service: `soulcodex-recovery`
- deployment: `be75f1db-f673-4181-8726-2a511ed72109`
- deployed commit: `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b`
- deployment status: **SUCCESS**

Runtime evidence:
- Railway deployment metadata confirms commit `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b` on branch `main`
- production environment
- Postgres-backed application storage
- Postgres session store
- schema preflight ready
- `/health` registered
- `/ready` registered
- Gemini provider configured

The older Railway `soulcodex` service is rollback-only and does not own the public production domain.

### 3. Frozen binary/store-upload authority

The historical frozen binary authority remains:

- `governance/release-audits/V4_1_CURRENT_RELEASE_AUTHORITY_2026-10-24.md`

Do **not** rewrite that receipt to a newer SHA merely because `main`, Railway, or source qualification advanced. A new frozen store-upload authority requires a new explicit artifact/submission receipt.

## Current 4.1 Product Boundary

The Free → Plus boundary is enforced across the current app architecture, including:

- Identity/profile surfaces
- Systems Details
- Timeline
- Compatibility/Friends
- Aureon/Soul Guide response depth
- Quick / Standard / Deep Dive reading modes
- online and offline Clarity reading construction
- local/offline profile generation and repair
- stored verification
- server-generated biography/archetype/guidance
- owned-profile API responses
- Ultimate Codex synthesis
- public-share projection
- PDF premium authority

Current core rule:
- accuracy, evidence, uncertainty, missing-data honesty, verified natal geometry, and verified Human Design core remain Free;
- qualified deeper interpretation and paid systems use the shared capability registry;
- planned capabilities are not sold or treated as live gates.

Current capability highlights:
- Free/live: core profile, Big Three, date numerology, evidence provenance, Diamond closure, basic Connections/Compatibility, verified full natal geometry, verified HD Type/Strategy/Authority/Profile
- Plus/live: interpretation depth, full-name numerology, advanced Daily, cross-system synthesis, premium exports
- Plus/planned: deeper HD definition/centers/channels/gates, advanced transits, timeline history, advanced Connections, premium tarot

## Billing and Entitlement Status

Architecture:
- provider-signed evidence is required;
- server verification precedes durable entitlement;
- local flags and retired one-time premium state cannot grant Plus;
- web/native purchase surfaces remain feature-gated and fail closed when configuration/provider evidence is unavailable.

Provider qualification remains **INCONCLUSIVE**.

Authoritative receipt:
- `governance/release-audits/V4_1_NATIVE_BILLING_QUALIFICATION_RECEIPT.md`

Therefore:
- iOS production billing flag: **MUST REMAIN FALSE**
- Android production billing flag: **MUST REMAIN FALSE**
- legacy umbrella native-billing flag: **MUST REMAIN FALSE**

Historical Apple sandbox purchase evidence is not a PASS because server verification failed with `authentication_required` / HTTP 401. The repaired current build still requires real provider purchase/restore/lifecycle qualification.\n\nCurrent provider-catalog evidence:\n- Apple `Soul Codex+` subscription group exists; both expected products (`app.soulcodex.plus.monthly.renewing` and `app.soulcodex.plus.annual.renewing`) currently show **Developer Rejected** with `Add for Review` available. Review history shows they were removed with the Oct 28 four-item submission after an app launch-crash review failure; the later Oct 31 app-only build `4000014` was approved. This is not evidence Apple rejected the subscription metadata itself.\n- Google Play monthly (`soul_codex_plus_monthly` / base plan `monthly`) and annual (`soul_codex_plus_annual` / base plan `annual`) are **Active**; annual U.S. price is $59.99/year.\n- Catalog presence/status does not qualify purchase, restore, lifecycle, or server verification.

## App Store Status

Authenticated App Store Connect evidence as of 2026-11-07:
- Soul Codex Apple ID: `6764221944`
- bundle ID: `app.soulcodex.ios`
- iOS 4.1 status: **Ready for Distribution**
- selected App Store Connect build: `4000014` / version `4.1.0`
- the private-console description is the newer evidence/reflection-focused copy and includes the Standard Apple EULA link
- primary category: Lifestyle; secondary category: Entertainment
- the current Support URL still points to `https://soulcodex.up.railway.app/support` rather than the canonical GitHub Pages support URL
- the App Store Server Notifications sandbox URL is configured to the Soul Codex Railway billing-notifications endpoint

Public storefront evidence still does not establish source-SHA parity. The exact U.S. listing still renders `Data Not Collected`, while authenticated App Store Connect currently declares **Data Linked to You** with 10 data types: Name, Email Address, Precise Location, Coarse Location, Purchase History, User ID, Sensitive Info, Other User Content, Other Diagnostic Data, and Other Data Types. The private Privacy Policy URL remains `https://soulcodex.up.railway.app/privacy`; App Store Connect states that changing this URL requires a new app version.

The private age-rating configuration is current and matches the U.S. public 9+ rating: 9+ in 172 countries/regions, 12+ in Vietnam and Brazil, and All in Korea, Republic of. Therefore age is not a stale-store mismatch; any move toward the product's earlier 13+ guidance is a deliberate questionnaire/product decision. Privacy public-rendering and privacy-URL reconciliation remain open.

Current external Apple metadata gate:
- issue #346 — App Store privacy, age, support/privacy URL, and public-store reconciliation

Canonical store/legal packet:
- `docs/STORE_SUBMISSION_PACKET.md`
- Privacy: `https://bboy9090.github.io/Ultimate-SoulCodex/privacy/`
- Support: `https://bboy9090.github.io/Ultimate-SoulCodex/support/`
- Account deletion: `https://bboy9090.github.io/Ultimate-SoulCodex/account-deletion/`

## Google Play Status

Current source qualification:
- signed Android AAB build: PASS
- signature verification: PASS
- versionCode: `4000016`
- exact-head Android artifact ID: `13585049471`
- generated final release manifest check: PASS — no `READ_CONTACTS` or `WRITE_CONTACTS`

Authenticated Play Console receipt as of 2026-11-07:
- app: SOUL CODEX / `soulcodex.app`
- Production: **Inactive**
- Closed testing: **Active**
- Internal testing: **Active**
- Alpha closed release: `Soul Codex 4.1.0 (4000015) Closed Beta`
- release state: Available to selected testers
- release date shown by Play Console: Oct 31, 2026 at 11:28 AM
- distribution: 178 countries/regions
- supported Android devices: 19,561
- configured Alpha tester email-list users: **29** (`test lkist`)\n- opted-in closed-test users: **1**
- Google production-access requirement shown in Console: at least **12 opted-in testers for at least 14 days**

Therefore Google Play production access is currently **not eligible**. The existing tester list is already large enough; the concrete blocker is opt-in conversion: reach at least 12 opted-in closed-test users and maintain the qualifying test for at least 14 days before applying for production access. The Play Console still serves uploaded versionCode `4000015`; qualified source versionCode `4000016` has not yet been uploaded.

Publishing automation:
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` is currently absent in the qualifying GitHub Actions environment;
- automated Play production upload remains unavailable;
- latest production-handoff artifact ID: `13585631821`.

Play subscription catalog configuration is present and matches the repository contract: monthly base plan `monthly` and annual base plan `annual` are active; the annual U.S. price is $59.99/year.\n\nThis blocks only automated publishing. Manual Play Console handling remains possible. Real Google Play Billing purchase/restore/lifecycle qualification remains independently open.

## Release Gates

### Current source / application

- exact-head build/typecheck: PASS
- qualified astrology and differentiation corpus: PASS
- privacy/security/data-integrity gates: PASS
- Accessibility Device Acceptance: PASS
- Diamond Way synthesis: PASS
- Account Sign-In qualification: PASS on the current release line
- Xcode bootstrap/archive qualification: PASS on qualified heads
- Personal Chart Browser Acceptance: PASS after pinning the Playwright lane to Ubuntu 24.04
- signed Android AAB qualification: PASS
- iOS simulator/archive qualification: PASS

### Production runtime

- Railway exact-main deployment parity: **PASS** at `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b`
- production schema preflight: PASS
- Postgres storage/session startup: PASS
- live Compatibility API stale-backend defect: RESOLVED
  - issue #213 closed after Railway proxy evidence showed `GET /api/compatibility/ping` = HTTP 200

### External / owner/provider gates still open

- Apple subscription review resubmission from current **Developer Rejected** state when billing qualification is ready: OPEN — because these are the first auto-renewable subscriptions, Apple requires a **new iOS app version** in the same review submission as the unapproved subscription group/products\n- real iOS StoreKit purchase/restore/lifecycle qualification: OPEN
- real Google Play Billing purchase/restore/lifecycle qualification: OPEN
- App Store U.S. privacy/age/copy/legal-URL reconciliation: OPEN (#346)
- fresh Google Play Console tester/track/production-access receipt: **CAPTURED 2026-11-07** — production remains blocked at 1/12 opted-in testers and the 14-day requirement
- final current-build store screenshots / physical-device evidence where required: OPEN

## Active Release Tracking

Primary release tracker:
- issue #202 — Soul Codex 4.1 split-store launch: current release authority and external receipts

Current App Store metadata tracker:
- issue #346

Retired/superseded release issues:
- issue #213 — closed; stale Railway Compatibility backend resolved
- issue #299 — closed; 4.0.1 Android authority superseded by 4.1

## Release Decision

At the last verified pre-status-update checkpoint, source and web production were healthy and SHA-aligned at `8c149f6987b7aec2c32a809ebc3def8c62ea5c0b`. This status-only change must not be used as evidence that a later GitHub/Railway HEAD is already deployed.

The remaining blockers are primarily provider/store-owner evidence classes, not unresolved application architecture:

1. Complete real current-build StoreKit provider qualification before enabling iOS billing.
2. Complete real current-build Play Billing provider qualification before enabling Android billing.
3. Reconcile App Store U.S. metadata against the current 4.1 privacy/store packet.
4. Obtain fresh Play Console tester/track/production evidence before claiming Android production publication.
5. Preserve a new explicit frozen store-upload receipt whenever a new binary is actually selected for submission; do not mutate the Oct 24 historical receipt.

No production billing flag should be enabled merely because source CI, Railway deployment, subscription catalog configuration, or public App Store availability is green.
