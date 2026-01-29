# UX States Spec - Langmeier-Dreieck (Student PWA)

This spec defines the **allowed UI states** and the transitions between them.
Goal: predictable, calm behavior that implements the Brandbook feedback ladder.

If UI behavior changes, update this file.

---

## 0) Vocabulary

- **Task**: role-based multiplication/division triangle task (one editable slot)
- **Attempt**: one submission by the student
- **Feedback ladder**:
  1) wrong #1 -> "try again"
  2) wrong #2 -> show structure lens + reveal correct; keep visible until correct input; then re-queue

---

## 1) Practice loop state machine (core)

### 1.1 States

- `LOADING`
  - pack/session restoring, read local state

- `READY`
  - task rendered, input empty, slot focused

- `TYPING`
  - user entering digits

- `SUBMITTING`
  - attempt is being validated (local + engine)

- `FEEDBACK_CORRECT`
  - brief success confirmation (200-400ms)

- `FEEDBACK_WRONG_1`
  - show microcopy: `feedback.tryAgain`
  - keep task active; allow immediate retry

- `FEEDBACK_WRONG_2_REVEAL`
  - show microcopy: `feedback.structureExplanation`
  - reveal correct answer
  - keep structure lens visible until the student enters the correct answer
  - then move on (task re-queued)

- `PAUSED`
  - pause sheet; no timers; resume returns to prior state

- `TECH_ERROR`
  - only for technical issues (sync failure etc), uses danger color
  - must not appear for learning mistakes

### 1.2 Transitions (high level)

- `LOADING` -> `READY`
  - when session + task are available

- `READY` -> `TYPING`
  - on first digit input

- `TYPING` -> `READY`
  - on clear/backspace to empty

- `READY|TYPING` -> `SUBMITTING`
  - on confirm/enter

- `SUBMITTING` -> `FEEDBACK_CORRECT`
  - if correct

- `SUBMITTING` -> `FEEDBACK_WRONG_1`
  - if wrong and attemptCountForThisTask == 1

- `SUBMITTING` -> `FEEDBACK_WRONG_2_REVEAL`
  - if wrong and attemptCountForThisTask == 2
  - must display correctValue from engine

- `FEEDBACK_CORRECT` -> `READY`
  - after brief confirmation, load next task

- `FEEDBACK_WRONG_1` -> `TYPING`
  - as soon as student starts retyping

- `FEEDBACK_WRONG_2_REVEAL` -> `READY`
  - after student enters the correct answer
  - engine re-queues family (needs reinforcement)

- `ANY` -> `PAUSED`
  - on pause button

- `PAUSED` -> prior state
  - on resume

- `ANY` -> `TECH_ERROR`
  - on unrecoverable technical error (rare)

---

## 2) Engine <-> UI contract for feedback ladder

The core-engine must provide a result object like:

- `feedbackAction: 'none' | 'try_again' | 'structure_hold' | 'correct'`
- `correctValue?: number` (required for `structure_hold`)
- `requeueFamily?: boolean` (true on wrong #2)

UI rules:
- On `try_again`: show `feedback.tryAgain` and do NOT shame
- On `structure_hold`: show structure lens and reveal correct value; keep visible until correct input, then continue

---

## 3) Structure Lens behavior

- Hidden by default in Test mode.
- Allowed in Learn mode.
- On wrong #2, UI must show the structure lens (even in Test mode) and keep it visible until correct input.

Lens rendering:
- Multiplication: rectangle highlight (a x b)
- Division (quotitive): show grouping by divisor to reveal quotient
- Division (partitive): show partitions by quotient to reveal divisor

---

## 4) Join flow (minimal)

States:
- `JOIN_IDLE`
- `JOIN_SCANNING_QR`
- `JOIN_ENTERING_CODE`
- `JOIN_SUBMITTING`
- `JOIN_SUCCESS`
- `JOIN_FAILURE` (neutral copy, no blame)

Copy:
- network issues should say "offline" neutrally, not "failed".

---

## 5) Offline sync indicators (quiet)

- No modal interruptions mid-practice.
- A small status dot/text may indicate:
  - `SYNC_OK`, `SYNC_PENDING`, `SYNC_ERROR`

Only `SYNC_ERROR` may use danger red, and must be calm:
- "Verbindung unterbrochen. Arbeitet offline weiter."

---

## 6) i18n keys referenced by states

Student:
- `feedback.tryAgain`
- `feedback.structureExplanation`
- `common.continue`
- `errors.network`

No hardcoded German/English strings in components; use keys.

---

## 7) Acceptance checklist for UI PRs

- [ ] Uses tokens only (no hex)
- [ ] Implements feedback ladder exactly
- [ ] No shame language
- [ ] Respects prefers-reduced-motion
- [ ] Join + offline states do not interrupt practice
