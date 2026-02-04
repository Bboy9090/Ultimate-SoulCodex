# Copilot Instructions for Ultimate Soul Codex

## Project Overview

Ultimate Soul Codex is a mobile-first personality and compatibility application that synthesizes 35+ spiritual and psychological systems into personalized insights. This is a production-ready TypeScript application with a focus on quality, accuracy, and user experience.

## Technology Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend:** Node.js 20 + Express.js
- **Database:** PostgreSQL (Neon serverless) with Drizzle ORM
- **AI:** OpenAI GPT-4 Turbo (streaming) + Google Gemini
- **Payments:** Stripe (subscriptions)
- **Build Tool:** Vite 5.x
- **Package Manager:** npm

## Core Principles ("No Illusion" Rule)

This repository operates in **reality, not simulation**:

1. **Never invent results or fake success** - If you cannot verify it ran, it did not run
2. **No placeholders/mocks/stubs in production code** - Mocks allowed ONLY in `tests/` directory
3. **All user-facing features must work end-to-end** - No fake success
4. **Small, focused PRs only** - One focused change per PR
5. **Explicit validation required** - Show proof: build output, test results, lint output

## Code Standards

### TypeScript

- Use TypeScript for all new code (no plain JavaScript)
- Enable strict mode - no `any` types without explicit justification
- Prefer explicit types over inference for public APIs
- Use Zod schemas for runtime validation (see `types.ts` for patterns)

### React

- Use functional components with hooks (no class components)
- Follow existing patterns in `client/src/` for component structure
- Use Radix UI components for consistent UI patterns
- Implement proper error boundaries
- Use React Query (`@tanstack/react-query`) for server state management

### Styling

- Use Tailwind CSS utility classes (no custom CSS files)
- Follow mobile-first responsive design
- Use existing color system defined in `COLOR_SYSTEM.md`
- Refer to Radix UI component patterns for consistency

### Backend

- Express.js route handlers in `server/routes/` directory
- Use async/await with proper error handling
- Always validate inputs with Zod schemas
- Use Drizzle ORM for database queries (see `db.ts`)
- Implement proper session management (Express sessions with PostgreSQL store)

## File Structure

```
/client          - Frontend React application
  /src           - React components and pages
  /hooks         - Custom React hooks
/server          - Backend Express.js application
  /routes        - API route handlers
  /services      - Business logic services
/shared          - Shared code between frontend and backend
  /types         - TypeScript types and Zod schemas
/tests           - Test files (mocks allowed here only)
```

## Important Files

- `AGENTS.md` - AI agent operating system and discipline (root directory)
- `.github/AGENTS.md` - Specialized Copilot agent roles for team deployment
- `PRODUCT_REQUIREMENTS.md` - Complete product requirements
- `DATA_MODEL.md` - Database schema and data architecture
- `SAFETY_ETHICS.md` - Ethical guidelines (READ BEFORE MODIFYING AI FEATURES)
- `DOCUMENTATION_INDEX.md` - Overview of all project documentation
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database ORM configuration

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Database migrations
npx drizzle-kit generate  # Generate migrations
npx drizzle-kit migrate   # Run migrations
```

## Testing Requirements

- Currently no automated test framework is set up
- Manual testing is required for all changes
- Run `npm run dev` and verify changes in browser
- Test on mobile viewport (Chrome DevTools)
- For API changes, test with actual HTTP requests

## Database

- PostgreSQL with Drizzle ORM
- Schema defined in `db.ts` and migration files
- Connection via `DATABASE_URL` environment variable
- Use parameterized queries (Drizzle prevents SQL injection)
- Never commit secrets or connection strings

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `GEMINI_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe API key (optional for development)
- `SESSION_SECRET` - Express session secret

## API Guidelines

- RESTful endpoints in `server/routes/`
- Always return proper HTTP status codes
- Use consistent error response format
- Implement rate limiting for public endpoints
- Stream AI responses using OpenAI streaming API
- Log errors properly (no console.log in production)

## Security

- Never commit API keys, secrets, or credentials
- Sanitize all user inputs before database queries
- Use parameterized queries (Drizzle ORM handles this)
- Implement CORS properly (see `server/index.ts`)
- Use HTTPS in production
- Follow OWASP guidelines for authentication

## Git & PR Workflow

- Small, focused commits with clear messages
- One feature or fix per PR
- Reference issue numbers in commit messages
- Never force push to main branch
- Use conventional commit format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Documentation

- Update relevant `.md` files when changing features
- Keep `README.md` accurate and up-to-date
- Document new environment variables in `.env.example`
- Add JSDoc comments for complex functions
- Update `PRODUCT_REQUIREMENTS.md` for feature changes

## Ethical Guidelines

**CRITICAL:** Read `SAFETY_ETHICS.md` before modifying:
- AI chat features
- Personality interpretations
- Compatibility analysis
- User-facing content

Key principles:
- Non-deterministic language (possibilities, not predictions)
- No medical, legal, or financial advice
- Inclusive and respectful language
- Crisis support detection for users in distress
- Transparency in all AI-generated content

## Specialized Agents

This repository uses specialized agent roles (see `.github/AGENTS.md`):

1. **Audit Hunter** - Find placeholders/mocks in production code
2. **CI Surgeon** - Make CI deterministic and fix tests
3. **Backend Integrity** - API contracts and error handling
4. **Frontend Parity** - Remove dead UI, wire real APIs
5. **Release Captain** - Enforce small PRs and Definition of Done
6. **Workshop Safety** - Warn against risky operations
7. **Tooling Refiner** - Code cleanup and structure
8. **Automation Engineer** - CI/CD pipeline health
9. **Security Guard** - Secrets detection and vulnerabilities
10. **Docs Curator** - Documentation clarity

## What NOT to Do

- ❌ Don't add new dependencies without justification
- ❌ Don't modify working code unless fixing a bug
- ❌ Don't remove existing features without discussion
- ❌ Don't bypass authentication or authorization
- ❌ Don't hardcode sensitive data
- ❌ Don't use `any` type in TypeScript
- ❌ Don't add console.log statements (use proper logging)
- ❌ Don't commit build artifacts (`dist/`, `node_modules/`)
- ❌ Don't modify `.github/agents/` directory (reserved for agent definitions)

## Quick Reference

### Adding a New Feature

1. Check `PRODUCT_REQUIREMENTS.md` for requirements
2. Review existing patterns in similar features
3. Create TypeScript types/schemas first
4. Implement backend API if needed
5. Build frontend UI components
6. Test manually in development
7. Update documentation
8. Create focused PR with clear description

### Fixing a Bug

1. Reproduce the bug in development
2. Identify root cause (use debugger, logs)
3. Write minimal fix that addresses the root cause
4. Test the fix thoroughly
5. Verify no regressions in related features
6. Document the fix in commit message

### Deployment

- See `DEPLOYMENT_COMPARISON.md` for platform options
- Fly.io is the recommended free option
- Railway for easiest setup (~$5/mo)
- Hetzner VPS for best value (€4/mo)

## Questions?

- Check documentation in repository root (see `DOCUMENTATION_INDEX.md`)
- Review similar existing code for patterns
- Ask clarifying questions before making assumptions
- When in doubt, make smaller changes rather than larger ones
