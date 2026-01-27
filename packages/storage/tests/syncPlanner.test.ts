import { describe, expect, it } from "vitest";
import { chunkEvents, computeSinceTs, updateCursor } from "../src/remote/syncPlanner";

describe("syncPlanner", () => {
  it("computes overlap sinceTs", () => {
    expect(computeSinceTs(1000, 500)).toBe(500);
    expect(computeSinceTs(null, 500)).toBe(0);
  });

  it("chunks events by batch size", () => {
    const batches = chunkEvents([1, 2, 3, 4, 5], 2);
    expect(batches).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("updates cursor using serverTs", () => {
    expect(updateCursor(100, 90)).toBe(100);
    expect(updateCursor(100, 140)).toBe(140);
    expect(updateCursor(null, 50)).toBe(50);
  });
});
