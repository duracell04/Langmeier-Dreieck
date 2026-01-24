// packages/types/src/domain/Mastery.ts
import type { ErrorType } from "./Attempt";
import type { Operation } from "./Task";

export type MasteryBucket = 0 | 1 | 2 | 3 | 4;

export interface FamilyMastery {
  familyId: string;
  bucket: MasteryBucket;
  consecutiveCorrect: number;
  lastSeenTs: number;
  dueTs: number;
  errors: Partial<Record<ErrorType, number>>;
  lastWrongOperation?: Operation;
}

export interface StudentState {
  studentRef: string;
  classId?: string;
  packId: string;
  mastery: Record<string, FamilyMastery>;
}
