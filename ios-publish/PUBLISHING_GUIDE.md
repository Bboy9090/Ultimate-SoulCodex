# Soul Codex — iOS App Store Publishing Guide

Complete step-by-step instructions to publish Soul Codex as a native iOS app on the Apple App Store.

---

## Overview

Soul Codex is a Progressive Web App (PWA). To publish it on the iOS App Store, we wrap the live web app in a native iOS shell using **Capacitor** (by Ionic). This approach lets you ship the exact same app experience with native iOS integration — push notifications, splash screen, status bar control, and App Store distribution.

---

## Prerequisites

Before you begin, you need:

- [ ] A Mac with **macOS 13 (Ventura)** or later
- [ ] **Xcode 15+** installed from the Mac App Store
- [ ] An **Apple Developer account** ($99/year) — enroll at [developer.apple.com](https://developer.apple.com/programs/enroll/)
- [ ] **Node.js 18+** and **npm** installed
- [ ] **CocoaPods** installed (`sudo gem install cocoapods`)
- [ ] Your Soul Codex deployed and live at your production URL

---

## Step 1: Set Up the Capacitor Project

### 1.1 Clone and prepare

```bash
# Clone the Soul Codex repository to your Mac
git clone <your-repo-url> soul-codex
cd soul-codex

# Install dependencies
npm install

# Build the production client
npm run build
```

### 1.2 Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
```

### 1.3 Copy the Capacitor config

```bash
# Copy the pre-built config to the project root
cp ios-publish/capacitor.config.ts ./capacitor.config.ts
```

### 1.4 Initialize the iOS project

```bash
npx cap init "Soul Codex" "app.soulcodex.ios" --web-dir dist/public
npx cap add ios
npx cap sync ios
```

This creates an `ios/` directory with a full Xcode project.

---

## Step 2: Configure the Xcode Project

### 2.1 Open in Xcode

```bash
npx cap open ios
```

### 2.2 Set up app icons

The icon generator has already created all required sizes. Copy them into the Xcode project:

```bash
# Generate icons (if not already done)
node ios-publish/generate-ios-icons.cjs

# Copy the asset catalog into the Xcode project
cp -r ios-publish/xcode-assets/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset
```

### 2.3 Configure signing

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select the **App** target
3. Go to **Signing & Capabilities**
4. Select your **Team** (your Apple Developer account)
5. Set **Bundle Identifier** to `app.soulcodex.ios`
6. Xcode will automatically create a provisioning profile

### 2.4 Set deployment target

1. In Xcode, select the **App** target
2. Go to **General** tab
3. Set **Minimum Deployments** → iOS 15.0 (recommended)

### 2.5 Configure the server URL

The `capacitor.config.ts` points to your production URL. If your app is deployed at a different URL, update the `server.url` field:

```typescript
server: {
  url: "https://your-actual-domain.replit.app",
  cleartext: false,
},
```

Then sync: `npx cap sync ios`

### 2.6 Add app capabilities (optional)

In Xcode → **Signing & Capabilities** → **+ Capability**:
- **Push Notifications** (if using push notifications)
- **Background Modes** → Remote notifications (if using push)

---

## Step 3: Create the Splash Screen

### 3.1 LaunchScreen storyboard

Xcode generates a default `LaunchScreen.storyboard` in `ios/App/App/`. Customize it:

1. Open `LaunchScreen.storyboard` in Xcode
2. Set the background color to `#1A0E07` (Soul Codex dark ink)
3. Add an image view centered on screen with the Soul Codex logo
4. Set constraints: centered horizontally and vertically, 120x120 points

### 3.2 Alternative: use launch image

Replace the storyboard with a static image if preferred:
- 1170 x 2532 (iPhone 14)
- 1284 x 2778 (iPhone 14 Plus)
- 1290 x 2796 (iPhone 15 Pro Max)
- 2048 x 2732 (iPad Pro 12.9")

---

## Step 4: Test on Device / Simulator

### 4.1 Run on simulator

```bash
npx cap run ios
```

Or in Xcode: select a simulator (e.g., iPhone 15 Pro) → press **⌘R** to run.

### 4.2 Run on physical device

1. Connect your iPhone via USB
2. Trust the computer on your iPhone
3. Select your device in Xcode's device dropdown
4. Press **⌘R** to build and run

### 4.3 Test checklist

- [ ] App launches with correct splash screen (dark background, gold logo)
- [ ] Landing page loads correctly
- [ ] Onboarding flow completes successfully
- [ ] Profile page shows full soul blueprint
- [ ] Daily guidance page loads with personalized content
- [ ] Soul Guide chat works (AI responses stream correctly)
- [ ] Compatibility check works
- [ ] Access code redemption works (test with `guest123t`)
- [ ] Push notification permission prompt appears
- [ ] Status bar is light text on dark background
- [ ] Navigation between all tabs works
- [ ] Scrolling is smooth on all pages
- [ ] Keyboard doesn't obscure input fields

---

## Step 5: Prepare App Store Connect

### 5.1 Create the app listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Soul Codex
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: app.soulcodex.ios
   - **SKU**: soulcodex-ios-001

### 5.2 Fill in metadata

Use the content from `ios-publish/metadata/app-store-description.md`:

| Field | Value |
|-------|-------|
| Subtitle | Your Complete Soul Blueprint |
| Promotional Text | Discover who you really are... |
| Description | (see app-store-description.md) |
| Keywords | astrology,numerology,human design,birth chart,horoscope,soul,compatibility,zodiac,natal chart,self |
| Support URL | https://soulcodex.app/support |
| Privacy Policy URL | https://soulcodex.app/privacy |
| Category | Lifestyle (primary), Entertainment (secondary) |
| Age Rating | 4+ |

### 5.3 Upload screenshots

See `ios-publish/metadata/screenshots-spec.md` for exact sizes and recommended screens to capture.

**Quick method using Xcode Simulator:**
1. Run the app in simulator at each required device size
2. Navigate to each screen
3. Press **⌘S** to save screenshot
4. Upload to App Store Connect under each device category

### 5.4 Set pricing

1. In App Store Connect → **Pricing and Availability**
2. Set price to **Free** (premium features gated by access codes / Stripe)
3. Select availability for all territories you want

### 5.5 App review information

Use the content from `ios-publish/metadata/app-store-review-notes.md`. The review team will need:
- The test access code (`guest123t`)
- Clear instructions on how to generate a profile

---

## Step 6: Build & Upload

### 6.1 Create an archive

1. In Xcode, select **Any iOS Device (arm64)** as the build target
2. Go to **Product** → **Archive** (⌘⇧B first to build, then **Product** → **Archive**)
3. Wait for the archive to complete

### 6.2 Upload to App Store Connect

1. In the **Organizer** window (opens after archive), select the archive
2. Click **Distribute App**
3. Choose **App Store Connect**
4. Follow the prompts:
   - **Upload** (not Export)
   - Enable **bitcode** if prompted
   - Sign with your distribution certificate
5. Click **Upload**

### 6.3 Wait for processing

Apple processes the build (usually 5–30 minutes). You'll get an email when it's ready.

---

## Step 7: Submit for Review

1. Go to App Store Connect → your app
2. Under the latest version, select the uploaded build
3. Fill in the **App Review Information** section:
   - Contact info (your name, email, phone)
   - Review notes (from `app-store-review-notes.md`)
   - Demo account: not required (app works without login)
4. Click **Submit for Review**

### Review timeline

- **Typical review**: 24–48 hours
- **First submission**: May take up to 5 days
- **Common rejection reasons** and how to avoid them:
  - ❌ "Minimum functionality" → Soul Codex has extensive features, this shouldn't apply
  - ❌ "Web app wrapper" → Capacitor provides native integration (splash screen, status bar, etc.), and the app offers unique generated content per user
  - ❌ "Privacy policy missing" → Included in the package

---

## Step 8: Post-Launch

### 8.1 Set up TestFlight (recommended before public launch)

1. In App Store Connect, go to the **TestFlight** tab
2. Add internal testers (up to 25 from your team)
3. Add external testers (up to 10,000 with minimal review)
4. Share the TestFlight invite link

### 8.2 Monitor and iterate

- Check **App Store Connect Analytics** for downloads and retention
- Monitor **Crash Reports** in Xcode Organizer
- Respond to App Store reviews

### 8.3 Updating the app

When you update the web app:
1. The Capacitor wrapper points to the live URL, so **most updates are instant** — no App Store resubmission needed
2. If you change Capacitor config, native plugins, or app metadata:
   ```bash
   npx cap sync ios
   # Then archive and upload a new build
   ```

---

## Files Included in This Package

```
ios-publish/
├── PUBLISHING_GUIDE.md          ← This guide
├── generate-ios-icons.cjs       ← Icon generation script
├── capacitor.config.ts          ← Capacitor configuration (copy to project root)
├── icons/                       ← All generated iOS icons (every required size)
├── xcode-assets/
│   └── AppIcon.appiconset/      ← Ready-to-use Xcode asset catalog
│       ├── Contents.json
│       └── icon-*.png
├── metadata/
│   ├── app-store-description.md ← Full App Store listing copy
│   ├── app-store-review-notes.md← Notes for Apple review team
│   ├── privacy-policy.html      ← Privacy policy (host at /privacy)
│   └── screenshots-spec.md     ← Screenshot sizes and recommendations
└── screenshots/                 ← (Empty — capture from simulator)
```

---

## Troubleshooting

### "Could not find module @capacitor/core"
Run `npm install` and `npx cap sync ios` again.

### White flash on app launch
The `capacitor.config.ts` sets `backgroundColor: "#1A0E07"` — make sure it's synced: `npx cap sync ios`

### Push notifications not working
1. Enable Push Notifications capability in Xcode
2. Create an APNs key in Apple Developer portal
3. Upload the key to your push notification service
4. The existing VAPID-based web push won't work natively — you'll need to add `@capacitor/push-notifications` plugin

### App rejected for "wrapper app"
If Apple flags it as a simple web wrapper, emphasize in your appeal:
- The app generates unique, personalized content per user (not just a website viewer)
- It uses 31+ computational systems to create content
- It includes AI-powered features (Soul Guide chat)
- Native features: splash screen, status bar integration, push notifications

---

## Quick Start (TL;DR)

```bash
# On your Mac:
git clone <repo> && cd soul-codex
npm install && npm run build
npm install @capacitor/core @capacitor/cli @capacitor/ios
cp ios-publish/capacitor.config.ts ./capacitor.config.ts
npx cap init "Soul Codex" "app.soulcodex.ios" --web-dir dist/public
npx cap add ios
node ios-publish/generate-ios-icons.cjs
cp -r ios-publish/xcode-assets/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset
npx cap sync ios
npx cap open ios
# → Set your team, build, archive, upload to App Store Connect
```
