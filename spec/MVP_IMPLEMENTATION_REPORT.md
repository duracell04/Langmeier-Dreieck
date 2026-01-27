# MVP_IMPLEMENTATION_REPORT

## 2026-01-27 Batch A (Supabase + Teacher MVP)
Implemented:
- Supabase schema alignment: classes.settings jsonb + teacher_user_id, RLS updates.
- Edge functions: join_class settings fallback + identityToken acceptance; submit_events unchanged behavior but aligned with schema.
- Teacher dashboard: class defaults stored in settings, join URL uses /join?code, KPIs accuracy + bottleneck top 5.
- Deploy docs for Supabase.

Files:
- supabase/migrations/20260127162000_class_settings_teacher_user.sql
- supabase/functions/_shared/validation.ts
- supabase/functions/join_class/index.ts
- apps/teacher-dashboard/src/App.tsx
- docs/supabase-deploy.md

Commands run:
- pnpm -C apps/teacher-dashboard build (FAIL: esbuild spawn EPERM)
- pnpm -r build (PASS)
- pnpm -r test (PASS)

Assumptions:
- Join URL uses /join?code=... and SPA hosting rewrites to index.html.

## 2026-01-27 Batch B (Student + Engine + Event Pipeline)
Implemented:
- Cached class config in student join flow; practice reads cached config for mode/session length/division/square mode.
- Practice updates for dynamic session length/mode and stable feedback copy.
- Added engine tests for learn plan determinism, seeded picker determinism, and requeue swap-spacing deferral.
- Added storage sync client test with fetch mock for cursor and dedupe handling.

Files:
- apps/student-pwa/src/services/joinUseCases.ts
- apps/student-pwa/src/routes/Practice.tsx
- packages/storage/src/local/idb.ts
- packages/core-engine/tests/learnQueue.test.ts
- packages/core-engine/tests/picker.test.ts
- packages/core-engine/tests/requeue.test.ts
- packages/storage/tests/syncClient.test.ts
- spec/MVP_INVENTORY_CHECK.md

Commands run:
- pnpm -C apps/student-pwa build (FAIL: esbuild spawn EPERM)
- pnpm -r test (PASS)
- pnpm -r build (PASS)

Assumptions:
- Student join uses classConfig from join_class response; if missing, defaults are used.
- Product set filtering remains neutral until a canonical mapping is specified.
