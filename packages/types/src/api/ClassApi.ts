// packages/types/src/api/ClassApi.ts
import type { StudentEvent } from "../events/StudentEvents";
import type { ProductSetId } from "../domain/ProductSet";

export type ClassMode = "learn" | "test";
export type SessionLength = 10 | 25 | 40;
export type SquareMode = "default" | "single";

export interface ClassDefaults {
  packId: string;
  defaultMode: ClassMode;
  productSets: ProductSetId[];
  sessionLength: SessionLength;
  divisionEnabled: boolean;
  squareMode: SquareMode;
  allowStudentOverride: boolean;
}

export interface JoinClassRequest {
  joinCode: string;
  deviceId?: string;
  identityToken?: string;
}

export interface JoinClassResponse {
  classId: string;
  studentRef: string;
  studentNumber: number;
  classConfig: ClassDefaults;
}

export interface SubmitEventsRequest {
  classId: string;
  studentRef: string;
  events: StudentEvent[];
  cursorTs?: number;
}

export interface SubmitEventsResponse {
  accepted: number;
  deduped: number;
  serverTs: number;
}
