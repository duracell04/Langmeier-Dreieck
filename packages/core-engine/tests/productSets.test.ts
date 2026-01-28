import { describe, expect, it } from "vitest";
import { buildFamiliesForProductSets } from "../src/engine/productSets";

const PRODUCTS_3_4 = [12, 16, 18, 20, 24, 30, 36, 40];

describe("buildFamiliesForProductSets", () => {
  it("builds families for selected product sets", () => {
    const families = buildFamiliesForProductSets(["products_3_4"]);
    const products = families.map(family => family.product).sort((a, b) => a - b);
    expect(products).toEqual(PRODUCTS_3_4);
  });

  it("includes factor pairs for cardinals", () => {
    const families = buildFamiliesForProductSets(["cardinals"]);
    const zero = families.find(family => family.product === 0);
    expect(zero?.factorPairs).toContainEqual([0, 0]);
    expect(zero?.factorPairs).toContainEqual([0, 5]);

    const fifty = families.find(family => family.product === 50);
    expect(fifty?.factorPairs).toContainEqual([5, 10]);
  });
});
