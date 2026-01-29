# MVP_INVENTORY_CHECK

Date: 2026-01-27

This audit is derived from:
- spec/PRODUCT_STORY.md
- spec/ENGINE_RULES.md
- spec/DATA_BACKEND.md

## PRODUCT_STORY
- Student journey (join -> practice -> results -> rejoin): PASS
  Evidence: apps/student-pwa/src/routes/Join.tsx, apps/student-pwa/src/routes/Practice.tsx, apps/student-pwa/src/routes/Results.tsx
- Teacher journey (login -> create class defaults -> join screen -> results KPIs): PASS
  Evidence: apps/teacher-dashboard/src/App.tsx
- UX invariants (one-screen loop, calm feedback, no clutter, no multiple choice): PASS
  Evidence: apps/student-pwa/src/routes/Practice.tsx, packages/ui-kit/src/student/FeedbackLadder.tsx, packages/ui-kit/src/student/Keypad.tsx
- Practice phase machine (solve|wrong1|reveal-hold|success): PASS
  Evidence: apps/student-pwa/src/routes/Practice.tsx, packages/core-engine/src/engine/phaseMachine.ts
- UI copy rules (de-CH, no sharp-s): PASS
  Evidence: apps/student-pwa/src/routes/Join.tsx, apps/student-pwa/src/routes/Practice.tsx, apps/teacher-dashboard/src/App.tsx
- Design polish gates (tokens-first, component usage, accessibility): PASS
  Evidence: apps/student-pwa/src/routes/Practice.tsx, packages/ui-kit/src/student/Keypad.tsx, packages/ui-kit/src/student/FeedbackLadder.tsx
- Navigation contract (locked): PASS
  Evidence: apps/student-pwa/src/main.tsx, apps/teacher-dashboard/src/main.tsx

## ENGINE_RULES
- Domain primitives (relation, factor pairs, task variant fields): PASS
  Evidence: packages/types/src/domain/ProductFamily.ts, packages/types/src/domain/Task.ts
- Learn queue policy (deterministic, swap adjacent, stable division variants): PASS
  Evidence: packages/core-engine/src/engine/learnQueue.ts
- Test queue policy (seeded, fair, anti-swap N=2, recent family window 2-3): PASS
  Evidence: packages/core-engine/src/engine/picker.ts
- Requeue policy (reveal -> minSpacing=6, density cap, swap spacing): PASS
  Evidence: packages/core-engine/src/engine/requeue.ts, apps/student-pwa/src/routes/Practice.tsx
- Stable task key rules (no random UUID for identity): PASS
  Evidence: packages/core-engine/src/engine/generateTask.ts
- Squares special-case (hide both factors optionally; reveal after correct in Learn): PASS
  Evidence: packages/core-engine/src/engine/learnQueue.ts, apps/student-pwa/src/routes/Practice.tsx
- Structure lens semantics (10x10 fill, no answer-leak highlights): PASS
  Evidence: packages/ui-kit/src/student/StructureLensGrid.tsx
- Required unit tests list (determinism + spacing): PASS
  Evidence: packages/core-engine/tests/learnQueue.test.ts, packages/core-engine/tests/picker.test.ts, packages/core-engine/tests/requeue.test.ts

## DATA_BACKEND
- Session identity model (classId, studentRef, deviceId, sessionId, packId/setId): PASS
  Evidence: packages/storage/src/local/idb.ts, packages/core-engine/src/session/sessionManager.ts, apps/student-pwa/src/services/joinUseCases.ts
- Event types + emission points (session_start, task_shown, attempt_submitted, hint_used, task_end, session_end): PASS
  Evidence: apps/student-pwa/src/routes/Practice.tsx, packages/types/src/events/StudentEvents.ts
- Exactly one task_end per task end: PASS
  Evidence: apps/student-pwa/src/routes/Practice.tsx
- Sync algorithm (batching, idempotent by event_id, lastSyncTs cursor + overlap): PASS
  Evidence: apps/student-pwa/src/services/practiceUseCases.ts, packages/storage/src/remote/syncPlanner.ts
- Supabase backend contract (tables, RLS intent, edge functions, task_end_events, KPIs): PASS
  Evidence: supabase/migrations/20260127121400_mvp_schema.sql, supabase/functions/join_class/index.ts, supabase/functions/submit_events/index.ts, apps/teacher-dashboard/src/App.tsx
- Env/secrets policy (anon in frontend env, service role only in Supabase secrets): PASS
  Evidence: apps/teacher-dashboard/src/services/supabaseClient.ts, supabase/functions/join_class/index.ts
- Dependency policy (QR via join URL; QR image optional; prefer no new deps): PASS
  Evidence: apps/teacher-dashboard/src/App.tsx
