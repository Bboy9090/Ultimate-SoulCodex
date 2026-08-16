# Priority 1: Store Ingestion Procedures

**Status**: ACTIVE  
**Release Version**: `v4.0.0-rc.2`  
**Release SHA**: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`

## Goal

Prove that Google Play and App Store Connect accept the exact signed rc.2 binaries and associate them with the expected Soul Codex app identities.

Store ingestion does not prove real-hardware behavior, tester delivery, production review, or public release.

---

## Android: Google Play Internal Testing

### Artifact identity

- File: `app-release.aab`
- SHA-256: `14a07d97b27eb581471e57d83069f9eb60b4c6d05553b7f077c70dc662052fcd`
- Version name: `4.0.0-rc.2`
- Version code: `4000002`
- Target track: Internal testing

### Procedure

1. Open Play Console and select Soul Codex.
2. Open **Testing → Internal testing**.
3. Create or edit the rc.2 internal-test release.
4. Upload the exact verified `app-release.aab`.
5. Confirm Play recognizes version code `4000002`.
6. Add release notes as required.
7. Complete any account-side declarations required by Play Console.
8. Save/publish the internal-test release.
9. Record the exact console status and any blocking validation or policy messages.
10. Record whether a tester opt-in/install path becomes available.

### PASS

Android ingestion PASS requires:

- AAB accepted without signing/upload-key mismatch
- version code `4000002` recognized
- release exists on the Internal testing track
- no blocking bundle-validation/policy error prevents tester distribution

The app does not need to be publicly searchable. Public Play listing is a later state.

### FAIL

FAIL if Play rejects the binary, version identity, signing key, bundle metadata, or account/policy state.

If the binary must change, do not overwrite rc.2 build identity. Create a new build/version code and preserve the failed receipt.

---

## iOS: App Store Connect / TestFlight ingestion

### Artifact identity

- File: `Ultimate Soul Codex.ipa`
- SHA-256: `8a8e33beb7931e2c0459129eebecff8cf0e457458867cfdb3b3a39826b8522f0`
- Bundle ID: `app.soulcodex.ios`
- Marketing version: `4.0.0`
- Build number: `4000002`

### Procedure

1. Confirm the Soul Codex app record exists in App Store Connect.
2. Upload the exact verified IPA using an Apple-supported upload path such as Transporter or Xcode upload tooling.
3. Confirm Apple accepts the upload transaction.
4. Record the upload timestamp.
5. Confirm App Store Connect associates the binary with bundle ID `app.soulcodex.ios`.
6. Confirm version/build identity `4.0.0 (4000002)`.
7. Record the exact Apple processing state.
8. Complete required account-side export-compliance or metadata questions if presented.
9. Do not resubmit merely because processing is taking longer than expected.
10. Record any validation, entitlement, signing, export, or metadata blockers.

### PASS

iOS ingestion PASS requires:

- upload accepted without certificate/provisioning/bundle validation failure
- version `4.0.0`, build `4000002` associated with Soul Codex
- build enters Apple processing and is visible in App Store Connect

Completion of processing and tester delivery belongs to Priority 4.

### FAIL

FAIL if Apple rejects the binary at upload/ingestion or cannot associate it with the expected app identity.

If a binary change is required, increment the build number and preserve the failed rc.2 ingestion receipt.

---

## Receipt

Record all results in `RC-2-STORE-INGESTION-RECEIPT.md`.

**Overall Priority 1 PASS** requires both platform ingestion sections to PASS.
