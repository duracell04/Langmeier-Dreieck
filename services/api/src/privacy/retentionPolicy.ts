// services/api/src/privacy/retentionPolicy.ts
export interface RetentionConfig {
  attemptsDays: number;   // e.g. 180
  sessionsDays: number;   // e.g. 365
  auditDays: number;      // e.g. 365
}

export async function runRetentionPolicy(cfg: RetentionConfig) {
  // delete/aggregate old raw events
  // keep only aggregates if needed
  // implementation depends on DB strategy
}
