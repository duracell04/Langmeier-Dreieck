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
  setPackId,
  setStudentNumber,
  setStudentRef,
  setClassConfig,
  type ClassConfig,
} from "@triangle/storage";

export interface JoinClassResult {
  classId: string;
  studentRef: string;
  studentNumber: number;
  joinCode: string;
  classConfig: ClassConfig;
}

export interface StoredIdentity {
  classId: string;
  studentRef: string;
  studentNumber: number;
  joinCode: string;
  identityMarker: string | null;
}

const DEFAULT_CLASS_CONFIG: ClassConfig = {
  packId: "core",
  defaultMode: "learn",
  productSets: ["products_3_4"],
  sessionLength: 25,
  divisionEnabled: true,
  squareMode: "default",
};

function parseClassConfig(input: unknown): ClassConfig | null {
  if (!input || typeof input !== "object") return null;
  const item = input as ClassConfig;
  const validLength = item.sessionLength === 10 || item.sessionLength === 25 || item.sessionLength === 40;
  const validMode = item.defaultMode === "learn" || item.defaultMode === "test";
  const validSquare = item.squareMode === "default" || item.squareMode === "single";
  if (!validLength || !validMode || !validSquare) return null;
  if (typeof item.packId !== "string") return null;
  if (!Array.isArray(item.productSets)) return null;
  if (typeof item.divisionEnabled !== "boolean") return null;
  return item;
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
    const classConfig = DEFAULT_CLASS_CONFIG;
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
    await setPackId(classConfig.packId);
    await setClassConfig(classConfig);
    return { ...result, joinCode: normalized, classConfig };
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

  const classConfig = parseClassConfig(data.classConfig) ?? DEFAULT_CLASS_CONFIG;

  await persistIdentity({
    classId: data.classId,
    studentRef: data.studentRef,
    studentNumber,
    joinCode: normalized,
    identityMarker: identityMarker ?? null,
  });

  await setPackId(classConfig.packId);
  await setClassConfig(classConfig);

  return { classId: data.classId, studentRef: data.studentRef, studentNumber, joinCode: normalized, classConfig };
}

export async function clearStoredIdentity(): Promise<void> {
  await Promise.all([
    setClassId(null),
    setStudentRef(null),
    setStudentNumber(null),
    setJoinCode(null),
    setIdentityMarker(null),
    setPackId(null),
    setClassConfig(null),
  ]);
}
