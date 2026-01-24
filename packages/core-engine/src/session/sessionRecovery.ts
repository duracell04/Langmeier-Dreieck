// packages/core-engine/src/session/sessionRecovery.ts
import type { PracticeSession } from "./sessionManager";

export function shouldResumeSession(s: PracticeSession): boolean {
  // v1 rule: resume if last active within threshold handled by SessionManager
  // but allow UI to confirm on restart if desired.
  return true;
}
