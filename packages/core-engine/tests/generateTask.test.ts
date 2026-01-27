import { describe, expect, it } from "vitest";
import { buildCoreFamilies } from "../src/engine/families";
import { createSeededRng } from "../src/engine/rng";
import { generateTaskFromFamily, buildTaskKey } from "../src/engine/generateTask";

const family = buildCoreFamilies({ minFactor: 2, maxFactor: 4 })[0];

describe("generateTaskFromFamily", () => {
  it("is deterministic with a fixed rng", () => {
    const rng = createSeededRng(1234);
    const taskA = generateTaskFromFamily(family, { rng, operation: "mul", missing: "product" });
    const rng2 = createSeededRng(1234);
    const taskB = generateTaskFromFamily(family, { rng: rng2, operation: "mul", missing: "product" });
    expect(taskA.taskKey).toBe(taskB.taskKey);
    expect(taskA.pair).toEqual(taskB.pair);
  });

  it("includes orientation and square mode in taskKey", () => {
    const keyBase = buildTaskKey({
      familyId: "p4",
      operation: "mul",
      pair: [2, 2],
      missing: "left",
      divisionMeaning: undefined,
      squareSharedInput: true,
    });
    const keyDefault = buildTaskKey({
      familyId: "p4",
      operation: "mul",
      pair: [2, 2],
      missing: "left",
      divisionMeaning: undefined,
      squareSharedInput: false,
    });
    expect(keyBase).not.toEqual(keyDefault);
  });
});
