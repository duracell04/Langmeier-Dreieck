import { describe, expect, it } from "vitest";
import { buildCoreFamilies } from "../src/engine/families";
import { buildLearnPlan } from "../src/engine/learnQueue";

describe("buildLearnPlan", () => {
  it("is deterministic for the same families", () => {
    const families = buildCoreFamilies({ minFactor: 2, maxFactor: 4 });
    const planA = buildLearnPlan(families, { divisionEnabled: true, squareMode: "default" });
    const planB = buildLearnPlan(families, { divisionEnabled: true, squareMode: "default" });

    expect(planA).toEqual(planB);
  });

  it("keeps swap adjacent for non-square pairs", () => {
    const families = buildCoreFamilies({ minFactor: 2, maxFactor: 4 });
    const plan = buildLearnPlan(families, { divisionEnabled: false, squareMode: "default" });
    const firstPair = plan.find(item => item.operation === "mul" && item.missing === "product" && item.swap === "keep");
    if (!firstPair) {
      expect(firstPair).toBeTruthy();
      return;
    }
    const idx = plan.findIndex(item => item.familyId === firstPair.familyId && item.pair[0] === firstPair.pair[0] && item.pair[1] === firstPair.pair[1] && item.missing === "product" && item.swap === "keep");
    const next = plan[idx + 1];
    if (firstPair.pair[0] === firstPair.pair[1]) {
      expect(next?.swap).not.toBe("swap");
      return;
    }
    expect(next?.swap).toBe("swap");
    expect(next?.pair).toEqual(firstPair.pair);
  });
});
