# Soul Codex - Release Checklist

This checklist ensures every release meets the "No Illusion" standard: features work end-to-end, no placeholders in production, and explicit validation.

---

## Pre-Release Validation

### 1. Code Quality

- [ ] All TypeScript compilation errors resolved (`npm run check`)
- [ ] No console errors on page load (any route)
- [ ] No React warnings in dev console
- [ ] No unhandled promise rejections
- [ ] All TODOs in code have corresponding GitHub issues or are removed

### 2. Feature Completeness

- [ ] All advertised features work end-to-end
- [ ] No placeholder data in production paths
- [ ] No mock services in production mode (only in `tests/`)
- [ ] Confidence labels present on all uncertain outputs
- [ ] Missing data (birth time, location) shows graceful degradation

### 3. Testing

- [ ] `scripts/healthcheck.sh` passes
- [ ] `scripts/smoke-test.sh` passes
- [ ] Manual smoke test of all core flows:
  - [ ] Profile onboarding (new user)
  - [ ] Profile page loads with reading
  - [ ] Today page shows daily context
  - [ ] Codex reading generates (AI synthesis)
  - [ ] Journal prompts load and are browsable
  - [ ] Compatibility page works (if implemented)
- [ ] Demo mode works without external dependencies (`DEMO_MODE=true`)
- [ ] Production mode works with database (`DATABASE_URL` set)

### 4. Performance

- [ ] Initial page load < 3 seconds on 3G (throttle in DevTools)
- [ ] Reading generation < 10 seconds (with AI)
- [ ] No memory leaks (check DevTools Performance Monitor)
- [ ] Service worker caches assets correctly (offline mode works after first load)
- [ ] Lighthouse score: Performance > 80, Accessibility > 90

### 5. Security

- [ ] No secrets in client-side code (check bundle with `grep -r "sk-" dist/`)
- [ ] Environment variables not exposed to client
- [ ] Session cookies are httpOnly and secure (in production)
- [ ] No SQL injection vulnerabilities (use parameterized queries)
- [ ] Password hashing uses argon2 (not bcrypt or plain SHA)
- [ ] CORS configured correctly (only trusted origins)

### 6. Data Privacy

- [ ] Privacy policy up-to-date (`/privacy` route)
- [ ] Terms of service up-to-date (`/terms` route)
- [ ] User data encrypted at rest (if DATABASE_URL set)
- [ ] No third-party tracking scripts (Google Analytics, Facebook Pixel, etc.)
- [ ] User can export their data (future: implement `/api/user/export`)
- [ ] User can delete their data (future: implement `/api/user/delete`)

### 7. Accessibility

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader tested (VoiceOver on Mac, NVDA on Windows)
- [ ] Color contrast meets WCAG AA (use axe DevTools)
- [ ] Focus states visible on all interactive elements
- [ ] Alt text on all images
- [ ] ARIA labels on icon-only buttons

### 8. Mobile Responsiveness

- [ ] Works on iPhone (Safari iOS)
- [ ] Works on Android (Chrome Android)
- [ ] Works on tablet (iPad, Android tablet)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll on small screens
- [ ] Virtual keyboard doesn't obscure form inputs

---

## Build & Deploy

### 9. Build Process

- [ ] Workspace packages build successfully:
  ```bash
  npm run build -w packages/db
  npm run build -w packages/core
  ```
- [ ] Client build completes without errors:
  ```bash
  npm run build:client
  ```
- [ ] Server build completes without errors:
  ```bash
  npm run build:server
  ```
- [ ] Production bundle size reasonable (< 2MB for main JS bundle)
- [ ] No dev dependencies in production bundle

### 10. Environment Configuration

- [ ] `.env.example` up-to-date with all required vars
- [ ] Production `.env` file has all secrets set
- [ ] DATABASE_URL points to production DB (if not demo mode)
- [ ] SESSION_SECRET is strong random string (not "secret" or "changeme")
- [ ] AI API keys valid (GEMINI_API_KEY or OPENAI_API_KEY)
- [ ] NODE_ENV=production in production
- [ ] DEMO_MODE=false in production (unless intentional demo instance)

### 11. Database Migrations

- [ ] All migrations applied successfully:
  ```bash
  npm run db:push
  ```
- [ ] Migration rollback plan documented (in case of failure)
- [ ] Database backups taken before migration
- [ ] Migration tested on staging environment first

### 12. Deployment

- [ ] Staging deployment successful
- [ ] Staging smoke tests pass
- [ ] Production deployment plan documented
- [ ] Rollback plan ready (previous version tagged in git)
- [ ] Deployment to production:
  - [ ] Server starts without errors
  - [ ] Health check endpoint responds (`/health`)
  - [ ] Database connection successful
  - [ ] AI synthesis works (test with one profile)
  - [ ] No 500 errors in server logs
- [ ] DNS/SSL certificate valid (if applicable)
- [ ] CDN cache purged (if using CDN)

---

## Post-Release Validation

### 13. Production Smoke Test

Within 15 minutes of deployment:

- [ ] Landing page loads (`/`)
- [ ] New user can create profile (`/start`)
- [ ] Profile page loads with reading (`/profile`)
- [ ] Today page shows daily context (`/today`)
- [ ] Codex reading generates (`/codex`)
- [ ] Journal prompts load (`/journal` if implemented)
- [ ] No 500 errors in production logs
- [ ] No client-side errors in Sentry/error tracker

### 14. Monitoring

- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Server logs accessible (Railway, Heroku, Vercel logs)
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)
- [ ] Performance monitoring (Vercel Analytics, Cloudflare Analytics)

### 15. Documentation

- [ ] README.md updated with new features
- [ ] CHANGELOG.md updated with version and changes
- [ ] API documentation updated (if API changes)
- [ ] User-facing documentation updated (if new UI features)

### 16. Communication

- [ ] Release notes drafted
- [ ] Users notified (email, in-app notification, etc.)
- [ ] Social media announcement (if applicable)
- [ ] GitHub release created with tag (e.g., `v1.0.0`)

---

## Rollback Procedure

If critical bugs are found in production:

1. **Immediate:** Revert to previous version (git tag)
2. **Within 5 min:** Redeploy previous stable version
3. **Within 10 min:** Verify rollback successful (smoke test)
4. **Within 30 min:** Root cause analysis, create GitHub issue
5. **Within 24 hr:** Fix identified, tested on staging, ready for re-release

---

## Definition of Done

A release is complete when:

1. All items in this checklist are checked
2. `scripts/healthcheck.sh` passes in production
3. `scripts/smoke-test.sh` passes in production
4. No critical errors in first hour of production traffic
5. GitHub release created with changelog

---

## Version History

| Version | Date | Changes | Released By |
|---------|------|---------|-------------|
| 1.0.1   | TBD  | Reforged MVP foundation | Bobby's World |

---

## Notes

- **Never skip steps.** If a step doesn't apply (e.g., no database migrations), explicitly note "N/A" with reason.
- **Document failures.** If a check fails, create GitHub issue and block release until resolved.
- **Automate where possible.** Convert manual checks to CI/CD pipeline over time.
- **Keep this checklist updated.** If new critical steps emerge, add them immediately.
