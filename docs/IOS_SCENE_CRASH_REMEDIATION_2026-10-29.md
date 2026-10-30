# iOS build 346: scene lifecycle launch crash

## Verified cause

Both owner-provided App Review crash reports for version 4.1.0/build 346 show EXC_BREAKPOINT / SIGTRAP on thread 0 at `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`, on iOS 27.0 (24A437). Apple reviewed on iPad Air (5th generation). This is a native launch failure before the chart or reading code runs; it is distinct from the earlier EULA metadata rejection.

The current c06aea7 candidate also lacked a scene manifest/delegate. Its earlier simulator pass on an older OS did not qualify iOS 27.

Attachment SHA-256:
- 02D95125: `1b0f243b6c6060c3fdbf6937010c7873f1096bb4a717c83a7b9e7666491a03af`
- E24BE6F3: `007a68ebd2903948e7daf11506020ef95ae84be6b402c64ca64060dbd7afff0a`

Raw device crash reports remain private attachments; they are not committed to this public repository.

## Repair

- Adopt a single application UIScene, register SceneDelegate in the Xcode Sources phase and Info.plist, and remove legacy storyboard application startup.
- Construct SoulCodexBridgeViewController in the scene so native billing and session plugins remain registered.
- Forward cold connection options, warm URL contexts and universal links through Capacitor SceneDelegateProxy.
- Keep external-display roles from starting a second profile/web instance.
- Upgrade matching Capacitor JS/native/CLI and Swift packages to exact 8.6.0. Initial 8.5.0 qualification revealed critical proxy and transitive CLI advisories; that version was rejected before commit. Final full npm audit reports zero findings.
- Advance iOS source build 4000012 to 4000013. Android remains candidate 4000014 and needs a fresh artifact after this dependency change. Xcode Cloud build counters remain separate from source build settings.
- Require the Xcode 27 runner, iOS 27 runtime, both iPhone and iPad launches, live PID survival, first-paint screenshots and fatal-log scans including scene traps. No older runtime may stand in for the reviewed environment.

## Local validation and limits

- 26 focused native/toolchain/release tests passed.
- 345 tests selected from active release/security/native workflows passed.
- TypeScript, workspace build, production Capacitor build and iOS sync/patch passed.
- Full npm audit: 0 vulnerabilities.
- A broad all-root test invocation includes database-required and historical contracts outside that selection. The changed tree has 968 passes / 24 failures; unchanged c06aea7 has 965 passes / the identical 24 failure names under the same installed graph. The three added scene tests pass. Retain these failures as existing release debt; do not represent the entire root suite as green.
- Local Mac has Xcode 26.5/iOS 26.5 only; registered physical phones/tablet are unavailable. No iOS 27 device validation or new App Store submission is claimed here.

## Promotion and rollback

Keep PR 606 draft until fresh exact-head native runtime/archive/signature evidence exists. Earlier c06 artifacts cannot qualify this revision. Revert this commit to roll back; build 346 remains rejected and must not be resubmitted as a repaired binary.

References: https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle and https://capacitorjs.com/docs/updating/8-5 (scene adoption), https://github.blog/changelog/2026-10-15-xcode-27-runner-image-generally-available/ (runner).
