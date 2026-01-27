# Repo Reality (snapshot)

Date: 2026-01-27

This file summarizes the repo as observed before coding. If this document
conflicts with spec files, the spec files win.

## Stage clarity

- Current repo stage: Prototype (local-only backend/persistence).
- MVP target: Supabase-backed backend with deployable UX/UI and real teacher/student usage.

## Workspace structure (high level)

- apps/
  - student-pwa (Vite + React)
  - teacher-dashboard (Vite + React)
- packages/
  - core-engine (pedagogy, task generation, gamification)
  - ui-kit (shared UI primitives)
  - theme (tokens)
  - types (domain + events types)
  - validation (runtime schemas, currently empty stubs)
  - storage (IndexedDB event log + validators, remote sync stub)
- services/ (placeholder backend services)
- supabase/ (local CLI config + functions/migrations scaffold)
- docs/ (overview docs)
- spec/ (contracts; some files empty placeholders)
- tests/ (Playwright + perf scaffolding, not wired)
- curriculum/ (packs + schema)

## Top-level scripts and expectations

Root package.json:
- dev: pnpm --filter @triangle/student-pwa dev
- build: pnpm -r --if-present build
- test: pnpm -r --if-present test
- lint: pnpm -r --if-present lint

From README/docs:
- Install: corepack enable; pnpm install
- Run student PWA: pnpm dev
- Run teacher dashboard: pnpm --filter @triangle/teacher-dashboard dev
- Run API placeholder: pnpm dev:api (prints message only)

## App configs

- Vite configs: apps/*/vite.config.mts
  - student-pwa aliases core-engine src
  - teacher-dashboard minimal
- Tailwind: root preset (tailwind.preset.cjs) + app configs
- Theme tokens: packages/theme/tokens.css

## Domain and storage state

- packages/types defines StudentEvent v1 and domain types.
- packages/storage implements IndexedDB event log and session storage.
- packages/storage remote sync client is an empty stub.
- packages/validation schemas folder is empty.

## Supabase state

- supabase/ exists but migrations/functions are not yet defined for MVP.

## Observed gaps / drift

- spec/brief_v1.md, spec/mastery-algorithm.md, spec/offline-sync.md,
  spec/privacy-posture.md, spec/lti.md are empty placeholders.
- Student PWA uses hardcoded strings and a prototype practice loop
  that does not match the required phase machine.
- Teacher dashboard is a static mock without auth or data.
- Event sync and Supabase edge functions are not implemented.
- build/test scripts in several packages are stubs; no vitest tests exist yet.
- README and UI strings appear mis-encoded in this environment (cosmetic).

## Safety/privacy constraints

- No student PII is present; event types support pseudonymous studentRef.
- Server-side PII scrubber is specified but not yet implemented in Supabase flows.
