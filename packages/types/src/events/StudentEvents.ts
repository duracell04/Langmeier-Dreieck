// packages/types/src/events/StudentEvents.ts
import type { Attempt } from "../domain/Attempt";

export type StudentEventVersion = 1;

export type StudentEvent =
  | SessionStartEvent
  | TaskShownEvent
  | AttemptSubmittedEvent
  | HintUsedEvent
  | TaskEndEvent
  | SessionEndEvent;

export interface BaseEvent {
  version: StudentEventVersion;
  type: string;
  eventId: string;       // UUID, client-generated
  ts: number;            // epoch ms
  at?: number;           // optional alias of ts (epoch ms)
  deviceId: string;      // random UUID stored locally (not fingerprinting)
  studentRef: string;    // pseudonymous token (see join flow)
  classId?: string;
  packId: string;
  sessionId: string;     // classroom session identity
}

export interface SessionStartEvent extends BaseEvent {
  type: "session_start";
  mode: "learn" | "test";
  setId: string;
}

export interface TaskShownEvent extends BaseEvent {
  type: "task_shown";
  taskKey: string;
  familyId: string;
  operation: "mul" | "div";
  missing: "product" | "left" | "right";
}

export interface AttemptSubmittedEvent extends BaseEvent {
  type: "attempt_submitted";
  attempt: Attempt;
}

export interface HintUsedEvent extends BaseEvent {
  type: "hint_used";
  hintType: "family_glance" | "structure_lens";
  taskKey?: string;
}

export type TaskEndResult = "correct" | "reveal";
export type TaskEndMissingSlot = "product" | "factorLeft" | "factorRight";
export type LockedRole = "none" | "divisorLeft" | "divisorRight";

export interface TaskEndEvent extends BaseEvent {
  type: "task_end";
  taskId: string;
  familyProduct: number;       // product family (e.g. 24)
  op: "mul" | "div";
  missing: TaskEndMissingSlot;
  lockedRole: LockedRole;
  attemptsBeforeEnd: 0 | 1 | 2; // 0 = first try
  usedStructureLens: boolean;
  msToEnd: number;
  result: TaskEndResult;
}

export interface SessionEndEvent extends BaseEvent {
  type: "session_end";
  durationMs: number;
  items: number;
  accuracy: number; // 0..1
}
