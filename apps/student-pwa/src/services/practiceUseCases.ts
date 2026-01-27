import type { BaseEvent, StudentEvent } from "@triangle/types";
import { appendEvent, getLastAckTs, queryEvents, setLastAckTs, submitEvents } from "@triangle/storage";

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
  if (!config.supabaseUrl || !config.supabaseAnonKey) return { accepted: 0, deduped: 0, serverTs: Date.now() };

  const lastAckTs = await getLastAckTs();
  const events = await queryEvents({ studentRef: context.studentRef, sinceTs: lastAckTs ?? 0 });

  if (events.length === 0) return { accepted: 0, deduped: 0, serverTs: Date.now() };

  const result = await submitEvents(config, {
    classId: context.classId,
    studentRef: context.studentRef,
    events,
  });

  const maxTs = events.reduce((acc, event) => Math.max(acc, event.ts), lastAckTs ?? 0);
  await setLastAckTs(maxTs);

  return result;
}
