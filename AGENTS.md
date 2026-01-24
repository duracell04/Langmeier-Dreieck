# AGENTS.md -- Langmeier-Dreieck (Triangle 1x1) Engineering Rules

This file defines how autonomous/dev agents must work in this repo: architecture contracts, safety/privacy constraints, and execution order. Treat this as **source-of-truth** for implementation decisions.

---

## 0) Project in one sentence
Offline-first PWA that digitises the Langmeier-Dreieck pedagogy: **ProductFamilies (product + factor pairs)** generate role-based multiplication/division triangle tasks, logged as a **versioned append-only event stream**, producing teacher-facing insights (bottlenecks, confusion clusters, who-needs-what).

---

## 1) Non-negotiable engineering contracts

### 1.1 Event log is the source of truth
- Student activity is recorded as **immutable, append-only events**.
- Derived state (mastery, aggregates) must be **recomputable** from events.
- Never "sync mastery state" as authoritative; sync events.

### 1.2 Strict schema versioning
- Every event has a `version`.
- Any incompatible event change requires:
  1) version bump
  2) migration function
  3) updated runtime validator
- Keep schemas aligned between:
  - `packages/types` (compile-time types)
  - `packages/storage/events/validator.ts` (runtime validation)
  - `spec/events-schema.md` (human contract)

### 1.3 Privacy by design enforced in code
- No student PII stored server-side (names/emails/phones/addresses/DOB).
- Student identity is **pseudonymous** via `studentRef` issued by server on join.
- Backend must reject payloads containing PII keys (scrubber).

### 1.4 Session identity + recovery
- Sessions must recover after refresh/crash:
  - persist `sessionId`, `studentRef`, `classId`, `packId`, `rngSeed`, mode
  - resume within a configured idle window
- No login required for recovery.

---

## 2) Repository boundaries (separation of concerns)

### 2.1 `packages/types` (single source of truth)
- Domain types: ProductFamily, Task, Attempt, Mastery, etc.
- Event types: immutable StudentEvent union.
- API contract types (request/response shapes).

### 2.2 `packages/validation`
- Runtime schemas (Zod) for API payloads and event batches.
- Server must validate all input using these schemas.

### 2.3 `packages/core-engine`
- Pure pedagogy logic:
  - Task generation from ProductFamilies
  - Mastery scheduling (SM/Leitner/FSRS-kernel allowed)
  - Picker selection rules
  - Error typing rules
  - Session manager + recovery logic
- Must remain UI-agnostic (no React).

### 2.4 `packages/storage`
- IndexedDB layer (local)
- Append-only event log persistence
- Sync client (remote)
- Event validation + migrations

### 2.5 Analytics split
- Client-only: session summaries (local), no class-wide analytics.
- Class-wide analytics belong in backend `services/api/src/analytics`.

### 2.6 Apps
- `apps/student-pwa`: UI + orchestration only; no pedagogy logic duplicated.
- `apps/teacher-dashboard`: UI to view aggregates and create assignments/exports.

### 2.7 Backend
- `services/api`: class creation/join, sync ingestion, aggregates, exports.
- Must scrub PII and enforce retention policy.

---

## 3) Development order (avoid architectural drift)

Agents must implement in this order:

1) **Contracts**
   - `packages/types`
   - event schema (types + validator + docs)
   - `packages/validation`
2) **Offline local loop**
   - student PWA local-only: triangle + keypad + event log + mastery
3) **Session recovery**
   - session persistence + resume
4) **Minimal backend**
   - create class, join, sync events (idempotent)
5) **Teacher dashboard**
   - consumes aggregates (bottlenecks/confusions/groups)
6) **Simulation + tests**
   - mastery simulation to prevent "stuck forever"
   - E2E offline->sync test

Do not jump ahead to payments/LTI until contracts + offline loop are stable.

---

## 4) Pedagogy -> software rules (must be preserved)

### 4.1 Product-centred
- Product is the anchor; tasks are generated from ProductFamilies.
- `ProductFamily = { product, factorPairs[] }` (no "primary factors" in logic).

### 4.2 Role-based tasks
- A Task is defined by:
  - familyId, chosen factorPair, operation (mul/div), missing slot
- Exactly **one slot is editable** in the UI.

### 4.3 Division semantics
- Support both:
  - quotitive: `product / divisor = quotient` (missing quotient)
  - partitive: `product / quotient = divisor` (missing divisor)
- UI must encode division asymmetry by **locking the given element**.

### 4.4 Cognitive load / aids
- Structure lens (100-grid) is progressive disclosure:
  - default OFF in Test
  - allowed in Learn
  - suggested after repeated errors
- Feedback is staged (calm, non-shaming):
  - first wrong: try again
  - second wrong: structure flash + show correct + re-queue soon

---

## 5) Offline-first sync contract (minimum rules)

### 5.1 Client behaviour
- Always write events locally first (IndexedDB).
- Sync opportunistically:
  - upload "events since lastAck"
  - retry safely (idempotent)
- Never delete local events until acked.

### 5.2 Server behaviour
- Ingest events with idempotency:
  - dedupe by `eventId` (and optionally by `(studentRef, eventId)`).
- Assign `serverReceivedAt` timestamp for stable ordering.
- Aggregates are derived from events (or stored caches).

### 5.3 Clock skew
- Never rely on client `ts` for ordering across devices.
- Prefer server receive time for ordering; client time only for UX metrics.

---

## 6) Testing requirements (must exist before pilots)

### 6.1 Unit tests
- Task generator determinism (seeded RNG)
- Mastery update rules
- Event schema validator accepts valid and rejects invalid events
- PII scrubber rejects forbidden keys

### 6.2 Simulation tests
- Run thousands of virtual students through mastery to detect:
  - stuck loops
  - too-slow progression
  - division-error stabilisation effect

### 6.3 E2E tests (Playwright)
- Offline session end-to-end then sync later
- Join flow (QR/code) without login
- Session recovery after refresh mid-session

### 6.4 Performance checks (CI gate later)
- Student loop: next item perceived <100ms
- Feedback visible <=400ms
- Lighthouse PWA >=90

---

## 7) Coding standards (agent rules)

- TypeScript strict mode.
- No duplication of domain logic in apps; import from packages.
- All public functions must have clear types; prefer pure functions in engine.
- Runtime validation at boundaries:
  - API request parsing uses Zod schemas
  - Event ingestion uses event validator
- No secrets in repo; use `.env` locally.
- Use small commits with focused scope.

---

## 8) Public repo hygiene (if repo is public)
- Do not commit proprietary curriculum content unless approved.
- Avoid "official" brand claims in code/comments unless contract permits.
- Keep any school data strictly local in dev; never upload real student data.

---

## 9) Where to look first
- `spec/` for contracts and acceptance criteria
- `packages/types` for canonical types
- `packages/storage/events` for validator + migrations
- `packages/core-engine/session` for recovery logic

---

## 10) Definition of Done (v1 MVP)
- Teacher can create class + QR slips quickly.
- Students can practice fully offline after first load.
- Event log sync is reliable + idempotent.
- Dashboard shows bottlenecks + confusion clusters + who-needs-what.
- Session recovery works after refresh/crash.
- No student emails; no third-party trackers by default.
