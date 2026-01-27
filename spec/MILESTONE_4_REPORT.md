# MILESTONE 4 REPORT

Date: 2026-01-27

## Summary

Implemented event emission and offline-first sync, added a Supabase submit_events client, and updated the practice loop to log session/task events and sync them.

## Files changed

- packages/storage/src/remote/syncClient.ts
- packages/storage/src/index.ts
- packages/storage/src/local/idb.ts
- packages/types/src/events/StudentEvents.ts
- packages/storage/src/events/validator.ts
- spec/events-schema.md
- apps/student-pwa/src/services/practiceUseCases.ts
- apps/student-pwa/src/routes/Practice.tsx
- packages/ui-kit/src/student/FeedbackLadder.tsx

## Commands run

- pnpm -r test
- pnpm -r build

## Key output

- pnpm -r test completed (no tests configured yet).
- pnpm -r build succeeded; both Vite apps built successfully.

## Assumptions / decisions

- Events are appended locally first and synced via submit_events using the anon key.
- lastAckTs is tracked in IndexedDB meta to limit uploads; duplicates are safe due to event_id dedupe.
- BaseEvent now includes optional at as an alias of ts to match TaskEnd contract without a version bump.
