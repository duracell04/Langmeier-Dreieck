import { describe, expect, it } from "vitest";
import { StudentEventSchema } from "../src/events/validator";

describe("StudentEventSchema", () => {
  it("accepts a valid task_end event", () => {
    const result = StudentEventSchema.safeParse({
      version: 1,
      type: "task_end",
      eventId: "evt-1234567890",
      ts: Date.now(),
      deviceId: "dev-1234567890",
      studentRef: "stu-123456",
      classId: "cls-123",
      packId: "core",
      sessionId: "sess-123456",
      taskId: "task-1",
      familyProduct: 24,
      op: "mul",
      missing: "product",
      lockedRole: "none",
      attemptsBeforeEnd: 1,
      usedStructureLens: false,
      msToEnd: 1200,
      result: "correct",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = StudentEventSchema.safeParse({
      version: 1,
      type: "nope",
      eventId: "evt-1234567890",
      ts: Date.now(),
      deviceId: "dev-1234567890",
      studentRef: "stu-123456",
      packId: "core",
      sessionId: "sess-123456",
    });
    expect(result.success).toBe(false);
  });
});
