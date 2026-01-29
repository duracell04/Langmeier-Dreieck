import type { ProductSetId } from "@triangle/types";

const DB_NAME = "triangle1x1";
const DB_VERSION = 1;

const STORE_META = "meta";
const STORE_EVENTS = "events";

const PRODUCT_SET_IDS: ProductSetId[] = [
  "products_3_4",
  "products_2",
  "squares",
  "cardinals",
  "all_products",
];

const PRODUCT_SET_ID_SET = new Set(PRODUCT_SET_IDS);

export type MetaKey =
  | "deviceId"
  | "studentRef"
  | "sessionId"
  | "classId"
  | "studentNumber"
  | "packId"
  | "lastAckTs"
  | "activeSession"
  | "joinCode"
  | "identityMarker"
  | "classConfig"
  | "practiceConfig";

export interface ClassConfig {
  packId: string;
  defaultMode: "learn" | "test";
  productSets: ProductSetId[];
  sessionLength: 10 | 25 | 40;
  divisionEnabled: boolean;
  squareMode: "default" | "single";
  allowStudentOverride?: boolean;
}

export type PracticeSpeed = "slow" | "fast";

export interface PracticeConfig {
  mode: "learn" | "test";
  productSets: ProductSetId[];
  speed: PracticeSpeed;
}

interface MetaRecord {
  key: MetaKey;
  value: string;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        const store = db.createObjectStore(STORE_EVENTS, { keyPath: "eventId" });
        store.createIndex("by_studentRef", "studentRef", { unique: false });
        store.createIndex("by_sessionId", "sessionId", { unique: false });
        store.createIndex("by_student_session", ["studentRef", "sessionId"], { unique: false });
        store.createIndex("by_ts", "ts", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = run(store);

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);

    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getMeta(key: MetaKey): Promise<string | null> {
  const record = await withStore<MetaRecord | undefined>(STORE_META, "readonly", store => store.get(key));
  return record ? record.value : null;
}

export async function setMeta(key: MetaKey, value: string | null): Promise<void> {
  if (value === null) {
    await withStore(STORE_META, "readwrite", store => store.delete(key));
    return;
  }
  const record: MetaRecord = { key, value };
  await withStore(STORE_META, "readwrite", store => store.put(record));
}

export async function getDeviceId(): Promise<string | null> {
  return getMeta("deviceId");
}

export async function setDeviceId(value: string | null): Promise<void> {
  return setMeta("deviceId", value);
}

export async function getClassId(): Promise<string | null> {
  return getMeta("classId");
}

export async function setClassId(value: string | null): Promise<void> {
  return setMeta("classId", value);
}

export async function getStudentRef(): Promise<string | null> {
  return getMeta("studentRef");
}

export async function setStudentRef(value: string | null): Promise<void> {
  return setMeta("studentRef", value);
}

export async function getStudentNumber(): Promise<number | null> {
  const raw = await getMeta("studentNumber");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setStudentNumber(value: number | null): Promise<void> {
  if (value === null) return setMeta("studentNumber", null);
  return setMeta("studentNumber", String(value));
}

export async function getPackId(): Promise<string | null> {
  return getMeta("packId");
}

export async function setPackId(value: string | null): Promise<void> {
  return setMeta("packId", value);
}

function isValidProductSets(values: unknown): values is ProductSetId[] {
  if (!Array.isArray(values)) return false;
  return values.every(item => typeof item === "string" && PRODUCT_SET_ID_SET.has(item as ProductSetId));
}

function isClassConfig(value: unknown): value is ClassConfig {
  if (!value || typeof value !== "object") return false;
  const item = value as ClassConfig;
  const validSessionLength = item.sessionLength === 10 || item.sessionLength === 25 || item.sessionLength === 40;
  const validMode = item.defaultMode === "learn" || item.defaultMode === "test";
  const validSquare = item.squareMode === "default" || item.squareMode === "single";
  const validOverride =
    typeof item.allowStudentOverride === "boolean" || typeof item.allowStudentOverride === "undefined";
  return (
    typeof item.packId === "string" &&
    validMode &&
    isValidProductSets(item.productSets) &&
    validSessionLength &&
    typeof item.divisionEnabled === "boolean" &&
    validSquare &&
    validOverride
  );
}

export async function getClassConfig(): Promise<ClassConfig | null> {
  const raw = await getMeta("classConfig");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isClassConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function setClassConfig(value: ClassConfig | null): Promise<void> {
  if (!value) return setMeta("classConfig", null);
  return setMeta("classConfig", JSON.stringify(value));
}

function isPracticeConfig(value: unknown): value is PracticeConfig {
  if (!value || typeof value !== "object") return false;
  const item = value as PracticeConfig;
  const validMode = item.mode === "learn" || item.mode === "test";
  const validSpeed = item.speed === "slow" || item.speed === "fast";
  return validMode && validSpeed && isValidProductSets(item.productSets);
}

export async function getPracticeConfig(): Promise<PracticeConfig | null> {
  const raw = await getMeta("practiceConfig");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isPracticeConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function setPracticeConfig(value: PracticeConfig | null): Promise<void> {
  if (!value) return setMeta("practiceConfig", null);
  return setMeta("practiceConfig", JSON.stringify(value));
}

export async function getLastAckTs(): Promise<number | null> {
  const raw = await getMeta("lastAckTs");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setLastAckTs(value: number | null): Promise<void> {
  if (value === null) return setMeta("lastAckTs", null);
  return setMeta("lastAckTs", String(value));
}

export async function getSessionId(): Promise<string | null> {
  return getMeta("sessionId");
}

export async function setSessionId(value: string | null): Promise<void> {
  return setMeta("sessionId", value);
}

export async function getJoinCode(): Promise<string | null> {
  return getMeta("joinCode");
}

export async function setJoinCode(value: string | null): Promise<void> {
  return setMeta("joinCode", value);
}

export async function getIdentityMarker(): Promise<string | null> {
  return getMeta("identityMarker");
}

export async function setIdentityMarker(value: string | null): Promise<void> {
  return setMeta("identityMarker", value);
}

export async function clearAllMeta(): Promise<void> {
  await withStore(STORE_META, "readwrite", store => store.clear());
}

export { STORE_EVENTS, STORE_META };
