# Repo Reality (snapshot)

Date: 2026-01-26

This file summarizes the current repo structure and how the README expects the repo to run.
If this document conflicts with spec files, the spec files win.

## High-level structure

- apps/
  - student-pwa (Vite + React)
  - teacher-dashboard (Vite + React)
- packages/
  - core-engine (pure pedagogy, mastery, picker)
  - storage (IndexedDB, event log, sync client)
  - types (domain + events)
  - validation (Zod schemas)
  - ui-kit (shared UI)
  - theme (tokens)
  - analytics-client (placeholder)
- services/
  - api (placeholder backend)
  - payments (placeholder)
  - lti (docs placeholder)
- docs/ (architecture and local dev docs exist)
- spec/ (contracts; some files empty placeholders)
- tests/ (Playwright + perf budgets present but not wired to a runner)
- curriculum/ (packs + schema)
- schema/ (README)

## How README expects you to run the repo

From README + docs/local-development.md:

- Install:
  - corepack enable
  - pnpm install
- Run student app:
  - pnpm dev
- Run teacher dashboard:
  - pnpm --filter @triangle/teacher-dashboard dev
- Run API placeholder:
  - pnpm dev:api
- Other scripts:
  - pnpm build
  - pnpm test
  - pnpm lint

Root package.json implements:
  - dev -> pnpm --filter @triangle/student-pwa dev
  - build/test/lint -> pnpm -r --if-present build/test/lint

## Observed gaps / drift

- spec/brief_v1.md is empty.
- spec/mastery-algorithm.md is empty (docs/mastery-algorithm.md exists).
- spec/offline-sync.md is empty (docs/offline-sync.md exists).
- spec/privacy-posture.md is empty (docs/privacy-posture.md exists).
- spec/lti.md is empty (docs/lti.md exists).
- tests/ exists (Playwright + axe + perf budgets), but there is no root test runner config in package.json that wires these files (no Playwright config found yet).
- packages/storage/src/events/types.ts is empty.
- README contains non-ASCII characters that appear mis-encoded in this environment. This is cosmetic, not functional.

## Decision: single app vs workspace

Keep the existing PNPM workspace and implement MVP inside:
- apps/student-pwa (UI + orchestration)
- packages/core-engine (task generation + gamification)
- packages/types + packages/storage (contracts + validators)

