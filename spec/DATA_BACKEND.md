# DATA_BACKEND

Source of truth for client event emission, sync, and backend contract. This file is authoritative and is linked to:
- PRODUCT_STORY (UX + practice states): spec/PRODUCT_STORY.md
- ENGINE_RULES (task generation + identity): spec/ENGINE_RULES.md

## Session identity model
Persist locally and resume within idle window:
- classId (nullable if not joined yet)
- studentRef (pseudonymous; no PII)
- deviceId
- sessionId
- packId / setId
- rngSeed
- mode (learn/test)

## Event types + emission points
All events are append-only with version and event_id. Emission points are exact:
- session_start: when a session is created (first task of session not yet shown).
- task_shown: when a task is rendered to the student.
- attempt_submitted: on each answer submit (includes correctness and latency).
- hint_used: when structure lens is shown due to second wrong answer or manual hint.
- task_end: when a task completes (correct or reveal).
- session_end: when session ends (route change away or unload) with duration + summary.

Rule: Exactly one task_end must be emitted per task instance.

## Sync algorithm (offline-first)
- Always write events locally first.
- Batch upload events since lastAck cursor.
- Idempotent by event_id (optionally scoped by studentRef).
- Use lastSyncTs cursor with an overlap window (e.g., 60s) to handle clock skew.
- Never delete local events until acknowledged by server.

## Supabase backend contract (MVP)
Tables (conceptual):
- classes (id, name, created_by, defaults)
- students (studentRef, classId, createdAt)
- events (event_id, studentRef, classId, sessionId, type, version, payload, clientTs, serverReceivedAt)
- task_end_events (denormalized from events for analytics)
- kpi_cache (optional materialized aggregates)

RLS intent:
- students can only write their own events via edge function.
- teachers can read aggregates for their classes.

Edge functions:
- join_class: validates join code, issues studentRef + classId, returns pack/set defaults.
- submit_events: accepts event batch, scrubs PII, enforces version, inserts idempotently.

Teacher KPIs:
- accuracy, reveal rate, time per task, bottlenecks by product, confusion clusters.

## Env/secrets policy
- Frontend uses anon key only via env (e.g., VITE_SUPABASE_*).
- Service role key only in Supabase secrets; never in repo or client.

## Dependency policy (MVP)
- Join URL with code parameter is required; QR image is optional.
- Prefer no new dependencies for QR generation; use a static QR in docs if needed.
