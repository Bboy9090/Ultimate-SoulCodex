# Soul Codex — Google Play Store Publishing Guide

This guide takes Soul Codex from web app to a published listing on the
Google Play Store. Mirror file of `ios-publish/PUBLISHING_GUIDE.md`.

---

## 0. Prerequisites

- Soul Codex web app deployed and reachable at a stable HTTPS URL
  (the Capacitor wrapper points at it). A Replit Reserved-VM or
  Autoscale deployment works fine.
- Node.js 20+ on your local machine (for the Android build).
- Android Studio (Hedgehog or newer) — required to build the AAB.
- A real Android device or emulator running API 26+ for testing.

---

## 1. Google Play Developer account ($25, one-time)

1. Go to https://play.google.com/console and sign up.
2. Pay the **one-time $25 registration fee**.
3. Complete the **identity verification** flow that opens after sign-up:
   - Personal account: government ID + a selfie video.
   - Organization account: legal entity name + address + a **D-U-N-S
     number** (free from https://www.dnb.com/duns-number.html — issuance
     can take ~30 days, plan accordingly).
4. Verification typically completes within 2–3 business days.

---

## 2. Capacitor wrap

From the project root:

```bash
# 1. Install Capacitor + Android plugin (if not already)
npm install --save @capacitor/core @capacitor/cli @capacitor/android
npm install --save @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard

# 2. Build the web app
npm run build

# 3. Initialize Capacitor with the Android-specific config
npx cap init "Soul Codex" app.soulcodex.android --web-dir dist/public

# 4. Replace the generated capacitor.config.ts with ours
cp android-publish/capacitor.config.ts capacitor.config.ts

# 5. Add the Android platform
npx cap add android

# 6. Sync web assets into the native project
npx cap sync android
```

You now have an `android/` directory containing a Gradle project.

---

## 3. Drop in icons + adaptive launcher

```bash
node android-publish/generate-android-icons.cjs
```

Then copy resources into the native project:

```bash
cp -R android-publish/android-assets/mipmap-* android/app/src/main/res/
cp -R android-publish/android-assets/values/* android/app/src/main/res/values/
```

This populates:
- `mipmap-{m,h,x,xx,xxx}hdpi/ic_launcher.png` — legacy square launcher
- `mipmap-{m,h,x,xx,xxx}hdpi/ic_launcher_round.png` — legacy round launcher
- `mipmap-{m,h,x,xx,xxx}hdpi/ic_launcher_foreground.png` — adaptive foreground
- `mipmap-anydpi-v26/ic_launcher.xml` — adaptive icon (Android 8+)
- `values/ic_launcher_background.xml` — `#1A0E07` background

Open `android/app/src/main/AndroidManifest.xml` and confirm:

```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:label="Soul Codex"
    android:theme="@style/AppTheme">
```

---

## 4. App config in Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    namespace "app.soulcodex.android"
    compileSdk 34

    defaultConfig {
        applicationId "app.soulcodex.android"
        minSdk 23
        targetSdk 34          // REQUIRED by Play as of Aug 2025
        versionCode 1         // bump every upload
        versionName "1.0.0"
    }
}
```

> Play will reject any AAB whose `targetSdk` is below 34.

---

## 5. Signing key

Play uses **Play App Signing**: you generate an upload key, and Google
holds the actual signing key. You upload AABs signed with the upload key.

```bash
keytool -genkey -v \
  -keystore soulcodex-upload.keystore \
  -alias soulcodex \
  -keyalg RSA -keysize 2048 -validity 10000
```

Store the keystore + passwords somewhere safe (1Password, etc.). Losing
them means you can't push updates from this machine.

In `android/app/build.gradle`, add a release signing config:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../soulcodex-upload.keystore")
            storePassword System.getenv("SC_STORE_PASS")
            keyAlias "soulcodex"
            keyPassword System.getenv("SC_KEY_PASS")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 6. Build the AAB

```bash
export SC_STORE_PASS='...'
export SC_KEY_PASS='...'

cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

This is the artifact you upload to Play Console.

---

## 7. Test on a real device first

```bash
# Build a debug APK and install it
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

Walk through:
- Onboarding flow
- Sign-in (email/password)
- Soul Blueprint renders
- Soul Guide chat works
- Push notification permission prompt appears (Android 13+)
- Account → Sign out works
- Account → Delete my account flow completes
- Premium upgrade flow (if shipped with billing)

Fix any issues before continuing.

---

## 8. Play Console listing

Inside https://play.google.com/console:

### Create app
- App name: **Soul Codex**
- Default language: English (US)
- App or game: **App**
- Free or paid: **Free** (premium is an in-app subscription)

### Main store listing
Paste content from `android-publish/metadata/play-store-listing.md`:
- Short description (80 chars)
- Full description (4000 chars)
- App icon: `android-publish/icons/play-store-icon-512.png`
- Feature graphic: `android-publish/icons/play-store-feature-graphic.png`
- Phone screenshots: see `android-publish/metadata/screenshots-spec.md`
- Category: **Lifestyle**
- Tags: Astrology, Self-improvement, Personality
- Contact: support@soulcodex.app
- Privacy policy URL: **https://soulcodex.app/privacy**

### App content
- **Privacy policy** → paste URL above
- **App access** → "All functionality is available without restrictions" (or
  provide a demo account if account creation is required for review)
- **Ads** → "No, my app does not contain ads"
- **Content rating** → fill the IARC questionnaire using
  `android-publish/metadata/content-rating.md`. Expected: **Everyone**.
- **Target audience** → 18+ (the app deals with personal birth data; 13+ is
  also defensible if you prefer broader reach)
- **News app** → No
- **COVID-19 contact tracing** → No
- **Data safety** → fill using `android-publish/metadata/data-safety-form.md`
- **Government app** → No
- **Financial features** → No
- **Health features** → No

### Pricing & distribution
- Free
- Countries: **All available** (or your launch list)
- Contains ads: **No**

### Subscriptions (if billing enabled)
- Monetization → Products → **Subscriptions** → create your premium tier
  with the same price points as your Stripe / web version.
- Wire up Google Play Billing in the app (RevenueCat handles this in one
  SDK across iOS and Android — recommended).

### Release
- Production track → Create new release
- Upload `app-release.aab`
- Release name: e.g. `1.0.0 (1)`
- Release notes:
  ```
  Initial release. Your complete soul blueprint — astrology, numerology,
  Human Design, and behavioral analysis synthesized into one personalized
  reading.
  ```
- **Submit for review**

---

## 9. Review timeline

- **First submission:** typically 3–7 days (sometimes longer for first-time
  developer accounts).
- **Updates:** usually a few hours to 2 days.

Common rejection reasons to pre-empt:
- Data Safety form mismatches actual SDK behavior → see
  `android-publish/metadata/data-safety-form.md`
- Account deletion not actually accessible → already shipped at
  Profile → Account → Delete my account
- targetSdk too low → fixed in step 4 (must be 34)
- Privacy policy URL returns 404 → make sure `/privacy` is live on the
  deployed URL

---

## 10. After publication

- Set up **Play Console alerts** for crashes (vitals dashboard).
- Use **Internal testing** track for future builds before promoting to
  Production.
- Bump `versionCode` (integer, +1) and `versionName` (semver) for every
  upload.
- If you add any new SDKs, third parties, or data collection, update the
  Data Safety form **before** the next release.

---

## Quick checklist

- [ ] Play Console account created + identity verified
- [ ] `android/` generated via `npx cap add android`
- [ ] Icons generated and copied into `android/app/src/main/res/`
- [ ] `targetSdk 34`, `applicationId app.soulcodex.android`
- [ ] Upload keystore generated and safely stored
- [ ] AAB builds cleanly with `./gradlew bundleRelease`
- [ ] Tested on a real Android device
- [ ] Store listing copy filled in
- [ ] Content rating questionnaire submitted (Everyone)
- [ ] Data Safety form completed
- [ ] Privacy policy URL live and reachable
- [ ] Account deletion verified in production build
- [ ] AAB uploaded to Production track and submitted for review
