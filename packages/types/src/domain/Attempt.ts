// packages/types/src/domain/Attempt.ts
import type { Operation } from "./Task";

export type ErrorType =
  | "wrong_value"
  | "role_confusion"
  | "swapped_factors"
  | "wrong_family"
  | "plausibility"
  | "typo";

export interface Attempt {
  taskKey: string;
  studentRef: string;     // pseudonymous (see privacy model)
  ts: number;             // epoch ms
  answer: number;
  correct: boolean;
  timeMs: number;
  operation: Operation;
  errorType?: ErrorType;
  scaffoldUsed?: boolean; // structure lens or family glance
}
