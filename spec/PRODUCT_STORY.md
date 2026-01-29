# PRODUCT_STORY

Source of truth for MVP product behavior and UX. This file is authoritative and is linked to:
- ENGINE_RULES (task generation + queues): spec/ENGINE_RULES.md
- DATA_BACKEND (events + sync + backend): spec/DATA_BACKEND.md

## Student journey (end-to-end)
1) Join class
   - Enter join code or follow join URL with ?code=XXXX.
   - Choose optional identity marker (no personal data).
   - If offline, show status and allow local-only practice after prior join.
2) Practice
   - One-screen loop: triangle task, keypad, feedback, optional structure lens.
   - Session resumes after refresh within idle window (no login required).
3) Results
   - Show summary of last session (items, accuracy, reveals, duration).
   - Offer "practice again" and "home".
4) Rejoin
   - Use stored join info to rejoin the last class with one action.
   - If offline, practice continues and sync happens later.

## Teacher journey (end-to-end)
1) Login
   - Email + magic link or org SSO (future); for MVP use a simple login screen stub.
2) Create class defaults
   - Choose pack/set, session length, mode (learn/test), and division enabled.
   - Generate join code and join URL.
3) Join screen
   - Show join code and join URL (QR image optional).
   - Provide printable slips (future) but must not block MVP.
4) Results KPIs
   - View class-wide KPIs: accuracy, reveals, bottlenecks, confusion clusters.
   - Drill down by family/product, time window, and session.

## UX invariants (must always hold)
- One-screen loop for practice (no multi-step wizard).
- Calm feedback: no shaming, no flashing red, no punitive copy.
- No clutter: only essential controls, large tappable inputs.
- No multiple choice; the student always inputs the missing value.

## Practice phase machine (contract)
State machine for a single task. Timings are default values; small tuning allowed if UX improves.

States:
- solve: student can input answer.
- wrong1: show "try again" feedback; input cleared.
- success: correct answer confirmed; auto-advance after SUCCESS_DWELL_MS.
- reveal: show structure lens + correct answer; stays visible until correct input; task requeued on completion.

Transitions:
- solve -> success on correct input.
- solve -> wrong1 on first wrong input.
- wrong1 -> solve on next input.
- solve/wrong1 -> reveal on second wrong input.
- reveal -> success on correct input (task requeued), then advance after success dwell.

Timing defaults (align with app constants):
- SUCCESS_DWELL_MS = 700

Structure lens rules are defined in ENGINE_RULES.
Event emissions are defined in DATA_BACKEND.

## UI copy rules
- De-CH spelling only (use ae/oe/ue, no sharp-s; use ss instead).
- Short, calm sentences; avoid exclamation marks.
- Copy must match grade-appropriate German and avoid slang.

## Design polish gates
- Tokens-first styling (use design tokens from the theme system).
- Prefer shared UI components from @triangle/ui-kit.
- Accessibility: contrast AA, focus states, 44px tap targets, label inputs.

## Navigation contract (locked)
- Student PWA uses hash routing (see apps/student-pwa/src/main.tsx).
- Teacher dashboard uses hash routing (see apps/teacher-dashboard/src/main.tsx).
- Do not introduce a new navigation library; keep current approach.
