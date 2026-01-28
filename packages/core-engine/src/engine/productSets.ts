import type { ProductFamily, ProductSetDefinition, ProductSetId } from "@triangle/types";

export interface ProductSetOptions {
  minFactor?: number;
  maxFactor?: number;
}

const PRODUCT_SET_DEFINITIONS: ProductSetDefinition[] = [
  {
    id: "products_3_4",
    label: "Produkte aus 3 und 4 Reihen",
    products: [12, 16, 18, 20, 24, 30, 36, 40],
  },
  {
    id: "products_2",
    label: "Produkte aus 2 Reihen",
    products: [14, 15, 21, 27, 28, 32, 35, 42, 48, 54, 56, 63, 72],
  },
  {
    id: "squares",
    label: "Quadratzahlen",
    products: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
  },
  {
    id: "cardinals",
    label: "Einer- und Zehnerzahlen",
    products: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 60, 70, 80, 90],
  },
  {
    id: "all_products",
    label: "Alle Produkte",
    products: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      12, 14, 15, 16, 18, 20, 21, 24, 25, 27,
      28, 30, 32, 35, 36, 40, 42, 45, 48, 49,
      50, 54, 56, 60, 63, 64, 70, 72, 80, 81,
      90, 100,
    ],
  },
];

export function listProductSetDefinitions(): ProductSetDefinition[] {
  return PRODUCT_SET_DEFINITIONS.map(def => ({ ...def, products: [...def.products] }));
}

function normalizePair(pair: [number, number]): [number, number] {
  const [a, b] = pair;
  return a <= b ? [a, b] : [b, a];
}

function buildFamily(product: number, factorPairs: Array<[number, number]>, tags: string[]): ProductFamily {
  return {
    id: `p${product}`,
    product,
    factorPairs,
    tags: tags.length ? [...tags] : undefined,
    canonicalPair: factorPairs[0],
  };
}

function buildFactorPairs(product: number, minFactor: number, maxFactor: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let a = minFactor; a <= maxFactor; a += 1) {
    for (let b = a; b <= maxFactor; b += 1) {
      if (a * b === product) {
        pairs.push(normalizePair([a, b]));
      }
    }
  }

  if (product === 0 && pairs.length === 0 && minFactor > 0) {
    pairs.push([0, 0]);
  }

  return pairs;
}

export function buildFamiliesFromProducts(
  products: number[],
  options: ProductSetOptions = {},
  tagsByProduct?: Map<number, string[]>
): ProductFamily[] {
  const minFactor = options.minFactor ?? 1;
  const maxFactor = options.maxFactor ?? 10;

  const unique = Array.from(new Set(products)).filter(p => Number.isFinite(p));
  unique.sort((a, b) => a - b);

  return unique
    .map(product => {
      const factorPairs = buildFactorPairs(product, minFactor, maxFactor);
      if (factorPairs.length === 0) return null;
      const tags = tagsByProduct?.get(product) ?? [];
      return buildFamily(product, factorPairs, tags);
    })
    .filter(Boolean) as ProductFamily[];
}

function resolveProductSet(setId: ProductSetId): ProductSetDefinition | null {
  return PRODUCT_SET_DEFINITIONS.find(def => def.id === setId) ?? null;
}

export function buildFamiliesForProductSets(
  setIds: ProductSetId[],
  options: ProductSetOptions = {}
): ProductFamily[] {
  const requested = setIds.length ? setIds : ["products_3_4"];
  const tagMap = new Map<number, string[]>();

  for (const id of requested) {
    const def = resolveProductSet(id);
    if (!def) continue;
    for (const product of def.products) {
      const current = tagMap.get(product) ?? [];
      if (!current.includes(id)) current.push(id);
      tagMap.set(product, current);
    }
  }

  const allProducts = Array.from(tagMap.keys());
  const minFactor = options.minFactor ?? (allProducts.includes(0) ? 0 : 1);
  const maxFactor = options.maxFactor ?? 10;
  return buildFamiliesFromProducts(allProducts, { minFactor, maxFactor }, tagMap);
}
