import { describe, expect, it } from "vitest";
import { buildCoreFamilies } from "../src/engine/families";
import { createSeededRng } from "../src/engine/rng";
import { pickNextTask } from "../src/engine/picker";
import type { Task } from "@triangle/types";

const families = buildCoreFamilies({ minFactor: 2, maxFactor: 4 });

describe("pickNextTask", () => {
  it("avoids immediate swap within spacing window", () => {
    const rng = createSeededRng(42);
    const first = pickNextTask(families, {}, { rng, operation: "mul", missing: "product", swap: "keep" });
    const swapped = { ...first, pair: [first.pair[1], first.pair[0]] };

    const next = pickNextTask(families, {}, {
      rng: createSeededRng(42),
      operation: "mul",
      missing: "product",
      swap: "swap",
      recentTasks: [swapped],
      swapSpacing: 2,
    });

    const isSquare = swapped.pair[0] === swapped.pair[1];
    const isSwap = !isSquare && next.pair[0] === swapped.pair[1] && next.pair[1] === swapped.pair[0];
    expect(isSwap).toBe(false);
  });

  it("is deterministic with the same seed", () => {
    const buildSequence = (seed: number) => {
      const rng = createSeededRng(seed);
      const recentFamilies: string[] = [];
      const recentTasks: Task[] = [];
      const sequence: string[] = [];

      for (let i = 0; i < 8; i += 1) {
        const task = pickNextTask(families, {}, {
          rng,
          recentFamilyIds: recentFamilies,
          recentTasks,
          recentFamilyWindow: 3,
          swapSpacing: 2,
          operation: "mix",
          missing: "mix",
          divisionMeaning: "mix",
          swap: "mix",
          divisionEnabled: true,
          squareMode: "default",
        });
        sequence.push(task.taskKey);
        recentFamilies.push(task.familyId);
        recentTasks.push(task);
      }

      return sequence;
    };

    expect(buildSequence(42)).toEqual(buildSequence(42));
  });
});
