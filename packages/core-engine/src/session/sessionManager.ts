// packages/core-engine/src/session/sessionManager.ts
export interface PracticeSession {
  sessionId: string;
  studentRef: string;
  classId?: string;
  packId: string;
  mode: "learn" | "test";
  setId: string;
  productSets?: string[];
  speed?: "slow" | "fast";
  startedAt: number;
  lastActiveAt: number;
  // optional: seed to reproduce "next N tasks" after crash
  rngSeed: number;
}

export interface SessionStoragePort {
  loadActiveSession(): Promise<PracticeSession | null>;
  saveActiveSession(s: PracticeSession): Promise<void>;
  clearActiveSession(sessionId: string): Promise<void>;
}

export class SessionManager {
  constructor(private storage: SessionStoragePort) {}

  async startSession(input: Omit<PracticeSession, "lastActiveAt">) {
    const s: PracticeSession = { ...input, lastActiveAt: Date.now() };
    await this.storage.saveActiveSession(s);
    return s;
  }

  async touch(sessionId: string) {
    const s = await this.storage.loadActiveSession();
    if (!s || s.sessionId !== sessionId) return null;
    const next = { ...s, lastActiveAt: Date.now() };
    await this.storage.saveActiveSession(next);
    return next;
  }

  async recoverSession(maxIdleMs = 20 * 60 * 1000) {
    const s = await this.storage.loadActiveSession();
    if (!s) return null;
    const idle = Date.now() - s.lastActiveAt;
    if (idle > maxIdleMs) {
      await this.storage.clearActiveSession(s.sessionId);
      return null;
    }
    return s;
  }

  async endSession(sessionId: string) {
    await this.storage.clearActiveSession(sessionId);
  }
}
