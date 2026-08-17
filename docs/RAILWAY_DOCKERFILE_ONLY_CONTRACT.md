# Railway Dockerfile-Only Build Contract

Soul Codex production Railway services must build from the repository root `Dockerfile` and from no other build system.

## Repository contract

The only accepted Railway build configuration is:

- `Dockerfile` at repository root
- `railway.json` with `build.builder = "DOCKERFILE"`
- `railway.json` with `build.dockerfilePath = "Dockerfile"`

Repository-level competing build/start fallbacks are forbidden, including `Procfile`, `nixpacks.toml`, `nixpacks.json`, `railpack.toml`, `railpack.json`, `railway.toml`, and equivalent `.railway/` fallbacks.

`scripts/verify-railway-dockerfile-only.mjs` and the `Railway Dockerfile Only` workflow enforce this rule.

## Railway dashboard contract

A Railway service-level dashboard override can supersede repository configuration. For the production service behind `soulcodex.up.railway.app`:

1. Effective builder must be **Dockerfile**, never Railpack or Nixpacks.
2. The service must be connected to `Bboy9090/Ultimate-SoulCodex` and the intended production branch.
3. The domain must be attached to that exact production service/environment.
4. A release promotion must create/build a deployment for the intended commit SHA. A plain **Redeploy** of an older deployment is not evidence that Railway fetched a newer Git commit.
5. Release acceptance requires the live `/health` identity and Compatibility probes to match the intended release. A dashboard status of `Deployed` by itself is insufficient evidence.

## rc.3 incident note

Issue #213 established why this contract is necessary: repeated production probes returned the same pre-rc.3 `{"status":"ok"}` payload because the service had not built the rc.3 commit, and the effective Railway service builder was reported as Railpack while the repository contract specified Dockerfile.

The source/container candidate and the live deployment remain separate evidence layers. Do not close a live-integration issue until the live domain proves the expected release identity.
