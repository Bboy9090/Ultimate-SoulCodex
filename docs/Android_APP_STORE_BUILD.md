# Android App Store Build Workflow

## Overview

This document explains how to build and submit the Ultimate SoulCodex Android app to Google Play Store using the GitHub Actions workflow.

## Workflow File

- **Location**: `.github/workflows/build-android.yml`
- **Trigger**: Manual workflow dispatch (`workflow_dispatch`)
- **Platform**: Ubuntu Latest
- **Timeout**: 45 minutes
- **Java**: Temurin JDK 21
- **Gradle**: Cached for faster builds

## Build Types

### Debug Build
- **Configuration**: Debug
- **Signing**: None (unsigned)
- **Output**: Debug APK
- **Use Case**: Local testing and CI validation
- **Device**: Any Android device or emulator

### Release APK
- **Configuration**: Release
- **Signing**: Required (keystore + credentials)
- **Output**: Signed `.apk` file
- **Use Case**: Direct APK distribution
- **Note**: APKs are deprecated by Google Play in favor of AAB

### Release AAB (Android App Bundle)
- **Configuration**: Release
- **Signing**: Required (keystore + credentials)
- **Output**: Signed `.aab` file
- **Use Case**: Google Play Store submission (recommended)
- **Advantage**: Smaller downloads, dynamic feature delivery

## Prerequisites

### 1. Google Play Developer Account
- Developer account with billing setup
- Application created in Google Play Console
- Package name: `app.soulcodex.main`

### 2. Android Signing Key
Create a keystore file for signing releases:

```bash
# Generate keystore (one-time)
keytool -genkey -v -keystore soul-codex-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias soul-codex-key

# Encode as base64 for GitHub
base64 -i soul-codex-release.keystore -o keystore.base64
```

### 3. GitHub Secrets Setup

Configure the following secrets in GitHub (Settings → Secrets and variables → Actions):

#### `ANDROID_KEYSTORE`
Base64-encoded Android keystore file.

**How to create:**
1. Generate keystore (see above)
2. Encode as base64:
   ```bash
   base64 -i soul-codex-release.keystore -o keystore.base64
   ```
3. Add to GitHub as secret `ANDROID_KEYSTORE`

#### `ANDROID_KEYSTORE_PASSWORD`
Password used to create the keystore.

#### `ANDROID_KEY_ALIAS`
Key alias within the keystore (e.g., `soul-codex-key`).

#### `ANDROID_KEY_PASSWORD`
Password for the key alias (usually same as keystore password).

### 4. GitHub Variables (Optional)

Set the following in GitHub (Settings → Secrets and variables → Variables):

#### `VITE_API_URL`
Backend API endpoint for the app.
- **Default**: `https://soulcodex.up.railway.app`
- **Override**: Set in Variables if you have a different backend

## Workflow Steps

### 1. Checkout Repository
Clones the repository at the current commit.

### 2. Setup Node.js
Installs Node.js 22 with npm dependency caching.

### 3. Setup Java
Installs Temurin JDK 21 with Gradle caching for faster builds.

### 4. Install Dependencies
Runs `npm ci` to install exact dependency versions.

### 5. Build Workspace Packages
Builds internal packages:
- `@soulcodex/db` - Database layer
- `@soulcodex/core` - Core business logic
- `@soulcodex/astrology` - Astrology calculations

### 6. Validate Mobile Release Configuration
Verifies that:
- `VITE_API_URL` is set
- Required build artifacts will be available
- Mobile release is properly configured

### 7. Build Web App
Creates optimized production build:
- Runs `npm run build`
- Produces minified JavaScript and CSS
- Generates PWA service worker

### 8. Sync Capacitor
Synchronizes web app with native Android project:
- Copies web assets to `android/app/src/main/assets/public/`
- Updates native configuration
- Prepares for native build

### 9. Build APK/AAB

#### For Debug:
Creates an unsigned debug APK for testing on devices/emulators.

#### For Release:
1. **Decode Keystore** - Converts base64 keystore to binary
2. **Validate Secrets** - Ensures all signing credentials are present
3. **Build** - Compiles and signs the APK or AAB
4. **Verify** - Confirms the output file exists and displays size

### 10. Upload Artifacts
Stores build outputs:
- **Debug**: 7-day retention
- **Release (APK/AAB)**: 30-day retention

### 11. Cleanup
Removes sensitive keystore file from build machine.

## How to Trigger the Workflow

### Method 1: GitHub UI
1. Go to Actions → Build Android
2. Click "Run workflow"
3. Select build type: `debug`, `release-apk`, or `release-aab`
4. Click "Run workflow"

### Method 2: GitHub CLI
```bash
# Debug build
gh workflow run build-android.yml -f build_type=debug

# Release APK
gh workflow run build-android.yml -f build_type=release-apk

# Release AAB (recommended for Play Store)
gh workflow run build-android.yml -f build_type=release-aab
```

### Method 3: REST API
```bash
curl -X POST https://api.github.com/repos/Bboy9090/Ultimate-SoulCodex/actions/workflows/build-android.yml/dispatches \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"ref":"main","inputs":{"build_type":"release-aab"}}'
```

## Build Artifacts

### Debug Build Output
Located in: `android/app/build/outputs/apk/debug/`

Contains:
- `app-debug.apk` - Unsigned debug app package
- Can be installed directly on devices/emulators

### Release APK Output
Located in: `android/app/build/outputs/apk/release/`

Contains:
- `app-release.apk` - Signed release APK
- Ready for sideloading or APK distribution
- Larger file size than AAB

### Release AAB Output
Located in: `android/app/build/outputs/bundle/release/`

Contains:
- `app-release.aab` - Signed app bundle
- Recommended for Google Play Store
- Smaller downloads after Play Store processes it

## Google Play Store Submission

After a successful release-aab build:

### 1. Download the AAB
Download the `.aab` file from GitHub Actions artifacts.

### 2. Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (Soul Codex)
3. Go to "Release" → "Production"
4. Click "Create new release"
5. Upload the AAB file
6. Review app details (title, description, screenshots, etc.)
7. Fill in release notes
8. Submit for review

### 3. Approval Process
- Google Play reviews the app (typically 24-48 hours)
- App appears on Play Store after approval
- Can be rolled out gradually to users

### Alternative: Using bundletool

To test the AAB locally before submission:

```bash
# Download bundletool
wget https://dl.google.com/android/bundletool/bundletool-all.jar

# Generate APKs from AAB
java -jar bundletool-all.jar build-apks \
  --bundle=app-release.aab \
  --output=app-release.apks \
  --ks=soul-codex-release.keystore \
  --ks-pass=pass:YOUR_KEYSTORE_PASSWORD \
  --ks-key-alias=soul-codex-key \
  --key-pass=pass:YOUR_KEY_PASSWORD

# Install on connected device
java -jar bundletool-all.jar install-apks \
  --apks=app-release.apks
```

## Local Testing

### 1. Build for Local Testing
```bash
cd android
chmod +x gradlew
./gradlew assembleDebug
```

### 2. Install on Device/Emulator
```bash
# Using adb
adb install app/build/outputs/apk/debug/app-debug.apk

# Or drag-drop in Android Studio
```

### 3. Install AAB locally (with bundletool)
See "Alternative: Using bundletool" section above.

## Troubleshooting

### Gradle Build Fails
**Error**: "Gradle sync failed" or "Build failed"

**Solution**:
- Check Java version: `java -version` (should be 21)
- Clean gradle cache: `cd android && ./gradlew clean`
- Verify `variables.gradle` is correct
- Check `build.gradle` for syntax errors

### Capacitor Sync Issues
**Error**: "Capacitor sync failed" or assets not copied

**Solution**:
- Run locally: `npx cap sync android`
- Check web build completed: `ls -la dist/public/`
- Verify `capacitor.config.json` exists in root

### Keystore Decode Fails
**Error**: "Base64 decode error" or "Invalid keystore format"

**Solution**:
- Verify `ANDROID_KEYSTORE` is properly base64 encoded
- Test locally: `base64 -D < keystore.base64 | file -`
- Should output: "data"
- Regenerate keystore if corrupted

### Signing Fails
**Error**: "Failed to sign" or "Invalid credentials"

**Solution**:
- Verify all 4 secrets are set:
  - `ANDROID_KEYSTORE`
  - `ANDROID_KEYSTORE_PASSWORD`
  - `ANDROID_KEY_ALIAS`
  - `ANDROID_KEY_PASSWORD`
- Check credentials are correct (test locally with keytool)
- Verify keystore file wasn't corrupted

### Play Store Upload Fails
**Error**: "Invalid AAB" or "Signature mismatch"

**Solution**:
- Download and inspect the AAB from artifacts
- Use bundletool to verify: `java -jar bundletool-all.jar validate --bundle=app-release.aab`
- Check certificate is valid (not expired)
- Verify bundle is signed with production certificate

## Configuration Files

### build.gradle
**Location**: `android/app/build.gradle`

Contains:
- **namespace**: `app.soulcodex.main`
- **applicationId**: `app.soulcodex.main`
- **signingConfigs**: Release key configuration
- **buildTypes**: Debug and Release configurations

### variables.gradle
**Location**: `android/variables.gradle`

Contains version settings:
- **minSdkVersion**: 24 (Android 7.0+)
- **compileSdkVersion**: 36 (Android 15)
- **targetSdkVersion**: 36 (Android 15)

### capacitor.settings.gradle
**Location**: `android/capacitor.settings.gradle`

Includes Capacitor and plugins configuration.

## App Information

- **Package Name**: `app.soulcodex.main`
- **Application ID**: `app.soulcodex.main`
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 15)
- **Version Code**: 1
- **Version Name**: 1.0

## Signing Key Management

### Key Generation
```bash
keytool -genkey -v -keystore soul-codex-release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias soul-codex-key
```

### Key Information
```bash
# List keys in keystore
keytool -list -v -keystore soul-codex-release.keystore

# Export certificate
keytool -export -alias soul-codex-key \
  -keystore soul-codex-release.keystore \
  -file soul-codex.cer
```

### Important Notes
⚠️ **KEEP YOUR KEYSTORE SAFE**
- Never commit keystore to Git
- Back it up securely (password manager, safe storage)
- Losing it means you can't update your app on Play Store
- Same key must be used for all updates to the same app

## Environment Variables

- **VITE_API_URL**: Backend API endpoint
  - **Set in**: GitHub Variables or workflow
  - **Default**: `https://soulcodex.up.railway.app`
  - **Used by**: Web app to connect to backend

## Gradle Properties

**Location**: `android/gradle.properties`

Contains Gradle settings like:
- Memory allocations
- Gradle daemon settings
- Plugin versions

## Monitoring

View workflow runs:
1. GitHub → Actions → Build Android
2. Click on workflow run to see real-time logs
3. Check artifacts in "Artifacts" section after completion
4. Monitor build size and performance metrics

## Performance Tips

1. **Use Gradle caching** - First build slower, subsequent builds faster
2. **Split resources** - Smaller bundles with AAB
3. **ProGuard/R8** - Minify code for smaller APK (can enable in build.gradle)
4. **WebP images** - Smaller than PNG/JPG

## References

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Build Documentation](https://developer.android.com/build)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Gradle Build Tool](https://gradle.org/releases/)

## Rollback Strategy

If an app needs to be rolled back:
1. Previous AAB files are retained in artifacts (30 days)
2. Download previous AAB from GitHub Actions
3. Upload to Play Store as new release
4. Google Play handles rollback notifications

## Release Checklist

Before submitting to Play Store:
- [ ] All features tested on devices
- [ ] Version code and name updated
- [ ] Release notes written
- [ ] Screenshots updated
- [ ] App icon and branding current
- [ ] Privacy policy URL set
- [ ] Terms of service URL set
- [ ] Contact email configured
- [ ] Build produces valid AAB
- [ ] Keystore not included in repository

---

**Last Updated**: 2026-07-31
**Workflow Version**: 2.0
**SDK Target**: Android 15 (API 36)
