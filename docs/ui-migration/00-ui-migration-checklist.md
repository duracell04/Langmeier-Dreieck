# UI Migration Checklist

## Phase 0 — Recon + safety boundaries (no UI changes)
- [x] Detect target stack & tooling
  - Framework: React 18 + Vite (apps/student-pwa, apps/teacher-dashboard)
  - Styling: Tailwind v4 preset + CSS variables (`tailwind.preset.cjs`, `packages/theme/tokens.css`)
  - Package manager: pnpm workspace (`pnpm-workspace.yaml`)
- [x] Identify protected areas (do not rewrite logic)
  - `packages/core-engine`
  - `packages/storage`
  - `packages/types`
  - `packages/validation`
  - `services/api`
  - `apps/student-pwa/src/state` (session + learning state)
- [x] Identify UI entry points
  - Student PWA router shell: `apps/student-pwa/src/main.tsx`
  - Student routes: `apps/student-pwa/src/routes/*.tsx`
  - Student styles: `apps/student-pwa/src/styles/app.css`
  - Teacher app shell: `apps/teacher-dashboard/src/App.tsx`
  - Teacher style guide: `apps/teacher-dashboard/src/StyleGuide.tsx`
  - Teacher styles: `apps/teacher-dashboard/src/styles/app.css`
  - Shared UI kit: `packages/ui-kit/src`
  - Theme tokens: `packages/theme/tokens.css`

## Phase A — Learn source UI/brand system (read-only)
- [x] Read source README/docs for UI intent
- [x] Capture typography, spacing, colors, radius, shadows, layout, components
- [x] Document exact file paths in source

## Phase B — Theme/tokens in target
- [x] Tokens layer (semantic CSS variables)
- [x] Base typography + layout primitives
- [x] Add /styleguide route preview

## Phase C — UI kit components
- [x] Button / Card / Input / Badge
- [x] Navbar / Footer / SectionHeading / Hero
- [x] Style guide shows components

## Phase D — Landing + app shell
- [x] Landing structure matches source
- [x] Practice flow unaffected
- [x] Responsive checks

## Phase E — Refactor screens to ui-kit
- [ ] Incremental screen refactors
- [ ] No logic changes

## Phase F — Verification & guardrails
- [x] Add ui:check or equivalent
- [x] Run lint/typecheck/tests/build
- [x] Document in verification notes

## Pre-change reminders
- Read `spec/ui-style.md` + `spec/ux-states.md` before UI edits (per `apps/student-pwa/AGENTS.md`).
- Tokens only, no hex values outside tokens.

