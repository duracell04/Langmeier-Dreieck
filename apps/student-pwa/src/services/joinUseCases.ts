import { supabase } from "./supabaseClient";
import {
  getClassId,
  getDeviceId,
  getStudentNumber,
  getStudentRef,
  setClassId,
  setDeviceId,
  setStudentNumber,
  setStudentRef,
} from "@triangle/storage";

export interface JoinClassResult {
  classId: string;
  studentRef: string;
  studentNumber: number;
}

export async function loadStoredIdentity(): Promise<JoinClassResult | null> {
  const [classId, studentRef, studentNumber] = await Promise.all([
    getClassId(),
    getStudentRef(),
    getStudentNumber(),
  ]);

  if (!classId || !studentRef || studentNumber === null) return null;
  return { classId, studentRef, studentNumber };
}

async function ensureDeviceId(): Promise<string> {
  const existing = await getDeviceId();
  if (existing) return existing;
  const created = crypto.randomUUID();
  await setDeviceId(created);
  return created;
}

export async function joinClass(joinCode: string, identityToken?: string | null): Promise<JoinClassResult> {
  const deviceId = await ensureDeviceId();

  const { data, error } = await supabase.functions.invoke("join_class", {
    body: {
      joinCode,
      deviceId,
      identityToken: identityToken ?? undefined,
    },
  });

  if (error) {
    throw new Error(error.message || "join_failed");
  }

  if (!data || typeof data.classId !== "string" || typeof data.studentRef !== "string") {
    throw new Error("join_failed");
  }

  const studentNumber = Number(data.studentNumber);
  if (!Number.isFinite(studentNumber)) {
    throw new Error("join_failed");
  }

  await Promise.all([
    setClassId(data.classId),
    setStudentRef(data.studentRef),
    setStudentNumber(studentNumber),
  ]);

  return { classId: data.classId, studentRef: data.studentRef, studentNumber };
}
