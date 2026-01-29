import { describe, expect, it } from "vitest";
import { recommendNextStep } from "../src/engine/nextStep";

describe("recommendNextStep", () => {
  it("returns keepGoing when there are no attempts", () => {
    expect(recommendNextStep({ total: 0, reveals: 0, accuracy: 0 })).toBe("keepGoing");
  });

  it("prefers learnSame when reveals are high", () => {
    expect(recommendNextStep({ total: 10, reveals: 3, accuracy: 0.7 })).toBe("learnSame");
  });

  it("suggests testSlow on high accuracy", () => {
    expect(recommendNextStep({ total: 20, reveals: 0, accuracy: 0.95 })).toBe("testSlow");
  });

  it("falls back to keepGoing otherwise", () => {
    expect(recommendNextStep({ total: 10, reveals: 1, accuracy: 0.75 })).toBe("keepGoing");
  });
});
