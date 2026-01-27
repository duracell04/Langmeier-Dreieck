import { describe, expect, it } from "vitest";
import { gridVisible, keypadDisabled, nextPhase, resetPhase } from "../src/engine/phaseMachine";

describe("phaseMachine", () => {
  it("starts in solve with zero attempts", () => {
    expect(resetPhase()).toEqual({ phase: "solve", attempts: 0 });
  });

  it("transitions wrong1 -> structure -> reveal on consecutive wrongs", () => {
    let state = resetPhase();
    state = nextPhase(state, false);
    expect(state).toEqual({ phase: "wrong1", attempts: 1 });
    state = nextPhase(state, false);
    expect(state).toEqual({ phase: "structure", attempts: 2 });
    state = nextPhase(state, false);
    expect(state).toEqual({ phase: "reveal", attempts: 2 });
  });

  it("transitions to success on correct", () => {
    const state = nextPhase({ phase: "solve", attempts: 0 }, true);
    expect(state).toEqual({ phase: "success", attempts: 0 });
  });

  it("derives grid and keypad flags from phase", () => {
    expect(gridVisible("solve")).toBe(false);
    expect(gridVisible("structure")).toBe(true);
    expect(gridVisible("reveal")).toBe(true);
    expect(keypadDisabled("solve")).toBe(false);
    expect(keypadDisabled("success")).toBe(true);
    expect(keypadDisabled("reveal")).toBe(true);
  });
});
