# PLAN (MVP delivery)

Date: 2026-01-26

This plan follows the repo contracts and README workflow. It favors small, verified increments.

## Approach

- Keep the current PNPM workspace layout.
- Use existing packages: types, core-engine, ui-kit, storage.
- Student PWA is the MVP surface; teacher dashboard stays minimal.
- No router: screen state only.
- Tailwind via @tailwindcss/vite only.
- No new major dependencies unless required by tests.

## Assumptions

- The student PWA is the primary MVP target.
- Specs in spec/ override docs/ if inconsistent.
- Tests are acceptable to add in packages/core-engine (pure functions) with Vitest.
- Empty spec files should be filled later; docs/ content can be used as a base.

## Current state (already in repo)

- TaskEndEvent contract added to types + validator + spec/events-schema.md.
- computeGamification and variantId implemented in packages/core-engine.
- SessionStreak, MasteryDots, BadgeStamp components added to ui-kit.

## Milestones

### Milestone 1 - Repo green baseline
Goal: clean install/build/run according to README.

Commands:
- corepack enable
- pnpm install
- pnpm dev
- pnpm --filter @triangle/teacher-dashboard dev
- pnpm build
- pnpm test

Notes:
- If tests are not wired, add minimal vitest config under packages/core-engine and update scripts.

### Milestone 2 - Domain + task engine audit
Goal: verify product sets, learn/test queues, swap spacing, requeue rule.

Work:
- Align product sets to spec list.
- Ensure learn queue is deterministic with swap adjacent.
- Ensure test queue uses seed and enforces swap spacing.
- Requeue after reveal with minSpacing=6.

Verify:
- Add vitest unit tests for generator determinism and spacing.

### Milestone 3 - State + persistence
Goal: Context + reducer + localStorage versioned persistence.

Work:
- Settings + progress persistence.
- Session state includes phase enum and timings.

Verify:
- Manual refresh keeps settings/progress.

### Milestone 4 - Practice UI + phase machine
Goal: exact ladder behavior with phase-driven UI invariants.

Work:
- Implement phase transitions: solve, wrong1, structure, success, reveal.
- Ensure gridVisible and keypadDisabled derived from phase only.
- Ensure auto-advance timings: success 700ms, reveal 1600ms.

Verify:
- Manual run and pure reducer tests.

### Milestone 5 - Results + gamification
Goal: event emission + results screen with streak and badges.

Work:
- Emit TaskEndEvent only at task end.
- Render SessionStreak, MasteryDots, BadgeStamp (cap 2).
- Use computeGamification for results.

Verify:
- Unit tests for computeGamification.
- pnpm build and pnpm test.

### Milestone 6 - Docs + polish
Goal: align docs and specs with implementation.

Work:
- Update README run instructions if needed.
- Fill empty spec files or link to docs equivalents.
- Add spec/MILESTONE_n_REPORT.md after each milestone.

