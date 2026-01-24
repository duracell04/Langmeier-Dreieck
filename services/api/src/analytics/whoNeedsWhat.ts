// services/api/src/analytics/whoNeedsWhat.ts
export interface StudentNeed {
  studentRef: string;
  familyId: string;
  errorRate: number;
}

export function groupWhoNeedsWhat(needs: StudentNeed[], threshold = 0.3) {
  return needs.filter(n => n.errorRate >= threshold);
}
