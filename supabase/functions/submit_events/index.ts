import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const piiKeys = new Set([
  "name",
  "firstname",
  "lastname",
  "email",
  "phone",
  "address",
  "dob",
  "dateofbirth",
  "birthdate",
  "birthday",
  "studentname",
  "parentname",
  "guardian",
]);

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function containsPiiKeys(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsPiiKeys);
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (piiKeys.has(key.toLowerCase())) return true;
    if (containsPiiKeys(val)) return true;
  }
  return false;
}

function eventTimestamp(event: Record<string, unknown>): number | null {
  const ts = event.ts;
  if (typeof ts === "number" && Number.isFinite(ts)) return ts;
  const at = event.at;
  if (typeof at === "number" && Number.isFinite(at)) return at;
  return null;
}

function hasRequiredBase(event: Record<string, unknown>): boolean {
  return (
    typeof event.eventId === "string" &&
    typeof event.type === "string" &&
    typeof event.ts === "number" &&
    typeof event.deviceId === "string" &&
    typeof event.studentRef === "string" &&
    typeof event.packId === "string" &&
    typeof event.sessionId === "string"
  );
}

function isTaskEndEvent(event: Record<string, unknown>): event is Record<string, any> {
  return event.type === "task_end";
}

function taskEndRow(event: Record<string, any>, classId: string, studentRef: string) {
  if (
    typeof event.familyProduct !== "number" ||
    typeof event.op !== "string" ||
    typeof event.missing !== "string" ||
    typeof event.lockedRole !== "string" ||
    typeof event.attemptsBeforeEnd !== "number" ||
    typeof event.usedStructureLens !== "boolean" ||
    typeof event.msToEnd !== "number" ||
    typeof event.result !== "string"
  ) {
    return null;
  }

  return {
    event_id: event.eventId,
    class_id: classId,
    student_ref: studentRef,
    task_id: typeof event.taskId === "string" ? event.taskId : null,
    session_id: typeof event.sessionId === "string" ? event.sessionId : null,
    pack_id: typeof event.packId === "string" ? event.packId : null,
    family_product: event.familyProduct,
    op: event.op,
    missing: event.missing,
    locked_role: event.lockedRole,
    attempts_before_end: event.attemptsBeforeEnd,
    used_structure_lens: event.usedStructureLens,
    ms_to_end: event.msToEnd,
    result: event.result,
    event_ts: eventTimestamp(event) ?? null,
  };
}

serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  const classId = typeof payload?.classId === "string" ? payload.classId : "";
  const studentRef = typeof payload?.studentRef === "string" ? payload.studentRef : "";
  const events = Array.isArray(payload?.events) ? payload.events : [];

  if (!classId || !studentRef || events.length === 0) {
    return jsonResponse(400, { error: "invalid_payload" });
  }

  for (const event of events) {
    if (!event || typeof event !== "object") {
      return jsonResponse(400, { error: "invalid_event" });
    }
    if (!hasRequiredBase(event)) {
      return jsonResponse(400, { error: "invalid_event_shape" });
    }
    if (event.studentRef !== studentRef) {
      return jsonResponse(400, { error: "student_mismatch" });
    }
    if (typeof event.classId === "string" && event.classId !== classId) {
      return jsonResponse(400, { error: "class_mismatch" });
    }
    if (containsPiiKeys(event)) {
      return jsonResponse(400, { error: "pii_rejected" });
    }
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("class_id", classId)
    .eq("student_ref", studentRef)
    .maybeSingle();

  if (studentError) {
    return jsonResponse(500, { error: "student_lookup_failed" });
  }

  if (!student) {
    return jsonResponse(403, { error: "student_not_in_class" });
  }

  const eventRows = events.map((event: Record<string, unknown>) => ({
    event_id: event.eventId,
    class_id: classId,
    student_ref: studentRef,
    event_type: event.type,
    event_ts: eventTimestamp(event) ?? null,
    session_id: typeof event.sessionId === "string" ? event.sessionId : null,
    pack_id: typeof event.packId === "string" ? event.packId : null,
    payload: event,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("student_events")
    .upsert(eventRows, { onConflict: "event_id", ignoreDuplicates: true })
    .select("event_id");

  if (insertError) {
    return jsonResponse(500, { error: "event_insert_failed" });
  }

  const accepted = inserted?.length ?? 0;
  const deduped = Math.max(0, events.length - accepted);

  const taskEndRows = events
    .filter((event: Record<string, unknown>) => isTaskEndEvent(event))
    .map(event => taskEndRow(event as Record<string, any>, classId, studentRef))
    .filter(Boolean) as Record<string, unknown>[];

  if (taskEndRows.length > 0) {
    const { error: taskEndError } = await supabase
      .from("task_end_events")
      .upsert(taskEndRows, { onConflict: "event_id", ignoreDuplicates: true });

    if (taskEndError) {
      return jsonResponse(500, { error: "task_end_insert_failed" });
    }
  }

  return jsonResponse(200, {
    accepted,
    deduped,
    serverTs: Date.now(),
  });
});
