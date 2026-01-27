# MVP Plan (Prototype -> Supabase MVP)

Date: 2026-01-27

This plan follows the repo contracts and the user milestone list. It keeps
work inside the allowed paths and preserves the Dreieck-1x1 pedagogy/UX rules.

## Scope guardrails

Work only in:
- apps/student-pwa/**
- apps/teacher-dashboard/**
- packages/types/**
- packages/storage/**
- packages/core-engine/** (only if required for task/event contracts)
- supabase/**
- spec/** and docs/**

## Milestones

### M1 - Backend scaffolding (schema + RLS + edge functions)
Goal: Supabase tables + RLS + edge functions (join_class, submit_events).
Files touched (expected):
- supabase/migrations/*.sql
- supabase/functions/join_class/index.ts
- supabase/functions/submit_events/index.ts
- spec/MILESTONE_1_REPORT.md
Commands:
- pnpm -r build
- supabase status / supabase start / supabase db reset (if CLI is used)

### M2 - Supabase client wiring (both apps)
Goal: client setup and env examples.
Files touched (expected):
- apps/student-pwa/package.json
- apps/teacher-dashboard/package.json
- apps/student-pwa/src/services/supabaseClient.ts
- apps/teacher-dashboard/src/services/supabaseClient.ts
- apps/student-pwa/.env.example
- apps/teacher-dashboard/.env.example
- spec/MILESTONE_2_REPORT.md
Commands:
- pnpm -C apps/student-pwa build
- pnpm -C apps/teacher-dashboard build

### M3 - Student join flow + local identity storage
Goal: join screen calls join_class; identity stored locally.
Files touched (expected):
- apps/student-pwa/src/routes/Join.tsx
- apps/student-pwa/src/services/joinUseCases.ts
- packages/storage/src/local/idb.ts (classId + packId meta if needed)
- apps/student-pwa/src/services/sessionIdentity.ts (new)
- spec/MILESTONE_3_REPORT.md
Commands:
- pnpm -C apps/student-pwa build

### M4 - Event log + sync client
Goal: append-only local events and submit_events sync.
Files touched (expected):
- packages/storage/src/remote/syncClient.ts
- apps/student-pwa/src/services/practiceUseCases.ts
- packages/types/src/events/StudentEvents.ts (if needed)
- packages/storage/src/events/validator.ts (if needed)
- spec/MILESTONE_4_REPORT.md
Commands:
- pnpm -r test
- pnpm -r build

### M5 - Teacher dashboard MVP
Goal: Auth login + class management + KPI view from task_end_events.
Files touched (expected):
- apps/teacher-dashboard/src/App.tsx
- apps/teacher-dashboard/src/services/*
- spec/MILESTONE_5_REPORT.md
Commands:
- pnpm -C apps/teacher-dashboard build

### M6 - Practice ladder exactness + event correctness
Goal: phase machine and event emission match spec.
Files touched (expected):
- apps/student-pwa/src/routes/Practice.tsx
- packages/ui-kit/src/student/FeedbackLadder.tsx
- packages/ui-kit/src/student/Keypad.tsx (if needed)
- packages/core-engine/src/engine/gamification.ts (if needed)
- packages/core-engine/tests/* (vitest)
- spec/MILESTONE_6_REPORT.md
Commands:
- pnpm -C apps/student-pwa build
- pnpm -r test

### M7 - Docs + QA
Goal: README updates + env/supabase deployment docs + final green checks.
Files touched (expected):
- README.md
- docs/* (env + supabase deploy steps)
- spec/MILESTONE_7_REPORT.md
Commands:
- pnpm install
- pnpm -r test
- pnpm -r build

## Notes

- All user-facing strings in apps must be de-CH and avoid the character ss.
- No secrets committed; Supabase service role key only via secrets.
- Avoid raw hex colors in React components; use token classes.
