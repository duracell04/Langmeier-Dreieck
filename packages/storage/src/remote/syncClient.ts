import type { StudentEvent } from "@triangle/types";

export interface SubmitEventsPayload {
  classId: string;
  studentRef: string;
  events: StudentEvent[];
  cursorTs?: number;
}

export interface SubmitEventsResult {
  accepted: number;
  deduped: number;
  serverTs: number;
}

export interface SyncClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export async function submitEvents(
  config: SyncClientConfig,
  payload: SubmitEventsPayload
): Promise<SubmitEventsResult> {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("supabase_config_missing");
  }

  const response = await fetch(`${config.supabaseUrl}/functions/v1/submit_events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`submit_events_failed:${response.status}:${detail}`);
  }

  const data = (await response.json()) as Partial<SubmitEventsResult>;
  return {
    accepted: Number(data.accepted ?? 0),
    deduped: Number(data.deduped ?? 0),
    serverTs: Number(data.serverTs ?? Date.now()),
  };
}
