import type { ProductSetId } from "@triangle/types";

export const PRODUCT_SET_ORDER: ProductSetId[] = [
  "products_3_4",
  "products_2",
  "squares",
  "cardinals",
  "all_products",
];

export function sortProductSets(sets: ProductSetId[]): ProductSetId[] {
  const rank = new Map<ProductSetId, number>(
    PRODUCT_SET_ORDER.map((setId, index) => [setId, index])
  );

  return [...sets].sort((a, b) => {
    const rankA = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
    const rankB = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });
}
