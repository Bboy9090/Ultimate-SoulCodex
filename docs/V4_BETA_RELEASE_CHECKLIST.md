# Soul Codex V4 Beta Release Checklist

## Scope lock

- No new symbolic systems
- No major redesigns
- No new navigation concepts
- No V5 work
- Only fixes, polish, validation, accessibility, performance, and release evidence

## Source control

- [ ] Working tree clean
- [ ] Target branch rebased or fast-forwarded from `main`
- [ ] Exact candidate commit SHA recorded
- [ ] Pull request diff reviewed
- [ ] No unresolved review threads

## Local validation

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm run check:workspaces`
- [ ] `npm run test`
- [ ] `npm run build:workspaces`
- [ ] `npm run build`
- [ ] `npm audit --omit=dev --audit-level=high`
- [ ] `npm audit --audit-level=high`

## Product journey

- [ ] Create or open a profile
- [ ] Unknown birth-time behavior remains honest
- [ ] Open Reading works for server and `local-*` profiles
- [ ] Compatibility never presents a blank transition
- [ ] Reading sections progress rather than repeat
- [ ] Evidence and limitations remain inspectable
- [ ] Timeline distinguishes symbolic cycles from lived events
- [ ] Mobile launcher does not obstruct browser controls
- [ ] Offline reload works where supported

## Trust contract

- [ ] No invented Moon, Rising, biography, trauma, diagnosis, memory, or relationship history
- [ ] Verified, deterministic, supported, tentative, and unknown claims remain distinguishable
- [ ] Every reading includes practical action and limitations
- [ ] User correction and lived experience remain authoritative

## Release operations

- [ ] Deployment succeeds
- [ ] Production health endpoint passes
- [ ] Homepage and deep routes load
- [ ] Rollback target recorded
- [ ] Release notes written
- [ ] Store or beta assets reviewed
- [ ] Validation evidence identifies whether it came from local testing, hosted CI, deployment, or real hardware

## Version ladder

1. `v4.0.0-beta1` after feature freeze and passing local validation
2. `v4.0.0-beta2` after beta defect repair
3. `v4.0.0-rc1` after real-device and deployment validation
4. `v4.0.0` only after all release receipts exist

A tag is a milestone marker, not proof by itself. Humanity has produced enough ceremonial labels without supporting evidence.
