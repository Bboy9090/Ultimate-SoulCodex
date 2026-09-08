# Soul Codex - Application Contract

**Version:** 1.0
**Effective Date:** 2026-05-23

This document defines the explicit guarantees, boundaries, and behavioral promises that Soul Codex makes to its users.

---

## Core Guarantees

### 1. Truth in Calculation

**We guarantee:**
- Astrological calculations use astronomy-engine for deterministic planetary position data
- No lookup tables or fake planetary positions
- Calculations are deterministic: same birth data = same chart output
- All calculation confidence is explicitly labeled using the current runtime confidence values

**What this means for you:**
- Planetary positions are calculated using astronomy-engine and are deterministic for the same birth data
- Precision validation against golden fixtures is tracked separately
- Missing birth time reduces confidence but doesn't produce fake data
- Sections that depend on exact birth time, location-sensitive chart angles, houses, or unresolved historical timezone rules must be labeled with reduced confidence

---

### 2. No Fake Mystical Data

**We guarantee:**
- No randomly generated "insights" or "readings"
- No template-based horoscopes with `<your sign here>` substitution
- AI synthesis (when enabled) is based on your actual chart data, not generic archetypes
- If data is missing (e.g., birth time), we say so explicitly—we don't guess

**What this means for you:**
- Two people with the same Sun sign get different readings (because charts differ)
- Every output is traceable to your birth data or current transits
- Placeholders only appear in test/demo mode, never in production

---

### 3. Confidence Labeling

**We guarantee:**
- Every major reading section has a confidence indicator
- Confidence uses the current runtime labels:
  - **Overall confidence**: `high`, `medium`, or `low`
  - **Section badges**: `verified`, `partial`, or `unverified`
- Missing birth time explicitly degrades outputs (no Rising sign, no house cusps)

**What this means for you:**
- You always know the reliability of what you're reading
- Adding birth time/location upgrades confidence immediately (no re-creation needed)

---

### 4. Data Privacy & Security

**We guarantee:**
- Your birth data and journal entries are private by default
- Data is encrypted at rest (when DATABASE_URL is configured)
- No third-party tracking or analytics in MVP (no Google Analytics, Facebook Pixel, etc.)
- Session cookies are httpOnly and secure (can't be stolen via XSS)
- Passwords are hashed with argon2 (industry standard, not bcrypt or SHA-1)

**What this means for you:**
- Your data is not sold to third parties
- We don't track your behavior across websites
- Even if our database is compromised, passwords can't be easily cracked

**Important:** Demo mode (DEMO_MODE=true) stores data in memory only—data is lost on server restart.

---

### 5. Local Caching Boundaries

**We guarantee:**
- Some client-side state can be cached locally where the current UI implements browser storage
- Standard browser caching can speed repeat visits
- Service-worker-based offline support is not currently guaranteed

**What this means for you:**
- Some previously loaded data may remain available in your browser
- New readings and live calculations still require internet access
- Repeat visits can feel faster after the first load

**Exceptions:**
- New readings require internet (AI synthesis, transit calculations)
- Real-time transit data requires internet

---

### 6. No Medical or Deterministic Claims

**We guarantee:**
- Soul Codex never claims to diagnose medical conditions
- No statements like "You will experience X on Y date"
- All interpretations are framed as tendencies, patterns, or potentials—not certainties
- Clear disclaimers on any health-related interpretations (e.g., chakra imbalances)

**What this means for you:**
- Soul Codex is a self-discovery tool, not medical advice
- Always consult professionals for health/legal/financial decisions
- Readings describe patterns, not fate

---

### 7. Graceful Degradation

**We guarantee:**
- Missing birth time shows reduced reading (no Rising sign), not errors
- If AI API is unavailable, deterministic fallback templates are used
- Database outage triggers in-memory demo mode (data not persisted)
- Page errors show user-friendly messages (not stack traces)

**What this means for you:**
- The app doesn't crash when data is missing
- Reduced features are better than broken features
- You always know when a fallback is active

---

### 8. Transparent Limitations

**We guarantee:**
- Clear documentation of what Soul Codex does and doesn't do
- Explicit labels for beta/experimental features
- No hidden paywalls (if premium features exist, they're labeled upfront)
- Known bugs documented in GitHub issues (not hidden)

**What this means for you:**
- No surprises about what's included or what costs money
- You can report bugs and see their status
- We don't overpromise or underdeliver

---

## What We Don't Promise

### Not Guaranteed:
- **Prediction of future events**: Soul Codex is not a fortune-telling app
- **100% uptime**: We aim for high availability but can't guarantee zero downtime
- **Instant AI synthesis**: Generation can take 5-10 seconds (dependent on API)
- **Compatibility with all browsers**: We support modern browsers (Chrome, Safari, Firefox, Edge); IE11 not supported
- **Mobile native apps (MVP)**: PWA-first; native iOS/Android apps are future roadmap items

### Explicitly Out of Scope:
- Medical diagnosis or treatment recommendations
- Legal or financial advice
- Relationship counseling or therapy
- Predictions of death, illness, or catastrophic events
- Third-party data sharing for advertising

---

## User Responsibilities

To get the most accurate results, you should:

1. **Provide accurate birth data**: Wrong date/time = wrong chart
2. **Use supported browsers**: Chrome, Safari, Firefox, Edge (latest versions)
3. **Keep API keys secure**: If self-hosting, don't expose GEMINI_API_KEY or OPENAI_API_KEY
4. **Report bugs**: Use GitHub issues or support email
5. **Read privacy policy**: Understand how your data is used

---

## Enforcement & Accountability

### How We Enforce This Contract:

- **Automated checks**: `scripts/healthcheck.sh` and `scripts/smoke-test.sh` validate core guarantees
- **Code review**: All PRs must pass "No Illusion" audit (no placeholders in production)
- **User testing**: Beta testers verify features work end-to-end before release
- **Public roadmap**: See `ROADMAP.md` for planned features and limitations

### If We Break This Contract:

- **Immediate fix**: Critical bugs (data loss, security breach) are patched within 24 hours
- **Public acknowledgment**: Breaches are documented in CHANGELOG.md and GitHub issues
- **Rollback**: If a release violates guarantees, it's rolled back until fixed
- **User notification**: Affected users are notified via email/in-app message

---

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 1.0     | 2026-05-23 | Initial contract for Reforged MVP |

---

## Contact

Questions or concerns about this contract?

- **GitHub Issues**: https://github.com/Bboy9090/Ultimate-SoulCodex/issues
- **Email**: support@bobbysworld.dev (future: set up dedicated email)
- **Privacy Policy**: `/privacy` route in app
- **Terms of Service**: `/terms` route in app

---

## Legal Disclaimer

Soul Codex is provided "as is" without warranty of any kind, express or implied. This document is a good-faith statement of intent, not a legally binding contract. See full Terms of Service for legal terms.

**Use Soul Codex responsibly.** It's a tool for self-discovery, not a replacement for professional advice.
