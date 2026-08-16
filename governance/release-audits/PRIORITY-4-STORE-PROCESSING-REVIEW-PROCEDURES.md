# Priority 4: Store Processing and Review Procedures

**Status**: Awaiting Priority 1 store-ingestion receipts  
**Release Version**: `v4.0.0-rc.2`  
**Release SHA**: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`  
**Android version code**: `4000002`  
**iOS version/build**: `4.0.0 (4000002)`

---

## Governing rule

Store processing is not store acceptance, physical hardware validation, or production release.

Priority 4 proves that the stores have processed the exact rc.2 binaries far enough for tester distribution and that tester access remains usable. Public production acceptance requires its own later receipt.

Priority 4 must not be marked PASS from estimated timing. Only observed console/tester states count.

---

## Preconditions

Priority 1 must already have produced store-ingestion evidence:

### Google Play
- `app-release.aab` accepted
- version code `4000002` recognized
- release exists on the Internal testing track

### Apple
- `Ultimate Soul Codex.ipa` accepted by App Store Connect
- bundle ID `app.soulcodex.ios`
- version `4.0.0`
- build `4000002`
- build has entered or completed Apple processing

If either upload is rejected, Priority 4 is not started for that platform. Record the rejection in `RC-2-STORE-INGESTION-RECEIPT.md` and repair/resubmit under a new immutable build identity if the binary changes.

---

# Google Play Internal Testing

## Contract

Internal testing is the first distribution track for rc.2. It supports up to 100 testers and is intended for fast QA distribution through Google Play.

Internal testing does **not** prove public Play Store listing, production approval, or search visibility. The canonical access proof is the internal-testing release plus a working tester opt-in/install path.

Feedback from test users is treated as testing feedback and must not be conflated with the app's public rating.

## Step 1: Confirm release state

In Play Console:

1. Open Soul Codex.
2. Open **Testing → Internal testing**.
3. Confirm version code `4000002` is attached to the rc.2 release.
4. Record the exact console status shown.
5. Record any blocking policy, signing, bundle, country, or account messages.

**PASS condition**: release is accepted on Internal testing with no blocking validation error.

## Step 2: Confirm tester access

1. Confirm an internal tester list/group exists.
2. Confirm at least one tester account is included.
3. Obtain the tester opt-in/install link provided by Play Console.
4. Open the link using an enrolled tester account.
5. Confirm the tester can opt in or is already enrolled.
6. Confirm Play offers the rc.2 build for installation.

Do not require the app to appear in ordinary public Play Store search. Internal-test distribution is proven by the tester path, not public discoverability.

**PASS condition**: tester can reach and install the internal build through Google Play.

## Step 3: Observe initial health

Record, when available:

- tester/install count
- crash/ANR signals
- private tester feedback
- device compatibility warnings
- blocking policy notices

A lack of telemetry immediately after first distribution is not itself a failure. A repeatable launch crash, install failure, or blocking policy message is a failure and must be routed to the appropriate gate.

## Google result

Record:

```text
Google Play Priority 4
- Release SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Version code: 4000002
- Track: Internal testing
- Console status: [status]
- Tester group configured: PASS/FAIL
- Tester link works: PASS/FAIL
- Store-delivered install available: PASS/FAIL
- Crash/ANR blockers: [none/details]
- Policy blockers: [none/details]
- Timestamp: [ISO 8601]
- Result: PASS/FAIL/MONITORING
```

Priority 4 Google PASS requires a usable internal-test distribution. It does not require public listing or production approval.

---

# Apple App Store Connect / TestFlight

## Contract

Apple processing timing is variable. This procedure intentionally defines no fixed SLA.

TestFlight supports up to 100 **internal App Store Connect users with access to the app**. External testing supports up to 10,000 testers. External TestFlight builds may require TestFlight App Review; the first build submitted for external testing requires review, while later builds may not require the same full review.

Internal TestFlight distribution is not production App Review and must not be recorded as App Store acceptance.

## Step 1: Confirm build processing

In App Store Connect:

1. Open Soul Codex.
2. Open the **TestFlight** area.
3. Locate version `4.0.0`, build `4000002`.
4. Record the exact Apple status shown.
5. If Apple requests export-compliance or other metadata, record and complete only the required account-side action.
6. Do not resubmit an identical binary merely because processing is taking longer than expected.

**PASS condition for processing**: build `4000002` completes processing and is eligible to be assigned to an internal TestFlight group.

## Step 2: Assign internal testers

1. Create or select an internal TestFlight group.
2. Add eligible App Store Connect users, up to the platform limit.
3. Add build `4000002` to the group.
4. Enter `What to Test` information when prompted.
5. Confirm testers receive access through TestFlight.

**PASS condition**: at least one eligible internal tester can see version `4.0.0` build `4000002` in TestFlight.

## Step 3: Confirm store-delivered install path

1. On a real iOS/iPadOS device, open TestFlight as the enrolled internal tester.
2. Confirm Soul Codex is listed.
3. Confirm version/build identity is `4.0.0 (4000002)`.
4. Confirm Install/Update begins successfully.

Actual app behavior after installation belongs to **Priority 2 physical hardware validation**. Priority 4 records only that TestFlight delivery is functioning.

## Step 4: Optional external TestFlight

External testing is optional and not required to close internal-processing Priority 4.

If external testing is used:

1. Create an external group.
2. Add build `4000002`.
3. Provide required beta-test information.
4. Submit for TestFlight App Review when required.
5. Record actual Apple review state.
6. Do not assume or encode a fixed review-duration SLA.

## Apple result

Record:

```text
Apple Priority 4
- Release SHA: 2e02d1023ddeb4e453236c34f2d4d2b7f6948957
- Bundle ID: app.soulcodex.ios
- Version: 4.0.0
- Build: 4000002
- Processing status: [status]
- Internal group assigned: PASS/FAIL
- Internal tester sees build: PASS/FAIL
- TestFlight install available: PASS/FAIL
- Export-compliance blockers: [none/details]
- Apple processing/review blockers: [none/details]
- Timestamp: [ISO 8601]
- Result: PASS/FAIL/MONITORING
```

Priority 4 Apple PASS requires processed build plus usable internal TestFlight delivery. It does not mean production App Review has passed.

---

# Interaction with Priority 2 hardware validation

Priority 4 and Priority 2 touch the same tester delivery path but prove different things:

- **Priority 4** proves the store can deliver rc.2 to the tester.
- **Priority 2** proves rc.2 works correctly after that store-delivered installation on real hardware.

Once a tester can install the store-delivered build, Priority 2 may execute immediately. There is no reason to wait for a monitoring window before beginning the hardware smoke.

A hardware crash discovered during Priority 2 is recorded as a hardware/runtime failure even though store processing itself may remain PASS.

---

# Interaction with store acceptance

Neither Play Internal Testing nor internal TestFlight constitutes public store acceptance.

## Android production path

After internal and hardware validation, the release may advance through the testing/production path applicable to the developer account. Any closed-test production-access requirement is account-specific and must be verified in Play Console before promotion.

## Apple production path

After TestFlight and hardware validation, the selected build must still be submitted to production App Review and reach the required distribution state before App Store acceptance is earned.

---

# Pass / fail rules

## PASS

Priority 4 overall PASS requires both:

- Google Play Internal testing can deliver version code `4000002` to an enrolled tester.
- Apple TestFlight can deliver version `4.0.0` build `4000002` to an eligible internal tester.

## MONITORING

Use MONITORING when a store has accepted the binary but processing or tester assignment has not completed yet.

## FAIL

Use FAIL for a blocking condition such as:

- store rejects the submitted binary
- signing identity or upload key mismatch
- processed build cannot be assigned/delivered to testers
- tester opt-in/install path is broken
- store policy blocks distribution

Runtime crashes after successful store delivery belong primarily to Priority 2, although the Priority 4 receipt should cross-reference them.

---

# Evidence receipt

Priority 4 evidence may be recorded in a dedicated `RC-2-STORE-PROCESSING-REVIEW-RECEIPT.md` or appended to the store-ingestion receipt, but the state names must remain separate:

- INGESTED
- PROCESSING
- INTERNAL TESTING AVAILABLE
- HARDWARE VALIDATED
- PRODUCTION REVIEW
- STORE ACCEPTED

Never replace those states with a single word such as `shipped` until every final release gate has actually passed.
