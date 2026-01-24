// services/api/src/analytics/confusionMatrix.ts
export interface ConfusionEntry {
  promptKey: string;
  answerKey: string;
  count: number;
}

export function buildConfusionMatrix(entries: ConfusionEntry[]) {
  return entries;
}
