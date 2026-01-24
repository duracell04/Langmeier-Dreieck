import type { Attempt, ErrorType, FamilyMastery } from "@triangle/types";

export interface MasteryParams {
  intervalsMs: number[];
  correctToAdvance: number;
  wrongBackoffMs: number;
}

export const defaultMasteryParams: MasteryParams = {
  intervalsMs: [0, 30_000, 2 * 60_000, 10 * 60_000, 60 * 60_000],
  correctToAdvance: 2,
  wrongBackoffMs: 20_000,
};

export function initFamilyMastery(familyId: string, now = Date.now()): FamilyMastery {
  return {
    familyId,
    bucket: 0,
    consecutiveCorrect: 0,
    lastSeenTs: now,
    dueTs: now,
    errors: {},
  };
}

function clampBucket(bucket: number): 0 | 1 | 2 | 3 | 4 {
  if (bucket <= 0) return 0;
  if (bucket === 1) return 1;
  if (bucket === 2) return 2;
  if (bucket === 3) return 3;
  return 4;
}

export function updateMastery(
  prev: FamilyMastery,
  attempt: Attempt,
  params: MasteryParams = defaultMasteryParams
): FamilyMastery {
  const now = Number.isFinite(attempt.ts) ? attempt.ts : Date.now();

  let bucket = prev.bucket;
  let consecutiveCorrect = prev.consecutiveCorrect;
  let lastWrongOperation = prev.lastWrongOperation;

  const errors: Partial<Record<ErrorType, number>> = { ...prev.errors };

  if (attempt.correct) {
    consecutiveCorrect += 1;
    if (consecutiveCorrect >= params.correctToAdvance) {
      bucket = clampBucket(bucket + 1);
      consecutiveCorrect = 0;
    }
  } else {
    bucket = clampBucket(bucket - 1);
    consecutiveCorrect = 0;
    lastWrongOperation = attempt.operation;
    if (attempt.errorType) {
      errors[attempt.errorType] = (errors[attempt.errorType] ?? 0) + 1;
    }
  }

  const intervalIdx = Math.min(bucket, params.intervalsMs.length - 1);
  const dueTs = attempt.correct ? now + params.intervalsMs[intervalIdx] : now + params.wrongBackoffMs;

  return {
    ...prev,
    bucket,
    consecutiveCorrect,
    lastSeenTs: now,
    dueTs,
    errors,
    lastWrongOperation,
  };
}
