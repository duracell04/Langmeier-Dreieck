# Triangle 1×1 (Langmeier-Dreieck) — Student PWA + Teacher Dashboard

A **privacy-first, offline-capable practice instrument** for mastering multiplication/division facts via **product-centred factor families** (triangle schema) with an optional **100-grid “structure lens”**, plus a **teacher dashboard** that converts progress into **actionable classroom next steps**.

> **Positioning:** This is a *precision fluency tool*, not edutainment. It optimizes for **calm focus**, **fast retrieval**, and **role clarity** (especially for division).

---

## Why Triangle 1×1 is different

Most “times tables” practice is row-based (6-times table, then 7-times table…). Triangle 1×1 is **product-centred**:

- The **product** is the stable anchor (e.g., 24).
- Learners retrieve the **factor family** (1×24, 2×12, 3×8, 4×6).
- Multiplication and division are trained in **one relational structure**, with division **asymmetry** made explicit.

This supports **relational understanding** over purely instrumental procedures (Skemp, 1976) and encourages **derived fact strategies** rather than counting-based routines (Baroody, 2006).

---

## Core learning principles (designed into the UX)

- **Active retrieval practice** (typed answer via custom keypad) is stronger for durable memory than recognition tasks.
- **Spacing + interleaving** are implemented via an explainable mastery queue and mixed Test mode (Cepeda et al., 2006; Rohrer & Taylor, 2007).
- **Multiple representations** (triangle schema + optional 100-grid/arrays) build representational fluency and reduce fragile “row counting” cues.
- **Non-shaming feedback** treats errors as information signals; staged correction supports learning from errors (Metcalfe, 2017).

---

## What ships in v1

### Student PWA (offline-first)
- **One-screen practice loop** (no menus mid-session)
- **Learn mode** (scaffolded): structure lens + family glance allowed, untimed by default
- **Test mode** (interleaved): minimal aids, optional timed sprints
- **Multiplication + Division** with **visual role clarity**
- **Mastery queue** (family-level) + **re-queue** on errors
- **Static 100-grid structure lens (SVG)** (animations deferred)
- **Anonymous classroom join** via QR + short join code (no student emails)

### Teacher dashboard (web)
- Create class + choose set(s) + generate **QR + printable slips (PDF)**
- **Class overview:** accuracy, time-on-task, sessions/week
- **Actionable insights:** bottleneck products, confusion clusters, “who needs what”
- **Assign:** sets + duration in ≤ 60 seconds
- Exports: **PDF + CSV**
- Reset/delete class data

**Non-goals (v1):** Unity-style game world, deep LMS plugins (LTI later), complex AI personalization, full parent billing flows.

---

## Teacher workflows (what to do with the data)

### 1) Bottleneck intervention
Dashboard: “Top bottleneck families: 42, 48, 56”  
Action: Assign a short, focused set (5 min/day) to the students who show high error rates on those families.

### 2) Confusion cluster mini-lesson
Dashboard: “When shown 6×7, many answers map to 6×8 (48) or 7×7 (49)”  
Action: Teach contrast (6×7 vs 6×8) briefly, then assign contrast practice.

### 3) Division role-clarity intervention
Dashboard: “Group A: strong multiplication, weak division; high role confusion”  
Action: Assign a division-focused set that explicitly alternates **quotitive vs partitive** forms (see below).

---

## Division semantics (built-in, role-based)

Triangle 1×1 distinguishes the two core meanings of division:

- **Quotitive (measurement):** `24 ÷ 6 = ?` (“How many 6s fit in 24?”)
- **Partitive (sharing):** `24 ÷ ? = 6` (“Split 24 into 6 groups — how many per group?”)

The UI encodes asymmetry:
- the **given** value is visually **locked**
- the **missing slot** is the only editable target

This prevents common role-mapping errors documented in division research (Fischbein et al., 1985; Correa et al., 1998).

---

## Data model (high-level)

- **ProductFamily** = product + canonical `factorPairs[]`  
  (no “primary factor” in logic; optional `canonicalPair` only as a UI hint)

- **Tasks are generated (not stored)** and are **role-based**:
  - operation (mul/div)
  - chosen factor pair
  - missing slot (product/left/right)
  - optional division meaning (quotitive/partitive)

- **Attempts** capture correctness, time, and **error type** for actionable analytics.

---

## Mastery scheduling (v1 summary)

v1 uses an explainable **SM/Leitner-style** queue at **family level**:

- Correct → interval increases; after N consecutive correct → family “graduates” to a higher bucket
- Wrong → short re-queue + bucket down
- **Cross-operation stabilization:** division errors bias the next items toward the **inverse multiplication** in the same family to reinforce the relational scaffold.

> Full spec: see `/spec/mastery_params.md` and `/docs/mastery-algorithm.md`  
> Rationale: spacing + interleaving effects (Cepeda et al., 2006; Rohrer & Taylor, 2007)

---

## Error taxonomy (for actionable instruction)

Errors are classified to drive interventions (examples):
- `wrong_value` (fact error)
- `role_confusion` (division slot mapping)
- `swapped_factors` (left/right swap if meaningful in UI)
- `wrong_family` (answered another product family)
- `plausibility` (structurally impossible / very off)

Dashboard uses these to group students by *what they struggle with*, not just by score.

---

## Offline-first architecture (classroom-safe)

- **IndexedDB** stores local state and an **append-only event log**
- Sessions work offline after first load; sync is opportunistic
- **Local device is source of truth during sessions**
- Sync never overwrites derived mastery state; mastery is recomputable from events

> Full protocol + edge cases: `/docs/offline-sync.md`

### Session recovery (refresh/crash)
A shared session manager handles re-binding after refresh so students can continue without logins.

> See `/packages/core-engine/src/session/`

---

## Privacy by design (CH/EU posture)

**We collect only what is necessary for instruction:**
- attempts (task key, correctness, response time)
- hint usage (structure lens, family glance)
- session boundaries (start/end, duration)

**We do not collect:**
- student emails
- required real names (optional nickname only)
- third-party advertising trackers
- behavioral profiling across apps

Teachers can reset/delete class data. Data minimization aligns with privacy-by-design requirements (GDPR Art. 25; Cavoukian, 2009).

> Enforcement and retention details: `/docs/privacy-posture.md` and `/services/api/privacy/`

---

## Performance budgets (student loop is a “precision instrument”)

- First load (cold): **< 2s** on typical school Wi‑Fi (after caching: near instant)
- Answer → next item: **< 100ms perceived**
- Feedback visible: **≤ 400ms**
- Structure lens: SVG, smooth on older iPads

Budgets are enforced via CI checks (Lighthouse/perf tests).

> See `/tests/performance/`

---

## Repository structure (monorepo)

```
/apps
/student-pwa
/teacher-dashboard
/packages
/core-engine        # task generation, mastery, picker, session recovery
/storage            # indexeddb, append-only log, sync client
/ui-kit             # reusable components (Triangle, Keypad, Grid Lens)
/types              # shared TS types (domain + events + API contracts)
/validation         # runtime schemas (e.g., Zod) for API payloads
/curriculum
/packs              # locale packs (engine once, packs per market)
/schema             # JSON schema + versioning
/services
/api                # class join, sync, dashboard aggregations
/payments           # placeholder skeleton + feature flags (later)
/lti                # placeholder docs + middleware (later)
/docs
/spec
/tests
```

---

## Getting started (development)

> This repo is designed for PNPM workspaces + a monorepo runner (Turborepo or Nx).
> Adjust commands to match your chosen tooling.

Typical flow:
1. Install dependencies
2. Run the student PWA and dashboard
3. Run unit + e2e tests

Documentation for scripts and local env setup:
- `/docs/architecture.md`
- `/docs/local-development.md`

---

## Testing (required in classroom software)

- **Unit tests:** core-engine (mastery, picker, error typing)
- **Simulation tests:** 1,000 “virtual students” to validate mastery progression and prevent infinite loops
- **E2E tests:** join flow, offline-then-sync, teacher setup
- **Perf tests:** Lighthouse budgets + item transition latency
- **Accessibility:** WCAG checks (axe)

See `/tests/`.

---

## Internationalization (from day 1)

- No text in code; all strings via i18n
- Locale keys: `de-CH`, `de-DE`, `en-US`, `fr-FR`, `es-ES`
- Curriculum is delivered as **packs** per market

See `/curriculum/` and `/apps/*/i18n/`.

---

## LMS integration (planned)

LTI 1.3 requires a server-side OIDC handshake and mapping LMS contexts to classes. v1 ships without LTI; the repo contains scaffolding only.

See `/services/api/src/middleware/` and `/docs/lti.md`.

---

## Project stages (clarity)

This repo is intentionally staged. The **current repo state is Prototype**.

- **Prototype (current):** minimal frontend, local-only backend/persistence. No deployed backend; focus on the core practice loop and event logging.
- **MVP (next):** deployable release with nicer UX/UI and a **Supabase-backed backend**. Real teachers and students start using it; offline-first sync goes to Supabase.
- **Improvement stage:** collect feedback, then iterate on pedagogy, performance, and UX.
- **Monetization stage:** donors, subscriptions, and/or one-time payments to cover running costs and ongoing development (after MVP traction).

---

## Roadmap status (transparent)

| Component | Status | Notes |
|---|---:|---|
| Student PWA core loop | v1 | triangle + keypad + Learn/Test |
| Offline-first event log | v1 | append-only + opportunistic sync |
| Teacher dashboard (core) | v1 | setup + bottlenecks + confusions |
| Static 100-grid lens | v1 | SVG; animations deferred |
| Payments / licensing | later | feature flags + webhooks skeleton |
| LTI 1.3 | later | server middleware required |
| Native wrappers | later | only if app-store discovery needed |

**Important:** Payments/monetization/paywall are intentionally out of scope
for the pilot/MVP. The current `services/payments` area is a placeholder only
and should not be implemented until after pilot rollout and validated traction.

---

## References (design basis)

- Baroody, A. J. (2006). Why children have difficulties mastering basic number combinations. *Teaching Children Mathematics*.
- Cavoukian, A. (2009). *Privacy by Design: The 7 Foundational Principles*.
- Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3).
- Correa, J., et al. (1998). Young children’s understanding of division. *Child Development, 69*(2).
- Fischbein, E., et al. (1985). The role of implicit models in solving problems. *Journal for Research in Mathematics Education, 16*(1).
- Metcalfe, J. (2017). Learning from errors. *Annual Review of Psychology, 68*.
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Psychonomic Bulletin & Review, 14*(1).
- Skemp, R. R. (1976). Relational understanding and instrumental understanding. *Mathematics Teaching, 77*.

---

## License

All rights reserved unless otherwise specified. See `LICENSE` (or contact the maintainers for licensing options).

---

## Contact / pilots

If you are a school interested in a pilot (CH/DACH), see `/docs/pilots.md`.

If you want, I can also generate the **supporting docs** this README points to (e.g., `/docs/mastery-algorithm.md`, `/docs/offline-sync.md`, `/docs/privacy-posture.md`) in the same “audit-ready” style, plus a minimal `events-schema.json` and a `mastery-sim.ts` simulation test scaffold.

---

## MVP Supabase setup (required for sync)

This MVP uses Supabase only (no custom backend). For full steps see `docs/supabase-mvp.md`.

Quick summary:
- Create a Supabase project (or run `supabase start` locally).
- Apply migrations in `supabase/migrations`.
- Deploy edge functions `join_class` and `submit_events`.
- Set app env vars (both apps):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Students join via the `join_class` edge function and events are submitted only via `submit_events`.

---

## Deployment (MVP)

See `docs/deployment.md` for Supabase + static hosting steps and required env vars.

## Paywall placeholder (teacher-only)

The MVP includes a **feature-flagged** paywall placeholder for future Stripe integration.
It is **hidden by default** and only appears when `VITE_SHOW_PAYWALL_PLACEHOLDER=true`.
Use `VITE_ENTITLEMENT_OVERRIDE=pro` to force-unlock locally.
