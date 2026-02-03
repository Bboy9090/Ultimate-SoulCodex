# GitHub Copilot Agent Definitions

This directory contains individual agent prompt definitions for specialized GitHub Copilot sessions.

Each agent file defines a focused role for automated code review, fixes, and improvements.

## Available Agents

- `audit-hunter.agent.md` - Finds placeholders, mocks, and stubs
- `ci-surgeon.agent.md` - Fixes CI/CD pipeline issues
- `backend-integrity.agent.md` - Ensures API contracts and error handling
- `frontend-parity.agent.md` - Removes dead UI and wires real APIs
- `release-captain.agent.md` - Enforces PR standards and Definition of Done

## Usage

Reference these agent definitions when:
- Setting up GitHub Copilot chat sessions
- Configuring automated code review workflows
- Creating PR templates with role-specific guidance

See `.github/AGENTS.md` for the complete agent role definitions.
