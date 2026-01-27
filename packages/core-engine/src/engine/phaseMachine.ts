export type PracticePhase = "solve" | "wrong1" | "structure" | "success" | "reveal";

export interface PhaseState {
  phase: PracticePhase;
  attempts: 0 | 1 | 2;
}

export function resetPhase(): PhaseState {
  return { phase: "solve", attempts: 0 };
}

export function nextPhase(state: PhaseState, correct: boolean): PhaseState {
  if (correct) {
    return { phase: "success", attempts: state.attempts };
  }

  if (state.attempts === 0) {
    return { phase: "wrong1", attempts: 1 };
  }

  if (state.attempts === 1) {
    return { phase: "structure", attempts: 2 };
  }

  return { phase: "reveal", attempts: 2 };
}

export function gridVisible(phase: PracticePhase): boolean {
  return phase === "structure" || phase === "reveal";
}

export function keypadDisabled(phase: PracticePhase): boolean {
  return phase === "success" || phase === "reveal";
}
