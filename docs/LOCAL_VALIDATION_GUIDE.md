# Soul Codex Local Validation Guide

This guide mirrors the essential release checks without relying on GitHub-hosted Actions.

## Supported environment

- Google Cloud Shell or another Linux shell
- Node.js 22 or newer
- npm
- Git

## Prepare the branch

```bash
git fetch origin
git switch <branch-name>
git pull --ff-only origin <branch-name>
git status
git rev-parse HEAD
```

The working tree must be clean before validation.

## Install locked dependencies

```bash
npm ci
```

## Required checks

Run each command separately and stop at the first failure.

```bash
npm run check
npm run check:workspaces
npm run test
npm run build:workspaces
npm run build
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

## Production smoke test

```bash
export NODE_ENV=production
export PORT=3000
export SESSION_SECRET=local-validation-secret
npm start
```

Verify:

- `http://localhost:3000/health` returns a successful health response
- the homepage loads
- a local profile route loads
- the clarity reading opens
- compatibility shows a loading state instead of an empty page
- evidence and limitations expand and collapse
- timeline continuity text appears
- the browser console has no red errors

## Validation receipt

Record:

- branch name
- exact commit SHA
- Node and npm versions
- each command and its result
- manual browser checks
- known exceptions

A locally validated change must never be described as GitHub-Actions validated. The evidence source must be stated honestly.
