import { describe, expect, it } from "vitest";
import { computeGamification } from "../src/engine/gamification";
import type { TaskEndEvent } from "@triangle/types";

const baseEvent: TaskEndEvent = {
  version: 1,
  type: "task_end",
  eventId: "event-base",
  ts: 1000,
  at: 1000,
  deviceId: "device-1234567890",
  studentRef: "student-abcdef",
  packId: "core",
  sessionId: "session-123456",
  taskId: "task-1",
  familyProduct: 24,
  op: "mul",
  missing: "product",
  lockedRole: "none",
  attemptsBeforeEnd: 0,
  usedStructureLens: false,
  msToEnd: 900,
  result: "correct",
};

function event(overrides: Partial<TaskEndEvent>): TaskEndEvent {
  return { ...baseEvent, ...overrides };
}

describe("computeGamification", () => {
  it("computes streaks and mastery by family", () => {
    const events: TaskEndEvent[] = [
      event({ eventId: "e1", ts: 1000, familyProduct: 24, op: "mul", missing: "product" }),
      event({ eventId: "e2", ts: 2000, familyProduct: 24, op: "mul", missing: "factorLeft" }),
      event({ eventId: "e3", ts: 3000, familyProduct: 24, op: "div", missing: "factorRight", lockedRole: "divisorLeft" }),
      event({ eventId: "e4", ts: 4000, familyProduct: 36, result: "reveal", attemptsBeforeEnd: 2 }),
    ];

    const result = computeGamification(events);

    expect(result.bestStreak).toBe(3);
    expect(result.currentStreak).toBe(0);
    expect(result.masteryByFamily[24].level).toBe(2);
    expect(result.masteryByFamily[24].variantsFirstTry.length).toBe(3);
    expect(result.masteryByFamily[36].reveals).toBe(1);
  });
});
