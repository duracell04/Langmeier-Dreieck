import type { ProductFamily } from "@triangle/types";

export interface CoreFamilyOptions {
  minFactor?: number;
  maxFactor?: number;
  tag?: string;
}

function normalizePair(pair: [number, number]): [number, number] {
  const [a, b] = pair;
  return a <= b ? [a, b] : [b, a];
}

export function buildCoreFamilies(options: CoreFamilyOptions = {}): ProductFamily[] {
  const min = options.minFactor ?? 2;
  const max = options.maxFactor ?? 9;
  const tag = options.tag ?? "core";

  const map = new Map<number, ProductFamily>();

  for (let a = min; a <= max; a++) {
    for (let b = min; b <= max; b++) {
      const product = a * b;
      const pair = normalizePair([a, b]);

      const existing = map.get(product);
      if (existing) {
        if (!existing.factorPairs.some(p => p[0] === pair[0] && p[1] === pair[1])) {
          existing.factorPairs.push(pair);
        }
        continue;
      }

      map.set(product, {
        id: `p${product}`,
        product,
        factorPairs: [pair],
        tags: [tag],
        canonicalPair: pair,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.product - b.product);
}
