# Soul Codex — Mobile Build Guide

## Quick Start (Debug Builds)

Both workflows are manual dispatch — go to GitHub Actions tab, select the workflow, click "Run workflow."

### Android Debug APK (test on your phone)
1. Go to **Actions → Build Android → Run workflow**
2. Select `debug`
3. Download the APK artifact when done
4. Transfer to your Android phone and install (enable "Install from unknown sources")

### iOS Development Build
1. Go to **Actions → Build iOS → Run workflow**
2. Select `development`
3. Builds for iOS Simulator (no signing needed)

---

## Release Builds (Store Submission)

### Android — Google Play Store

#### One-time: Create signing keystore
Run this on your machine (keep the keystore file safe — you can never recreate it):
```bash
keytool -genkey -v -keystore soul-codex-release.keystore \
  -alias soul-codex -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Soul Codex, O=Soul Codex, L=Bronx, ST=NY, C=US"
```

#### One-time: Add GitHub secrets
Go to **repo Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `ANDROID_KEYSTORE` | Base64 of your keystore: `base64 -i soul-codex-release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | The store password you chose |
| `ANDROID_KEY_ALIAS` | `soul-codex` |
| `ANDROID_KEY_PASSWORD` | The key password you chose |

Add this repository variable for both mobile workflows:

| Variable | Value |
|---|---|
| `VITE_API_URL` | The public HTTPS origin serving the production Soul Codex API, with no trailing `/api` |

#### Build & Submit
1. Go to **Actions → Build Android → Run workflow**
2. Select `release-aab` (Google Play requires AAB format)
3. Download the `.aab` artifact
4. Go to [Google Play Console](https://play.google.com/console)
5. Create app → Upload the AAB → Fill in store listing → Submit for review

---

### iOS — App Store

#### One-time: Create signing certificate and profile
1. Log into [Apple Developer](https://developer.apple.com)
2. Go to **Certificates, Identifiers & Profiles**
3. Create an **App ID** with bundle ID: `app.soulcodex.ios`
4. Create a **Distribution Certificate** (iOS Distribution)
5. Export as `.p12` file with a password
6. Create an **App Store Provisioning Profile** for your App ID
7. Download the `.mobileprovision` file

The project and `scripts/ExportOptions.plist` currently use Team ID `86NUJ8M3B8`. Verify that this is the Team ID that owns `app.soulcodex.ios` before creating the provisioning profile.

#### One-time: Add GitHub secrets
| Secret | Value |
|--------|-------|
| `IOS_CERTIFICATE_P12` | Base64 of your .p12: `base64 -i Certificates.p12` |
| `IOS_CERTIFICATE_PASSWORD` | Password for the .p12 |
| `IOS_PROVISIONING_PROFILE` | Base64 of your .mobileprovision |

#### Build & Submit
1. Go to **Actions → Build iOS → Run workflow**
2. Select `app-store`
3. Download the `.ipa` artifact
4. Upload via [Transporter app](https://apps.apple.com/app/transporter/id1450874784) or `xcrun altool`
5. Go to [App Store Connect](https://appstoreconnect.apple.com) → Submit for review

The workflows build signed artifacts; they intentionally do not submit or release them automatically.

## Required Store Console Work

Code cannot complete these account-bound steps:

- Verify `https://soulcodex.app/privacy`, `/support`, and `/account-deletion` are publicly reachable after deployment.
- Complete Apple App Privacy and Google Play Data Safety from the shipped app behavior and `PrivacyPage.tsx`.
- Upload screenshots and the Google Play feature graphic.
- Complete age/content-rating, target-audience, ads, and app-access questionnaires.
- Provide review notes and any credentials needed to exercise premium entitlement.
- Run TestFlight and Google Play internal testing on physical devices before production submission.

---

## Local Build (Android only on Windows)

If you have Android Studio installed:
```bash
npm run cap:build        # Build web + sync
npm run cap:android      # Open in Android Studio
```
Then build from Android Studio: **Build → Generate Signed Bundle / APK**

---

## Icon & Splash Updates

When you have a new master icon:
1. Replace `assets/icon-master.png` (1024x1024, square, no rounded corners)
2. Run `npm run cap:icons`
3. Run `npm run cap:build` to sync to native projects
4. Commit and push — CI will use the new icons

---

## Version Bumps

Before each store submission, update version numbers in:
- `android/app/build.gradle` → `versionCode` (increment by 1) and `versionName`
- `ios/App/App/Info.plist` → `CFBundleShortVersionString` and `CFBundleVersion`
- `package.json` → `version`
