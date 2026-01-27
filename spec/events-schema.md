# Event Schema (StudentEvent v1)

This document is the human contract for student events. Keep in sync with:
- `packages/types/src/events/StudentEvents.ts`
- `packages/storage/src/events/validator.ts`

---

## BaseEvent (all events)

```ts
{
  version: 1;
  type: string;
  eventId: string;   // UUID
  ts: number;        // epoch ms
  at?: number;       // optional alias of ts
  deviceId: string;  // local UUID (not fingerprinting)
  studentRef: string;
  classId?: string;
  packId: string;
  sessionId: string;
}
```

---

## Task end (canonical for streak/mastery/badges)

**Rule:** A task ends when the learner submits the correct answer OR on the third wrong attempt that triggers reveal.
At task end, emit **exactly one** `task_end` event.

```ts
type TaskEndResult = "correct" | "reveal";
type TaskEndMissingSlot = "product" | "factorLeft" | "factorRight";
type LockedRole = "none" | "divisorLeft" | "divisorRight";

interface TaskEndEvent extends BaseEvent {
  type: "task_end";
  taskId: string;
  familyProduct: number;       // e.g. 24
  op: "mul" | "div";
  missing: TaskEndMissingSlot;
  lockedRole: LockedRole;
  attemptsBeforeEnd: 0 | 1 | 2; // 0 = first try
  usedStructureLens: boolean;
  msToEnd: number;             // from task shown to task end
  result: TaskEndResult;       // correct or reveal
}
```

**Canonical variant id:**
```ts
variantId = `${op}:${missing}:${lockedRole}`
```

---

## Existing event types (v1)

```ts
interface SessionStartEvent extends BaseEvent {
  type: "session_start";
  mode: "learn" | "test";
  setId: string;
}

interface TaskShownEvent extends BaseEvent {
  type: "task_shown";
  taskKey: string;
  familyId: string;
  operation: "mul" | "div";
  missing: "product" | "left" | "right";
}

interface AttemptSubmittedEvent extends BaseEvent {
  type: "attempt_submitted";
  attempt: Attempt;
}

interface HintUsedEvent extends BaseEvent {
  type: "hint_used";
  hintType: "family_glance" | "structure_lens";
  taskKey?: string;
}

interface SessionEndEvent extends BaseEvent {
  type: "session_end";
  durationMs: number;
  items: number;
  accuracy: number; // 0..1
}
```
