import { supabase } from "./supabaseClient";
import {
  getClassId,
  getDeviceId,
  getIdentityMarker,
  getJoinCode,
  getStudentNumber,
  getStudentRef,
  setClassId,
  setDeviceId,
  setIdentityMarker,
  setJoinCode,
  setStudentNumber,
  setStudentRef,
} from "@triangle/storage";

export interface JoinClassResult {
  classId: string;
  studentRef: string;
  studentNumber: number;
  joinCode: string;
}

export interface StoredIdentity {
  classId: string;
  studentRef: string;
  studentNumber: number;
  joinCode: string;
  identityMarker: string | null;
}

export async function loadStoredIdentity(): Promise<StoredIdentity | null> {
  const [classId, studentRef, studentNumber, joinCode, identityMarker] = await Promise.all([
    getClassId(),
    getStudentRef(),
    getStudentNumber(),
    getJoinCode(),
    getIdentityMarker(),
  ]);

  if (!classId || !studentRef || studentNumber === null || !joinCode) return null;
  return { classId, studentRef, studentNumber, joinCode, identityMarker };
}

async function ensureDeviceId(): Promise<string> {
  const existing = await getDeviceId();
  if (existing) return existing;
  const created = crypto.randomUUID();
  await setDeviceId(created);
  return created;
}

function normalizeJoinCode(value: string): string {
  return value.trim().toUpperCase();
}

async function persistIdentity(input: {
  classId: string;
  studentRef: string;
  studentNumber: number;
  joinCode: string;
  identityMarker: string | null;
}) {
  await Promise.all([
    setClassId(input.classId),
    setStudentRef(input.studentRef),
    setStudentNumber(input.studentNumber),
    setJoinCode(input.joinCode),
    setIdentityMarker(input.identityMarker),
  ]);
}

export async function joinClass(joinCode: string, identityMarker?: string | null): Promise<JoinClassResult> {
  const deviceId = await ensureDeviceId();
  const normalized = normalizeJoinCode(joinCode);

  if (import.meta.env.DEV && (normalized === "DEMO" || normalized === "DEMO12")) {
    const demoRef = `demo-${crypto.randomUUID()}`;
    const result = {
      classId: "demo-class",
      studentRef: demoRef,
      studentNumber: 1,
    };
    await persistIdentity({
      ...result,
      joinCode: normalized,
      identityMarker: identityMarker ?? null,
    });
    return { ...result, joinCode: normalized };
  }

  const { data, error } = await supabase.functions.invoke("join_class", {
    body: {
      joinCode: normalized,
      deviceId,
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

  await persistIdentity({
    classId: data.classId,
    studentRef: data.studentRef,
    studentNumber,
    joinCode: normalized,
    identityMarker: identityMarker ?? null,
  });

  return { classId: data.classId, studentRef: data.studentRef, studentNumber, joinCode: normalized };
}

export async function clearStoredIdentity(): Promise<void> {
  await Promise.all([
    setClassId(null),
    setStudentRef(null),
    setStudentNumber(null),
    setJoinCode(null),
    setIdentityMarker(null),
  ]);
}
