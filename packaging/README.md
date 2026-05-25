# Soul Codex - Packaging Guide

This directory contains build configurations and instructions for packaging Soul Codex for different platforms.

---

## Supported Platforms

### 1. Web (PWA) - **Primary Distribution Method**
Soul Codex is primarily distributed as a Progressive Web App (PWA) that can be installed from the browser.

**Build Command:**
```bash
npm run build:client
npm run build:server
```

**Output:**
- `dist/public/` - Client-side assets (HTML, CSS, JS)
- `dist/index.js` - Server bundle

**Deployment:**
- Deploy `dist/` to any Node.js hosting (Vercel, Railway, Heroku, etc.)
- Set environment variables (`SESSION_SECRET`, `DATABASE_URL`, etc.)
- Ensure port 5000 is accessible by default (or configure via PORT env var)

**PWA Installation:**
- Users can install from browser (Chrome: "Install App", Safari: "Add to Home Screen")
- Browser install prompts are available, but service-worker-based offline support is still planned

---

### 2. Windows (MSIX) - **Experimental**

**Status:** Not yet implemented (planned for v1.2)

**Requirements:**
- Windows 10+ (version 1809 or later)
- MSIX packaging tools
- Code signing certificate (for distribution)

**Planned Build Process:**
1. Build web app (`npm run build:client`)
2. Package into Electron or WebView2 wrapper
3. Create MSIX bundle with `makeappx.exe`
4. Sign with code signing certificate

**Output Directory:** `packaging/windows/`

**Distribution:**
- Microsoft Store
- Sideloading (for enterprise/testing)

**Notes:**
- Package ID: `BobbysWorld.SoulCodex`
- Publisher: `CN=Bobby's World`
- Requires Windows SDK for development

---

### 3. Blue Phoenix OS - **Planned**

**Status:** Not yet implemented (part of Bobby's World ecosystem)

**Requirements:**
- Blue Phoenix OS package format (AppImage or custom)
- OS-specific APIs for system integration

**Planned Build Process:**
1. Build web app (`npm run build:client`)
2. Package into AppImage or BP OS format
3. Include metadata from `app.metadata.json`

**Output Directory:** `packaging/blueprintos/`

**Distribution:**
- Blue Phoenix OS App Store
- Direct install via BP OS package manager

**Package ID:** `com.bobbysworld.soulcodex`

**Notes:**
- Integration with BP OS theming and system services
- Access to BP OS-specific features (notifications, sync, etc.)

---

## General Build Prerequisites

### All Platforms

1. **Node.js 20**
```bash
nvm install 20
nvm use 20
```

2. **Install Dependencies**
```bash
npm install
```

3. **Build Workspace Packages**
```bash
npm run build -w packages/db
npm run build -w packages/core
```

4. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with production values
```

Required environment variables:
- `SESSION_SECRET` - Strong random string (not "changeme")
- `DATABASE_URL` - PostgreSQL connection string (optional, demo mode works without)
- `GEMINI_API_KEY` or `OPENAI_API_KEY` - AI synthesis (optional)

---

## Platform-Specific Instructions

### Web/PWA Build

#### Development Server
```bash
NODE_ENV=development npx tsx server/index.ts
```

#### Production Build
```bash
# Build client
npm run build:client

# Build server
npm run build:server

# Start production server
NODE_ENV=production npm start
```

#### Deployment Options

**Vercel** (Recommended for web)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

**Docker**
```bash
# Build image
docker build -t soulcodex:latest .

# Run container
docker run -p 3000:3000 \
  -e SESSION_SECRET=your-secret \
  -e DATABASE_URL=your-db-url \
  soulcodex:latest
```

---

### Windows MSIX Build (Future)

**Step 1: Install Windows SDK**
- Download from: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
- Ensure `makeappx.exe` is in PATH

**Step 2: Build Web App**
```bash
npm run build:client
npm run build:server
```

**Step 3: Create MSIX Package**
```bash
# (Future script, not yet implemented)
npm run package:windows
```

**Step 4: Sign Package**
```bash
# Requires code signing certificate
signtool sign /f certificate.pfx /p password SoulCodex.msix
```

**Output:**
- `packaging/windows/SoulCodex.msix` - Installable package

---

### Blue Phoenix OS Build (Future)

**Step 1: Build Web App**
```bash
npm run build:client
npm run build:server
```

**Step 2: Create AppImage**
```bash
# (Future script, not yet implemented)
npm run package:blueprintos
```

**Output:**
- `packaging/blueprintos/SoulCodex-x86_64.AppImage` - Portable executable

---

## Testing Packages

### Pre-Release Checklist

Before distributing any package:

1. **Run Health Check**
```bash
./scripts/healthcheck.sh
```

2. **Run Smoke Tests**
```bash
./scripts/smoke-test.sh
```

3. **Manual Testing**
- [ ] Fresh install on clean system
- [ ] Profile creation works
- [ ] Reading generation succeeds
- [ ] No console errors
- [ ] Offline mode works (PWA)
- [ ] Updates install correctly

4. **Security Scan**
- [ ] No hardcoded secrets in bundle
- [ ] Dependencies scanned (`npm audit`)
- [ ] HTTPS enforced in production
- [ ] CSP headers configured

---

## Code Signing

### Windows
- Obtain code signing certificate from trusted CA
- Sign MSIX before distribution
- Users will see "Unknown Publisher" without signing

### macOS (Future)
- Apple Developer account required
- Sign with Developer ID certificate
- Notarize with Apple

### Blue Phoenix OS
- TBD (BP OS signing process)

---

## Distribution Channels

### Web/PWA
- **Primary:** Direct link to hosted app (https://soulcodex.app)
- **Secondary:** Install button on landing page

### Windows
- **Microsoft Store** (requires MSIX, publisher account, certification)
- **Direct Download** (sideloading, requires code signing for trust)

### Blue Phoenix OS
- **BP OS App Store** (integrated into OS)

---

## Update Mechanism

### Web/PWA
- Web updates are picked up on the next refresh/revisit (service worker support is still planned)
- New version deployed, users get update on next visit
- No user action required

### Windows MSIX
- Microsoft Store handles updates automatically
- Sideloaded apps require manual update (or auto-update service)

### Blue Phoenix OS
- BP OS package manager handles updates

---

## Troubleshooting

### Build Fails

**Error:** `Cannot find module '@soulcodex/core'`
**Fix:** Build workspace packages first
```bash
npm run build -w packages/core
npm run build -w packages/db
```

**Error:** `NODE_ENV is not recognized`
**Fix:** Use cross-env or set in .env
```bash
npm install -g cross-env
cross-env NODE_ENV=production npm start
```

### Package Size Too Large

- Check bundle analyzer output
- Remove unused dependencies
- Enable tree-shaking (Vite does this automatically)
- Compress images and assets

### Installation Fails

- Verify code signing certificate is valid
- Check minimum OS version requirements
- Review installation logs

---

## Appendix: File Structure

```
packaging/
├── README.md (this file)
├── windows/
│   ├── manifest.xml (future)
│   ├── assets/ (future: app icons, splash screens)
│   └── SoulCodex.msix (build output)
└── blueprintos/
    ├── metadata.json (future)
    ├── assets/ (future)
    └── SoulCodex-x86_64.AppImage (build output)
```

---

## Contact

Questions about packaging?
- **GitHub Issues:** https://github.com/Bboy9090/Ultimate-SoulCodex/issues
- **Email:** support@bobbysworld.dev
