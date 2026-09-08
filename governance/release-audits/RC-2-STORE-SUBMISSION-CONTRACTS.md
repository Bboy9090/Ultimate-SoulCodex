# RC.2 Store Submission Contracts

**Status**: Signed artifacts complete. Store ingestion is the next active gate. Physical hardware validation is pending store-delivered builds.  
**Last Updated**: 2026-08-15  
**Release SHA**: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`  
**RC Version**: `v4.0.0-rc.2`

---

## Governing separation

**Signed binaries prove that Soul Codex can build and sign distributable native artifacts. They do not prove store ingestion, store delivery, real-hardware runtime behavior, store acceptance, or production release.**

| State | Proven | Not yet proven | Required receipt |
|---|---|---|---|
| **Signed artifacts** | Toolchain, signing identity, binary integrity | Store acceptance, installability, runtime behavior | Artifact digest + signer verification + release SHA |
| **Store ingestion** | Store accepts the uploaded binary and associates it with Soul Codex | Real-device behavior, public review/acceptance | Console build record + version/build identity |
| **Physical hardware** | Store-delivered build installs and passes bounded smoke on real hardware | Wider-device coverage, public review | Device/OS/build receipt + smoke evidence |
| **Deployment proof** | Staging deploy/rollback/redeploy is reproducible | Store acceptance, production readiness | Three-cycle deployment receipt |
| **Store acceptance** | Required store review/publication state is satisfied | Continued production health | Store status/listing receipt |
| **Production release** | Exact released version is live and passes post-release smoke | Long-term support | Production deployment + smoke receipt |

No future agent may collapse these states into one another.

---

## Signed artifacts: complete

### Android

- Artifact: `app-release.aab`
- Size: `6,664,722` bytes
- Release SHA: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`
- Version name: `4.0.0-rc.2`
- Version code: `4000002`
- AAB SHA-256: `14a07d97b27eb581471e57d83069f9eb60b4c6d05553b7f077c70dc662052fcd`
- GitHub artifact ID: `9256764910`
- Artifact ZIP digest: `sha256:4eae8176145d8403ce611c32545d253e4f1cf5189def7b0f487dd950d285099e`
- Upload keystore: decoded and verified
- Alias/password: verified with `keytool`
- Bundle signing: PASS
- `jarsigner`: `jar verified`
- Target API: `36`

**Classification**: signed Android distributable artifact proven. Google Play ingestion and hardware validation remain separate.

### iOS

- Artifact: `Ultimate Soul Codex.ipa`
- Release SHA: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`
- Marketing version: `4.0.0`
- Build number: `4000002`
- IPA SHA-256: `8a8e33beb7931e2c0459129eebecff8cf0e457458867cfdb3b3a39826b8522f0`
- GitHub artifact ID: `9254271930`
- Artifact ZIP digest: `sha256:a77b4b3b2cb8f0943c5d51f0534cad19c5b68d35b7f3388cf0f0c766bcbc0ea0`
- Apple Distribution certificate/private key: matched and current
- App Store provisioning profile: team, bundle ID, profile class, and current distribution certificate verified
- Xcode archive: PASS
- IPA export: PASS

**Classification**: signed iOS distributable artifact proven. App Store Connect/TestFlight ingestion and hardware validation remain separate.

---

## Priority 1: store ingestion

### Android: Google Play internal testing

**Goal**: prove that Google Play accepts the exact signed rc.2 AAB and serves it through the internal testing track.

**Upload target**: Play Console → Testing → Internal testing.

**Upload artifact**: `app-release.aab` from the verified rc.2 artifact package.

**Expected identity after ingestion**:
- package/bundle identity: existing Soul Codex Android application
- version name: `4.0.0-rc.2`
- version code: `4000002`

**Success criteria**:
- AAB accepted without signing/key mismatch
- version code `4000002` recognized
- release appears in the internal testing track
- tester opt-in/install link becomes available
- no blocking policy or bundle-validation error

**Tester rule**: internal testing supports up to 100 testers. For personal developer accounts created after November 13, 2023, production access later requires a closed test with at least 12 testers continuously opted in for 14 days before applying for production access. That later production-access rule is not the internal-ingestion gate.

**Receipt to record**:
```text
Android store ingestion
- Release SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Track: Internal testing
- Version name: 4.0.0-rc.2
- Version code: 4000002
- Console status: [status]
- Upload accepted: PASS/FAIL
- Tester link available: PASS/FAIL
- Timestamp: [time]
- Blocking messages: [none/messages]
```

### iOS: App Store Connect / TestFlight

**Goal**: prove that App Store Connect accepts the exact signed rc.2 IPA, processes it, and exposes build `4000002` for TestFlight.

**Upload artifact**: `Ultimate Soul Codex.ipa` from the verified rc.2 artifact package.

**Supported upload paths**: Transporter, supported Xcode upload tooling, or another Apple-supported App Store Connect upload path.

**Expected identity after ingestion**:
- bundle ID: `app.soulcodex.ios`
- marketing version: `4.0.0`
- build number: `4000002`

**Success criteria**:
- upload accepted without certificate/provisioning/bundle validation error
- Apple associates the build with Soul Codex
- build `4000002` enters Apple processing
- processing completes and the build appears in TestFlight/App Store Connect
- internal tester group can be assigned the build

Apple does not provide a fixed processing SLA in this contract. The governing receipt is the actual App Store Connect state, not an estimated 24–48 hour window.

**Tester rule**: TestFlight supports up to 100 internal App Store Connect testers. External testing supports up to 10,000 testers and may require Beta App Review.

**Receipt to record**:
```text
iOS store ingestion
- Release SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Bundle ID: app.soulcodex.ios
- Version: 4.0.0
- Build: 4000002
- Upload accepted: PASS/FAIL
- Processing state: [state]
- TestFlight visible: PASS/FAIL
- Internal group assigned: PASS/FAIL
- Timestamp: [time]
- Blocking messages: [none/messages]
```

---

## Priority 2: physical hardware validation

**Precondition**: use the store-delivered build whenever possible. A sideloaded build can diagnose a store-ingestion failure but does not replace the final store-delivery receipt.

Minimum evidence set: one real iOS device and one real Android device.

### Bounded 11-point smoke

Run on both platforms against the ingested rc.2 build:

1. Clean install and first launch
2. Local profile creation
3. Force quit / relaunch / profile persistence
4. Reading + evidence + limitations
5. Timeline navigation
6. Compatibility journey
7. Explicit online astronomy verification
8. Airplane-mode/offline reload and local reading access
9. Sign-in/account path
10. Premium/payment boundary without completing a charge
11. Rotation/background/resume and crash-free completion

**Pass rule**: all checkpoints pass without crash, silent data loss, fabricated evidence state, or a blocking network dependency where offline behavior is promised.

### Hardware receipt

Create `governance/release-audits/RC-2-HARDWARE-VALIDATION-RECEIPT.md`.

```text
Device 1: iOS
- Model: [model]
- OS: [version]
- Distribution source: TestFlight
- App version/build: 4.0.0 (4000002)
- Tester: [name]
- Date: [date]
- 11-point smoke: PASS/FAIL
- Crash/data-loss result: PASS/FAIL
- Notes/evidence: [details]

Device 2: Android
- Model: [model]
- OS/API: [version]
- Distribution source: Google Play internal testing
- App version/code: 4.0.0-rc.2 (4000002)
- Tester: [name]
- Date: [date]
- 11-point smoke: PASS/FAIL
- Crash/data-loss result: PASS/FAIL
- Notes/evidence: [details]
```

---

## Priority 3: staging deployment and rollback proof

**Goal**: prove that rc.2 can be deployed, rolled back to the previous known-good deployment, and redeployed without manual repair.

Sequence:
1. Deploy exact rc.2 SHA to staging.
2. Verify `/health` and bounded core journey.
3. Roll back to the recorded previous known-good SHA/deployment.
4. Repeat health + journey smoke.
5. Redeploy exact rc.2 SHA.
6. Repeat health + journey smoke.

Create `governance/release-audits/RC-2-DEPLOYMENT-RECEIPT.md`.

```text
Deploy 1: rc.2
- SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Deployment ID: [id]
- Health: PASS/FAIL
- Journey smoke: PASS/FAIL

Rollback
- SHA/deployment: [previous]
- Deployment ID: [id]
- Health: PASS/FAIL
- Journey smoke: PASS/FAIL

Redeploy: rc.2
- SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Deployment ID: [id]
- Health: PASS/FAIL
- Journey smoke: PASS/FAIL

Overall: PASS/FAIL
```

---

## Priority 4: store review / acceptance

Store ingestion and store acceptance are not the same gate.

### Apple
- Internal TestFlight can begin after Apple processing and internal-group assignment.
- External TestFlight may require Beta App Review.
- Public App Store release requires the applicable App Review/publication state.

### Google Play
- Internal testing is an early QA track, not public production acceptance.
- If the developer account is a personal account created after November 13, 2023, satisfy the applicable closed-testing requirement before applying for production access.
- Production publication is recorded separately from internal/closed testing.

---

## Xcode Cloud anomaly

The GitHub-mirrored Xcode Cloud check for the rc.2 SHA has remained `in_progress`, while the independent GitHub macOS signing lane produced and verified the signed App Store IPA.

**Operational decision**: this Xcode Cloud anomaly does not block Priority 1 store ingestion. The independently verified IPA may be submitted to App Store Connect.

**Formal contract caveat**: the code-level function `canDeclareV4NativeDistributableCandidate(...)` still requires `xcodeCloudArchive=true`. Therefore, until that code contract is deliberately amended or the Xcode Cloud receipt completes, agents must not claim that this specific predicate has passed. Store-ingestion work may proceed independently.

Do not modify the frozen rc.2 application SHA merely to change this evidence predicate.

---

## Release ladder

```text
IMPLEMENTED          ✅
INTEGRATED           ✅
EMULATOR-VALIDATED   ✅
SIGNED ARTIFACTS     ✅

STORE INGESTION      ⏭ active next gate
PHYSICAL HARDWARE    ⏳ pending store-delivered builds
DEPLOYMENT PROOF     ⏳ pending
STORE ACCEPTANCE     ⏳ pending
PRODUCTION RELEASE   ⏳ pending
```

---

## Final declaration rule

No agent may declare rc.2 **shipped**, **publicly released**, or **ready for users** until the required evidence for all applicable release gates is recorded.

At minimum, final public-release evidence must include:
- signed iOS and Android artifact receipts
- successful store ingestion for both platforms
- physical hardware validation on at least one real iOS and one real Android device
- staging deploy/rollback/redeploy proof
- applicable Apple/Google store acceptance/publication state
- production deployment and post-deploy smoke receipt

Anything less is a proof in progress, not a shipped release.
