import type { BaseEvent, StudentEvent } from "@triangle/types";
import {
  appendEvent,
  chunkEvents,
  computeSinceTs,
  getLastAckTs,
  queryEvents,
  setLastAckTs,
  submitEvents,
  updateCursor,
} from "@triangle/storage";

export interface EventContext {
  deviceId: string;
  studentRef: string;
  classId?: string;
  packId: string;
  sessionId: string;
}

export interface SyncConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const SYNC_BATCH_SIZE = 120;
const SYNC_OVERLAP_MS = 5 * 60 * 1000;

export function createBaseEvent(context: EventContext, type: StudentEvent["type"]): BaseEvent {
  const ts = Date.now();
  return {
    version: 1,
    type,
    eventId: crypto.randomUUID(),
    ts,
    at: ts,
    deviceId: context.deviceId,
    studentRef: context.studentRef,
    classId: context.classId,
    packId: context.packId,
    sessionId: context.sessionId,
  };
}

export async function recordEvent(event: StudentEvent): Promise<void> {
  await appendEvent(event);
}

export async function syncPendingEvents(config: SyncConfig, context: EventContext) {
  if (!context.classId) return { accepted: 0, deduped: 0, serverTs: Date.now() };
  if (context.classId === "demo-class" || context.studentRef.startsWith("demo-")) {
    return { accepted: 0, deduped: 0, serverTs: Date.now() };
  }
  if (!config.supabaseUrl || !config.supabaseAnonKey) return { accepted: 0, deduped: 0, serverTs: Date.now() };

  const lastAckTs = await getLastAckTs();
  const sinceTs = computeSinceTs(lastAckTs, SYNC_OVERLAP_MS);
  const events = await queryEvents({ studentRef: context.studentRef, sinceTs });

  if (events.length === 0) return { accepted: 0, deduped: 0, serverTs: Date.now() };

  let accepted = 0;
  let deduped = 0;
  let serverTs = lastAckTs ?? Date.now();
  const batches = chunkEvents(events, SYNC_BATCH_SIZE);

  for (const batch of batches) {
    const result = await submitEvents(config, {
      classId: context.classId,
      studentRef: context.studentRef,
      events: batch,
      cursorTs: lastAckTs ?? undefined,
    });

    accepted += result.accepted;
    deduped += result.deduped;
    serverTs = updateCursor(serverTs, result.serverTs);
  }

  await setLastAckTs(serverTs);
  return { accepted, deduped, serverTs };
}
