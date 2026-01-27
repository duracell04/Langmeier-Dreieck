import { describe, expect, it } from "vitest";
import { buildCoreFamilies } from "../src/engine/families";
import { createSeededRng } from "../src/engine/rng";
import { pickNextTask } from "../src/engine/picker";

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

    const isSwap = next.pair[0] === swapped.pair[1] && next.pair[1] === swapped.pair[0];
    expect(isSwap).toBe(false);
  });
});
