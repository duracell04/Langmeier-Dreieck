import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JoinClassRequestSchema } from "../_shared/validation.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeJoinCode(code: string): string {
  return code.trim().toUpperCase();
}

function classConfigFromRow(row: Record<string, unknown>) {
  const productSets = Array.isArray(row.product_sets) ? row.product_sets.filter(item => typeof item === "string") : [];
  const sessionLength = row.session_length === 10 || row.session_length === 25 || row.session_length === 40
    ? row.session_length
    : 25;

  return {
    packId: typeof row.pack_id === "string" ? row.pack_id : "core",
    defaultMode: row.default_mode === "test" ? "test" : "learn",
    productSets: productSets.length ? productSets : ["products_3_4"],
    sessionLength,
    divisionEnabled: row.division_enabled !== false,
    squareMode: row.square_mode === "single" ? "single" : "default",
  };
}

serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "method_not_allowed" });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  const parsed = JoinClassRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse(400, { error: "invalid_payload" });
  }

  const joinCode = normalizeJoinCode(parsed.data.joinCode);
  const deviceId = parsed.data.deviceId?.trim() ?? "";

  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select("id, pack_id, default_mode, product_sets, session_length, division_enabled, square_mode")
    .eq("join_code", joinCode)
    .maybeSingle();

  if (classError) {
    return jsonResponse(500, { error: "class_lookup_failed" });
  }

  if (!classRow) {
    return jsonResponse(404, { error: "join_code_not_found" });
  }

  const classId = classRow.id as string;
  const classConfig = classConfigFromRow(classRow as Record<string, unknown>);

  if (deviceId) {
    const { data: existing, error: existingError } = await supabase
      .from("students")
      .select("student_ref, student_number")
      .eq("class_id", classId)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (existingError) {
      return jsonResponse(500, { error: "student_lookup_failed" });
    }

    if (existing) {
      return jsonResponse(200, {
        classId,
        studentRef: existing.student_ref,
        studentNumber: existing.student_number,
        classConfig,
      });
    }
  }

  const { data: lastStudent, error: lastError } = await supabase
    .from("students")
    .select("student_number")
    .eq("class_id", classId)
    .order("student_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastError) {
    return jsonResponse(500, { error: "student_number_failed" });
  }

  const nextNumber = (lastStudent?.student_number ?? 0) + 1;
  const studentRef = crypto.randomUUID();

  const { error: insertError } = await supabase.from("students").insert({
    class_id: classId,
    student_ref: studentRef,
    student_number: nextNumber,
    device_id: deviceId || null,
  });

  if (insertError) {
    return jsonResponse(500, { error: "student_insert_failed" });
  }

  return jsonResponse(200, {
    classId,
    studentRef,
    studentNumber: nextNumber,
    classConfig,
  });
});
