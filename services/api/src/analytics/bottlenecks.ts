// services/api/src/analytics/bottlenecks.ts
export interface FamilyStats {
  familyId: string;
  attempts: number;
  errors: number;
}

export function computeBottlenecks(stats: FamilyStats[], topN = 5): FamilyStats[] {
  return [...stats]
    .sort((a, b) => (b.errors / b.attempts) - (a.errors / a.attempts))
    .slice(0, topN);
}
