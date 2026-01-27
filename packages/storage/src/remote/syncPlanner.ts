export function computeSinceTs(lastAckTs: number | null, overlapMs: number): number {
  return Math.max(0, (lastAckTs ?? 0) - overlapMs);
}

export function chunkEvents<T>(events: T[], batchSize: number): T[][] {
  if (batchSize <= 0) return [events];
  const batches: T[][] = [];
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  return batches;
}

export function updateCursor(previous: number | null, serverTs: number): number {
  const base = previous ?? 0;
  return Math.max(base, serverTs);
}
