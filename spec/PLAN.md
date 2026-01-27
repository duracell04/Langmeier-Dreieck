# PLAN (MVP delivery)

Date: 2026-01-26

This plan follows repo contracts and the user milestone list. It favors
small, verified increments and keeps the workspace layout intact.

## Architecture summary

- Screens (no router): setup | practice | results.
- App state via React Context + useReducer with slices:
  - settings: mode (learn/test), product sets, speed (600-800ms), aids toggles.
  - session: sessionId, rngSeed, phase, attemptsBeforeEnd, input, queue, taskShownAt.
  - progress/events: TaskEndEvent list and derived session summary.
- Domain modules:
  - packages/core-engine: product sets + families, seeded RNG, task generation,
    learn/test queues, requeue spacing, computeGamification(events).
  - packages/types: canonical event and domain types.
  - packages/ui-kit: base primitives + practice UI pieces.
- Persistence:
  - localStorage versioned blob with safe fallback on mismatch/corruption.
- i18n:
  - use apps/student-pwa/src/i18n/de-CH.json + small t() helper; no hardcoded
    strings in Student PWA UI.
- Timing constants (single source):
  - SUCCESS_DWELL_MS = 700
  - REVEAL_DWELL_MS = 1600

## Planned file tree (add/update)

- apps/student-pwa/src/App.tsx (screen enum switch)
- apps/student-pwa/src/screens/Setup.tsx
- apps/student-pwa/src/screens/Practice.tsx
- apps/student-pwa/src/screens/Results.tsx
- apps/student-pwa/src/state/ (context, reducers, actions, selectors)
- apps/student-pwa/src/state/persistence.ts
- apps/student-pwa/src/i18n/ (update keys + t() helper)
- apps/student-pwa/src/theme/tokens.css (design system tokens)
- apps/student-pwa/src/styles/app.css (import local tokens + tailwind)
- packages/core-engine/src/engine/ (families, queue, RNG, gamification updates)
- packages/core-engine/tests/ (vitest unit tests)
- packages/ui-kit/src/shared/ (Toggle, Chip, Divider; adjust Button/Card if needed)
- spec/DESIGN_SYSTEM.md
- spec/UI_QA.md
- spec/MILESTONE_<n>_REPORT.md per milestone

## Assumptions (safest choices)

- Student PWA is the MVP surface; teacher dashboard remains minimal but must build.
- localStorage (not IndexedDB) is acceptable for MVP persistence.
- Only de-CH strings are required; i18n keys are used everywhere in Student PWA UI.
- Add vitest only if needed to satisfy pnpm test for pure functions.

## Milestones (with required commands)

### Milestone 1 — Green baseline (repo runnable)
Goal: pnpm install/dev/build work according to README (or adjust README).
Commands:
- pnpm install
- pnpm dev
- pnpm build

### Milestone 2 — Design system + base components
Goal: tokens + base components exist and are used.
Commands:
- pnpm dev
- pnpm build

### Milestone 3 — Domain + task generator + unit tests
Goal: product-centric engine works and is tested.
Commands:
- pnpm test
- pnpm build

### Milestone 4 — App state + persistence
Goal: context/reducer slices + localStorage versioning.
Commands:
- pnpm test
- pnpm build

### Milestone 5 — Practice UI + exact phase machine + tests
Goal: one-screen loop works exactly; no layout shift.
Commands:
- pnpm dev
- pnpm test
- pnpm build

### Milestone 6 — Results + computeGamification + subtle UI
Goal: deterministic results from TaskEndEvent log.
Commands:
- pnpm test
- pnpm build

### Milestone 7 — QA checklist + README update + final green checks
Goal: ship-ready MVP.
Commands:
- pnpm install
- pnpm test
- pnpm build
