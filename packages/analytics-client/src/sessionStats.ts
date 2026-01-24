// packages/analytics-client/src/sessionStats.ts
export interface SessionSummary {
  items: number;
  accuracy: number; // 0..1
  avgResponseMs: number;
  streak: number;
  improvedFamilies: string[];
}

export interface SessionAttempt {
  familyId: string;
  correct: boolean;
  timeMs: number;
}

export function summarizeSession(attempts: SessionAttempt[]): SessionSummary {
  if (attempts.length === 0) {
    return {
      items: 0,
      accuracy: 0,
      avgResponseMs: 0,
      streak: 0,
      improvedFamilies: [],
    };
  }

  const items = attempts.length;
  const correctCount = attempts.filter(a => a.correct).length;
  const accuracy = correctCount / items;
  const avgResponseMs = Math.round(
    attempts.reduce((sum, a) => sum + a.timeMs, 0) / items
  );

  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (!attempts[i].correct) break;
    streak++;
  }

  const improvedFamilies = Array.from(
    new Set(attempts.filter(a => a.correct).map(a => a.familyId))
  );

  return { items, accuracy, avgResponseMs, streak, improvedFamilies };
}
