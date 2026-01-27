# Repo Reality (snapshot)

Date: 2026-01-26

This file summarizes the repo as observed before coding. If this document
conflicts with spec files, the spec files win.

## Stage clarity

- Current repo stage: **Prototype** (local-only backend/persistence).
- MVP target: **Supabase-backed backend** with deployable UX/UI and real teacher/student usage.

## High-level structure (workspace)

- apps/
  - student-pwa (Vite + React)
  - teacher-dashboard (Vite + React)
- packages/
  - core-engine (pedagogy, task generation, gamification)
  - ui-kit (shared UI primitives)
  - theme (tokens)
  - types (domain + events types)
  - validation (Zod runtime schemas)
  - storage (event log + validators, stubs)
  - analytics-client (placeholder)
- services/
  - api (placeholder backend)
  - payments (placeholder)
  - lti (docs placeholder)
- docs/ (overview docs)
- spec/ (contracts; some files empty placeholders)
- tests/ (Playwright + axe + perf budgets, not wired)
- curriculum/ (packs + schema)
- schema/ (README)
- scripts/ (check-no-hex)

## Top-level tree (depth 3)

- apps/
  - student-pwa/
    - src/
    - dist/
    - package.json
    - vite.config.mts
    - tailwind.config.cjs
    - tsconfig.json
    - AGENTS.md
    - index.html
  - teacher-dashboard/
    - src/
    - dist/
    - package.json
    - vite.config.mts
    - tailwind.config.cjs
    - tsconfig.json
    - index.html
- packages/
  - core-engine/
    - src/engine
    - src/session
    - tests/
    - package.json
    - tsconfig.json
  - ui-kit/
    - src/shared
    - src/student
    - src/teacher
    - src/utils
    - package.json
  - theme/
    - tokens.css
    - package.json
  - types/
    - src/domain
    - src/events
    - package.json
    - tsconfig.json (empty)
  - validation/
    - src/schemas
    - package.json
    - tsconfig.json (empty)
  - storage/
    - src/events
    - src/local
    - src/remote
    - package.json
    - tsconfig.json (empty)
  - analytics-client/
    - src
    - package.json
- services/
  - api/
    - src/
    - package.json
    - tsconfig.json
  - payments/
    - src/
    - package.json
  - lti/
- docs/
- spec/
- tests/
  - accessibility/
  - e2e/
  - performance/
- curriculum/
  - packs/
  - schema/
  - tools/
- schema/
- scripts/
- root files: package.json, pnpm-workspace.yaml, tailwind.preset.cjs,
  tsconfig.base.json (empty), turbo.json (empty)

## README + docs run expectations

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

## Existing config files

- Vite:
  - apps/student-pwa/vite.config.mts (React + @tailwindcss/vite; alias to core-engine src)
  - apps/teacher-dashboard/vite.config.mts (React + @tailwindcss/vite)
- Tailwind:
  - tailwind.preset.cjs (token-mapped utilities)
  - apps/*/tailwind.config.cjs (preset + content globs)
- TypeScript:
  - apps/*/tsconfig.json (strict, noEmit)
  - packages/core-engine/tsconfig.json (strict, noEmit)
  - packages/types|validation|storage/tsconfig.json (empty stubs)
  - tsconfig.base.json (empty stub)

## Observed gaps / drift

- spec/brief_v1.md is empty.
- spec/mastery-algorithm.md is empty (docs/mastery-algorithm.md exists).
- spec/offline-sync.md is empty (docs/offline-sync.md exists).
- spec/privacy-posture.md is empty (docs/privacy-posture.md exists).
- spec/lti.md is empty (docs/lti.md exists).
- packages/types and several packages have build scripts that only echo.
- packages/storage/src/events/types.ts and migrations.ts are empty stubs.
- tests/ exists (Playwright + axe + perf budgets), but no root test runner config.
- Student PWA uses hash-based routing and hardcoded strings; i18n JSON exists but is not wired.
- README shows mis-encoded characters in this environment (cosmetic).
- node_modules folders are present in repo (already installed).

## Fix strategy

- Keep the PNPM workspace and build MVP in apps/student-pwa + packages/core-engine/ui-kit/theme/types.
- Minimal repair to scripts/configs to make pnpm install/dev/build/test green.
- Only add dependencies if required for unit tests (likely vitest).
