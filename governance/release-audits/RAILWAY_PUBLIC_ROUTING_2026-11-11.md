# Railway Public Routing and Rollback Inventory — 2026-11-11

This is a **dated read-only provider receipt**, not an instruction to change a live service or a claim that future deployments share these values. Recheck Railway before acting.

## Public production traffic

- Railway project: `Soulcodex`, ID `3c68d6cc-a1cd-4c40-b8aa-4227e599b2c1`
- Production environment: `6930e018-39e3-4101-b65f-67f4e400e05c`
- Public web domain: **`https://soulcodex.up.railway.app`**
- Domain owner: **`soulcodex-recovery`**, service `974ff51a-5912-4403-8a52-5f3128f3dc6a`, port 8080
- Connected repository / branch: `Bboy9090/Ultimate-SoulCodex` / `main`
- Latest observed recovery deployment: `7cd25520-d6ba-41a2-bac7-9eb1c4d022a8`, **SUCCESS**, commit `d8c8fd6487f89ad23618faa101df3d1138a83947`
- Provider deployment logs identify `Soul Codex server running on port 8080`, release `4.1.0 d8c8fd6487f89ad23618faa101df3d1138a83947 foundation-v4`, Postgres-backed storage, Postgres sessions and readiness endpoint registration.
- Railway edge request logs for `soulcodex.up.railway.app` show **HTTP 200** for `/`, `/privacy`, `/app-ads.txt` and the current asset bundle.
- Railway environment status: recovery service **online**, 1/1 running replica, zero current provider warnings/criticals.

**Evidence boundary:** These are authoritative provider-side runtime and routing observations. A browser request returning HTTP 200 cannot independently prove a native purchase, exact App Store/Play binary, or the private account settings. This receipt does not imply production billing is enabled.

## Intentionally dormant rollback lane

- Railway service: **`soulcodex`**, ID `63db5615-61ad-4294-a34e-c05713023fd7`
- Service domain: `soulcodex-rollback-20261031.up.railway.app` (not the public production domain)
- Source: same GitHub repository and branch `main`
- **Watch-pattern override:** `__rollback_archive_no_auto_deploy__/**`
- Consequence: regular `main` commits generate **SKIPPED** deployment events for this service **by design**, including `d8c8fd6487f89ad23618faa101df3d1138a83947`.
- Railway reports its active earlier rollback deployment `d429bcd2-d7b5-4bce-86e5-90d2bd04ede9` (SUCCESS, October 31) as online with 1/1 replica and **seven warnings**; a separate later attempt `4cdf2725-3c04-4adb-9aa7-674eaffe897a` failed on October 31.
- This lane must **not** be re-enabled, redeployed, removed or given the public domain merely to clear a SKIPPED status. It is not the public release pipeline. Keeping a second running replica may consume resources, so cost review is appropriate before any owner-approved shutdown.

## Build configuration drift and controlled resolution

The checked-in `railway.json` requires `build.builder = "DOCKERFILE"` and `Dockerfile`. Both provider service descriptions currently show a **Railpack** service-level builder override (`build.builder = "RAILPACK"`). The healthy recovery service should not be silently switched to Dockerfile or restarted solely to reconcile this discrepancy.

Required future process: validate exact Dockerfile behavior and startup on an isolated, cost-controlled qualification lane; compare health/readiness, schema and session behavior, confirm zero billing toggles, then propose an explicitly approved single-service cutover with rollback. Do not accidentally create a third billable production replica.

## Automated monitoring

`.github/workflows/public-runtime-parity.yml` runs deterministic checks on PRs and makes a **read-only** HTTP request to `/health` and `/ready` during scheduled or manual runs. It records current-vs-stale source SHA, readiness, API contract and durable Postgres evidence. It does **not** access Railway credentials or alter the domain/service.

A green PR/test run is not a provider receipt. Only the actual scheduled/manual JSON artifact proves what the public endpoint returned at the time of observation.

## Store boundary

Android versionCode `4000016` is the documented Google Play closed-test upload; production-access eligibility still needs real opted-in testers. iOS native subscription purchase/restore is not provider-qualified. Never promote a new store candidate or enable billing from this Railway source deployment alone.
