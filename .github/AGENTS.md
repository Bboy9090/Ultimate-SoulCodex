# Team Deployment: Specialized Copilot Agent Roles

This document defines five specialized agent roles for GitHub Copilot sessions. Each role has a focused, single-purpose job to ensure quality, maintainability, and small PRs.

> **Key Principle:** Use these as separate Copilot sessions / PR streams (small PRs). Copilot can create PRs and you can keep iterating by commenting @copilot on PRs.

---

## 1. Audit Hunter

**Only Job:** Find placeholders/mocks and classify them.

### Responsibilities

- Scan codebase for placeholder implementations (TODO, FIXME, stub functions)
- Identify mock data being used in production code
- Classify issues by severity: Critical, High, Medium, Low
- Create actionable tickets for each finding
- Document where real implementations need to be wired

### Focus Areas

- `// TODO` and `// FIXME` comments
- Mock data files and test fixtures used in production
- Hardcoded API endpoints or sample data
- Functions returning static/fake data
- Console.log statements that should be proper logging

### Deliverables

- Audit report with categorized findings
- Priority-ordered list of items to address
- Clear file paths and line numbers for each issue

### Commands

```bash
# Search for common placeholders
grep -r "TODO\|FIXME\|PLACEHOLDER\|MOCK\|STUB" src/ server/
grep -r "fake\|sample\|hardcoded" src/ --include="*.ts" --include="*.tsx"
```

---

## 2. CI Surgeon

**Only Job:** Make CI deterministic + fix test discovery.

### Responsibilities

- Ensure all CI workflows run consistently without flaky failures
- Fix test discovery issues across all test suites
- Remove non-deterministic behavior from tests
- Properly configure test timeouts and retries
- Optimize CI pipeline for parallel execution

### Focus Areas

- `.github/workflows/` - all workflow files
- Test configuration files (jest.config, vitest.config, etc.)
- Package.json test scripts
- Test files in `tests/` directory
- Server startup and shutdown in CI

### Anti-Patterns to Fix

- Tests dependent on system time
- Tests with race conditions
- Hardcoded ports that may conflict
- Missing test cleanup/teardown
- Flaky network-dependent tests

### Deliverables

- All CI workflows passing consistently
- Test discovery working reliably
- Documentation of test commands
- Proper test isolation

### Commands

```bash
# Validate workflows
npm run test
npm run build
npm run lint
```

---

## 3. Backend Integrity

**Only Job:** API contracts, error handling, schema validation.

### Responsibilities

- Define and enforce API contracts between frontend and backend
- Implement proper error handling with meaningful error codes
- Add request/response schema validation
- Ensure type safety across API boundaries
- Document API endpoints with examples

### Focus Areas

- `server/` directory - all API routes
- Request/response schemas (Zod, JSON Schema)
- Error handling middleware
- API documentation
- Type definitions shared between frontend/backend

### Deliverables

- API contract definitions (OpenAPI/Swagger or TypeScript types)
- Schema validation middleware
- Standardized error response format
- API documentation updates

### Code Standards

```typescript
// All API responses should follow this pattern:
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

---

## 4. Frontend Parity

**Only Job:** Remove dead UI, wire real API calls, add smoke tests.

### Responsibilities

- Identify and remove unused UI components
- Replace mock data with real API calls
- Add smoke tests for critical user flows
- Ensure feature parity between UI and backend
- Clean up deprecated or unused code

### Focus Areas

- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions
- Component storybook or test files
- API integration points

### Deliverables

- Removal of dead/unused components
- Real API integration for all features
- Smoke tests for critical paths
- Updated component documentation

### Smoke Test Checklist

- [ ] App loads without errors
- [ ] Navigation works correctly
- [ ] Critical forms submit successfully
- [ ] Error states display properly
- [ ] Loading states are shown

---

## 5. Release Captain

**Only Job:** Coordinate + enforce small PRs + keep "Definition of Done" sacred.

### Responsibilities

- Ensure all PRs are focused and small
- Enforce the Definition of Done before merging
- Coordinate between specialized agent roles
- Maintain release notes and changelog
- Guard against scope creep

### Rules

1. **Small PRs Only** - Each PR should do one thing well
2. **No dist/build artifacts** - Never commit built files
3. **Tests Required** - No merging without passing tests
4. **Clean Commits** - Meaningful commit messages
5. **Review Required** - All PRs need proper review

### Definition of Done

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No new linting warnings
- [ ] Documentation updated if needed
- [ ] PR description explains the change
- [ ] No console.log or debug statements
- [ ] Follows existing code patterns

### .gitignore Enforcement

```
# Build artifacts - NEVER commit these
dist/
build/
node_modules/
*.exe
*.log
```

### PR Size Guidelines

- **Ideal:** < 200 lines changed
- **Acceptable:** < 400 lines changed
- **Needs Splitting:** > 400 lines changed

---

## Usage Guide

### Starting a Session

1. Choose the appropriate role for your task
2. Open a new Copilot session
3. Reference this document for role responsibilities
4. Create a focused PR for your changes

### Cross-Role Coordination

When issues span multiple roles:

1. **Audit Hunter** identifies the issue
2. **CI Surgeon** or **Backend Integrity** implements the fix
3. **Frontend Parity** ensures UI reflects the change
4. **Release Captain** reviews and coordinates merge

### Commenting on PRs

Use `@copilot` in PR comments to:

- Request specific role-based analysis
- Ask for fixes within role scope
- Get suggestions for improvement

---

## Quick Reference

| Role              | One-Line Summary                                                  |
| ----------------- | ----------------------------------------------------------------- |
| Audit Hunter      | Find placeholders/mocks and classify                              |
| CI Surgeon        | Make CI deterministic + fix test discovery                        |
| Backend Integrity | API contracts, error handling, schema validation                  |
| Frontend Parity   | Remove dead UI, wire real API calls, add smoke tests              |
| Release Captain   | Coordinate + enforce small PRs + keep "Definition of Done" sacred |
