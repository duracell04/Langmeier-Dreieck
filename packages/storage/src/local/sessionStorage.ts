import { getMeta, setMeta, setSessionId, setStudentRef } from "./idb";

export interface PracticeSession {
  sessionId: string;
  studentRef: string;
  classId?: string;
  packId: string;
  mode: "learn" | "test";
  setId: string;
  startedAt: number;
  lastActiveAt: number;
  rngSeed: number;
}

export interface SessionStoragePort {
  loadActiveSession(): Promise<PracticeSession | null>;
  saveActiveSession(s: PracticeSession): Promise<void>;
  clearActiveSession(sessionId: string): Promise<void>;
}

const ACTIVE_SESSION_KEY = "activeSession" as const;

function isValidSession(value: any): value is PracticeSession {
  if (!value || typeof value !== "object") return false;
  return (
    typeof value.sessionId === "string" &&
    typeof value.studentRef === "string" &&
    typeof value.packId === "string" &&
    (value.mode === "learn" || value.mode === "test") &&
    typeof value.setId === "string" &&
    typeof value.startedAt === "number" &&
    typeof value.lastActiveAt === "number" &&
    typeof value.rngSeed === "number"
  );
}

export class IdbSessionStorage implements SessionStoragePort {
  async loadActiveSession(): Promise<PracticeSession | null> {
    const raw = await getMeta(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!isValidSession(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async saveActiveSession(s: PracticeSession): Promise<void> {
    await setMeta(ACTIVE_SESSION_KEY, JSON.stringify(s));
    await setStudentRef(s.studentRef);
    await setSessionId(s.sessionId);
  }

  async clearActiveSession(sessionId: string): Promise<void> {
    const current = await this.loadActiveSession();
    if (current && current.sessionId !== sessionId) return;
    await setMeta(ACTIVE_SESSION_KEY, null);
    await setSessionId(null);
  }
}
