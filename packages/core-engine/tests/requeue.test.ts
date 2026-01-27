import { describe, expect, it } from "vitest";
import { enqueueRequeue, pickDueRequeue, shouldUseRequeue, type RequeuePolicy } from "../src/engine/requeue";
import type { Task } from "@triangle/types";

const baseTask: Task = {
  instanceId: "t1",
  taskKey: "k1",
  familyId: "p4",
  operation: "mul",
  pair: [2, 2],
  missing: "product",
  product: null,
  left: 2,
  right: 2,
};

const policy: RequeuePolicy = {
  minSpacing: 6,
  swapSpacing: 2,
  density: { maxConsecutive: 2, windowSize: 4, maxInWindow: 2 },
};

describe("requeue policy", () => {
  it("enforces density cap", () => {
    const sources: Array<"new" | "requeue"> = ["requeue", "requeue", "new", "requeue"];
    expect(shouldUseRequeue(sources, policy.density)).toBe(false);
  });

  it("enforces min spacing", () => {
    let queue = enqueueRequeue([], baseTask, 0, policy.minSpacing);
    const pickEarly = pickDueRequeue(queue, 2, [], policy);
    expect(pickEarly.task).toBeUndefined();
    const pickLater = pickDueRequeue(queue, 6, [], policy);
    expect(pickLater.task?.taskKey).toBe(baseTask.taskKey);
  });

  it("defers requeue when swap spacing is violated", () => {
    const swapTask: Task = {
      ...baseTask,
      taskKey: "k2",
      instanceId: "t2",
      familyId: "p6",
      pair: [2, 3],
      left: 2,
      right: 3,
    };
    const swapped: Task = {
      ...swapTask,
      instanceId: "t3",
      pair: [3, 2],
      left: 3,
      right: 2,
    };

    let queue = enqueueRequeue([], swapTask, 0, 0);
    const pick = pickDueRequeue(queue, 0, [swapped], policy);
    expect(pick.task).toBeUndefined();
    expect(pick.queue[0].dueIndex).toBe(1);
  });
});
